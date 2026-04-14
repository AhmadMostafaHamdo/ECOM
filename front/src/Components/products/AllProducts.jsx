import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useLocalize } from "../context/LocalizeContext";
import { formatCurrency } from "../../utils/localizeUtils";
import { motion, AnimatePresence } from "framer-motion";
import { Slider, Tooltip, Skeleton } from "@mui/material";
import {
    Search,
    FilterList,
    GridView,
    FormatListBulleted,
    Sort,
    LocalOffer,
    Star,
    Visibility,
    ShoppingBag,
    Inventory2,
    FavoriteBorder,
    AddShoppingCart,
    CalendarMonth
} from "@mui/icons-material";
import { axiosInstance, ROOT_URL } from "../../api";
import "./AllProducts.css";
import Pagination from "../common/Pagination";
import BackButton from "../common/BackButton";

const AllProducts = () => {
    const { t } = useTranslation();
    const { category: categorySlug } = useParams();
    const navigate = useNavigate();
    const { activeCountry } = useLocalize();

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString(activeCountry.locale === 'ar' ? 'ar-EG' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
        });
    };

    const location = useLocation();

    // Core State
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Initial fetch from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get("search");
        if (q) {
            setSearchTerm(q);
            setDebouncedSearch(q);
        }
    }, [location.search]);

    const [sortBy, setSortBy] = useState("newest");
    const [viewMode, setViewMode] = useState("grid");

    // Using array for min & max price
    const [priceRange, setPriceRange] = useState([0, 30000]);
    const [debouncedPrice, setDebouncedPrice] = useState([0, 30000]);

    // Pagination State
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 12
    });

    const displayCategoryName = useMemo(() => {
        if (!categorySlug || categorySlug === "all") return t('allProducts.allCategories', 'All Categories');
        return categorySlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }, [categorySlug, t]);

    // Handle debouncing
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedPrice(priceRange), 500);
        return () => clearTimeout(handler);
    }, [priceRange]);

    // Fetch Products
    const fetchProducts = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const backendCategory = (categorySlug && categorySlug !== "all")
                ? displayCategoryName
                : undefined;

            const payload = {
                category: backendCategory,
                selections: {},
                price: debouncedPrice[1] < 30000 ? debouncedPrice[1] : null,
                search: debouncedSearch,
                page: page,
                limit: 12
            };

            const response = await axiosInstance.post("/products/filter", payload);
            const resData = response.data;

            if (resData.data) {
                setProducts(resData.data);
                setPagination({
                    totalItems: resData.total || resData.data.length,
                    totalPages: resData.total_pages || 1,
                    currentPage: resData.page || page,
                    limit: resData.limit || 12
                });
            } else {
                setProducts(Array.isArray(resData) ? resData : []);
                setPagination(prev => ({
                    ...prev,
                    totalItems: (Array.isArray(resData) ? resData.length : 0),
                    totalPages: 1,
                    currentPage: 1
                }));
            }
        } catch (error) {
            console.error("Products fetch failed:", error.message);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [categorySlug, displayCategoryName, debouncedSearch, debouncedPrice]);

    // Trigger fetch on filter changes
    useEffect(() => {
        fetchProducts(1);
    }, [fetchProducts]);

    const handlePageChange = (newPage) => {
        if (newPage === pagination.currentPage) return;
        fetchProducts(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const sortedProducts = useMemo(() => {
        let filtered = products.filter(p => p.price.cost >= debouncedPrice[0]);

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return a.price.cost - b.price.cost;
                case "price-high":
                    return b.price.cost - a.price.cost;
                case "rating":
                    return (b.rating || 0) - (a.rating || 0);
                case "name":
                    return (a?.title?.shortTitle || "").localeCompare(b?.title?.shortTitle || "");
                case "newest":
                default:
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateB - dateA;
            }
        });
    }, [products, sortBy, debouncedPrice]);

    const handleProductClick = (productId) => {
        navigate(`/getproductsone/${productId}`);
    };

    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);
    };

    const renderSkeletons = () => {
        return Array.from({ length: viewMode === "grid" ? 12 : 6 }).map((_, idx) => (
            <div key={idx} className={`premium_product_card skeleton ${viewMode}`} style={{ cursor: "default" }}>
                <div className="card_image_wrapper" style={{ background: 'transparent' }}>
                    <Skeleton
                        variant="rectangular"
                        width="100%"
                        height="100%"
                        sx={{ position: 'absolute', top: 0, left: 0, bgcolor: 'var(--surface-2)' }}
                    />
                </div>
                <div className="card_details" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Skeleton width="40%" height={24} sx={{ bgcolor: 'var(--surface-2)' }} />
                    <Skeleton width="90%" height={32} sx={{ bgcolor: 'var(--surface-2)' }} />
                    <Skeleton width="70%" height={24} sx={{ bgcolor: 'var(--surface-2)' }} />
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                        <Skeleton width="50%" height={35} sx={{ bgcolor: 'var(--surface-2)' }} />
                        <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'var(--surface-2)' }} />
                    </div>
                </div>
            </div>
        ));
    };

    return (
        <div className="allproducts_wrapper">
            {/* Premium Header */}
            <header className="allproducts_hero">
                <div className="hero_glass">
                    <div className="hero_content">
                        <BackButton className="glass_back_btn" />
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="title_area"
                        >
                            <span className="category_tag">{t('allProducts.exploring')}</span>
                            <h1>{displayCategoryName}</h1>
                            <div className="stats_row">
                                <Inventory2 className="stat_icon" />
                                <span>{pagination.totalItems} {t('allProducts.productsFound')}</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>

            <div className="allproducts_main">
                {/* Advanced Filter Bar */}
                <aside className="filters_sidebar">
                    <div className="filter_card">
                        <div className="filter_header">
                            <FilterList />
                            <h3>{t('allProducts.filters')}</h3>
                        </div>

                        <div className="filter_section">
                            <label>{t('allProducts.search')}</label>
                            <div className="search_input_wrapper">
                                <Search className="search_icon" />
                                <input
                                    type="text"
                                    placeholder={t('allProducts.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="filter_section">
                            <label>{t('allProducts.sortBy')}</label>
                            <div className="select_wrapper">
                                <Sort className="select_icon" />
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="newest">{t('allProducts.newest')}</option>
                                    <option value="price-low">{t('allProducts.priceLow')}</option>
                                    <option value="price-high">{t('allProducts.priceHigh')}</option>
                                    <option value="rating">{t('allProducts.highestRated')}</option>
                                    <option value="name">{t('allProducts.nameAZ')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="filter_section">
                            <label>{t('allProducts.priceRange')}</label>
                            <div className="price_inputs_grid">
                                <div className="price_box">
                                    <span>{t('allProducts.min')}</span>
                                    <div className="price_value_display">{formatCurrency(priceRange[0], activeCountry.locale, activeCountry.currency)}</div>
                                </div>
                                <div className="price_box" style={{ alignItems: 'flex-end', textAlign: 'end' }}>
                                    <span>{t('allProducts.max')}</span>
                                    <div className="price_value_display">{formatCurrency(priceRange[1], activeCountry.locale, activeCountry.currency)}</div>
                                </div>
                            </div>
                            <div style={{ padding: '0 10px' }}>
                                <Slider
                                    value={priceRange}
                                    onChange={handlePriceChange}
                                    valueLabelDisplay="auto"
                                    min={0}
                                    max={30000}
                                    step={100}
                                    sx={{
                                        color: 'var(--primary)',
                                        '& .MuiSlider-thumb': {
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                            '&:hover, &.Mui-focusVisible': {
                                                boxShadow: '0px 0px 0px 8px var(--primary-glow)',
                                            },
                                        },
                                        '& .MuiSlider-valueLabel': {
                                            background: 'var(--surface)',
                                            color: 'var(--text-1)',
                                            borderRadius: '8px',
                                            fontFamily: 'var(--font)',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            border: '1px solid var(--border)'
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="filter_section">
                            <label>{t('allProducts.viewMode')}</label>
                            <div className="view_mode_toggle">
                                <button
                                    className={viewMode === "grid" ? "active" : ""}
                                    onClick={() => setViewMode("grid")}
                                >
                                    <GridView />
                                    <span>{t('allProducts.grid')}</span>
                                </button>
                                <button
                                    className={viewMode === "list" ? "active" : ""}
                                    onClick={() => setViewMode("list")}
                                >
                                    <FormatListBulleted />
                                    <span>{t('allProducts.list')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Products Area */}
                <section className="products_content">
                    {loading ? (
                        <div className={`products_display_container ${viewMode}`}>
                            {renderSkeletons()}
                        </div>
                    ) : sortedProducts.length > 0 ? (
                        <>
                            <motion.div layout className={`products_display_container ${viewMode}`}>
                                <AnimatePresence>
                                    {sortedProducts.map((product) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.4 }}
                                            key={product.id}
                                            className={`premium_product_card ${viewMode}`}
                                            onClick={() => handleProductClick(product.id)}
                                        >
                                            <div className="card_image_wrapper">
                                                <img 
                                                    src={(() => {
                                                        const p = product;
                                                        if (Array.isArray(p.images) && p.images.length > 0) {
                                                            const img = p.images[0];
                                                            if (img) return img.startsWith('http') || img.startsWith('blob:') ? img : `${ROOT_URL}${img}`;
                                                        }
                                                        if (p.url) return p.url.startsWith('http') || p.url.startsWith('blob:') ? p.url : `${ROOT_URL}${p.url}`;
                                                        return '';
                                                    })()} 
                                                    alt={product?.title?.shortTitle || 'Product'} 
                                                    loading="lazy"
                                                    onError={(e) => { e.target.style.opacity = '0.3'; }}
                                                />
                                                <div className="card_overlay">
                                                    <div className="overlay_actions">
                                                        <Tooltip title={t('product.inquireNow', 'Inquire Now')} placement="top">
                                                            <button
                                                                className="icon_action_btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleProductClick(product.id);
                                                                }}
                                                            >
                                                                <AddShoppingCart />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip title={t('allProducts.quickView')} placement="top">
                                                            <button
                                                                className="icon_action_btn primary"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleProductClick(product.id);
                                                                }}
                                                            >
                                                                <Visibility />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip title={t('product.addToWishlist')} placement="top">
                                                            <button
                                                                className="icon_action_btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleProductClick(product.id);
                                                                }}
                                                            >
                                                                <FavoriteBorder />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                                {product.discount && (
                                                    <div className="discount_tag">
                                                        <LocalOffer className="tag_icon" />
                                                        {product.discount}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="card_details">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span className="product_category">{product.category}</span>
                                                    {product.locationDetail && (product.locationDetail.country || product.locationDetail.city) && (
                                                        <span className="product_location" style={{ fontSize: '11px', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <LocalOffer style={{ fontSize: '12px', color: 'var(--primary)' }} />
                                                            {product.locationDetail.city || product.locationDetail.province || product.locationDetail.country}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="product_title">{product?.title?.shortTitle || 'Untitled Product'}</h3>
                                                <p className="product_tagline">{product?.tagline || ''}</p>

                                                <div className="product_meta">
                                                    <div className="rating_badge">
                                                        <Star className="star_icon" />
                                                        <span>{Number(product.rating || 0).toFixed(1)}</span>
                                                    </div>
                                                    <div className="views_count">
                                                        <Visibility className="meta_icon" />
                                                        <span>{product.views || 0}</span>
                                                    </div>
                                                    {product.createdAt && (
                                                        <div className="publish_date" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#888' }}>
                                                            <CalendarMonth style={{ fontSize: '12px' }} />
                                                            <span>{formatDate(product.createdAt)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="price_footer">
                                                    <div className="price_info">
                                                        <span className="cost">{formatCurrency(product?.price?.cost || 0, activeCountry.locale, product?.price?.currency || activeCountry.currency)}</span>
                                                        <span className="mrp">{formatCurrency(product?.price?.mrp || 0, activeCountry.locale, product?.price?.currency || activeCountry.currency)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>

                            {/* Show pagination if we have more than 1 page */}
                            <div className="pagination_wrapper">
                                <Pagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="premium_empty_state"
                        >
                            <div className="empty_illustration">
                                <Search className="bg_icon" />
                                <ShoppingBag className="main_icon" />
                            </div>
                            <h2>{t('allProducts.noResults')}</h2>
                            <p>{t('allProducts.noResultsDesc')}</p>
                            <button className="reset_btn" onClick={() => {
                                setSearchTerm("");
                                setPriceRange([0, 30000]);
                                setDebouncedSearch("");
                                setDebouncedPrice([0, 30000]);
                            }}>
                                {t('allProducts.clearFilters')}
                            </button>
                        </motion.div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AllProducts;

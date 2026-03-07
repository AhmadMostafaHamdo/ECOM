import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
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
    AddShoppingCart
} from "@mui/icons-material";
import { apiUrl } from "../../api";
import "./AllProducts.css";
import Pagination from "../common/Pagination";
import BackButton from "../common/BackButton";

const AllProducts = () => {
    const { t } = useTranslation();
    const { category: categorySlug } = useParams();
    const navigate = useNavigate();
    
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

            const response = await fetch(apiUrl("/products/filter"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Network response was not ok");
            const resData = await response.json();

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
                    totalItems: resData.length || 0,
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
        if(newPage === pagination.currentPage) return;
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
                    return a.title.shortTitle.localeCompare(b.title.shortTitle);
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
                <div className="card_image_wrapper" style={{background: 'transparent'}}>
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
                            <span className="category_tag">{t('allProducts.exploring', 'Exploring Category')}</span>
                            <h1>{displayCategoryName}</h1>
                            <div className="stats_row">
                                <Inventory2 className="stat_icon" />
                                <span>{pagination.totalItems} {t('allProducts.productsFound', 'Products Found')}</span>
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
                            <h3>{t('allProducts.filters', 'Filters')}</h3>
                        </div>

                        <div className="filter_section">
                            <label>{t('allProducts.search', 'Search Products')}</label>
                            <div className="search_input_wrapper">
                                <Search className="search_icon" />
                                <input
                                    type="text"
                                    placeholder={t('allProducts.searchPlaceholder', 'Type product name...')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="filter_section">
                            <label>{t('allProducts.sortBy', 'Sort By')}</label>
                            <div className="select_wrapper">
                                <Sort className="select_icon" />
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="newest">{t('allProducts.newest', 'Newest First')}</option>
                                    <option value="price-low">{t('allProducts.priceLow', 'Price: Low to High')}</option>
                                    <option value="price-high">{t('allProducts.priceHigh', 'Price: High to Low')}</option>
                                    <option value="rating">{t('allProducts.highestRated', 'Highest Rated')}</option>
                                    <option value="name">{t('allProducts.nameAZ', 'Name: A-Z')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="filter_section">
                            <label>{t('allProducts.priceRange', 'Price Range')}</label>
                            <div className="price_inputs_grid">
                                <div className="price_box">
                                    <span>{t('allProducts.min', 'Min')}</span>
                                    <div className="price_value_display">Rs. {priceRange[0]}</div>
                                </div>
                                <div className="price_box" style={{ alignItems: 'flex-end', textAlign: 'end' }}>
                                    <span>{t('allProducts.max', 'Max')}</span>
                                    <div className="price_value_display">Rs. {priceRange[1]}</div>
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
                                        color: 'var(--gold)',
                                        '& .MuiSlider-thumb': {
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                            '&:hover, &.Mui-focusVisible': {
                                                boxShadow: '0px 0px 0px 8px rgba(240, 165, 0, 0.16)',
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
                            <label>{t('allProducts.viewMode', 'View Mode')}</label>
                            <div className="view_mode_toggle">
                                <button
                                    className={viewMode === "grid" ? "active" : ""}
                                    onClick={() => setViewMode("grid")}
                                >
                                    <GridView />
                                    <span>{t('allProducts.grid', 'Grid')}</span>
                                </button>
                                <button
                                    className={viewMode === "list" ? "active" : ""}
                                    onClick={() => setViewMode("list")}
                                >
                                    <FormatListBulleted />
                                    <span>{t('allProducts.list', 'List')}</span>
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
                                                <img src={product.url} alt={product.title.shortTitle} loading="lazy" />
                                                <div className="card_overlay">
                                                    <div className="overlay_actions">
                                                        <Tooltip title="Add to Cart" placement="top">
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
                                                        <Tooltip title={t('allProducts.quickView', 'Quick View')} placement="top">
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
                                                        <Tooltip title="Add to Wishlist" placement="top">
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
                                                <span className="product_category">{product.category}</span>
                                                <h3 className="product_title">{product.title.shortTitle}</h3>
                                                <p className="product_tagline">{product.tagline}</p>

                                                <div className="product_meta">
                                                    <div className="rating_badge">
                                                        <Star className="star_icon" />
                                                        <span>{Number(product.rating || 0).toFixed(1)}</span>
                                                    </div>
                                                    <div className="views_count">
                                                        <Visibility className="meta_icon" />
                                                        <span>{product.views || 0}</span>
                                                    </div>
                                                </div>

                                                <div className="price_footer">
                                                    <div className="price_info">
                                                        <span className="cost">Rs. {product.price.cost}</span>
                                                        <span className="mrp">Rs. {product.price.mrp}</span>
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
                            <h2>{t('allProducts.noResults', 'No Results Found')}</h2>
                            <p>{t('allProducts.noResultsDesc', 'We could not find any products matching your current filters.')}</p>
                            <button className="reset_btn" onClick={() => {
                                setSearchTerm("");
                                setPriceRange([0, 30000]);
                                setDebouncedSearch("");
                                setDebouncedPrice([0, 30000]);
                            }}>
                                {t('allProducts.clearFilters', 'Clear Filters')}
                            </button>
                        </motion.div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AllProducts;

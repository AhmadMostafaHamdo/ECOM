import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowBack,
    Search,
    FilterList,
    GridView,
    FormatListBulleted,
    Sort,
    LocalOffer,
    Star,
    Visibility,
    ShoppingBag,
    Inventory2
} from "@mui/icons-material";
import { apiUrl } from "../../api";
import "./AllProducts.css";
import Pagination from "../common/Pagination";

const AllProducts = () => {
    const { t } = useTranslation();
    const { category: categorySlug } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [viewMode, setViewMode] = useState("grid");
    const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 12
    });

    // Determine the actual category name from the slug
    const displayCategoryName = useMemo(() => {
        if (!categorySlug || categorySlug === "all") return t('allProducts.allCategories');
        return categorySlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }, [categorySlug, t]);

    const fetchProducts = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            // If the category slug is a translated title, it might not match backend categories
            // We'll try to send it, but if it's "all", we send undefined
            const backendCategory = (categorySlug && categorySlug !== "all")
                ? displayCategoryName
                : undefined;

            const payload = {
                category: backendCategory,
                selections: {},
                price: priceRange.max < 20000 ? priceRange.max : null,
                search: searchTerm,
                page: page,
                limit: 12
            };

            const response = await fetch(apiUrl("/products/filter"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const resData = await response.json();

            if (resData.products) {
                setProducts(resData.products);
                setPagination(resData.pagination || {
                    totalItems: resData.products.length,
                    totalPages: 1,
                    currentPage: 1,
                    limit: 12
                });
            } else {
                setProducts(Array.isArray(resData) ? resData : []);
                setPagination(prev => ({ ...prev, totalItems: resData.length || 0 }));
            }
        } catch (error) {
            console.error("Products fetch failed:", error.message);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [categorySlug, displayCategoryName, searchTerm, priceRange.max]);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchProducts(1);
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [fetchProducts]);

    const handlePageChange = (newPage) => {
        fetchProducts(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => {
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
                    // Assuming id or createdAt could be used
                    return 0;
            }
        });
    }, [products, sortBy]);

    const handleBack = () => {
        history.goBack();
    };

    const handleProductClick = (productId) => {
        navigate(`/getproductsone/${productId}`);
    };

    return (
        <div className="allproducts_wrapper">
            {/* Premium Header */}
            <header className="allproducts_hero">
                <div className="hero_glass">
                    <div className="hero_content">
                        <button className="glass_back_btn" onClick={handleBack}>
                            <ArrowBack />
                            <span>{t('allProducts.back')}</span>
                        </button>
                        <div className="title_area">
                            <span className="category_tag">{t('allProducts.exploring')}</span>
                            <h1>{displayCategoryName}</h1>
                            <div className="stats_row">
                                <Inventory2 className="stat_icon" />
                                <span>{pagination.totalItems} {t('allProducts.productsFound')}</span>
                            </div>
                        </div>
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
                                    <input
                                        type="number"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                                    />
                                </div>
                                <br/>
                                <div className="price_box">
                                    <span>{t('allProducts.max')}</span>
                                    <input
                                        type="number"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="20000"
                                step="100"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                className="premium_range"
                            />
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

                {/* Products Grid Area */}
                <section className="products_content">
                    {loading ? (
                        <div className="premium_loader">
                            <div className="spinner_outer">
                                <div className="spinner_inner"></div>
                                <ShoppingBag className="spinner_icon" />
                            </div>
                            <h3>{t('allProducts.fetchingProducts')}</h3>
                            <p>{t('allProducts.pleaseWait')}</p>
                        </div>
                    ) : sortedProducts.length > 0 ? (
                        <>
                            <div className={`products_display_container ${viewMode}`}>
                                {sortedProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className={`premium_product_card ${viewMode}`}
                                        onClick={() => handleProductClick(product.id)}
                                    >
                                        <div className="card_image_wrapper">
                                            <img src={product.url} alt={product.title.shortTitle} loading="lazy" />
                                            <div className="card_overlay">
                                                <button className="quick_view_btn">
                                                    <Visibility />
                                                </button>
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
                                                <button className="add_to_cart_mini">
                                                    <ShoppingBag />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pagination_wrapper">
                                <Pagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="premium_empty_state">
                            <div className="empty_illustration">
                                <Search className="bg_icon" />
                                <ShoppingBag className="main_icon" />
                            </div>
                            <h2>{t('allProducts.noResults')}</h2>
                            <p>{t('allProducts.noResultsDesc')}</p>
                            <button className="reset_btn" onClick={() => {
                                setSearchTerm("");
                                setPriceRange({ min: 0, max: 20000 });
                            }}>
                                {t('allProducts.clearFilters')}
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AllProducts;

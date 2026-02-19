import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";
import { ArrowBack, Search, Filter, Grid, List } from "@mui/icons-material";
import { apiUrl } from "../../api";
import "./AllProducts.css";

const AllProducts = () => {
    const { t } = useTranslation();
    const { category } = useParams();
    const history = useHistory();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("featured");
    const [viewMode, setViewMode] = useState("grid");
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            // Convert URL-friendly category back to normal format
            const normalizedCategory = category && category !== "all" 
                ? category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                : null;

            const payload = {
                category: normalizedCategory,
                selections: {},
                price: null
            };

            const response = await fetch(apiUrl("/products/filter"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log("Products fetch failed:", error.message);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.title.shortTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.title.longTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPrice = product.price.cost >= priceRange.min && product.price.cost <= priceRange.max;
        return matchesSearch && matchesPrice;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case "price-low":
                return a.price.cost - b.price.cost;
            case "price-high":
                return b.price.cost - a.price.cost;
            case "rating":
                return (b.rating || 0) - (a.rating || 0);
            case "name":
                return a.title.shortTitle.localeCompare(b.title.shortTitle);
            default:
                return 0;
        }
    });

    const handleBack = () => {
        history.goBack();
    };

    const handleProductClick = (productId) => {
        history.push(`/getproductsone/${productId}`);
    };

    if (loading) {
        return (
            <div className="allproducts_loader">
                <div className="loader_content">
                    <div className="loader_spinner"></div>
                    <h2>{t('allProducts.loadingProducts')}</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="allproducts_container">
            <div className="allproducts_header">
                <button className="back_btn" onClick={handleBack}>
                    <ArrowBack />
                    {t('allProducts.back')}
                </button>
                <div className="header_content">
                    <h1>
                        {category && category !== "all" 
                            ? `${category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ${t('allProducts.title')}`
                            : t('allProducts.title')
                        }
                    </h1>
                    <p>{sortedProducts.length} {t('allProducts.productsFound')}</p>
                </div>
            </div>

            <div className="allproducts_filters">
                <div className="search_bar">
                    <Search />
                    <input
                        type="text"
                        placeholder={t('allProducts.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter_controls">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="featured">{t('allProducts.featured')}</option>
                        <option value="price-low">{t('allProducts.priceLow')}</option>
                        <option value="price-high">{t('allProducts.priceHigh')}</option>
                        <option value="rating">{t('allProducts.highestRated')}</option>
                        <option value="name">{t('allProducts.nameAZ')}</option>
                    </select>

                    <div className="view_toggle">
                        <button
                            className={`view_btn ${viewMode === "grid" ? "active" : ""}`}
                            onClick={() => setViewMode("grid")}
                        >
                            <Grid />
                        </button>
                        <button
                            className={`view_btn ${viewMode === "list" ? "active" : ""}`}
                            onClick={() => setViewMode("list")}
                        >
                            <List />
                        </button>
                    </div>
                </div>

                <div className="price_filter">
                    <label>Price Range:</label>
                    <div className="price_inputs">
                        <input
                            type="number"
                            placeholder="Min"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                        />
                        <span>-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                        />
                    </div>
                </div>
            </div>

            <div className={`allproducts_grid ${viewMode}`}>
                {sortedProducts.length > 0 ? (
                    sortedProducts.map((product) => (
                        <div
                            key={product.id}
                            className={`product_card ${viewMode}`}
                            onClick={() => handleProductClick(product.id)}
                        >
                            <div className="product_image">
                                <img src={product.url} alt={product.title.shortTitle} loading="lazy" />
                                {product.discount && (
                                    <div className="discount_badge">
                                        {product.discount}
                                    </div>
                                )}
                            </div>
                            <div className="product_info">
                                <h3>{product.title.shortTitle}</h3>
                                <p className="product_tagline">{product.tagline}</p>
                                <div className="product_rating">
                                    <span>⭐ {Number(product.rating || 0).toFixed(1)}</span>
                                    <span>({product.views || 0} views)</span>
                                </div>
                                <div className="product_price">
                                    <span className="current_price">Rs. {product.price.cost}</span>
                                    <span className="original_price">Rs. {product.price.mrp}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no_products">
                        <h3>No products found</h3>
                        <p>Try adjusting your filters or search terms</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllProducts;

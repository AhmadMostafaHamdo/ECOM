import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Banner from "./Banner";

import "../home/home.css";
import StorefrontIcon from "@mui/icons-material/Storefront";
import VerifiedIcon from "@mui/icons-material/Verified";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

import { axiosInstance, ROOT_URL } from "../../api";

import { ProductSkeletonList } from "../common/ProductSkeleton";
import { Logincontext } from "../context/Contextprovider";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalize } from "../context/LocalizeContext";
import { formatCurrency } from "../../utils/localizeUtils";
import { motion, AnimatePresence } from "framer-motion";
import { LocalOffer, StarRate, Visibility, ArrowForward } from "@mui/icons-material";
import Pagination from "../common/Pagination";

const CATEGORY_ALL = "All Categories";

/* ── Trust bar ── */
const TrustBar = () => {
  const { t } = useTranslation();
  const items = [
    { icon: <VerifiedIcon />, title: t("home.verifiedQuality", "Authentic Goods"), sub: t("home.verifiedQualityDesc", "High quality guaranteed products.") },
    { icon: <StorefrontIcon />, title: t("home.expressDelivery", "Store Pickup"), sub: t("home.expressDeliveryDesc", "Pick up your items from our branch.") },
    { icon: <SupportAgentIcon />, title: t("home.support247", "Direct Support"), sub: t("home.supportDesc", "Visit us for any assistance.") },
    { icon: <SwapHorizIcon />, title: t("home.easyReturns", "In-Store Exchange"), sub: t("home.returnsDesc", "Easy exchange at our store.") },
  ];

  return (
    <div className="trust_bar">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div className="trust_divider" />}
          <div className="trust_item">
            <div className="trust_item_icon">{item.icon}</div>
            <div className="trust_item_text">
              <h6>{item.title}</h6>
              <p>{item.sub}</p>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

/* ── Product Grid Card ── */
const ProductCard = ({ product, onLoginRequired }) => {
  const { t } = useTranslation();
  const { activeCountry } = useLocalize();
  const { account } = useContext(Logincontext);
  const navigate = useNavigate();

  // Resolve image: use first from images[] array, fallback to url field
  const getImageSrc = (p) => {
    if (Array.isArray(p.images) && p.images.length > 0) {
      const img = p.images[0];
      if (!img) return p.url ? (p.url.startsWith("http") ? p.url : `${ROOT_URL}${p.url}`) : "";
      return img.startsWith("http") || img.startsWith("blob:") ? img : `${ROOT_URL}${img}`;
    }
    if (p.url) {
      return p.url.startsWith("http") || p.url.startsWith("blob:") ? p.url : `${ROOT_URL}${p.url}`;
    }
    return "";
  };

  const handleClick = () => {
    if (!account) {
      onLoginRequired();
      return;
    }
    navigate(`/getproductsone/${product.id}`);
  };

  const imgSrc = getImageSrc(product);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.35 }}
      className="home_product_card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <div className="home_card_img_wrap">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product?.title?.shortTitle || "Product"}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
            }}
          />
        ) : null}
        <div className="home_card_no_img" style={{ display: imgSrc ? "none" : "flex" }}>
          🛍️
        </div>
        {product.discount && product.discount !== "0%" && (
          <div className="home_card_discount">
            <LocalOffer style={{ fontSize: 11 }} />
            {product.discount}
          </div>
        )}
      </div>

      <div className="home_card_body">
        <span className="home_card_category">{product.category}</span>
        <h3 className="home_card_title">{product?.title?.shortTitle || "Untitled"}</h3>
        {product.tagline && <p className="home_card_tagline">{product.tagline}</p>}

        <div className="home_card_meta">
          <span className="home_card_rating">
            <StarRate style={{ fontSize: 13 }} />
            {Number(product.rating || 0).toFixed(1)}
          </span>
          <span className="home_card_views">
            <Visibility style={{ fontSize: 13 }} />
            {product.views || 0}
          </span>
        </div>

        <div className="home_card_price">
          <span className="home_card_cost">
            {formatCurrency(product?.price?.cost || 0, activeCountry.locale, product?.price?.currency || activeCountry.currency)}
          </span>
          {product?.price?.mrp > product?.price?.cost && (
            <span className="home_card_mrp">
              {formatCurrency(product?.price?.mrp || 0, activeCountry.locale, product?.price?.currency || activeCountry.currency)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Main component ── */
const Maincomp = React.memo(
  ({
    selectedCategory = CATEGORY_ALL,
    filters = null,
    setSelectedCategory,
    searchTerm = "",
  }) => {
    const { t } = useTranslation();
    const { account, setShowLoginPrompt } = useContext(Logincontext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      limit: 12,
    });

    const handleExploreClick = () => {
      if (!account) {
        setShowLoginPrompt(true);
      } else {
        navigate("/products/all");
      }
    };

    const handleCreateProductClick = () => {
      if (!account) {
        setShowLoginPrompt(true);
      } else {
        navigate("/products/new");
      }
    };

    const handleLoginRequired = () => {
      setShowLoginPrompt(true);
    };

    const fetchProducts = useCallback(async (page = 1) => {
      setLoading(true);
      try {
        const payload = {
          category:
            selectedCategory && selectedCategory !== CATEGORY_ALL
              ? selectedCategory
              : undefined,
          selections: filters?.selections || {},
          price: filters?.price ?? null,
          search: searchTerm,
          page,
          limit: 12,
        };

        const response = await axiosInstance.post("/products/filter", payload);
        const resData = response.data;

        if (resData.data) {
          setProducts(resData.data || []);
          setPagination({
            totalItems: resData.total || resData.data.length,
            totalPages: resData.total_pages || 1,
            currentPage: resData.page || page,
            limit: resData.limit || 12,
          });
        } else {
          const arr = Array.isArray(resData) ? resData : [];
          setProducts(arr);
          setPagination({
            totalItems: arr.length,
            totalPages: 1,
            currentPage: 1,
            limit: 12,
          });
        }
      } catch (error) {
        setProducts([]);
        console.log("Products fetch failed:", error.message);
      } finally {
        setLoading(false);
      }
    }, [selectedCategory, filters, searchTerm]);

    useEffect(() => {
      fetchProducts(1);
    }, [fetchProducts]);

    const handlePageChange = (newPage) => {
      if (newPage === pagination.currentPage) return;
      fetchProducts(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const isDefaultView = selectedCategory === CATEGORY_ALL && !filters && !searchTerm;

    if (loading && products.length === 0) {
      return (
        <div className="home_section">
          <div style={{ height: 380, background: "var(--surface-2)", borderRadius: 12, marginBottom: 12 }} />
          <ProductSkeletonList count={8} />
        </div>
      );
    }

    return (
      <div className="home_section">

        {/* ── HERO AREA ── */}
        <section className="hero_area_full" aria-label="Hero Banner">
          <div className="banner_part_full">
            <Banner onExplore={handleExploreClick} />
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <TrustBar />

        {/* ── CATEGORY / FILTER STATUS ── */}
        {(!isDefaultView) && (
          <section className="category_status" aria-label="Filter status">
            <h4>
              {selectedCategory === CATEGORY_ALL
                ? t("home.showingAll")
                : `${t("home.category")}: ${selectedCategory}`}
            </h4>
            <p>
              {pagination.totalItems} {t("allProducts.productsFound")}
            </p>
          </section>
        )}

        {/* ── ALL PRODUCTS GRID ── */}
        {loading ? (
          <div className="home_products_section">
            <ProductSkeletonList count={12} />
          </div>
        ) : products.length > 0 ? (
          <div className="home_products_section">
            {/* Section header */}
            <div className="home_products_header">
              <div className="home_products_title_wrap">
                <span className="home_products_tag">{t("product.curated", "Curated")}</span>
                <h2 className="home_products_title">
                  {isDefaultView
                    ? t("home.allProducts", "All Products")
                    : selectedCategory === CATEGORY_ALL
                    ? t("allProducts.title", "Products")
                    : selectedCategory}
                </h2>
                <span className="home_products_count">
                  {pagination.totalItems} {t("allProducts.productsFound", "products")}
                </span>
              </div>
              <button className="home_viewall_btn" onClick={handleExploreClick}>
                <span>{t("product.viewAll", "View All")}</span>
                <ArrowForward style={{ fontSize: 18 }} />
              </button>
            </div>

            {/* Products grid */}
            <motion.div layout className="home_products_grid">
              <AnimatePresence>
                {products.map((product) => (
                  <ProductCard
                    key={product.id || product._id}
                    product={product}
                    onLoginRequired={handleLoginRequired}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="home_pagination_wrap">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  limit={pagination.limit}
                  onPageChange={handlePageChange}
                  showItemsInfo={true}
                  showPageSizeSelector={false}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="category_empty_state" style={{ position: "relative" }}>
            <span className="floating_icon">🛍️</span>
            <span className="floating_icon">🔍</span>
            <span className="floating_icon">📱</span>
            <span className="floating_icon">💎</span>

            <h3 className="empty_title">{t("home.noProductsFound")}</h3>
            <p className="empty_description">{t("home.noProductsDesc")}</p>
            <div className="empty_actions">
              <button
                type="button"
                className="action_btn primary_btn"
                onClick={() => setSelectedCategory && setSelectedCategory(CATEGORY_ALL)}
              >
                <span>🏠</span>
                {t("home.browseAllProducts")}
              </button>
              <button
                type="button"
                className="action_btn create_btn"
                onClick={handleCreateProductClick}
              >
                <span>✨</span>
                {t("admin.createProduct", "Create Product")}
              </button>
              <button
                type="button"
                className="action_btn secondary_btn"
                onClick={() => window.location.reload()}
              >
                <span>🔄</span>
                {t("home.refreshPage")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default Maincomp;
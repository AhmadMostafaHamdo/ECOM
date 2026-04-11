import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Banner from "./Banner";
import SpecialProductSections from "./SpecialProductSections";
import Slide from "./Slide";
import "../home/home.css";
import { Divider } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { axiosInstance } from "../../api";

import { ProductSkeletonList } from "../common/ProductSkeleton";
import { Logincontext } from "../context/Contextprovider";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORY_ALL = "All Categories";

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

    const handleExploreClick = () => {
        if (!account) {
            setShowLoginPrompt(true);
        } else {
            navigate('/products/all');
        }
    };

    const handleCreateProductClick = () => {
        if (!account) {
            setShowLoginPrompt(true);
        } else {
            navigate('/products/new');
        }
    };

    useEffect(() => {
      let isMounted = true;

      const fetchProducts = async () => {
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
          };

          const response = await axiosInstance.post("/products/filter", payload);
          const resData = response.data;

          if (isMounted) {
            setProducts(
              resData.data || (Array.isArray(resData.data) ? resData.data : []),
            );
          }
        } catch (error) {
          if (isMounted) {
            setProducts([]);
          }
          console.log("Products fetch failed:", error.message);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchProducts();

      return () => {
        isMounted = false;
      };
    }, [selectedCategory, filters, searchTerm]);

    if (loading && products.length === 0) {
      return (
        <div className="home_section">
          <ProductSkeletonList count={8} />
        </div>
      );
    }

    return (
      <>
        <div className="home_section">
          {/* Localized Territory Banner */}


          <section className="hero_grid">
            <div className="banner_part">
              <Banner />
            </div>

            <aside className="right_slide">
              <div className="right_slide_content">
                <h4>{t("home.premiumCollection")}</h4>
                <p>{t("home.premiumDescription")}</p>
                <div className="right_img_wrapper">
                  <img
                    src="/assets/banners/electronics.png"
                    alt="Latest launch"
                    loading="lazy"
                  />
                </div>
                <button type="button" className="explore_link" onClick={handleExploreClick}>
                  {t("home.exploreCollection")}
                </button>
              </div>
            </aside>
          </section>

          <section className="category_status">
            <h4>
              {selectedCategory === CATEGORY_ALL
                ? t("home.showingAll")
                : `${t("home.category")}: ${selectedCategory}`}
            </h4>
            <p>
              {products.length} {t("allProducts.productsFound")}
            </p>
          </section>

          <section className="trust_strip">
            <article>
              <StarIcon />
              <div>
                <h5>{t("home.verifiedQuality")}</h5>
                <p>{t("home.verifiedQualityDesc")}</p>
              </div>
            </article>
            <article>
              <LocalShippingIcon />
              <div>
                <h5>{t("home.expressDelivery")}</h5>
                <p>{t("home.expressDeliveryDesc")}</p>
              </div>
            </article>
            <article>
              <TrendingUpIcon />
              <div>
                <h5>{t("home.trendingNow")}</h5>
                <p>{t("home.trendingNowDesc")}</p>
              </div>
            </article>
          </section>

          {products.length > 0 ? (
            <>
              {selectedCategory === CATEGORY_ALL && !filters && !searchTerm ? (
                <SpecialProductSections />
              ) : (
                <>
                  <Slide
                    title={
                      selectedCategory === CATEGORY_ALL
                        ? t("allProducts.title")
                        : selectedCategory
                    }
                    products={products}
                    category={
                      selectedCategory === CATEGORY_ALL
                        ? "all"
                        : selectedCategory
                    }
                  />

                  <div className="center_img reveal_section" style={{ animationDelay: '0.2s' }}>
                    <div className="center_img_overlay">
                      <h3>{t("home.savingsHub")}</h3>
                      <p>{t("home.savingsDescription")}</p>
                    </div>
                    <img
                      src="/assets/banners/sale.png"
                      alt="Special offers"
                      loading="lazy"
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="category_empty_state">
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
                  onClick={() =>
                    setSelectedCategory && setSelectedCategory(CATEGORY_ALL)
                  }
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

        <Divider className="main_divider" />
      </>
    );
  },
);

export default Maincomp;
                                                        
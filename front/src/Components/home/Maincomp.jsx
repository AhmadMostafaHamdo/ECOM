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
import { apiUrl } from "../../api";

const CATEGORY_ALL = "All Categories";

const Maincomp = React.memo(({ selectedCategory = CATEGORY_ALL, filters = null, setSelectedCategory }) => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        let loaderTimer;

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const payload = {
                    category: selectedCategory !== CATEGORY_ALL ? selectedCategory : null,
                    selections: filters?.selections || {},
                    price: filters?.price ?? null
                };

                const response = await fetch(apiUrl("/products/filter"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (isMounted) {
                    setProducts(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (isMounted) {
                    setProducts([]);
                }
                console.log("Products fetch failed:", error.message);
            } finally {
                loaderTimer = setTimeout(() => {
                    if (isMounted) {
                        setLoading(false);
                    }
                }, 350);
            }
        };

        fetchProducts();

        return () => {
            isMounted = false;
            if (loaderTimer) {
                clearTimeout(loaderTimer);
            }
        };
    }, [selectedCategory, filters]);

    if (loading) {
        return (
            <div className="main_loader">
                <div className="loader_content">
                    <div className="loader_icon">
                        <ShoppingBagIcon className="shopping_icon pulse" />
                    </div>
                    <div className="loader_spinner_main"></div>
                    <h2>{t('home.preparingCollections')}</h2>
                    <p>{t('home.loadingPersonalized')}</p>
                    <div className="loader_progress">
                        <div className="loader_progress_bar"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="home_section">
                <section className="hero_grid">
                    <div className="banner_part">
                        <Banner />
                    </div>

                    <aside className="right_slide">
                        <div className="right_slide_content">
                            <h4>{t('home.premiumCollection')}</h4>
                            <p>{t('home.premiumDescription')}</p>
                            <div className="right_img_wrapper">
                                <img
                                    src="https://images-eu.ssl-images-amazon.com/images/G/31/img21/Wireless/Jupiter/Launches/T3/DesktopGateway_CategoryCard2x_758X608_T3._SY608_CB639883570_.jpg"
                                    alt="Latest launch"
                                    loading="lazy"
                                />
                            </div>
                            <button type="button" className="explore_link">
                                {t('home.exploreCollection')}
                            </button>
                        </div>
                    </aside>
                </section>

                <section className="category_status">
                    <h4>{selectedCategory === CATEGORY_ALL ? t('home.showingAll') : `${t('home.category')}: ${selectedCategory}`}</h4>
                    <p>{products.length} {t('home.productsAvailable')}{products.length === 1 ? "" : "s"}</p>
                </section>

                <section className="trust_strip">
                    <article>
                        <LocalShippingIcon />
                        <div>
                            <h5>{t('home.fastDelivery')}</h5>
                            <p>{t('home.fastDeliveryDesc')}</p>
                        </div>
                    </article>
                    <article>
                        <StarIcon />
                        <div>
                            <h5>{t('home.verifiedQuality')}</h5>
                            <p>{t('home.verifiedQualityDesc')}</p>
                        </div>
                    </article>
                    <article>
                        <TrendingUpIcon />
                        <div>
                            <h5>{t('home.secureCheckout')}</h5>
                            <p>{t('home.secureCheckoutDesc')}</p>
                        </div>
                    </article>
                </section>

                {products.length > 0 ? (
                    <>
                        {selectedCategory === CATEGORY_ALL && !filters ? (
                            <SpecialProductSections />
                        ) : (
                            <>
                                <Slide title={`${selectedCategory === CATEGORY_ALL ? "All Products" : selectedCategory}`} products={products} />
                                
                                <div className="center_img">
                                    <div className="center_img_overlay">
                                        <h3>Exclusive Savings Hub</h3>
                                        <p>Up to 80% off selected categories this week.</p>
                                    </div>
                                    <img
                                        src="https://m.media-amazon.com/images/G/31/AMS/IN/970X250-_desktop_banner.jpg"
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

                        <h3 className="empty_title">{t('home.noProductsFound')}</h3>
                        <p className="empty_description">
                            {t('home.noProductsDesc')}
                        </p>
                        <div className="empty_actions">
                            <button
                                type="button"
                                className="action_btn primary_btn"
                                onClick={() => setSelectedCategory && setSelectedCategory(CATEGORY_ALL)}
                            >
                                <span>🏠</span>
                                {t('home.browseAllProducts')}
                            </button>
                            <button
                                type="button"
                                className="action_btn secondary_btn"
                                onClick={() => window.location.reload()}
                            >
                                <span>🔄</span>
                                {t('home.refreshPage')}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Divider className="main_divider" />
        </>
    );
});

export default Maincomp;

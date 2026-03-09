import React from "react";
import { useTranslation } from "react-i18next";
import { useLocalize } from "../context/LocalizeContext";
import { formatCurrency } from "../../utils/localizeUtils";
import "../home/slide.css";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowForward, LocalOffer, StarRate, Visibility } from "@mui/icons-material";

const responsive = {
    desktop: {
        breakpoint: { max: 3000, min: 1220 },
        items: 4
    },
    tablet: {
        breakpoint: { max: 1220, min: 640 },
        items: 2
    },
    mobile: {
        breakpoint: { max: 640, min: 0 },
        items: 1
    }
};

const Slide = React.memo(({ title, products, category }) => {
    const { t } = useTranslation();
    const { activeCountry } = useLocalize();
    const navigate = useNavigate();
    const items = Array.isArray(products) ? products : [];

    const handleViewAll = () => {
        // Use provided category or extract from title
        const targetCategory = category || (title ? title.toLowerCase().replace(/\s+/g, '-') : "all");
        navigate(`/products/all/${targetCategory}`);
    };

    return (
        <div className="products_section">
            <div className="products_deal">
                <div className="title_wrapper">
                    <p className="title_tag">{t('product.curated')}</p>
                    <h3>{title}</h3>
                </div>
                <button className="view_btn" type="button" onClick={handleViewAll}>
                    <span>{t('product.viewAll')}</span>
                    <ArrowForward className="arrow_icon" />
                </button>
            </div>

            {items.length > 0 ? (
                <Carousel
                    responsive={responsive}
                    infinite={true}
                    draggable={false}
                    swipeable={true}
                    autoPlay={true}
                    autoPlaySpeed={4000}
                    keyBoardControl={true}
                    removeArrowOnDeviceType={["tablet", "mobile"]}
                    itemClass="carousel-item-padding-40-px"
                    containerClass="carousel-container"
                >
                    {items.map((e) => (
                        <NavLink to={`/getproductsone/${e.id}`} key={e.id} className="product_link">
                            <div className="products_items">
                                <div className="product_img">
                                    <img src={e.url} alt={e.title.shortTitle} loading="lazy" />
                                    {e.discount && (
                                        <div className="discount_badge">
                                            <LocalOffer className="offer_icon" />
                                            {e.discount}
                                        </div>
                                    )}
                                </div>
                                <div className="product_info">
                                    <p className="products_name">{e.title.shortTitle}</p>
                                    <div className="location_badge_mini" style={{ fontSize: '10px', color: '#888', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {e.locationDetail && (e.locationDetail.city || e.locationDetail.country) ? (
                                            <>
                                                <LocalOffer style={{ fontSize: '11px', color: '#f5a623' }} />
                                                <span>{e.locationDetail.city || e.locationDetail.province || e.locationDetail.country}</span>
                                            </>
                                        ) : null}
                                    </div>
                                    <p className="products_explore">{e.tagline}</p>
                                    <div className="meta_row">
                                        <span className="rating_chip">
                                            <StarRate className="rating_icon" />
                                            {Number(e.rating || 0).toFixed(1)}
                                        </span>
                                        <span className="views_chip">
                                            <Visibility className="views_icon" />
                                            {e.views || 0} {t('product.views')}
                                        </span>
                                    </div>
                                    <div className="price_section">
                                        <span className="price_value">
                                          {formatCurrency(e.price.cost, activeCountry.locale, e.price.currency || activeCountry.currency)}
                                        </span>
                                        <span className="strike_price">
                                          {formatCurrency(e.price.mrp, activeCountry.locale, e.price.currency || activeCountry.currency)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </NavLink>
                    ))}
                </Carousel>
            ) : (
                <div className="empty_products">{t('home.loadingProducts')}</div>
            )}
        </div>
    );
});

export default Slide;

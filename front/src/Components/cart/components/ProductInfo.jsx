import React from 'react';
import { useTranslation } from 'react-i18next';
import { Divider } from '@mui/material';
import { StarRate, Visibility, Favorite, LocalOffer } from '@mui/icons-material';
import RatingDistribution from '../../reviews/RatingDistribution';
import StarRating from '../../reviews/StarRating';
import { useLocalize } from '../../context/LocalizeContext';
import { formatCurrency } from '../../../utils/localizeUtils';

const ProductInfo = ({ product, likeCount, reviewSummary }) => {
    const { t } = useTranslation();
    const { activeCountry } = useLocalize();

    return (
        <div className="right_cart">
            <div className="product_header">
                <div className="product-category-tag">
                    {product.category || t('admin.productCategory')}
                </div>
                <h3>{product.title?.shortTitle}</h3>
                <h4>{product.title?.longTitle}</h4>
                <div className="product_meta">
                    <span className="rating_chip">
                        <StarRate />
                        {Number(product.averageRating || product.rating || 0).toFixed(1)}
                        {product.totalReviews > 0 && (
                            <span className="review-count-mini">({product.totalReviews})</span>
                        )}
                    </span>
                    <span className="views_chip">
                        <Visibility />
                        {product.views || 0} {t("product.views")}
                    </span>
                    <span className="like_chip">
                        <Favorite />
                        {likeCount}
                    </span>
                </div>
            </div>

            <Divider className="product_divider" />

            <div className="price_section_cart">
                <p className="mrp">
                    {t('product.mrp', 'MRP')}: <del>{formatCurrency(product.price?.mrp, activeCountry.locale, activeCountry.currency)}</del>
                </p>
                <div className="deal_price">
                    <span className="deal_label">{t("cart.todayPrice")}:</span>
                    <span className="price_value">{formatCurrency(product.price?.cost, activeCountry.locale, activeCountry.currency)}</span>
                </div>
                <div className="savings">
                    <span>{t("cart.youSave")}:</span>
                    <span className="save_value">
                        {formatCurrency(product.price?.mrp - product.price?.cost, activeCountry.locale, activeCountry.currency)} (
                        {product.price?.discount})
                    </span>
                </div>
            </div>

            <div className="discount_box">
                <div className="discount_item">
                    <LocalOffer className="discount_icon" />
                    <div>
                        <h5>
                            {t("product.discount")}: <span>{product.discount}</span>
                        </h5>
                    </div>
                </div>
            </div>

            {reviewSummary && reviewSummary.totalReviews > 0 && (
                <div className="product-rating-summary">
                    <div className="rating-summary-left">
                        <div className="rating-big-number">{reviewSummary.averageRating.toFixed(1)}</div>
                        <StarRating rating={reviewSummary.averageRating} size="md" />
                        <span className="rating-total">{reviewSummary.totalReviews} {t('product.reviews')}</span>
                    </div>
                    <div className="rating-summary-right">
                        <RatingDistribution
                            distribution={reviewSummary.ratingDistribution}
                            totalReviews={reviewSummary.totalReviews}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductInfo;

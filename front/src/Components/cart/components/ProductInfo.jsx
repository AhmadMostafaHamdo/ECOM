import React from 'react';
import { useTranslation } from 'react-i18next';
import { Divider } from '@mui/material';
import { StarRate, Visibility, Favorite, LocalOffer, CalendarMonth } from '@mui/icons-material';
import RatingDistribution from '../../reviews/RatingDistribution';
import StarRating from '../../reviews/StarRating';
import { useLocalize } from '../../context/LocalizeContext';
import { formatCurrency } from '../../../utils/localizeUtils';

const ProductInfo = ({ product, likeCount, reviewSummary }) => {
    const { t } = useTranslation();
    const { activeCountry } = useLocalize();
    
    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString(activeCountry.locale === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

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
                    {product.createdAt && (
                        <span className="date_chip" title={t('product.createdAt')}>
                            <CalendarMonth />
                            {formatDate(product.createdAt)}
                        </span>
                    )}
                </div>
            </div>

            <Divider className="product_divider" />

            <div className="price_section_cart">
                <p className="mrp">
                    {t('product.mrp', 'MRP')}: <del>{formatCurrency(product.price?.mrp, activeCountry.locale, product.price?.currency || activeCountry.currency)}</del>
                </p>
                <div className="deal_price">
                    <span className="deal_label">{t("cart.todayPrice")}:</span>
                    <span className="price_value">{formatCurrency(product.price?.cost, activeCountry.locale, product.price?.currency || activeCountry.currency)}</span>
                </div>
                <div className="savings">
                    <span>{t("cart.youSave")}:</span>
                    <span className="save_value">
                        {formatCurrency(product.price?.mrp - product.price?.cost, activeCountry.locale, product.price?.currency || activeCountry.currency)} (
                        {product.price?.discount})
                    </span>
                </div>
            </div>

            {product.locationDetail && (product.locationDetail.country || product.locationDetail.province || product.locationDetail.city) && (
                <div className="location_section" style={{ margin: '16px 0', padding: '12px', background: 'var(--surface-alt, #f8f8fb)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent, #f5a623)', fontWeight: '600', fontSize: '14px' }}>
                        <LocalOffer style={{ fontSize: '18px' }} />
                        <span>{t('product.location', 'Location')}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px', fontSize: '13px' }}>
                        {product.locationDetail.country && (
                            <div>
                                <span style={{ color: '#888', display: 'block' }}>{t('productCreator.country', 'Country')}</span>
                                <span style={{ fontWeight: '500' }}>{product.locationDetail.country}</span>
                            </div>
                        )}
                        {product.locationDetail.province && (
                            <div>
                                <span style={{ color: '#888', display: 'block' }}>{t('productCreator.province', 'Province')}</span>
                                <span style={{ fontWeight: '500' }}>{product.locationDetail.province}</span>
                            </div>
                        )}
                        {product.locationDetail.city && (
                            <div>
                                <span style={{ color: '#888', display: 'block' }}>{t('productCreator.city', 'City')}</span>
                                <span style={{ fontWeight: '500' }}>{product.locationDetail.city}</span>
                            </div>
                        )}
                    </div>

                    {/* Contact Detail inside location box or sibling */}
                    {product.mobile && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border, #ebebf0)' }}>
                            <span style={{ color: '#888', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                                {t('auth.mobile', 'Phone Number')}
                            </span>
                            <a 
                                href={`tel:${product.mobile}`} 
                                style={{ 
                                    color: 'var(--text-1)', 
                                    fontWeight: '600', 
                                    fontSize: '15px', 
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>📞</span>
                                <span dir="ltr">{product.mobile}</span>
                            </a>
                        </div>
                    )}
                </div>
            )}

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

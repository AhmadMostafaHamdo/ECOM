import React from 'react';
import { useTranslation } from 'react-i18next';
import { Divider } from '@mui/material';
import {
  StarRate, Visibility, Favorite, LocalOffer, CalendarMonth,
  LocationOn, PhoneInTalk, VerifiedUser
} from '@mui/icons-material';
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

  const hasDiscount = product.price?.mrp && product.price?.cost && product.price.mrp > product.price.cost;
  const savingsAmount = hasDiscount ? product.price.mrp - product.price.cost : 0;

  return (
    <div className="right_cart">

      {/* ── Header ── */}
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

      {/* ── Price (reference price only, no checkout) ── */}
      <div className="price_section_cart">
        <div className="price_label_row">
          <span className="price_label_text">{t('product.referencePrice', 'Reference Price')}</span>
          {hasDiscount && (
            <span className="discount_pill">
              {product.price?.discount || `-${Math.round((savingsAmount / product.price.mrp) * 100)}%`}
            </span>
          )}
        </div>
        <div className="price_value_row">
          <span className="actual_price">
            {formatCurrency(product.price?.cost, activeCountry.locale, product.price?.currency || activeCountry.currency)}
          </span>
          {hasDiscount && (
            <span className="mrp_strike">
              {formatCurrency(product.price?.mrp, activeCountry.locale, product.price?.currency || activeCountry.currency)}
            </span>
          )}
        </div>
        <p className="price_note">
          <VerifiedUser style={{ fontSize: '13px', verticalAlign: 'middle', marginRight: '4px' }} />
          {t('product.priceNote', 'Price is indicative. Contact seller for final quote.')}
        </p>
      </div>

      {/* ── Location ── */}
      {product.locationDetail && (product.locationDetail.country || product.locationDetail.province || product.locationDetail.city) && (
        <div className="product_location_box">
          <div className="location_header">
            <LocationOn />
            <span>{t('product.location', 'Location')}</span>
          </div>
          <div className="location_grid">
            {product.locationDetail.country && (
              <div className="location_item">
                <span className="loc_label">{t('productCreator.country', 'Country')}</span>
                <span className="loc_value">{product.locationDetail.country}</span>
              </div>
            )}
            {product.locationDetail.province && (
              <div className="location_item">
                <span className="loc_label">{t('productCreator.province', 'Province')}</span>
                <span className="loc_value">{product.locationDetail.province}</span>
              </div>
            )}
            {product.locationDetail.city && (
              <div className="location_item">
                <span className="loc_label">{t('productCreator.city', 'City')}</span>
                <span className="loc_value">{product.locationDetail.city}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Discount tag ── */}
      {product.discount && (
        <div className="discount_box">
          <div className="discount_item">
            <LocalOffer className="discount_icon" />
            <div>
              <h5>
                {t("product.discount", "Discount")}: <span>{product.discount}</span>
              </h5>
            </div>
          </div>
        </div>
      )}

      {/* ── Reviews Summary ── */}
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

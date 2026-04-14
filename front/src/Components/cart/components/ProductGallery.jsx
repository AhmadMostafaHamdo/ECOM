import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircularProgress } from '@mui/material';
import {
  Favorite, FavoriteBorder, ChatBubbleOutline,
  LocalOffer, PhoneInTalk, InfoOutlined
} from '@mui/icons-material';
import { AlertCircle } from 'lucide-react';
import { ROOT_URL } from '../../../api';

const ProductGallery = ({
  images,
  product,
  liked,
  handleLike,
  likeCount,
  likeLoading,
  handleChatWithSeller,
  chatLoading,
  wishSaved,
  toggleWishlist,
  wishLoading,
  setReportOpen,
  account
}) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="left_cart">
      {/* ── Main Image ── */}
      <div className="product_image_wrapper">
        <img
          src={(() => {
            const baseUrl = images[selectedImage] || product.detailUrl;
            if (!baseUrl) return '';
            return (baseUrl.startsWith('http') || baseUrl.startsWith('blob:')) ? baseUrl : `${ROOT_URL}${baseUrl}`;
          })()}
          alt={product.title?.shortTitle || 'product'}
        />
        {product.discount && (
          <div className="product_discount_badge">
            <LocalOffer className="offer_icon_small" />
            {product.discount}
          </div>
        )}
        <button
          className={`product-like-overlay ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={likeLoading}
        >
          {likeLoading
            ? <CircularProgress size={16} color="inherit" />
            : (liked ? <Favorite /> : <FavoriteBorder />)}
          <span>{likeCount}</span>
        </button>
      </div>

      {/* ── Thumbnails ── */}
      {images.length > 1 && (
        <div className="product-thumbnails">
          {images.map((img, idx) => (
            <button
              key={idx}
              className={`product-thumb ${selectedImage === idx ? 'active' : ''}`}
              onClick={() => setSelectedImage(idx)}
            >
              <img
                src={img && (img.startsWith('http') || img.startsWith('blob:')) ? img : `${ROOT_URL}${img}`}
                alt={`view ${idx + 1}`}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Action Buttons (no payment/delivery) ── */}
      <div className="cart_btn">

        {/* Inquire / Contact Seller — primary CTA */}
        <button
          className="cart_btn_buy"
          onClick={handleChatWithSeller}
          disabled={chatLoading}
        >
          {chatLoading
            ? <CircularProgress size={20} className="btn_icon" color="inherit" />
            : <ChatBubbleOutline className="btn_icon" />}
          <span>{t('product.inquireNow', 'Inquire Now')}</span>
        </button>

        {/* If product has phone number — call button */}
        {product.mobile && (
          <a
            href={`tel:${product.mobile}`}
            className="cart_btn_call"
          >
            <PhoneInTalk className="btn_icon" />
            <span dir="ltr">{product.mobile}</span>
          </a>
        )}

        {/* Wishlist */}
        <button
          className={`cart_btn_wishlist ${wishSaved ? 'cart_btn_wishlist--saved' : ''}`}
          onClick={toggleWishlist}
          disabled={wishLoading}
          title={wishSaved
            ? t('product.removeFromWishlist', 'Remove from Wishlist')
            : t('product.addToWishlist', 'Add to Wishlist')}
        >
          {wishLoading
            ? <CircularProgress size={20} className="btn_icon" color="inherit" />
            : (wishSaved ? <Favorite className="btn_icon" /> : <FavoriteBorder className="btn_icon" />)}
          <span>
            {wishSaved ? t('product.saved', 'Saved') : t('product.saveForLater', 'Save for Later')}
          </span>
        </button>

        {/* Report */}
        {account && (
          <button
            className="cart_btn_report"
            onClick={() => setReportOpen(true)}
            title={t('product.reportProduct', 'Report Product')}
          >
            <AlertCircle size={16} />
            {t('product.reportProduct', 'Report Product')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;

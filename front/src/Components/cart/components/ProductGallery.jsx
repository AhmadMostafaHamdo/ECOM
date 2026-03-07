import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircularProgress } from '@mui/material';
import { Favorite, FavoriteBorder, ChatBubbleOutline, LocalOffer } from '@mui/icons-material';
import { AlertCircle } from 'lucide-react';

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
            <div className="product_image_wrapper">
                <img
                    src={images[selectedImage] || product.detailUrl}
                    alt={product.title?.shortTitle || 'product'}
                />
                {product.discount && (
                    <div className="product_discount_badge">
                        <LocalOffer className="offer_icon_small" />
                        {product.discount}
                    </div>
                )}
                <button className={`product-like-overlay ${liked ? 'liked' : ''}`} onClick={handleLike} disabled={likeLoading}>
                    {likeLoading ? <CircularProgress size={16} color="inherit" /> : (liked ? <Favorite /> : <FavoriteBorder />)}
                    <span>{likeCount}</span>
                </button>
            </div>

            {images.length > 1 && (
                <div className="product-thumbnails">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            className={`product-thumb ${selectedImage === idx ? 'active' : ''}`}
                            onClick={() => setSelectedImage(idx)}
                        >
                            <img src={img} alt={`view ${idx + 1}`} />
                        </button>
                    ))}
                </div>
            )}

            <div className="cart_btn">
                <button className="cart_btn_chat" onClick={handleChatWithSeller} disabled={chatLoading}>
                    {chatLoading ? <CircularProgress size={20} className="btn_icon" color="inherit" /> : <ChatBubbleOutline className="btn_icon" />}
                    <span>{t('product.chatWithSeller', 'Chat with Seller')}</span>
                </button>

                <button
                    className={`cart_btn_wishlist ${wishSaved ? 'cart_btn_wishlist--saved' : ''}`}
                    onClick={toggleWishlist}
                    disabled={wishLoading}
                    title={wishSaved ? t('product.removeFromWishlist', 'Remove from Wishlist') : t('product.addToWishlist', 'Add to Wishlist')}
                >
                    {wishLoading ? <CircularProgress size={20} className="btn_icon" color="inherit" /> : (wishSaved ? <Favorite className="btn_icon" />  : <FavoriteBorder className="btn_icon" />)}
                    <span>{wishSaved ? t('product.saved', 'Saved') : t('product.saveForLater', 'Save for Later')}</span>
                </button>

                {account && (
                    <button
                        className="cart_btn_report"
                        onClick={() => setReportOpen(true)}
                        title={t('product.reportProduct', 'Report Product')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '10px 18px', borderRadius: '10px',
                            border: '1px solid #fecaca', background: '#fff5f5',
                            color: '#ef4444', cursor: 'pointer',
                            fontSize: '13px', fontWeight: '700',
                            transition: 'all 0.2s', marginTop: '8px'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fff5f5'; }}
                    >
                        <AlertCircle/> {t('product.reportProduct', 'Report Product')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductGallery;

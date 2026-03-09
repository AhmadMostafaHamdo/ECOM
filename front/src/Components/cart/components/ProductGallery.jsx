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
    addtocart,
    addingToCart,
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
                <button
                    className="cart_btn_buy"
                    onClick={() => addtocart(product.id || product._id)}
                    disabled={addingToCart}
                >
                    {addingToCart ? <CircularProgress size={20} className="btn_icon" color="inherit" /> : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn_icon">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                    )}
                    <span>{t('cart.buyNow', 'Buy Now')}</span>
                </button>

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
                    {wishLoading ? <CircularProgress size={20} className="btn_icon" color="inherit" /> : (wishSaved ? <Favorite className="btn_icon" /> : <FavoriteBorder className="btn_icon" />)}
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
                        <AlertCircle /> {t('product.reportProduct', 'Report Product')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductGallery;

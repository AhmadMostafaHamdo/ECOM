import React, { useState } from 'react';
import { Favorite, FavoriteBorder, ChatBubbleOutline, LocalOffer } from '@mui/icons-material';

const ProductGallery = ({
    images,
    product,
    liked,
    handleLike,
    likeCount,
    handleChatWithSeller,
    wishSaved,
    toggleWishlist,
    wishLoading,
    setReportOpen,
    account
}) => {
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
                <button className={`product-like-overlay ${liked ? 'liked' : ''}`} onClick={handleLike}>
                    {liked ? <Favorite /> : <FavoriteBorder />}
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
                <button className="cart_btn_chat" onClick={handleChatWithSeller}>
                    <ChatBubbleOutline className="btn_icon" />
                    <span>تواصل مع البائع</span>
                </button>

                <button
                    className={`cart_btn_wishlist ${wishSaved ? 'cart_btn_wishlist--saved' : ''}`}
                    onClick={toggleWishlist}
                    disabled={wishLoading}
                    title={wishSaved ? 'إزالة من المحفوظات' : 'حفظ في المحفوظات'}
                >
                    {wishSaved ? <Favorite className="btn_icon" /> : <FavoriteBorder className="btn_icon" />}
                    <span>{wishSaved ? 'تم الحفظ' : 'حفظ في المحفوظات'}</span>
                </button>

                {account && (
                    <button
                        className="cart_btn_report"
                        onClick={() => setReportOpen(true)}
                        title="الإبلاغ عن هذا المنتج"
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
                        ⚠️ الإبلاغ عن المنتج
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductGallery;

import React, { useState } from 'react';
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductTabs from "./ProductTabs";

const ProductLayout = ({
    product,
    images,
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
    const [reviewSummary, setReviewSummary] = useState(null);

    return (
        <div className="product-page">
            <div className="product-main cart_container">
                <ProductGallery
                    images={images}
                    product={product}
                    liked={liked}
                    handleLike={handleLike}
                    likeCount={likeCount}
                    likeLoading={likeLoading}
                    handleChatWithSeller={handleChatWithSeller}
                    chatLoading={chatLoading}
                    addtocart={addtocart}
                    addingToCart={addingToCart}
                    wishSaved={wishSaved}
                    toggleWishlist={toggleWishlist}
                    wishLoading={wishLoading}
                    setReportOpen={setReportOpen}
                    account={account}
                />
                <ProductInfo
                    product={product}
                    likeCount={likeCount}
                    reviewSummary={reviewSummary}
                />
            </div>
            <ProductTabs
                product={product}
                reviewSummary={reviewSummary}
                setReviewSummary={setReviewSummary}
            />
        </div>
    );
};

export default ProductLayout;

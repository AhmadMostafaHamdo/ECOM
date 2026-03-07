import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StarRate } from '@mui/icons-material';
import ReviewForm from '../../reviews/ReviewForm';
import ReviewList from '../../reviews/ReviewList';
import CommentSection from '../../comments/CommentSection';

const ProductTabs = ({ product, reviewSummary, setReviewSummary }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('description');
    const [showReviewForm, setShowReviewForm] = useState(false);

    const handleReviewSubmit = () => {
        setShowReviewForm(false);
    };

    return (
        <div className="product-tabs-section">
            <div className="product-tabs-nav">
                <button
                    className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                    onClick={() => setActiveTab('description')}
                >
                    {t('product.about', 'About')}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    {t('product.reviews', 'Reviews')} {reviewSummary?.totalReviews ? `(${reviewSummary.totalReviews})` : ''}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('comments')}
                >
                    {t('product.comments', 'Comments')}
                </button>
            </div>

            <div className="product-tab-content">
                {activeTab === 'description' && (
                    <div className="description_box">
                        <h5>{t("cart.aboutItem")}</h5>
                        <p>{product.description || t('product.noDescription', 'No description available.')}</p>
                        {product.tagline && (
                            <div className="product-tagline">
                                <span>"{product.tagline}"</span>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="reviews-tab-content">
                        <div className="review-form-toggle">
                            {showReviewForm ? (
                                <ReviewForm
                                    targetType="product"
                                    targetId={product.id || product._id}
                                    onSubmit={handleReviewSubmit}
                                    onCancel={() => setShowReviewForm(false)}
                                />
                            ) : (
                                <button
                                    className="write-review-btn"
                                    onClick={() => setShowReviewForm(true)}
                                >
                                    <StarRate />
                                    {t('product.writeReview', 'Write a Review')}
                                </button>
                            )}
                        </div>
                        <ReviewList
                            targetType="product"
                            targetId={product.id || product._id}
                            onReviewsUpdate={setReviewSummary}
                        />
                    </div>
                )}

                {activeTab === 'comments' && (
                    <CommentSection productId={product.id || product._id} />
                )}
            </div>
        </div>
    );
};

export default ProductTabs;

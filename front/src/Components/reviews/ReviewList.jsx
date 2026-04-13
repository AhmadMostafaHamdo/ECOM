import React, { useState, useEffect, useContext } from 'react';
import StarRating from './StarRating';
import Button from '../common/Button';
import { Logincontext } from '../context/Contextprovider';
import { axiosInstance } from '../../api';
import { toast } from 'react-toastify';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import './ReviewList.css';

const ReviewList = ({ targetType, targetId, onReviewsUpdate }) => {
    const { account } = useContext(Logincontext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [targetType, targetId, page]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/reviews/${targetType}/${targetId}`, {
                params: { page, limit: 10 }
            });

            if (response.status === 200) {
                const data = response.data;
                const newReviews = data.data || data.reviews || [];
                setReviews(prev => page === 1 ? newReviews : [...prev, ...newReviews]);
                const totalPages = data.pagination?.totalPages || data.total_pages || 1;
                const currentPage = data.pagination?.page || data.page || page;
                setHasMore(currentPage < totalPages);
                if (onReviewsUpdate) {
                    onReviewsUpdate(data.summary);
                }
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleHelpful = async (reviewId, currentlyHelpful) => {
        if (!account) {
            toast.error('Please login to vote');
            return;
        }

        try {
            const response = await axiosInstance.put(`/reviews/${reviewId}/helpful`);

            if (response.status === 200) {
                const data = response.data;
                setReviews(prev => prev.map(review =>
                    review._id === reviewId ? data : review
                ));
            }
        } catch (error) {
            console.error('Failed to vote:', error);
        }
    };

    if (loading && page === 1) {
        return (
            <div className="review-list-loading">
                <div className="skeleton" style={{ height: '100px', marginBottom: '1rem' }}></div>
                <div className="skeleton" style={{ height: '100px', marginBottom: '1rem' }}></div>
                <div className="skeleton" style={{ height: '100px' }}></div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="review-list-empty">
                <p>No reviews yet. Be the first to review!</p>
            </div>
        );
    }

    return (
        <div className="review-list">
            {reviews.map((review) => {
                const isHelpful = account && review.helpfulVoters?.includes(account._id);

                return (
                    <div key={review._id} className="review-item">
                        <div className="review-header">
                            <div className="review-author">
                                <div className="review-author-avatar">
                                    {review.reviewerId?.fname?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="review-author-info">
                                    <div className="review-author-name">
                                        {review.reviewerId?.fname || 'Anonymous'}
                                        {review.reviewerId?.isVerified && (
                                            <VerifiedIcon className="verified-icon" />
                                        )}
                                    </div>
                                    <div className="review-meta">
                                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                        {review.verifiedPurchase && (
                                            <span className="verified-purchase">
                                                ✓ Verified Purchase
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <StarRating rating={review.rating} size="sm" />
                        </div>

                        {review.title && (
                            <h4 className="review-title">{review.title}</h4>
                        )}

                        <p className="review-comment">{review.comment}</p>

                        <div className="review-footer">
                            <button
                                className={`review-helpful-btn ${isHelpful ? 'active' : ''}`}
                                onClick={() => handleHelpful(review._id, isHelpful)}
                            >
                                {isHelpful ? (
                                    <ThumbUpIcon fontSize="small" />
                                ) : (
                                    <ThumbUpOutlinedIcon fontSize="small" />
                                )}
                                <span>Helpful ({review.helpful || 0})</span>
                            </button>
                        </div>
                    </div>
                );
            })}

            {hasMore && (
                <div className="review-list-load-more">
                    <Button
                        variant="outline"
                        onClick={() => setPage(prev => prev + 1)}
                        loading={loading}
                    >
                        Load More Reviews
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ReviewList;

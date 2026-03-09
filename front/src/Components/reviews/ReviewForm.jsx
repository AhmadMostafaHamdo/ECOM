import React, { useState, useContext } from 'react';
import StarRating from './StarRating';
import Button from '../common/Button';
import { Logincontext } from '../context/Contextprovider';
import { axiosInstance } from '../../api';
import { toast } from 'react-toastify';
import './ReviewForm.css';

const ReviewForm = ({ targetType, targetId, onSubmit, onCancel }) => {
    const { account } = useContext(Logincontext);
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!account) {
            toast.error('Please login to submit a review');
            return;
        }

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please write a review');
            return;
        }

        setLoading(true);

        try {
            const response = await axiosInstance.post('/reviews', {
                targetType,
                targetId,
                rating,
                title: title.trim(),
                comment: comment.trim()
            });

            if (response.status === 200 || response.status === 201) {
                toast.success('Review submitted successfully!');
                setRating(0);
                setTitle('');
                setComment('');
                if (onSubmit) onSubmit(response.data);
            } else {
                toast.error(response.data.error || 'Failed to submit review');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to submit review';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!account) {
        return (
            <div className="review-form-login-prompt">
                <p>Please login to write a review</p>
            </div>
        );
    }

    return (
        <form className="review-form" onSubmit={handleSubmit}>
            <div className="review-form-header">
                <h3>Write a Review</h3>
            </div>

            <div className="review-form-body">
                <div className="form-group">
                    <label className="form-label">Your Rating *</label>
                    <StarRating
                        rating={rating}
                        interactive={true}
                        size="lg"
                        onChange={setRating}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="review-title" className="form-label">
                        Review Title (Optional)
                    </label>
                    <input
                        id="review-title"
                        type="text"
                        className="form-input"
                        placeholder="Sum up your experience"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={200}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="review-comment" className="form-label">
                        Your Review *
                    </label>
                    <textarea
                        id="review-comment"
                        className="form-textarea"
                        placeholder="Share your thoughts about this product..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={2000}
                        rows={5}
                        required
                    />
                    <div className="form-hint">
                        {comment.length}/2000 characters
                    </div>
                </div>
            </div>

            <div className="review-form-footer">
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={rating === 0 || !comment.trim()}
                >
                    Submit Review
                </Button>
            </div>
        </form>
    );
};

export default ReviewForm;

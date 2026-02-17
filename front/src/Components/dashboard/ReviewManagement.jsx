import React, { useState, useEffect } from 'react';
import { apiUrl } from '../../api';
import { toast } from 'react-toastify';
import StarRating from '../reviews/StarRating';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import './ReviewManagement.css';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
    const [moderating, setModerating] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, [filter]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const url = filter === 'all'
                ? apiUrl('/admin/reviews')
                : apiUrl(`/admin/reviews?status=${filter}`);

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            } else {
                toast.error('Failed to fetch reviews');
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            toast.error('Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleModerate = async (reviewId, status, note = '') => {
        setModerating(reviewId);
        try {
            const response = await fetch(apiUrl(`/admin/reviews/${reviewId}/moderate`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    status,
                    moderationNote: note
                })
            });

            if (response.ok) {
                toast.success(`Review ${status}`);
                fetchReviews();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to moderate review');
            }
        } catch (error) {
            console.error('Failed to moderate review:', error);
            toast.error('Failed to moderate review');
        } finally {
            setModerating(null);
        }
    };

    const handleReject = (reviewId) => {
        if (window.confirm('Are you sure you want to reject this review?')) {
            handleModerate(reviewId, 'rejected', 'Violates guidelines');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'warning', icon: <PendingIcon fontSize="small" />, text: 'Pending' },
            approved: { class: 'success', icon: <CheckCircleIcon fontSize="small" />, text: 'Approved' },
            rejected: { class: 'error', icon: <CancelIcon fontSize="small" />, text: 'Rejected' }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`admin_badge ${badge.class}`}>
                {badge.icon} {badge.text}
            </span>
        );
    };

    return (
        <div className="admin_page">
            <header className="admin_page_header">
                <p className="admin_page_kicker">Moderation</p>
                <h1>Review Management</h1>
                <p>Moderate and manage product and user reviews</p>
            </header>

            {/* Filter Tabs */}
            <div className="review_filter_tabs">
                <button
                    className={`filter_tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Reviews
                </button>
                <button
                    className={`filter_tab ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    Pending
                </button>
                <button
                    className={`filter_tab ${filter === 'approved' ? 'active' : ''}`}
                    onClick={() => setFilter('approved')}
                >
                    Approved
                </button>
                <button
                    className={`filter_tab ${filter === 'rejected' ? 'active' : ''}`}
                    onClick={() => setFilter('rejected')}
                >
                    Rejected
                </button>
            </div>

            {/* Reviews Table */}
            {loading ? (
                <div className="admin_form_card">
                    <p>Loading reviews...</p>
                </div>
            ) : reviews.length === 0 ? (
                <div className="admin_form_card">
                    <p>No reviews found</p>
                </div>
            ) : (
                <div className="admin_table_container">
                    <table className="admin_table">
                        <thead>
                            <tr>
                                <th>Reviewer</th>
                                <th>Rating</th>
                                <th>Review</th>
                                <th>Target</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((review) => (
                                <tr key={review._id}>
                                    <td>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>
                                                {review.reviewerId?.fname || 'Anonymous'}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                                {review.reviewerId?.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <StarRating rating={review.rating} size="sm" />
                                    </td>
                                    <td>
                                        <div style={{ maxWidth: '300px' }}>
                                            {review.title && (
                                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                                    {review.title}
                                                </div>
                                            )}
                                            <div className="review_comment_truncate">
                                                {review.comment}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.875rem' }}>
                                            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                                {review.targetType}
                                            </div>
                                            <div style={{ color: 'var(--color-text-muted)' }}>
                                                {review.targetId}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        {getStatusBadge(review.status)}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {review.status !== 'approved' && (
                                                <button
                                                    className="admin_btn secondary sm"
                                                    onClick={() => handleModerate(review._id, 'approved')}
                                                    disabled={moderating === review._id}
                                                >
                                                    <CheckCircleIcon fontSize="small" />
                                                    Approve
                                                </button>
                                            )}
                                            {review.status !== 'rejected' && (
                                                <button
                                                    className="admin_btn danger sm"
                                                    onClick={() => handleReject(review._id)}
                                                    disabled={moderating === review._id}
                                                >
                                                    <CancelIcon fontSize="small" />
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ReviewManagement;

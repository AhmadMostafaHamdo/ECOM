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
            <header className="admin_page_header" style={{ marginBottom: '40px' }}>
                <p className="admin_page_kicker">Moderation</p>
                <h1>User Feedback</h1>
                <p>Monitor and moderate customer reviews to maintain quality and community guidelines.</p>
            </header>

            {/* Filter Tabs */}
            <div className="review_filter_tabs" style={{ marginBottom: '32px', borderBottom: '1px solid var(--color-border)', gap: '24px' }}>
                {[
                    { id: 'all', label: 'All Reviews' },
                    { id: 'pending', label: 'Pending Approval' },
                    { id: 'approved', label: 'Approved' },
                    { id: 'rejected', label: 'Rejected' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        className={`filter_tab ${filter === tab.id ? 'active' : ''}`}
                        onClick={() => setFilter(tab.id)}
                        style={{ paddingBottom: '12px', fontSize: '14px' }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Reviews Grid/Table */}
            {loading ? (
                <div style={{ padding: '120px', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px' }}></div>
                    <p style={{ color: 'var(--color-text-secondary)', fontWeight: '700', fontSize: '16px' }}>Curating feedback stream...</p>
                </div>
            ) : reviews.length === 0 ? (
                <section className="admin_form_card" style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--color-surface)', border: '1px dashed var(--color-border)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏷️</div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)' }}>No Feedback Detected</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', maxWidth: '400px', margin: '12px auto' }}>The selected filter hasn't returned any results. Try adjusting your search or check again later.</p>
                    <button className="admin_btn secondary" style={{ marginTop: '24px' }} onClick={() => setFilter('all')}>View All Feedback</button>
                </section>
            ) : (
                <section className="admin_table_container">
                    <div style={{ padding: '32px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>Community Sentinel</h2>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>Managing {reviews.length} feedback points</p>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin_table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '32px' }}>Contributor</th>
                                    <th>Rating</th>
                                    <th>Content Analysis</th>
                                    <th>Linkage</th>
                                    <th>Lifecycle</th>
                                    <th style={{ textAlign: 'right', paddingRight: '32px' }}>Moderation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((review) => (
                                    <tr key={review._id}>
                                        <td style={{ paddingLeft: '32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div className="reviewer_avatar">
                                                    {review.reviewerId?.fname?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-text-primary)' }}>
                                                        {review.reviewerId?.fname || 'External Source'}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                                                        {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <div style={{ transform: 'scale(1.1)', transformOrigin: 'left' }}>
                                                    <StarRating rating={review.rating} size="sm" />
                                                </div>
                                                <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--color-text-primary)' }}>{review.rating.toFixed(1)} / 5.0</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ maxWidth: '350px' }}>
                                                {review.title && (
                                                    <div style={{ fontWeight: 900, marginBottom: '4px', fontSize: '14px', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                                                        {review.title}
                                                    </div>
                                                )}
                                                <div className="review_comment_truncate" style={{ fontSize: '13px', lineHeight: '1.6', fontWeight: '500' }}>
                                                    {review.comment}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-primary)', fontSize: '11px', letterSpacing: '0.05em' }}>
                                                    {review.targetType}
                                                </span>
                                                <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: '600' }}>
                                                    UID: {review.targetId?.substring(0, 8)}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ transform: 'scale(0.95)', transformOrigin: 'left' }}>
                                                {getStatusBadge(review.status)}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: '32px' }}>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                {review.status !== 'approved' && (
                                                    <button
                                                        className="admin_btn primary"
                                                        style={{ padding: '8px 16px', fontSize: '12px', minWidth: '90px' }}
                                                        onClick={() => handleModerate(review._id, 'approved')}
                                                        disabled={moderating === review._id || loading}
                                                    >
                                                        Validate
                                                    </button>
                                                )}
                                                {review.status !== 'rejected' && (
                                                    <button
                                                        className="admin_btn"
                                                        style={{ padding: '8px 16px', fontSize: '12px', minWidth: '90px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}
                                                        onClick={() => handleReject(review._id)}
                                                        disabled={moderating === review._id || loading}
                                                    >
                                                        Embargo
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

export default ReviewManagement;

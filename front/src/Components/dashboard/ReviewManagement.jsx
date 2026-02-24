import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { apiUrl } from '../../api';
import Pagination from '../common/Pagination';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import './ReviewManagement.css';

const ReviewManagement = () => {
    const { t } = useTranslation();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
    const [moderating, setModerating] = useState(null);
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    });

    const fetchReviews = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page,
                limit: 10
            });
            if (filter !== 'all') {
                queryParams.append('status', filter);
            }

            const url = apiUrl(`/admin/reviews?${queryParams.toString()}`);
            const response = await fetch(url, { method: 'GET', credentials: 'include' });
            if (response.ok) {
                const resData = await response.json();
                setReviews(resData.data || []);
                setPagination(resData.pagination);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }, [filter]);

    useEffect(() => {
        fetchReviews(1);
    }, [fetchReviews]);

    const handlePageChange = (newPage) => {
        fetchReviews(newPage);
    };

    const handleModerate = async (reviewId, status) => {
        setModerating(reviewId);
        try {
            const response = await fetch(apiUrl(`/admin/reviews/${reviewId}/moderate`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status })
            });
            if (response.ok) fetchReviews(pagination.currentPage);
        } catch (error) { console.error(error); } finally { setModerating(null); }
    };

    return (
        <div className="admin_page bg-transparent">
            {/* <header className="admin_page_header mb-8">
                <div className="review_filter_tabs">
                    {['all', 'pending', 'approved', 'rejected'].map(t_key => (
                        <button
                            key={t_key}
                            onClick={() => setFilter(t_key)}
                            className={`filter_tab ${filter === t_key ? 'active' : ''}`}
                        >
                            {t(`common.${t_key === 'all' ? 'results' : t_key}`)}
                        </button>
                    ))}
                </div>
            </header> */}

            <section className="dashboard-section">
                <div className="dashboard-header">
                    <div className="dashboard-title">Community Sentiment</div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('admin.manageUsers')}</TableHead>
                            <TableHead>{t('admin.manageReviews')}</TableHead>
                            <TableHead>{t('admin.manageProducts')}</TableHead>
                            <TableHead>{t('common.status')}</TableHead>
                            <TableHead className="text-right">{t('common.results')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan="5" className="loading-state">
                                    <div className="loading-spinner"></div>
                                    Analyzing Sentiment...
                                </TableCell>
                            </TableRow>
                        ) : reviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan="5" className="empty-state">
                                    <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    No reviews found in this sector.
                                </TableCell>
                            </TableRow>
                        ) : reviews.map(review => (
                            <TableRow key={review._id}>
                                <TableCell>
                                    <div className="user-info">
                                        <div className="reviewer_avatar">
                                            {review.reviewerId?.fname ? review.reviewerId.fname[0].toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <div className="user-name">{review.reviewerId?.fname || 'External'}</div>
                                            <div className="user-id">{new Date(review.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                                    <div className="review_comment_truncate" title={review.comment}>{review.comment}</div>
                                </TableCell>
                                <TableCell>
                                    <span className="review-type">{review.targetType}</span>
                                </TableCell>
                                <TableCell>
                                    <span className={`status-badge ${
                                        review.status === 'approved' 
                                            ? 'active'
                                            : review.status === 'pending'
                                            ? 'pending'
                                            : 'inactive'
                                    }`}>
                                        {t(`common.${review.status}`)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="action-buttons">
                                        {review.status !== 'approved' && (
                                            <button 
                                                className="action-btn approve" 
                                                onClick={() => handleModerate(review._id, 'approved')} 
                                                disabled={moderating === review._id}
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {review.status !== 'rejected' && (
                                            <button 
                                                className="action-btn reject" 
                                                onClick={() => handleModerate(review._id, 'rejected')} 
                                                disabled={moderating === review._id}
                                            >
                                                Reject
                                            </button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                    <div className="pagination-container">
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </section>
        </div>
    );
};

export default ReviewManagement;

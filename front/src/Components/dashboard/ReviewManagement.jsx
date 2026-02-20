import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { apiUrl } from '../../api';
import Pagination from '../common/Pagination';

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
        <div className="admin_page" style={{ background: 'transparent' }}>
            <header className="admin_page_header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{t('admin.manageReviews')}</h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>{t('admin.welcomeMessage')}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['all', 'pending', 'approved', 'rejected'].map(t_key => (
                        <button
                            key={t_key}
                            onClick={() => setFilter(t_key)}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '700',
                                border: 'none',
                                cursor: 'pointer',
                                background: filter === t_key ? 'var(--admin-accent-blue-soft)' : 'transparent',
                                color: filter === t_key ? 'var(--admin-accent-blue)' : '#64748b'
                            }}
                        >
                            {t(`common.${t_key === 'all' ? 'results' : t_key}`)}
                        </button>
                    ))}
                </div>
            </header>

            <section className="admin_table_wrapper">
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>Community Sentiment</div>
                </div>

                <table className="admin_table">
                    <thead>
                        <tr>
                            <th>{t('admin.manageUsers')}</th>
                            <th>{t('admin.manageReviews')}</th>
                            <th>{t('admin.manageProducts')}</th>
                            <th>{t('common.status')}</th>
                            <th style={{ textAlign: 'right' }}>{t('common.results')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '100px' }}>Analyzing Sentiment...</td></tr>
                        ) : reviews.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>No reviews found in this sector.</td></tr>
                        ) : reviews.map(review => (
                            <tr key={review._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                                            {review.reviewerId?.fname ? review.reviewerId.fname[0].toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, color: '#1e293b' }}>{review.reviewerId?.fname || 'External'}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ color: '#f59e0b', fontSize: '12px' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{review.comment}</div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6' }}>{review.targetType}</span>
                                </td>
                                <td>
                                    <span className={`status_pill ${review.status === 'approved' ? 'active' : review.status === 'pending' ? 'pending' : 'rejected'}`}>
                                        {t(`common.${review.status}`)}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        {review.status !== 'approved' && (
                                            <button className="btn_outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleModerate(review._id, 'approved')} disabled={moderating === review._id}>Approve</button>
                                        )}
                                        {review.status !== 'rejected' && (
                                            <button className="btn_outline" style={{ padding: '6px 12px', fontSize: '12px', color: '#ef4444' }} onClick={() => handleModerate(review._id, 'rejected')} disabled={moderating === review._id}>Reject</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ padding: '16px' }}>
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

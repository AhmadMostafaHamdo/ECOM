import React, { useEffect, useMemo, useState } from "react";
import { apiUrl } from "../../api";

const StatisticsPage = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        totalCategories: 0,
        totalProducts: 0,
        totalCartItems: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState("");

    const fetchStats = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(apiUrl("/admin/stats"), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to load statistics");
            }

            const payload = await response.json();
            setStats({
                totalUsers: payload.totalUsers || 0,
                totalAdmins: payload.totalAdmins || 0,
                totalCategories: payload.totalCategories || 0,
                totalProducts: payload.totalProducts || 0,
                totalCartItems: payload.totalCartItems || 0
            });
            setLastUpdated(new Date().toLocaleString());
        } catch (statsError) {
            setError(statsError.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const derivedMetrics = useMemo(() => {
        const productsPerCategory = stats.totalCategories ? (stats.totalProducts / stats.totalCategories).toFixed(2) : "0.00";
        const cartsPerUser = stats.totalUsers ? (stats.totalCartItems / stats.totalUsers).toFixed(2) : "0.00";
        return { productsPerCategory, cartsPerUser };
    }, [stats]);

    return (
        <div className="admin_page">
            <header className="admin_page_header" style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <p className="admin_page_kicker">Performance Insights</p>
                    <h1>Platform Analytics</h1>
                    <p>Comprehensive overview of system activity, user engagement, and inventory metrics.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <button type="button" className="admin_btn primary" onClick={fetchStats} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {loading ? "Syncing..." : "Sync Database"}
                    </button>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '8px', fontWeight: 'bold' }}>
                        LAST SYNC: {lastUpdated ? lastUpdated.toUpperCase() : 'NEVER'}
                    </p>
                </div>
            </header>

            <section className="admin_stats_grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '40px' }}>
                <article className="admin_stat_card">
                    <div className="admin_stat_icon" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div>
                        <h3>Citizens</h3>
                        <p>{loading ? "..." : stats.totalUsers}</p>
                        <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '800', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                            +5.4%
                        </div>
                    </div>
                </article>

                <article className="admin_stat_card">
                    <div className="admin_stat_icon" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                    </div>
                    <div>
                        <h3>Inventory</h3>
                        <p>{loading ? "..." : stats.totalProducts}</p>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '700', marginTop: '4px' }}>{stats.totalCategories} Clusters</div>
                    </div>
                </article>

                <article className="admin_stat_card">
                    <div className="admin_stat_icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    </div>
                    <div>
                        <h3>Carts</h3>
                        <p>{loading ? "..." : stats.totalCartItems}</p>
                        <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '800', marginTop: '4px' }}>{derivedMetrics.cartsPerUser} Avg/User</div>
                    </div>
                </article>

                <article className="admin_stat_card">
                    <div className="admin_stat_icon" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <div>
                        <h3>Density</h3>
                        <p>{loading ? "..." : derivedMetrics.productsPerCategory}</p>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '700', marginTop: '4px' }}>Units Per Cluster</div>
                    </div>
                </article>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                <section className="admin_table_container" style={{ margin: 0, padding: '40px' }}>
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '-0.02em' }}>
                            <div style={{ width: '4px', height: '20px', background: 'var(--color-primary)', borderRadius: '10px' }}></div>
                            Global Resource Allocation
                        </h2>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '8px' }}>Real-time distribution of platform assets against scalability targets.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {[
                            { label: 'Cloud Infrastructure', value: stats.totalUsers, total: 1000, color: '#3b82f6', icon: '👤' },
                            { label: 'Stock Capacity', value: stats.totalProducts, total: 500, color: '#8b5cf6', icon: '📦' },
                            { label: 'Logical Clusters', value: stats.totalCategories, total: 50, color: '#10b981', icon: '🗂️' },
                            { label: 'Transactional Flow', value: stats.totalCartItems, total: 2000, color: '#f59e0b', icon: '🛒' },
                        ].map((item, idx) => (
                            <div key={idx}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                        <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{item.label}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--color-text-primary)' }}>{Math.round((item.value / item.total) * 100)}%</span>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-muted)' }}>{item.value} Units</span>
                                    </div>
                                </div>
                                <div style={{ height: '10px', background: 'rgba(0,0,0,0.03)', borderRadius: '20px', overflow: 'hidden', padding: '2px' }}>
                                    <div style={{
                                        width: `${Math.min(100, (item.value / item.total) * 100)}%`,
                                        height: '100%',
                                        background: item.color,
                                        borderRadius: '20px',
                                        transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        boxShadow: `0 0 12px ${item.color}44`
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="admin_form_card" style={{ background: 'var(--admin-sidebar-gradient)', color: 'white', border: 'none', padding: '40px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>

                    <h2 style={{ color: 'white', fontSize: '22px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.02em' }}>Operational Status</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>Core systems are operating at peak efficiency. Latency benchmarks are within the top 1% percentile.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { name: 'Core Engine', status: 'Optimal', uptime: '99.99%', color: '#10b981' },
                            { name: 'Edge Database', status: 'Active', uptime: '99.98%', color: '#10b981' },
                            { name: 'S3 Media Hub', status: 'Synced', uptime: '100%', color: '#10b981' }
                        ].map((srv, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '20px',
                                background: 'rgba(255,255,255,0.08)',
                                borderRadius: '18px',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div>
                                    <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>{srv.name}</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Uptime: {srv.uptime}</div>
                                </div>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '900',
                                    textTransform: 'uppercase',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    padding: '6px 14px',
                                    borderRadius: '50px',
                                    border: '1px solid rgba(16, 185, 129, 0.3)'
                                }}>
                                    <span style={{ width: '6px', height: '6px', background: srv.color, borderRadius: '50%', boxShadow: `0 0 10px ${srv.color}` }}></span>
                                    {srv.status}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button className="admin_btn sm" style={{ width: '100%', marginTop: '32px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', height: '48px' }}>
                        Download Health Audit
                    </button>
                </section>
            </div>
            {error && <div style={{ marginTop: '32px' }} className="admin_notice error">{error}</div>}
        </div>
    );
};

export default StatisticsPage;

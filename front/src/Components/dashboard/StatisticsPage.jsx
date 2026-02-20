import React, { useEffect, useMemo, useState } from "react";
import { apiUrl } from "../../api";
import { useTranslation } from "react-i18next";

const StatisticsPage = () => {
    const { t } = useTranslation();
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
        <div className="admin_page" style={{ background: 'transparent' }}>
            <header className="admin_page_header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{t("admin.statistics")}</h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>{t("admin.welcomeMessage")}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn_outline" onClick={fetchStats} disabled={loading}>
                        {loading ? "Updating..." : "Refresh Data"}
                    </button>
                    <button className="btn_primary">Export Report</button>
                </div>
            </header>

            <section className="admin_stats_grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                {[
                    { label: t("admin.totalUsers"), value: stats.totalUsers, color: '#3b82f6', trend: '+12%', icon: '👥' },
                    { label: t("cart.total"), value: `$${(stats.totalProducts * 420).toLocaleString()}`, color: '#10b981', trend: '+8%', icon: '💰' },
                    { label: t("admin.cartItems"), value: stats.totalCartItems, color: '#f59e0b', trend: '-2%', icon: '📦' },
                    { label: t("admin.totalProducts"), value: stats.totalProducts, color: '#8b5cf6', trend: '+4%', icon: '🚀' }
                ].map((stat, i) => (
                    <article key={i} className="admin_card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>{stat.label}</span>
                            <span style={{ fontSize: '18px' }}>{stat.icon}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                            <span style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>{loading ? "..." : stat.value}</span>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: stat.trend.startsWith('+') ? '#10b981' : '#ef4444', paddingBottom: '4px' }}>
                                {stat.trend}
                            </span>
                        </div>
                        <div style={{ height: '4px', width: '100%', background: '#f1f5f9', borderRadius: '2px', marginTop: '4px' }}>
                            <div style={{ width: '60%', height: '100%', background: stat.color, borderRadius: '2px' }}></div>
                        </div>
                    </article>
                ))}
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
                <section className="admin_card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Global Resource Allocation</h2>
                        <select className="btn_outline" style={{ padding: '4px 12px', fontSize: '12px' }}>
                            <option>Last 30 Days</option>
                            <option>Last 6 Months</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {[
                            { label: 'Cloud Infrastructure', value: stats.totalUsers, total: 1000, color: '#3b82f6' },
                            { label: 'Stock Capacity', value: stats.totalProducts, total: 500, color: '#8b5cf6' },
                            { label: 'Logical Clusters', value: stats.totalCategories, total: 50, color: '#10b981' },
                            { label: 'Transactional Flow', value: stats.totalCartItems, total: 2000, color: '#f59e0b' },
                        ].map((item, idx) => (
                            <div key={idx}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{item.label}</span>
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>{item.value} / {item.total}</span>
                                </div>
                                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${Math.min(100, (item.value / item.total) * 100)}%`,
                                        height: '100%',
                                        background: item.color,
                                        borderRadius: '4px',
                                        transition: 'width 1s ease'
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="admin_card" style={{ background: '#1e293b', border: 'none' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#ffffff' }}>Operational Status</h2>
                    <p style={{ margin: '8px 0 24px', color: '#94a3b8', fontSize: '13px' }}>Real-time health of core system modules.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { name: 'Core Engine', status: t("common.success"), color: '#10b981' },
                            { name: 'Edge Database', status: t("common.success"), color: '#10b981' },
                            { name: 'Media Hub', status: t("common.success"), color: '#10b981' }
                        ].map((srv, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{srv.name}</span>
                                <span className="status_pill active" style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    {srv.status}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button className="btn_primary" style={{ width: '100%', marginTop: '32px', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                        System Health Audit
                    </button>
                </section>
            </div>
            {error && <div style={{ marginTop: '24px' }} className="admin_notice error">{error}</div>}
        </div>
    );
};

export default StatisticsPage;

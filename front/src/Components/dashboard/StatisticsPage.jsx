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
            <header className="admin_page_header">
                <p className="admin_page_kicker">Metrics</p>
                <h1>Platform Statistics</h1>
                <p>Track key performance indicators across the system.</p>
            </header>

            <section className="admin_stats_grid">
                <article className="admin_stat_card">
                    <h3>Total Users</h3>
                    <p>{loading ? "--" : stats.totalUsers}</p>
                </article>
                <article className="admin_stat_card">
                    <h3>Total Admins</h3>
                    <p>{loading ? "--" : stats.totalAdmins}</p>
                </article>
                <article className="admin_stat_card">
                    <h3>Total Categories</h3>
                    <p>{loading ? "--" : stats.totalCategories}</p>
                </article>
                <article className="admin_stat_card">
                    <h3>Total Products</h3>
                    <p>{loading ? "--" : stats.totalProducts}</p>
                </article>
                <article className="admin_stat_card">
                    <h3>Total Cart Items</h3>
                    <p>{loading ? "--" : stats.totalCartItems}</p>
                </article>
                <article className="admin_stat_card">
                    <h3>Products / Category</h3>
                    <p>{loading ? "--" : derivedMetrics.productsPerCategory}</p>
                </article>
                <article className="admin_stat_card">
                    <h3>Cart Items / User</h3>
                    <p>{loading ? "--" : derivedMetrics.cartsPerUser}</p>
                </article>
            </section>

            <section className="admin_form_card compact">
                <div className="admin_stats_footer">
                    <button type="button" onClick={fetchStats} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh Statistics"}
                    </button>
                    <span>Last updated: {lastUpdated || "Not yet"}</span>
                </div>
                {error ? <p className="admin_notice error">{error}</p> : null}
            </section>
        </div>
    );
};

export default StatisticsPage;

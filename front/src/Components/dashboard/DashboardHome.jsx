import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { apiUrl } from "../../api";

const DashboardHome = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        totalCategories: 0,
        totalProducts: 0,
        totalCartItems: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await fetch(apiUrl("/admin/stats"), {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });

                if (!response.ok) {
                    throw new Error("Failed to load dashboard metrics");
                }

                const payload = await response.json();
                setStats({
                    totalUsers: payload.totalUsers || 0,
                    totalAdmins: payload.totalAdmins || 0,
                    totalCategories: payload.totalCategories || 0,
                    totalProducts: payload.totalProducts || 0,
                    totalCartItems: payload.totalCartItems || 0
                });
            } catch (error) {
                console.log("Dashboard stats load failed:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="admin_page">

            <section className="admin_stats_grid">
                <article className="admin_stat_card">
                    <h3>Total Users</h3>
                    <p>{loading ? "--" : stats.totalUsers}</p>
                </article>
                <article className="admin_stat_card">
                    <h3>Admin Accounts</h3>
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
                    <h3>Cart Items</h3>
                    <p>{loading ? "--" : stats.totalCartItems}</p>
                </article>
            </section>

            <section className="admin_quick_actions">
                <NavLink to="/dashboard/users" className="admin_action_link">
                    Manage Users
                </NavLink>
                <NavLink to="/dashboard/products" className="admin_action_link">
                    Manage Products
                </NavLink>
                <NavLink to="/dashboard/categories" className="admin_action_link">
                    Manage Categories
                </NavLink>
                <NavLink to="/dashboard/statistics" className="admin_action_link">
                    View Detailed Statistics
                </NavLink>
            </section>
        </div>
    );
};

export default DashboardHome;

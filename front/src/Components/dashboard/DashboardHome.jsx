import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { apiUrl } from "../../api";
import GroupIcon from "@mui/icons-material/Group";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CategoryIcon from "@mui/icons-material/Category";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import RateReviewIcon from "@mui/icons-material/RateReview";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";

const DashboardHome = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        totalCategories: 0,
        totalProducts: 0,
        totalCartItems: 0,
        totalReviews: 0,
        averageRating: 0,
        pendingReviews: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Fetch admin stats
                const adminResponse = await fetch(apiUrl("/admin/stats"), {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });

                if (adminResponse.ok) {
                    const adminData = await adminResponse.json();
                    setStats(prev => ({
                        ...prev,
                        totalUsers: adminData.totalUsers || 0,
                        totalAdmins: adminData.totalAdmins || 0,
                        totalCategories: adminData.totalCategories || 0,
                        totalProducts: adminData.totalProducts || 0,
                        totalCartItems: adminData.totalCartItems || 0
                    }));
                }

                // Fetch review stats
                try {
                    const reviewResponse = await fetch(apiUrl("/admin/reviews"), {
                        method: "GET",
                        credentials: "include"
                    });

                    if (reviewResponse.ok) {
                        const reviews = await reviewResponse.json();
                        const totalReviews = reviews.length;
                        const pendingReviews = reviews.filter(r => r.status === 'pending').length;
                        const approvedReviews = reviews.filter(r => r.status === 'approved');
                        const averageRating = approvedReviews.length > 0
                            ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
                            : 0;

                        setStats(prev => ({
                            ...prev,
                            totalReviews,
                            pendingReviews,
                            averageRating: Math.round(averageRating * 10) / 10
                        }));
                    }
                } catch (error) {
                    console.log("Review stats fetch failed:", error.message);
                }
            } catch (error) {
                console.log("Dashboard stats load failed:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            label: "Total Users",
            value: stats.totalUsers,
            icon: GroupIcon,
            color: "hsl(210, 60%, 55%)"
        },
        {
            label: "Admin Accounts",
            value: stats.totalAdmins,
            icon: AdminPanelSettingsIcon,
            color: "hsl(260, 50%, 60%)"
        },
        {
            label: "Categories",
            value: stats.totalCategories,
            icon: CategoryIcon,
            color: "hsl(142, 50%, 50%)"
        },
        {
            label: "Products",
            value: stats.totalProducts,
            icon: Inventory2Icon,
            color: "hsl(38, 70%, 55%)"
        },
        {
            label: "Cart Items",
            value: stats.totalCartItems,
            icon: ShoppingCartIcon,
            color: "hsl(199, 70%, 55%)"
        },
        {
            label: "Total Reviews",
            value: stats.totalReviews,
            icon: RateReviewIcon,
            color: "hsl(340, 60%, 60%)"
        },
        {
            label: "Pending Reviews",
            value: stats.pendingReviews,
            icon: TrendingUpIcon,
            color: "hsl(38, 70%, 55%)",
            badge: stats.pendingReviews > 0
        },
        {
            label: "Average Rating",
            value: stats.averageRating.toFixed(1),
            icon: StarIcon,
            color: "hsl(45, 85%, 55%)"
        }
    ];

    return (
        <div className="admin_page">
            <header className="admin_page_header">
                <p className="admin_page_kicker">Overview</p>
                <h1>Dashboard</h1>
                <p>Welcome to your admin control panel. Here's your platform overview.</p>
            </header>

            <section className="admin_stats_grid">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <article key={index} className="admin_stat_card">
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                marginBottom: 'var(--space-3)'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: 'var(--radius-lg)',
                                    background: `${stat.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon style={{ color: stat.color, fontSize: '24px' }} />
                                </div>
                                {stat.badge && (
                                    <span className="admin_badge warning" style={{ marginLeft: 'auto' }}>
                                        New
                                    </span>
                                )}
                            </div>
                            <h3>{stat.label}</h3>
                            <p>{loading ? "--" : stat.value}</p>
                        </article>
                    );
                })}
            </section>

            <section className="admin_quick_actions">
                <NavLink to="/dashboard/users" className="admin_action_link">
                    <GroupIcon style={{ marginRight: 'var(--space-2)' }} />
                    Manage Users
                </NavLink>
                <NavLink to="/dashboard/products" className="admin_action_link">
                    <Inventory2Icon style={{ marginRight: 'var(--space-2)' }} />
                    Manage Products
                </NavLink>
                <NavLink to="/dashboard/categories" className="admin_action_link">
                    <CategoryIcon style={{ marginRight: 'var(--space-2)' }} />
                    Manage Categories
                </NavLink>
                <NavLink to="/dashboard/reviews" className="admin_action_link">
                    <RateReviewIcon style={{ marginRight: 'var(--space-2)' }} />
                    Manage Reviews
                    {stats.pendingReviews > 0 && (
                        <span className="admin_badge warning" style={{ marginLeft: 'var(--space-2)' }}>
                            {stats.pendingReviews}
                        </span>
                    )}
                </NavLink>
                <NavLink to="/dashboard/statistics" className="admin_action_link">
                    <TrendingUpIcon style={{ marginRight: 'var(--space-2)' }} />
                    View Statistics
                </NavLink>
            </section>
        </div>
    );
};

export default DashboardHome;


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
    pendingReviews: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const adminResponse = await fetch(apiUrl("/admin/stats"), {
          credentials: "include",
        });

        if (adminResponse.ok) {
          const data = await adminResponse.json();
          setStats((prev) => ({
            ...prev,
            totalUsers: data.totalUsers || 0,
            totalAdmins: data.totalAdmins || 0,
            totalCategories: data.totalCategories || 0,
            totalProducts: data.totalProducts || 0,
            totalCartItems: data.totalCartItems || 0,
          }));
        }

        const reviewResponse = await fetch(apiUrl("/admin/reviews"), {
          credentials: "include",
        });

        if (reviewResponse.ok) {
          const reviews = await reviewResponse.json();

          const pending = reviews.filter((r) => r.status === "pending").length;
          const approved = reviews.filter((r) => r.status === "approved");

          const avg =
            approved.length > 0
              ? approved.reduce((s, r) => s + r.rating, 0) /
              approved.length
              : 0;

          setStats((prev) => ({
            ...prev,
            totalReviews: reviews.length,
            pendingReviews: pending,
            averageRating: Number(avg.toFixed(1)),
          }));
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
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
      color: "hsl(210,60%,55%)",
    },
    {
      label: "Admin Accounts",
      value: stats.totalAdmins,
      icon: AdminPanelSettingsIcon,
      color: "hsl(260,50%,60%)",
    },
    {
      label: "Categories",
      value: stats.totalCategories,
      icon: CategoryIcon,
      color: "hsl(142,50%,50%)",
    },
    {
      label: "Products",
      value: stats.totalProducts,
      icon: Inventory2Icon,
      color: "hsl(38,70%,55%)",
    },
    {
      label: "Cart Items",
      value: stats.totalCartItems,
      icon: ShoppingCartIcon,
      color: "hsl(199,70%,55%)",
    },
    {
      label: "Total Reviews",
      value: stats.totalReviews,
      icon: RateReviewIcon,
      color: "hsl(340,60%,60%)",
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReviews,
      icon: TrendingUpIcon,
      color: "hsl(38,70%,55%)",
      badge: stats.pendingReviews > 0,
    },
    {
      label: "Average Rating",
      value: stats.averageRating.toFixed(1),
      icon: StarIcon,
      color: "hsl(45,85%,55%)",
    },
  ];

  return (
    <div className="admin_page">
      {/* Header */}
      <header className="admin_page_header">
        <p className="admin_page_kicker">System Overview</p>
        <h1>Welcome back, JD</h1>
        <p>
          Here's what's happening with your store today. Everything looks good.
        </p>
      </header>

      {/* Stats */}
      <section className="admin_stats_grid">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <article key={i} className="admin_stat_card">
              <div className="admin_stat_icon_row">
                <div
                  className="admin_stat_icon"
                  style={{ background: `${stat.color}15` }}
                >
                  <Icon style={{ color: stat.color, fontSize: 24 }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {stat.badge && (
                    <span className="admin_badge warning" style={{ marginBottom: '4px' }}>New</span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontSize: '12px', fontWeight: '700' }}>
                    <TrendingUpIcon style={{ fontSize: '14px' }} />
                    <span>+12%</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ marginBottom: '4px' }}>{stat.label}</h3>
                <p>{loading ? "—" : stat.value}</p>
              </div>
            </article>
          );
        })}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '32px' }}>
        {/* Recent Activity Table */}
        <section className="admin_table_container">
          <div style={{ padding: '32px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Recent System Activities</h2>
            <button className="admin_btn secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>View History</button>
          </div>
          <table className="admin_table">
            <thead>
              <tr>
                <th>Activity Details</th>
                <th>Category</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((_, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.08)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingCartIcon style={{ fontSize: '18px' }} />
                      </div>
                      <div>
                        <span style={{ fontWeight: '700', display: 'block', fontSize: '14px' }}>Incoming Order #RD-982{i}</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Customer Purchase</span>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontWeight: '600', color: 'var(--color-text-secondary)' }}>E-Commerce</span></td>
                  <td>{new Date().toLocaleDateString()}</td>
                  <td><span className="admin_badge success">Verified</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Quick Actions & Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section className="admin_form_card">
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Operational Health</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { label: 'Cloud Infrastructure', status: 'Operational', color: 'var(--color-success)', progress: 100 },
                { label: 'Primary Database', status: 'Stable', color: 'var(--color-success)', progress: 100 },
                { label: 'Storage Sync', status: 'Optimizing (88%)', color: 'var(--color-warning)', progress: 88 },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: item.color }}>{item.status}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(0,0,0,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.progress}%`, height: '100%', background: item.color, borderRadius: '3px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin_form_card">
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Quick Navigation</h2>
            <div className="admin_quick_actions">
              <NavLink to="/admin/users" className="admin_action_link">
                <span className="admin_action_left">
                  <GroupIcon style={{ fontSize: '20px', color: 'var(--color-primary)' }} />
                  Access Users
                </span>
                <TrendingUpIcon style={{ fontSize: '14px', opacity: 0.5 }} />
              </NavLink>

              <NavLink to="/admin/products" className="admin_action_link">
                <span className="admin_action_left">
                  <Inventory2Icon style={{ fontSize: '20px', color: 'var(--color-primary)' }} />
                  Catalog Assets
                </span>
                <TrendingUpIcon style={{ fontSize: '14px', opacity: 0.5 }} />
              </NavLink>

              <NavLink to="/admin/categories" className="admin_action_link">
                <span className="admin_action_left">
                  <CategoryIcon style={{ fontSize: '20px', color: 'var(--color-primary)' }} />
                  Logic Classes
                </span>
                <TrendingUpIcon style={{ fontSize: '14px', opacity: 0.5 }} />
              </NavLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

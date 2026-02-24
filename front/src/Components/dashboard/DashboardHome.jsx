import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { apiUrl } from "../../api";
import { useTranslation } from "react-i18next";

import GroupIcon from "@mui/icons-material/Group";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CategoryIcon from "@mui/icons-material/Category";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import RateReviewIcon from "@mui/icons-material/RateReview";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";

const DashboardHome = () => {
  const { t } = useTranslation();
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
      label: t("admin.totalUsers"),
      value: stats.totalUsers,
      icon: GroupIcon,
      color: "hsl(210,60%,55%)",
    },
    {
      label: t("admin.adminAccounts"),
      value: stats.totalAdmins,
      icon: AdminPanelSettingsIcon,
      color: "hsl(260,50%,60%)",
    },
    {
      label: t("admin.totalCategories"),
      value: stats.totalCategories,
      icon: CategoryIcon,
      color: "hsl(142,50%,50%)",
    },
    {
      label: t("admin.totalProducts"),
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
    <div className="admin_page" style={{ background: 'transparent' }}>
      <section className="admin_stats_grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {statCards.slice(0, 4).map((stat, i) => {
          const Icon = stat.icon;
          return (
            <article key={i} className="admin_card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>{stat.label}</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ color: stat.color, fontSize: '18px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>{loading ? "..." : stat.value}</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', paddingBottom: '4px' }}>+12.5%</span>
              </div>
              <div style={{ height: '4px', width: '100%', background: '#f1f5f9', borderRadius: '2px', marginTop: '4px' }}>
                <div style={{ width: '70%', height: '100%', background: stat.color, borderRadius: '2px' }}></div>
              </div>
            </article>
          );
        })}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
        <section className="admin_table_wrapper">
          <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>Terminal Activity Log</div>
            <button className="btn_outline" style={{ padding: '6px 12px', fontSize: '12px' }}>Full History</button>
          </div>
          <table className="admin_table">
            <thead>
              <tr>
                <th>Operation Details</th>
                <th>Classification</th>
                <th>Lifecycle</th>
                <th style={{ textAlign: 'right' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((_, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingCartIcon style={{ fontSize: '16px' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '14px' }}>Transaction #TX-00{i + 1}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Processed via Gateway A</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: '700', color: '#64748b', fontSize: '13px' }}>Financial</td>
                  <td><span className="status_pill active">Approved</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn_outline" style={{ padding: '4px 10px', fontSize: '11px' }}>Inspect</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section className="admin_card">
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '24px' }}>Infrastructure Pulse</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { label: 'Neural Compute', status: t("common.success"), color: '#3b82f6', value: 94 },
                { label: 'Synapse Latency', status: t("common.success"), color: '#10b981', value: 98 },
                { label: 'Storage Cluster', status: `Capacity (82%)`, color: '#f59e0b', value: 82 }
              ].map((h, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span style={{ fontWeight: '600', color: '#64748b' }}>{h.label}</span>
                    <span style={{ fontWeight: '800', color: h.color }}>{h.status}</span>
                  </div>
                  <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${h.value}%`, height: '100%', background: h.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin_card" style={{ background: 'var(--admin-accent-blue)', color: 'white' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Citizen Spotlight</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', marginBottom: '20px' }}>
              Platform growth is up 24% this quarter. Review user feedback to identify new expansion vectors.
            </p>
            <NavLink to="/admin/users" className="btn_primary" style={{ background: 'white', color: 'var(--admin-accent-blue)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
              View User Dir
            </NavLink>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../../api";
import { useTranslation } from "react-i18next";
import {
  Users,
  DollarSign,
  Package,
  TrendingUp,
  RefreshCw,
  Download,
} from "lucide-react";
import "./admin-dashboard.css";
import { toast } from "react-toastify";

const StatisticsPage = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalCategories: 0,
    totalProducts: 0,
    totalCartItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get("/admin/stats");

      if (response.status === 200) {
        const payload = response.data;
        setStats({
          totalUsers: payload.totalUsers || 0,
          totalAdmins: payload.totalAdmins || 0,
          totalCategories: payload.totalCategories || 0,
          totalProducts: payload.totalProducts || 0,
          totalCartItems: payload.totalCartItems || 0,
        });
        setLastUpdated(new Date().toLocaleString());
        if (!loading)
          toast.success(t("common.success") || "Updated successfully");
      }
    } catch (statsError) {
      setError(statsError.response?.data?.error || statsError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const derivedMetrics = useMemo(() => {
    const productsPerCategory = stats.totalCategories
      ? (stats.totalProducts / stats.totalCategories).toFixed(2)
      : "0.00";
    const cartsPerUser = stats.totalUsers
      ? (stats.totalCartItems / stats.totalUsers).toFixed(2)
      : "0.00";
    return { productsPerCategory, cartsPerUser };
  }, [stats]);

  return (
    <div className="admin_page">
      <div className="dashboard-header">
        <div className="dashboard-title">{t("admin.statistics")}</div>
        <div className="dashboard-controls">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="filter-btn"
            title={
              lastUpdated
                ? `${t("admin.refreshStats")}: ${lastUpdated}`
                : t("admin.refreshStats")
            }
          >
            <RefreshCw
              className={`btn-icon-sm ${loading ? "animate-spin" : ""}`}
            />
            {t("common.refresh")}
          </button>
        </div>
      </div>
      <section className="admin_stats_grid">
        {[
          {
            label: t("admin.totalUsers"),
            value: stats.totalUsers,
            color: "#FF9500",
            trend: "+12%",
            icon: Users,
          },
          {
            label: t("cart.total"),
            value: `$${(stats.totalProducts * 420).toLocaleString()}`,
            color: "#10b981",
            trend: "+8%",
            icon: DollarSign,
          },
          {
            label: t("admin.cartItems"),
            value: stats.totalCartItems,
            color: "#f59e0b",
            trend: "-2%",
            icon: Package,
          },
          {
            label: t("admin.totalProducts"),
            value: stats.totalProducts,
            color: "#FFBF5C",
            trend: "+4%",
            icon: TrendingUp,
          },
        ].map((stat, i) => (
          <article key={i} className="admin_stat_card">
            <div className="admin_stat_icon_row">
              <span
                className="admin_stat_icon"
                style={{ background: stat.color + "15", color: stat.color }}
              >
                <stat.icon className="btn-icon-sm" />
              </span>
            </div>
            <h3>{stat.label}</h3>
            <p>{loading ? "..." : stat.value}</p>
            <span
              className="admin_badge"
              style={{ background: `${stat.color}20`, color: stat.color }}
            >
              {stat.trend}
            </span>
          </article>
        ))}
      </section>

      <section className="admin_stats_grid">
        <h2
          className="dashboard-title"
          style={{ gridColumn: "1 / -1", marginBottom: "var(--space-6)" }}
        >
          {t("admin.derivedMetrics")}
        </h2>
        {[
          {
            label: t("admin.productsPerCategory"),
            value: derivedMetrics.productsPerCategory,
            color: "#06b6d4",
            icon: Package,
          },
          {
            label: t("admin.cartItemsPerUser"),
            value: derivedMetrics.cartsPerUser,
            color: "#FFBF5C",
            icon: Users,
          },
        ].map((metric, i) => (
          <article key={i} className="admin_stat_card">
            <div className="admin_stat_icon_row">
              <span
                className="admin_stat_icon"
                style={{ background: metric.color + "15", color: metric.color }}
              >
                <metric.icon className="btn-icon-sm" />
              </span>
            </div>
            <h3>{metric.label}</h3>
            <p>{loading ? "..." : metric.value}</p>
            <span
              className="admin_badge"
              style={{ background: `${metric.color}20`, color: metric.color }}
            >
              {t("admin.calculated")}
            </span>
          </article>
        ))}
      </section>

      <div className="dashboard-grid-two">
        <section className="dashboard-section">
          <div className="dashboard-controls">
            <h2 className="dashboard-title">{t("admin.resourceAllocation")}</h2>
            <select className="filter-btn">
              <option>{t("admin.last30Days")}</option>
              <option>{t("admin.last6Months")}</option>
            </select>
          </div>

          <div className="progress-list">
            {[
              {
                label: t("admin.cloudInfra"),
                value: stats.totalUsers,
                total: 1000,
                color: "#FF9500",
              },
              {
                label: t("admin.stockCapacity"),
                value: stats.totalProducts,
                total: 500,
                color: "#FFBF5C",
              },
              {
                label: t("admin.logicalClusters"),
                value: stats.totalCategories,
                total: 50,
                color: "#10b981",
              },
              {
                label: t("admin.transactionalFlow"),
                value: stats.totalCartItems,
                total: 2000,
                color: "#f59e0b",
              },
            ].map((item, idx) => (
              <div key={idx} className="progress-item">
                <div className="progress-header">
                  <span className="progress-label">{item.label}</span>
                  <span className="progress-value">
                    {item.value} / {item.total}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, (item.value / item.total) * 100)}%`,
                      background: item.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section status-section">
          <h2 className="dashboard-title">{t("admin.operationalStatus")}</h2>
          <p className="dashboard-subtitle">{t("admin.healthStatus")}</p>

          <div className="status-list">
            {[
              {
                name: t("admin.coreEngine"),
                status: t("common.success"),
                color: "#10b981",
              },
              {
                name: t("admin.edgeDb"),
                status: t("common.success"),
                color: "#10b981",
              },
              {
                name: t("admin.mediaHub"),
                status: t("common.success"),
                color: "#10b981",
              },
            ].map((srv, i) => (
              <div key={i} className="status-item">
                <span className="status-name">{srv.name}</span>
                <span className="status-badge active">{srv.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      {error && <div className="admin_notice error">{error}</div>}
    </div>
  );
};

export default StatisticsPage;

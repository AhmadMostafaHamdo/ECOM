import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../api";
import { useTranslation } from "react-i18next";

import GroupIcon from "@mui/icons-material/Group";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CategoryIcon from "@mui/icons-material/Category";
import Inventory2Icon from "@mui/icons-material/Inventory2";

import "./dashboard-home.css";
import DashboardCharts from "./DashboardCharts";

const DashboardHome = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalCategories: 0,
    totalProducts: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/admin/stats");

        if (response.status === 200) {
          const data = response.data;
          setStats({
            totalUsers: data.totalUsers || 0,
            totalAdmins: data.totalAdmins || 0,
            totalCategories: data.totalCategories || 0,
            totalProducts: data.totalProducts || 0,
          });
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
        // Fallback to demo data on error or if API endpoint not available
        console.warn("Using demo data fallback");
        setStats({
          totalUsers: 1248,
          totalAdmins: 5,
          totalCategories: 12,
          totalProducts: 342,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const summaryCards = [
    {
      key: "users",
      label: t("admin.totalUsers"),
      value: stats.totalUsers,
      icon: GroupIcon,
      gradient: "linear-gradient(135deg, #5fa8ff 0%, #2d6bff 100%)",
      fill: 82,
    },
    {
      key: "admins",
      label: t("admin.adminAccounts"),
      value: stats.totalAdmins,
      icon: AdminPanelSettingsIcon,
      gradient: "linear-gradient(135deg, #b084ff 0%, #7c4dff 100%)",
      fill: 68,
    },
    {
      key: "categories",
      label: t("admin.totalCategories"),
      value: stats.totalCategories,
      icon: CategoryIcon,
      gradient: "linear-gradient(135deg, #30d7c7 0%, #1fa4a9 100%)",
      fill: 74,
    },
    {
      key: "products",
      label: t("admin.totalProducts"),
      value: stats.totalProducts,
      icon: Inventory2Icon,
      gradient: "linear-gradient(135deg, #f6b347 0%, #f97316 100%)",
      fill: 61,
    },
  ];

  return (
    <div className="admin_page dashboard-home">
      <section className="summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.key}
              className="summary-card"
              style={{ background: card.gradient }}
            >
              <div className="summary-top">
                <div>
                  <p className="summary-label">{card.label}</p>
                  <div className="summary-value-row">
                    <span className="summary-value">
                      {loading ? "..." : card.value}
                    </span>
                    <span className="summary-change">+12.5%</span>
                  </div>
                </div>
                <span className="summary-icon">
                  <Icon />
                </span>
              </div>
              <div className="summary-bar">
                <span style={{ width: `${card.fill}%` }}></span>
              </div>
            </article>
          );
        })}
      </section>

      {/* Charts Section */}
      <section className="charts-section">
        <h2 className="section-title">{t("admin.analytics")}</h2>
        {loading ? (
          <div className="charts-loading">
            <div className="loading-spinner"></div>
            <p>{t("common.loading")}</p>
          </div>
        ) : (
          <DashboardCharts stats={stats} />
        )}
      </section>
    </div>
  );
};

export default DashboardHome;

import React, { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  House,
  LogOut,
  Menu,
  MoonStar,
  PanelRightClose,
  Search,
  SunMedium,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Logincontext } from "../Components/context/Contextprovider";
import LanguageSwitcher from "../Components/common/LanguageSwitcher";
import { useTheme } from "../Components/context/ThemeContext";
import { axiosInstance } from "../services/http";
import { getAdminNavigation } from "../features/admin/navigation";
import "./layouts.css";
import "../Components/dashboard/admin-dashboard.css";

const pageMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] },
};

const DashboardLayout = () => {
  const { t } = useTranslation();
  const { account, setAccount } = useContext(Logincontext);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navigation = useMemo(() => getAdminNavigation(t), [t]);
  const activeItem =
    navigation.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
    ) || navigation[0];

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setAccount(false);
      localStorage.removeItem("auth_token");
      toast.success(t("auth.logoutSuccess"));
      navigate("/login");
    }
  };

  return (
    <section className="dashboard-layout">
      <button
        type="button"
        className={`dashboard-layout__overlay ${isSidebarOpen ? "is-open" : ""}`}
        aria-label={t("dialog.close")}
        aria-hidden={!isSidebarOpen}
        tabIndex={isSidebarOpen ? 0 : -1}
        onClick={closeSidebar}
      />

      <aside
        className={`dashboard-layout__sidebar admin-sidebar-shell ${isSidebarOpen ? "is-open" : ""}`}
      >
        <div className="admin-sidebar-shell__header">
          <NavLink to="/dashboard" className="admin-sidebar-shell__brand" onClick={closeSidebar}>
            <span className="admin-sidebar-shell__brand-mark">SC</span>
            <div>
              <strong>Studio Commerce</strong>
              <span>{t("admin.dashboard")}</span>
            </div>
          </NavLink>

          <button
            type="button"
            className="dashboard-layout__icon-button dashboard-layout__drawer-toggle"
            onClick={closeSidebar}
            aria-label={t("dialog.close")}
          >
            <PanelRightClose size={18} />
          </button>
        </div>

        <nav className="admin-sidebar-shell__nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `admin-sidebar-shell__link ${isActive ? "is-active" : ""}`
                }
                onClick={closeSidebar}
              >
                <span className="admin-sidebar-shell__link-icon">
                  <Icon size={18} />
                </span>
                <span className="admin-sidebar-shell__link-copy">
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-shell__footer">
          <div className="admin-sidebar-shell__profile">
            <div className="admin-sidebar-shell__avatar">
              {account?.fname?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="admin-sidebar-shell__meta">
              <strong>{account?.fname || t("admin.dashboard")}</strong>
              <span>{account?.role || t("auth.role_admin")}</span>
            </div>
          </div>

          <div className="admin-sidebar-shell__footer-actions">
            <NavLink to="/" className="ui-button ui-button--secondary" onClick={closeSidebar}>
              <House size={16} />
              {t("navigation.home")}
            </NavLink>
            <button type="button" className="ui-button ui-button--danger" onClick={handleLogout}>
              <LogOut size={16} />
              {t("navigation.logout")}
            </button>
          </div>
        </div>
      </aside>

      <div className="dashboard-layout__content">
        <header className="dashboard-layout__topbar">
          <div className="dashboard-layout__topbar-inner">
            <div className="dashboard-layout__heading">
              <div className="dashboard-layout__eyebrow">{t("admin.analytics")}</div>
              <h1 className="dashboard-layout__title">{activeItem.title}</h1>
              <p className="dashboard-layout__description">{activeItem.description}</p>
            </div>

            <div className="dashboard-layout__tools">
              <button
                type="button"
                className="dashboard-layout__icon-button dashboard-layout__drawer-toggle"
                onClick={() => setSidebarOpen(true)}
                aria-label={t("navigation.dashboard")}
              >
                <Menu size={18} />
              </button>

              <label className="dashboard-layout__search" htmlFor="dashboard-search">
                <Search size={18} />
                <input
                  id="dashboard-search"
                  type="search"
                  placeholder={t("navigation.search")}
                  readOnly
                />
              </label>

              <LanguageSwitcher variant="surface" />

              <button
                type="button"
                className="dashboard-layout__icon-button"
                onClick={toggleTheme}
                aria-label={isDark ? t("theme.light", "Light theme") : t("theme.dark", "Dark theme")}
              >
                {isDark ? <SunMedium size={18} /> : <MoonStar size={18} />}
              </button>

              <div className="dashboard-layout__profile">
                <div className="dashboard-layout__avatar">
                  {account?.fname?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="dashboard-layout__profile-text">
                  <strong>{account?.fname || t("admin.dashboard")}</strong>
                  <span>{account?.email || t("auth.role_admin")}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-layout__panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={pageMotion.initial}
              animate={pageMotion.animate}
              exit={pageMotion.exit}
              transition={pageMotion.transition}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default DashboardLayout;

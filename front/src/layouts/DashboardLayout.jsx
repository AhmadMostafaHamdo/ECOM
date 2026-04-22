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
      item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to),
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
    <div className="dl-root">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar}
            className="dl-overlay"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className={`dl-sidebar ${isSidebarOpen ? "is-open" : ""}`}>
        {/* Brand */}
        <div className="dl-sidebar__header">
          <NavLink to="/dashboard" className="dl-brand" onClick={closeSidebar}>
            <div className="dl-brand__mark">SC</div>
            <div className="dl-brand__copy">
              <strong>Studio Commerce</strong>
              <span>{t("admin.dashboard")}</span>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="dl-sidebar__nav custom-scrollbar">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.end}
                className={`dl-nav-link ${isActive ? "is-active" : ""}`}
                onClick={closeSidebar}
              >
                <div className={`dl-nav-link__icon ${isActive ? "is-active" : ""}`}>
                  <Icon size={19} />
                </div>
                <div className="dl-nav-link__copy">
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </div>
                {isActive && <div className="dl-nav-link__dot" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="dl-sidebar__footer">
          {/* User card */}
          <div className="dl-user-card">
            <div className="dl-user-card__avatar">
              {account?.fname?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="dl-user-card__info">
              <strong>{account?.fname || t("admin.dashboard")}</strong>
              <span>{account?.role || t("auth.role_admin")}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="dl-sidebar__actions">
            <NavLink
              to="/"
              className="dl-action-btn dl-action-btn--ghost"
              onClick={closeSidebar}
            >
              <House size={16} />
              {t("navigation.home")}
            </NavLink>
            <button
              type="button"
              className="dl-action-btn dl-action-btn--danger"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              {t("navigation.logout")}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className="dl-main">
        {/* Topbar */}
        <header className="dl-topbar">
          <div className="dl-topbar__inner">
            {/* Left: hamburger + page title */}
            <div className="dl-topbar__left">
              <button
                type="button"
                className="dl-icon-btn dl-hamburger"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              <div className="dl-page-heading">
                <div className="dl-page-heading__eyebrow">
                  {t("admin.analytics")}
                </div>
                <h1 className="dl-page-heading__title">{activeItem.title}</h1>
              </div>
            </div>

            {/* Right: tools */}
            <div className="dl-topbar__right">
              {/* Search */}
              <div className="dl-search">
                <Search className="dl-search__icon" size={17} />
                <input
                  type="search"
                  placeholder={t("navigation.search")}
                  readOnly
                  className="dl-search__input"
                  aria-label="Search"
                />
              </div>

              <div className="dl-topbar__divider" />

              <LanguageSwitcher variant="surface" />

              {/* Theme toggle */}
              <button
                type="button"
                className="dl-icon-btn dl-theme-toggle"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {isDark ? <SunMedium size={19} /> : <MoonStar size={19} />}
              </button>

              {/* Profile chip */}
              <div className="dl-profile-chip">
                <div className="dl-profile-chip__text">
                  <span className="dl-profile-chip__name">
                    {account?.fname || t("admin.dashboard")}
                  </span>
                  <span className="dl-profile-chip__email">
                    {account?.email || t("auth.role_admin")}
                  </span>
                </div>
                <div className="dl-profile-chip__avatar">
                  {account?.fname?.[0]?.toUpperCase() || "A"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="dl-page-body custom-scrollbar">
          <div className="dl-page-body__inner">
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
      </main>
    </div>
  );
};

export default DashboardLayout;

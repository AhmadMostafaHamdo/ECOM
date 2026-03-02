import React, {
  useState,
  Suspense,
  lazy,
  useCallback,
  useContext,
} from "react";

import { NavLink, Route, Switch, useRouteMatch } from "react-router-dom";

import "./admin-dashboard.css";

import DashboardIcon from "@mui/icons-material/Dashboard";

import GroupIcon from "@mui/icons-material/Group";

import CategoryIcon from "@mui/icons-material/Category";

import QueryStatsIcon from "@mui/icons-material/QueryStats";

import Inventory2Icon from "@mui/icons-material/Inventory2";

import RateReviewIcon from "@mui/icons-material/RateReview";

import MailIcon from "@mui/icons-material/Mail";

import MenuIcon from "@mui/icons-material/Menu";

import CloseIcon from "@mui/icons-material/Close";

import LogoutIcon from "@mui/icons-material/Logout";

import { useHistory } from "react-router-dom";

import { Logincontext } from "../context/Contextprovider";

import { apiUrl } from "../../api";

import { useTranslation } from "react-i18next";

import DialogComponent from "./DialogComponent";

import Messages from "./Messages";

const DashboardHome = lazy(() => import("./DashboardHome"));

const UsersManagement = lazy(() => import("./UsersManagement"));

const CategoriesManagement = lazy(() => import("./CategoriesManagement"));

const StatisticsPage = lazy(() => import("./StatisticsPage"));

const ProductsManagement = lazy(() => import("./ProductsManagement"));

const getNavItems = (t) => [
  { key: "home", label: t("admin.dashboard"), icon: DashboardIcon, path: "" },

  {
    key: "users",
    label: t("admin.manageUsers"),
    icon: GroupIcon,
    path: "/users",
  },

  {
    key: "products",
    label: t("admin.manageProducts"),
    icon: Inventory2Icon,
    path: "/products",
  },

  {
    key: "categories",
    label: t("admin.manageCategories"),
    icon: CategoryIcon,
    path: "/categories",
  },

  {
    key: "messages",
    label: t("admin.messages"),
    icon: MailIcon,
    path: "/messages",
  },

  {
    key: "stats",
    label: t("admin.statistics"),
    icon: QueryStatsIcon,
    path: "/statistics",
  },
];

const AdminDashboard = ({ onCategoriesChanged = () => {} }) => {
  const { path, url } = useRouteMatch();

  const history = useHistory();

  const { setAccount } = useContext(Logincontext);

  const { t } = useTranslation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const navItems = getNavItems(t);

  const closeSidebar = () => setSidebarOpen(false);

  const logoutuser = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/logout"), {
        method: "GET",

        headers: {
          Accept: "application/json",

          "Content-Type": "application/json",
        },

        credentials: "include",
      });

      if (res.ok) {
        setAccount(false);

        history.push("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [history, setAccount]);

  const handleLogoutConfirm = useCallback(async () => {
    await logoutuser();

    setConfirmLogoutOpen(false);
  }, [logoutuser]);

  return (
    <section className="admin_dashboard_shell">
      <button
        type="button"
        className="admin_sidebar_toggle"
        onClick={() => setSidebarOpen((value) => !value)}
        aria-label="Toggle admin menu"
      >
        {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <aside className={sidebarOpen ? "admin_sidebar open" : "admin_sidebar"}>
        <div className="admin_sidebar_brand">
          <div className="logo_icon">
            <CategoryIcon style={{ fontSize: "20px" }} />
          </div>

          <h2>Nexus v2</h2>
        </div>

        <nav className="admin_sidebar_nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            const route = `${url}${item.path}`;

            return (
              <NavLink
                key={item.key}
                exact={item.path === ""}
                to={route}
                className="admin_nav_link"
                activeClassName="active"
                onClick={closeSidebar}
              >
                <Icon />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin_sidebar_footer">
          <div
            style={{
              display: "flex",

              alignItems: "center",

              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",

                  height: "36px",

                  borderRadius: "8px",

                  background: "#f1f5f9",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  color: "#64748b",

                  fontWeight: "bold",

                  fontSize: "13px",
                }}
              >
                AH
              </div>

              <div>
                <p
                  style={{
                    margin: 0,

                    fontSize: "13px",

                    color: "#e2e8f0",

                    fontWeight: "800",
                  }}
                >
                  {t("admin.dashboard")}
                </p>

                <p
                  style={{
                    margin: 0,

                    fontSize: "11px",

                    color: "#bcd3ff",

                    fontWeight: "700",

                    letterSpacing: "0.02em",
                  }}
                >
                  SUPERUSER
                </p>
              </div>
            </div>

            <button
              onClick={() => setConfirmLogoutOpen(true)}
              style={{
                background: "transparent",

                border: "none",

                cursor: "pointer",

                color: "#94a3b8",

                padding: "8px",

                borderRadius: "8px",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                transition: "all 0.2s",
              }}
              className="admin_logout_btn"
              title="Disconnect Session"
            >
              <LogoutIcon style={{ fontSize: "20px" }} />
            </button>
          </div>
        </div>
      </aside>

      <div className="admin_dashboard_content">
        <header className="admin_top_header">
          <div className="admin_search_bar">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--color-text-muted)" }}
            >
              <circle cx="11" cy="11" r="8"></circle>

              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>

            <input type="text" placeholder={t("navigation.search")} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <div
              className="admin_header_icon_group"
              style={{ display: "flex", gap: "16px" }}
            >
              <div className="admin_header_icon">
                <RateReviewIcon style={{ fontSize: "18px" }} />

                <span className="admin_notification_badge">5</span>
              </div>

              <div className="admin_header_icon">
                <Inventory2Icon style={{ fontSize: "18px" }} />
              </div>
            </div>

            <div
              style={{
                height: "32px",

                width: "1px",

                background: "var(--color-border)",
              }}
            ></div>

            <NavLink
              to="/"
              className="admin_btn primary sm"
              style={{
                textDecoration: "none",

                padding: "10px 24px",

                fontSize: "12px",

                fontWeight: "800",

                boxShadow: "0 8px 20px rgba(59, 130, 246, 0.25)",
              }}
            >
              {t("navigation.home").toUpperCase()}
            </NavLink>
          </div>
        </header>

        <main
          className="admin_page_wrapper"
          onClick={closeSidebar}
          style={{ position: "relative" }}
        >
          <Suspense
            fallback={
              <div
                style={{
                  display: "flex",

                  flexDirection: "column",

                  alignItems: "center",

                  justifyContent: "center",

                  height: "70vh",

                  gap: "20px",
                }}
              >
                <div
                  style={{
                    width: "48px",

                    height: "48px",

                    border: "4px solid var(--color-primary-light)",

                    borderTopColor: "var(--color-primary)",

                    borderRadius: "50%",

                    animation: "spin 1s linear infinite",
                  }}
                ></div>

                <p
                  style={{
                    color: "var(--color-text-secondary)",

                    fontWeight: "700",

                    fontSize: "15px",

                    letterSpacing: "0.05em",
                  }}
                >
                  {t("common.loading").toUpperCase()}
                </p>
              </div>
            }
          >
            <Switch>
              <Route exact path={path}>
                <DashboardHome />
              </Route>

              <Route exact path={`${path}/users`}>
                <UsersManagement />
              </Route>

              <Route exact path={`${path}/products`}>
                <ProductsManagement />
              </Route>

              <Route exact path={`${path}/categories`}>
                <CategoriesManagement
                  onCategoriesChanged={onCategoriesChanged}
                />
              </Route>

              <Route exact path={`${path}/messages`}>
                <Messages />
              </Route>

              <Route exact path={`${path}/statistics`}>
                <StatisticsPage />
              </Route>

              <Route path={path}>
                <DashboardHome />
              </Route>
            </Switch>
          </Suspense>
        </main>
      </div>

      <DialogComponent
        open={confirmLogoutOpen}
        title={t("navigation.logout") || "Logout"}
        description="You are about to end your admin session. Continue?"
        confirmLabel={t("navigation.logout") || "Logout"}
        cancelLabel={t("common.cancel") || "Cancel"}
        tone="logout"
        placement="top"
        onConfirm={handleLogoutConfirm}
        onClose={() => setConfirmLogoutOpen(false)}
      />
    </section>
  );
};

export default AdminDashboard;

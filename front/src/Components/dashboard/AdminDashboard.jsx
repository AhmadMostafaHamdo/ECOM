import React, {
  useState,
  Suspense,
  lazy,
  useCallback,
  useContext,
} from "react";

import { NavLink, Route, Routes } from "react-router-dom";

import "./admin-dashboard.css";

import DashboardIcon from "@mui/icons-material/Dashboard";

import GroupIcon from "@mui/icons-material/Group";

import CategoryIcon from "@mui/icons-material/Category";

import QueryStatsIcon from "@mui/icons-material/QueryStats";

import Inventory2Icon from "@mui/icons-material/Inventory2";

import RateReviewIcon from "@mui/icons-material/RateReview";

import FlagIcon from "@mui/icons-material/Flag";

import MailIcon from "@mui/icons-material/Mail";

import ChatIcon from "@mui/icons-material/Chat";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { Logincontext } from "../context/Contextprovider";
import { axiosInstance } from "../../api";
import { useTranslation } from "react-i18next";
import DialogComponent from "./DialogComponent";
import { toast } from "react-toastify";
import Messages from "./Messages";
import ChatWidget from "../chat/ChatWidget";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

const DashboardHome = lazy(() => import("./DashboardHome"));
const UsersManagement = lazy(() => import("./UsersManagement"));
const CategoriesManagement = lazy(() => import("./CategoriesManagement"));
const StatisticsPage = lazy(() => import("./StatisticsPage"));
const ProductsManagement = lazy(() => import("./ProductsManagement"));
const AdminChat = lazy(() => import("./AdminChat"));
const ReportsManagement = lazy(() => import("./ReportsManagement"));

const getNavItems = (t) => [
  { key: "home", label: t("admin.dashboard"), icon: DashboardIcon, path: "" },
  { key: "users", label: t("admin.manageUsers"), icon: GroupIcon, path: "/users" },
  { key: "products", label: t("admin.manageProducts"), icon: Inventory2Icon, path: "/products" },
  { key: "categories", label: t("admin.manageCategories"), icon: CategoryIcon, path: "/categories" },
  { key: "messages", label: t("admin.messages.title"), icon: MailIcon, path: "/messages" },
  { key: "chat", label: t("admin.liveChat"), icon: ChatIcon, path: "/chat" },
  { key: "reports", label: t("report.title"), icon: FlagIcon, path: "/reports" },
  { key: "stats", label: t("admin.statistics"), icon: QueryStatsIcon, path: "/statistics" },
];

const AdminDashboard = ({ onCategoriesChanged = () => { } }) => {
  const url = "/dashboard";
  const navigate = useNavigate();

  const { setAccount } = useContext(Logincontext);

  const { t } = useTranslation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const navItems = getNavItems(t);

  const closeSidebar = () => setSidebarOpen(false);

  const logoutuser = useCallback(async () => {
    try {
      const res = await axiosInstance.post("/logout");

      if (res.status === 200) {
        setAccount(false);
        toast.success(t("auth.logoutSuccess") || "Logged out successfully");
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  }, [navigate, setAccount, t]);

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

      <AdminSidebar
        sidebarOpen={sidebarOpen}
        navItems={navItems}
        closeSidebar={closeSidebar}
        t={t}
        setConfirmLogoutOpen={setConfirmLogoutOpen}
        url={url}
      />

      <div className="admin_dashboard_content">
        <AdminHeader t={t} />

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
            <Routes>
              <Route path="" element={<DashboardHome />} />

              <Route path="users" element={<UsersManagement />} />

              <Route path="products" element={<ProductsManagement />} />

              <Route path="categories" element={
                <CategoriesManagement onCategoriesChanged={onCategoriesChanged} />
              } />

              <Route path="messages" element={<Messages />} />

              <Route path="chat" element={<AdminChat />} />

              <Route path="statistics" element={<StatisticsPage />} />

              <Route path="reports" element={<ReportsManagement />} />

              <Route path="*" element={<DashboardHome />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Chat Widget for Admin - always visible */}
      <ChatWidget />

      <DialogComponent
        open={confirmLogoutOpen}
        title={t("navigation.logout") || "Logout"}
        description={t("admin.logoutConfirm")}
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

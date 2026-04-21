import React, { Suspense, lazy, useContext, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Logincontext } from "../Components/context/Contextprovider";
import { useTheme } from "../Components/context/ThemeContext";
import { useAppSession } from "../hooks/useAppSession";
import { useDocumentDirection } from "../hooks/useDocumentDirection";
import { useStorefrontFilters } from "../hooks/useStorefrontFilters";
import StorefrontLayout from "../layouts/StorefrontLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AuthLayout from "../layouts/AuthLayout";
import "react-toastify/dist/ReactToastify.css";

const Maincomp = lazy(() => import("../Components/home/Maincomp"));
const Cart = lazy(() => import("../Components/cart/Cart"));
const Buynow = lazy(() => import("../Components/buynow/Buynow"));
const ProfilePage = lazy(() => import("../Components/profile/ProfilePage"));
const CreateProduct = lazy(() => import("../Components/products/CreateProduct"));
const AllProducts = lazy(() => import("../Components/products/AllProducts"));
const ContactUs = lazy(() => import("../Components/ContactUs"));
const WishlistPage = lazy(() => import("../Components/wishlist/WishlistPage"));
const SignIn = lazy(() => import("../Components/signup_signin/Sign_in"));
const SignUp = lazy(() => import("../Components/signup_signin/SignUp"));

const DashboardHome = lazy(() => import("../Components/dashboard/DashboardHome"));
const UsersManagement = lazy(() => import("../Components/dashboard/UsersManagement"));
const ProductsManagement = lazy(() => import("../Components/dashboard/ProductsManagement"));
const CategoriesManagement = lazy(() => import("../Components/dashboard/CategoriesManagement"));
const Messages = lazy(() => import("../Components/dashboard/Messages"));
const AdminChat = lazy(() => import("../Components/dashboard/AdminChat"));
const StatisticsPage = lazy(() => import("../Components/dashboard/StatisticsPage"));
const ReportsManagement = lazy(() => import("../Components/dashboard/ReportsManagement"));

const AppLoadingScreen = ({ title, copy }) => (
  <div className="app_loading">
    <div className="app_loading__panel">
      <div className="app_loading__indicator" />
      <h2 className="app_loading__title">{title}</h2>
      <p className="app_loading__copy">{copy}</p>
    </div>
  </div>
);

const AppRouter = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { account, showLoginPrompt, setShowLoginPrompt } = useContext(Logincontext);
  const { isDark } = useTheme();
  const authChecked = useAppSession();
  const storefront = useStorefrontFilters(t);

  useDocumentDirection(i18n);

  useEffect(() => {
    if (window?.scrollTo) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname]);

  if (!authChecked) {
    return (
      <AppLoadingScreen
        title={t("common.loading")}
        copy={t("common.craftingExperience")}
      />
    );
  }

  const isAdmin = account?.role === "admin";

  return (
    <div className="app_shell">
      <Suspense
        fallback={
          <AppLoadingScreen
            title={t("common.loading")}
            copy={t("home.preparingCollections")}
          />
        }
      >
        <Routes>
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={account ? <Navigate to={isAdmin ? "/dashboard" : "/"} replace /> : <SignIn />}
            />
            <Route
              path="/signup"
              element={account ? <Navigate to={isAdmin ? "/dashboard" : "/"} replace /> : <SignUp />}
            />
          </Route>

          <Route
            element={
              <StorefrontLayout
                categories={storefront.categories}
                selectedCategory={storefront.selectedCategory}
                onCategoryChange={storefront.setSelectedCategory}
                onApplyFilters={storefront.handleFilterApply}
                onSearchChange={storefront.setSearchTerm}
                showLoginPrompt={showLoginPrompt}
                onCloseLoginPrompt={() => setShowLoginPrompt(false)}
              />
            }
          >
            <Route
              path="/"
              element={
                isAdmin ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Maincomp
                    selectedCategory={storefront.selectedCategory}
                    filters={storefront.appliedFilters}
                    setSelectedCategory={storefront.setSelectedCategory}
                    searchTerm={storefront.searchTerm}
                  />
                )
              }
            />
            <Route
              path="/getproductsone/:id"
              element={isAdmin ? <Navigate to="/dashboard" replace /> : <Cart />}
            />
            <Route
              path="/buynow"
              element={isAdmin ? <Navigate to="/dashboard" replace /> : <Buynow />}
            />
            <Route
              path="/profile"
              element={isAdmin ? <Navigate to="/dashboard" replace /> : <ProfilePage />}
            />
            <Route
              path="/products/edit/:id"
              element={isAdmin ? <Navigate to="/dashboard" replace /> : <CreateProduct mode="edit" />}
            />
            <Route
              path="/products/new"
              element={isAdmin ? <Navigate to="/dashboard" replace /> : <CreateProduct />}
            />
            <Route
              path="/products/all/:category?"
              element={isAdmin ? <Navigate to="/dashboard" replace /> : <AllProducts />}
            />
            <Route
              path="/contact"
              element={isAdmin ? <Navigate to="/dashboard" replace /> : <ContactUs />}
            />
            <Route
              path="/wishlist"
              element={!account ? <Navigate to="/login" replace /> : <WishlistPage />}
            />
          </Route>

          <Route
            path="/dashboard"
            element={
              !account ? (
                <Navigate to="/login" replace />
              ) : isAdmin ? (
                <DashboardLayout />
              ) : (
                <Navigate to="/" replace />
              )
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="products" element={<ProductsManagement />} />
            <Route
              path="categories"
              element={<CategoriesManagement onCategoriesChanged={storefront.refreshCategories} />}
            />
            <Route path="messages" element={<Messages />} />
            <Route path="chat" element={<AdminChat />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="reports" element={<ReportsManagement />} />
          </Route>

          <Route path="*" element={<Navigate to={isAdmin ? "/dashboard" : "/"} replace />} />
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-center"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={i18n.dir() === "rtl"}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? "dark" : "light"}
      />
    </div>
  );
};

export default AppRouter;

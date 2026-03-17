import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  Suspense,
  lazy,
} from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { axiosInstance } from "./api";
import { Logincontext } from "./Components/context/Contextprovider";
import "./App.css";
import "./i18n/i18n";
import { useTranslation } from "react-i18next";

// Lazy Load Components
const Navbaar = lazy(() => import("./Components/header/Navbaar"));
const Newnav = lazy(() => import("./Components/newnav/Newnav"));
const Maincomp = lazy(() => import("./Components/home/Maincomp"));
const Footer = lazy(() => import("./Components/footer/Footer"));
const Signup = lazy(() => import("./Components/signup_signin/SignUp"));
const SignIn = lazy(() => import("./Components/signup_signin/Sign_in"));
const Cart = lazy(() => import("./Components/cart/Cart"));
const Buynow = lazy(() => import("./Components/buynow/Buynow"));
const AdminDashboard = lazy(
  () => import("./Components/dashboard/AdminDashboard"),
);
const ProfilePage = lazy(() => import("./Components/profile/ProfilePage"));
const CreateProduct = lazy(() => import("./Components/products/CreateProduct"));
const AllProducts = lazy(() => import("./Components/products/AllProducts"));
const ContactUs = lazy(() => import("./Components/ContactUs"));
const ChatWidget = lazy(() => import("./Components/chat/ChatWidget"));
const WishlistPage = lazy(() => import("./Components/wishlist/WishlistPage"));
const LoginPrompt = lazy(() => import("./Components/common/LoginPrompt"));

const CATEGORY_ALL = "All Categories";

function App() {
  const location = useLocation();
  const { account, setAccount, showLoginPrompt, setShowLoginPrompt } = useContext(Logincontext);
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);
  const [categories, setCategories] = useState([{ name: CATEGORY_ALL }]);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  // Global directionality handler
  useEffect(() => {
    const lng = i18n.language || 'en';
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  }, [i18n.language]);
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const isHomeRoute = location.pathname === "/";
  const isAuthRoute =
    location.pathname === "/signup" || location.pathname === "/login";

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/getcategories");
      const payload = response.data;
      const categoriesArray = payload.data || payload;
      if (Array.isArray(categoriesArray) && categoriesArray.length) {
        setCategories(categoriesArray);
      }
    } catch (error) {
      console.log("Category list refresh failed:", error.message);
    }
  }, []);

  useEffect(() => {
    setData(true);
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await axiosInstance.get("/validuser");

        if (res.status === 200 || res.status === 201) {
          const payload = res.data;
          setAccount(payload);
          if (payload.token) {
            localStorage.setItem("auth_token", payload.token);
          }
        } else {
          setAccount(false);
          localStorage.removeItem("auth_token");
        }
      } catch (error) {
        setAccount(false);
        localStorage.removeItem("auth_token");
      } finally {
        setAuthChecked(true);
      }
    };

    loadSession();
  }, [setAccount]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const categoryNames = categories.map(c => c.name);
    if (!categoryNames.includes(selectedCategory)) {
      setSelectedCategory(CATEGORY_ALL);
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      setSelectedCategory(CATEGORY_ALL);
      setAppliedFilters(null);
    }
  }, [searchTerm]);

  useEffect(() => {
    setAppliedFilters(null);
  }, [selectedCategory]);

  const handleFilterApply = useCallback((payload) => {
    setAppliedFilters(payload);
  }, []);

  const isAdmin = account?.role === "admin";

  useEffect(() => {
    if (window?.scrollTo) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname]);

  return (
    <div className="app_shell">
      {data && authChecked ? (
        <Suspense
          fallback={
            <div className="circle">
              <CircularProgress />
              <h2>{t("common.loading")}</h2>
            </div>
          }
        >
          {isAuthRoute ? (
            <Routes>
              <Route path="/signup" element={account ? <Navigate to="/" replace /> : <Signup />} />
              <Route path="/login" element={account ? <Navigate to="/" replace /> : <SignIn />} />
            </Routes>
          ) : (
            <>
              {!isDashboardRoute && <Navbaar onSearch={setSearchTerm} />}
              {!isDashboardRoute && isHomeRoute && (
                <Newnav
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  onApplyFilters={handleFilterApply}
                />
              )}

              {isDashboardRoute ? (
                <Routes>
                  <Route path="/dashboard/*" element={
                    !account ? (
                      <Navigate to="/login" replace />
                    ) : isAdmin ? (
                      <AdminDashboard onCategoriesChanged={fetchCategories} />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  } />
                </Routes>
              ) : (
                <main className="app_main">
                  <Routes>
                    <Route path="/" element={
                      isAdmin ? (
                        <Navigate to="/dashboard" replace />
                      ) : (
                        <Maincomp
                          selectedCategory={selectedCategory}
                          filters={appliedFilters}
                          setSelectedCategory={setSelectedCategory}
                          searchTerm={searchTerm}
                        />
                      )
                    } />
                    <Route path="/getproductsone/:id" element={
                      isAdmin ? <Navigate to="/dashboard" replace /> : <Cart />
                    } />
                    <Route path="/buynow" element={
                      isAdmin ? <Navigate to="/dashboard" replace /> : <Buynow />
                    } />
                    <Route path="/profile" element={
                      isAdmin ? <Navigate to="/dashboard" replace /> : <ProfilePage />
                    } />
                    <Route path="/products/edit/:id" element={
                      isAdmin ? (
                        <Navigate to="/dashboard" replace />
                      ) : (
                        <CreateProduct mode="edit" />
                      )
                    } />
                    <Route path="/products/new" element={
                      isAdmin ? (
                        <Navigate to="/dashboard" replace />
                      ) : (
                        <CreateProduct />
                      )
                    } />
                    <Route path="/products/all/:category?" element={
                      isAdmin ? <Navigate to="/dashboard" replace /> : <AllProducts />
                    } />
                    <Route path="/contact" element={
                      isAdmin ? <Navigate to="/dashboard" replace /> : <ContactUs />
                    } />
                    <Route path="/wishlist" element={
                      !account ? <Navigate to="/login" replace /> : <WishlistPage />
                    } />
                    <Route path="*" element={
                      <Navigate to="/" replace />
                    } />
                  </Routes>
                </main>
              )}
              {!isDashboardRoute && <Footer />}
              {!isDashboardRoute && !isAuthRoute && <ChatWidget />}
              {showLoginPrompt && (
                <LoginPrompt onCancel={() => setShowLoginPrompt(false)} />
              )}
            </>
          )}
        </Suspense>
      ) : (
        <div className="circle">
          <CircularProgress />
          <h2>{t("common.craftingExperience")}</h2>
        </div>
      )}
    </div>
  );
}

export default App;

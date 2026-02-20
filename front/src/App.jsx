import React, { useCallback, useContext, useEffect, useState, Suspense, lazy } from 'react';
import { Switch, Route, useLocation, Redirect } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import { apiUrl } from './api';
import { Logincontext } from './Components/context/Contextprovider';
import './App.css';
import './i18n/i18n';

// Lazy Load Components
const Navbaar = lazy(() => import('./Components/header/Navbaar'));
const Newnav = lazy(() => import('./Components/newnav/Newnav'));
const Maincomp = lazy(() => import('./Components/home/Maincomp'));
const Footer = lazy(() => import('./Components/footer/Footer'));
const Signup = lazy(() => import('./Components/signup_signin/SignUp'));
const SignIn = lazy(() => import('./Components/signup_signin/Sign_in'));
const Cart = lazy(() => import('./Components/cart/Cart'));
const Buynow = lazy(() => import('./Components/buynow/Buynow'));
const AdminDashboard = lazy(() => import('./Components/dashboard/AdminDashboard'));
const ProfilePage = lazy(() => import('./Components/profile/ProfilePage'));
const CreateProduct = lazy(() => import('./Components/products/CreateProduct'));
const AllProducts = lazy(() => import('./Components/products/AllProducts'));

const CATEGORY_ALL = "All Categories";

function App() {
  const location = useLocation();
  const { account, setAccount } = useContext(Logincontext);
  const [data, setData] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);
  const [categories, setCategories] = useState([CATEGORY_ALL]);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const isHomeRoute = location.pathname === "/";

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(apiUrl("/getcategories"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      if (Array.isArray(payload) && payload.length) {
        setCategories(payload);
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
        const res = await fetch(apiUrl("/validuser"), {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          credentials: "include"
        });

        if (res.status === 201) {
          const payload = await res.json();
          setAccount(payload);
        } else {
          setAccount(false);
        }
      } catch (error) {
        setAccount(false);
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
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory(CATEGORY_ALL);
    }
  }, [categories, selectedCategory]);

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
      {
        data && authChecked ? (
          <Suspense fallback={
            <div className="circle">
              <CircularProgress />
              <h2>Loading...</h2>
            </div>
          }>
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
              <Switch>
                <Route path="/dashboard">
                  {!account ? (
                    <Redirect to="/login" />
                  ) : isAdmin ? (
                    <AdminDashboard onCategoriesChanged={fetchCategories} />
                  ) : (
                    <Redirect to="/" />
                  )}
                </Route>
              </Switch>
            ) : (
              <main className="app_main">
                <Switch>
                  <Route exact path="/">
                    {isAdmin ? <Redirect to="/dashboard" /> : <Maincomp selectedCategory={selectedCategory} filters={appliedFilters} setSelectedCategory={setSelectedCategory} searchTerm={searchTerm} />}
                  </Route>
                  <Route exact path="/signup">
                    {account ? <Redirect to="/" /> : <Signup />}
                  </Route>
                  <Route exact path="/login">
                    {account ? <Redirect to="/" /> : <SignIn />}
                  </Route>
                  <Route exact path="/getproductsone/:id">
                    {isAdmin ? <Redirect to="/dashboard" /> : <Cart />}
                  </Route>
                  <Route exact path="/buynow">
                    {isAdmin ? <Redirect to="/dashboard" /> : <Buynow />}
                  </Route>
                  <Route exact path="/profile">
                    {isAdmin ? <Redirect to="/dashboard" /> : <ProfilePage />}
                  </Route>
                  <Route exact path="/products/new">
                    {isAdmin ? <Redirect to="/dashboard" /> : <CreateProduct />}
                  </Route>
                  <Route exact path="/products/all/:category?">
                    {isAdmin ? <Redirect to="/dashboard" /> : <AllProducts />}
                  </Route>
                  <Route>
                    <Redirect to="/" />
                  </Route>
                </Switch>
              </main>
            )}
            {!isDashboardRoute && <Footer />}
          </Suspense>
        ) : (
          <div className="circle">
            <CircularProgress />
            <h2>Crafting your experience...</h2>
          </div>
        )
      }

    </div>
  );
}

export default App;

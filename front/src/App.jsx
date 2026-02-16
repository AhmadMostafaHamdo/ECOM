import React from 'react';
import Navbaar from './Components/header/Navbaar';
import Newnav from './Components/newnav/Newnav';
import Maincomp from './Components/home/Maincomp';
import Footer from './Components/footer/Footer';
import Signup from './Components/signup_signin/SignUp';
import SignIn from './Components/signup_signin/Sign_in';
import Cart from './Components/cart/Cart';
import Buynow from './Components/buynow/Buynow';
import AdminDashboard from './Components/dashboard/AdminDashboard';
import ProfilePage from './Components/profile/ProfilePage';
import CreateProduct from './Components/products/CreateProduct';
import './App.css';
import { useCallback, useContext, useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { Switch, Route, useLocation, Redirect } from "react-router-dom";
import { apiUrl } from './api';
import { Logincontext } from './Components/context/Contextprovider';

const CATEGORY_ALL = "All Categories";

function App() {
  const location = useLocation();
  const { account, setAccount } = useContext(Logincontext);
  const [data, setData] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);
  const [categories, setCategories] = useState([CATEGORY_ALL]);
  const [appliedFilters, setAppliedFilters] = useState(null);
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
    setTimeout(() => {
      setData(true);
    }, 1200);
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
          <>
            <Navbaar />
            {!isDashboardRoute && isHomeRoute && (
              <Newnav
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onApplyFilters={handleFilterApply}
              />
            )}
            <main className={isDashboardRoute ? "app_main app_main_dashboard" : "app_main"}>
              <Switch>
                <Route exact path="/">
                  {isAdmin ? <Redirect to="/dashboard" /> : <Maincomp selectedCategory={selectedCategory} filters={appliedFilters} />}
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
                <Route path="/dashboard">
                  {!account ? (
                    <Redirect to="/login" />
                  ) : isAdmin ? (
                    <AdminDashboard onCategoriesChanged={fetchCategories} />
                  ) : (
                    <Redirect to="/" />
                  )}
                </Route>
                <Route>
                  <Redirect to="/" />
                </Route>
              </Switch>
            </main>
            {!isDashboardRoute && <Footer />}
          </>
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

import React, { useContext, useEffect, useState, useCallback } from "react";
import "./navbaar.css";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Logincontext } from "../context/Contextprovider";
import { ToastContainer, toast } from "react-toastify";
import { axiosInstance } from "../../api";
import { useSelector, useDispatch } from "react-redux";
import { fetchWishlist } from "../redux/features/wishlistSlice";
import { useTranslation } from "react-i18next";

// Material UI Components
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Drawer, IconButton, List, ListItem } from "@mui/material";

// Icons
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";

// Internal Components
import Rightheader from "./Rightheader";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { useTheme } from "../context/ThemeContext";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import CountrySelector from "../common/CountrySelector";

const Navbaar = React.memo(({ onSearch }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { account, setAccount } = useContext(Logincontext);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const isWishlistPage = location.pathname === "/wishlist";

  const dispatch = useDispatch();
  const wishlistItems = useSelector(state => state.wishlist?.items || []);

  const [anchorEl, setAnchorEl] = useState(null);
  const [dropen, setDropen] = useState(false);
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await axiosInstance.get(`/getproducts?search=${encodeURIComponent(query)}&limit=6`);
      const resData = response.data;
      const items = resData.data || resData.products || (Array.isArray(resData) ? resData : []);
      setSuggestions(items);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const tmr = setTimeout(() => {
      fetchSuggestions(text);
      if (onSearch) onSearch(text);
    }, 350);
    return () => clearTimeout(tmr);
  }, [text, fetchSuggestions, onSearch]);

  useEffect(() => {
    if (account) {
      dispatch(fetchWishlist());
    }
  }, [account, dispatch]);

  const logoutuser = useCallback(async () => {
    try {
      await axiosInstance.get("/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setAccount(false);
      localStorage.removeItem("auth_token");
      setAnchorEl(null);
      toast.success(t("auth.logoutSuccess") || "Logged out");
      navigate("/");
    }
  }, [setAccount, t, navigate]);

  const isAdmin = account?.role === "admin";

  return (
    <header className="header">
      <nav className="main_nav">
        {/* LEFT SECTION */}
        <div className="left_section">
          <IconButton className="hamburgur" onClick={() => setDropen(true)}>
            <MenuIcon />
          </IconButton>

          <Drawer open={dropen} onClose={() => setDropen(false)}>
            <Rightheader
              userlog={logoutuser}
              logclose={() => setDropen(false)}
            />
          </Drawer>

          <NavLink to="/" className="navlogo">
            <img src="/kik-2.png" alt="logo" />
            <span className="logo_badge">Studio Commerce</span>
          </NavLink>
        </div>

        {/* SEARCH SECTION */}
        <div
          className={`search_section ${showMobileSearch ? "mobile_visible" : ""}`}
        >
          <form
            className="nav_searchbaar"
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim()) {
                navigate(`/products/all?search=${encodeURIComponent(text.trim())}`);
                setText("");
              }
            }}
          >
            <SearchIcon className="search_leading_icon" />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("allProducts.searchPlaceholder")}
            />
            <button type="submit" className="search_icon_btn">
              <SearchIcon style={{ fontSize: 20 }} />
            </button>

            {text && (
              <List className="extrasearch_dropdown">
                {isSearching ? (
                  <ListItem className="searching_status">{t("common.searching")}</ListItem>
                ) : suggestions.length ? (
                  suggestions.map((p) => (
                    <ListItem key={p.id} className="suggestion_item">
                      <NavLink
                        to={`/getproductsone/${p.id}`}
                        onClick={() => setText("")}
                      >
                        {p.title.longTitle}
                      </NavLink>
                    </ListItem>
                  ))
                ) : (
                  <ListItem className="searching_status">
                    {t("allProducts.noProductsFound")}
                  </ListItem>
                )}
              </List>
            )}
          </form>
        </div>

        {/* RIGHT SECTION */}
        <div className="right_section">
          {/* Mobile Search Toggle */}
          <IconButton
            className="mobile_search_toggle"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <SearchIcon />
          </IconButton>

          <div className="desktop_items">
            <CountrySelector />
            <LanguageSwitcher />
            <NavLink to="/contact" className="nav_pill_btn">
              {t("navigation.contact")}
            </NavLink>
            {isAdmin && (
              <NavLink to="/dashboard" className="nav_pill_btn">
                {t("navigation.dashboard")}
              </NavLink>
            )}
            {!account && (
              <NavLink to="/login" className="nav_pill_btn primary">
                {t("auth.login")}
              </NavLink>
            )}
          </div>

          {account && (
            <div className="nav_actions_group">
              <NavLink to="/wishlist" className="nav_wishlist_btn" title={t('navigation.wishlist', 'My Wishlist')}>
                <Badge badgeContent={wishlistItems.length} color="secondary" className="wishlist_badge">
                  <FavoriteIcon
                    style={{
                      fontSize: isWishlistPage ? 25 : 20,
                      color: isWishlistPage ? "#f43f5e" : "#ff00009e"
                    }}
                  />
                </Badge>
              </NavLink>

              <NavLink to="/buynow" className="nav_cart_btn" title={t('cart.title', 'My Bag')}>
                <Badge badgeContent={account.carts?.length || 0} color="primary" className="cart_badge">
                  <ShoppingCartIcon
                    style={{
                      fontSize: location.pathname === "/buynow" ? 25 : 20,
                      color: location.pathname === "/buynow" ? "#2563eb" : "currentColor"
                    }}
                  />
                </Badge>
              </NavLink>
            </div>
          )}

          {/* Dark / Light toggle */}
          <button className="theme_toggle" onClick={toggleTheme} aria-label="toggle theme">
            {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </button>



          <Avatar
            className="user_avatar"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            {account ? account.fname[0].toUpperCase() : ""}
          </Avatar>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            className="profile_popover"
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              elevation: 8,
              className: "profile_menu_paper",
            }}
            MenuListProps={{
              className: "profile_menu_list",
            }}
          >
            <MenuItem
              className="profile_menu_item"
              onClick={() => {
                navigate("/profile");
                setAnchorEl(null);
              }}
            >
              <div className="menu_item_icon">
                <AccountCircleIcon fontSize="small" />
              </div>
              <span className="menu_item_text">{t("navigation.profile")}</span>
            </MenuItem>
            {account && (
              <MenuItem
                className="profile_menu_item"
                onClick={() => {
                  navigate("/wishlist");
                  setAnchorEl(null);
                }}
              >
                <div className="menu_item_icon">
                  <FavoriteIcon fontSize="small" style={{ color: '#f43f5e' }} />
                </div>
                <span className="menu_item_text">{t("navigation.wishlist")}</span>
              </MenuItem>
            )}
            {account && (
              <MenuItem
                className="profile_menu_item logout_item"
                onClick={logoutuser}
              >
                <div className="menu_item_icon">
                  <LogoutIcon fontSize="small" />
                </div>
                <span className="menu_item_text">{t("navigation.logout")}</span>
              </MenuItem>
            )}
          </Menu>
        </div>
      </nav>
      <ToastContainer position="bottom-right" />
    </header>
  );
});

export default Navbaar;

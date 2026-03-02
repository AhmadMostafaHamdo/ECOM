import React, { useContext, useEffect, useState, useCallback } from "react";
import "./Navbaar.css";
import { NavLink, useHistory } from "react-router-dom";
import { Logincontext } from "../context/Contextprovider";
import { ToastContainer, toast } from "react-toastify";
import { apiUrl } from "../../api";
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

// Internal Components
import Rightheader from "./Rightheader";
import LanguageSwitcher from "../common/LanguageSwitcher";

const Navbaar = React.memo(({ onSearch }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { account, setAccount } = useContext(Logincontext);

  const [anchorEl, setAnchorEl] = useState(null);
  const [dropen, setDropen] = useState(false);
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim()) return setSuggestions([]);
    setIsSearching(true);
    try {
      const res = await fetch(
        apiUrl(`/getproducts?search=${encodeURIComponent(query)}&limit=6`),
      );
      const data = await res.json();
      setSuggestions(data.products || data || []);
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

  const logoutuser = useCallback(async () => {
    await fetch(apiUrl("/logout"), { credentials: "include" });
    setAccount(false);
    setAnchorEl(null);
    toast.success(t("auth.logoutSuccess") || "Logged out");
    history.push("/");
  }, [history, setAccount, t]);

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
          <div className="nav_searchbaar">
            <SearchIcon className="search_leading_icon" />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("allProducts.searchPlaceholder")}
            />
            <button className="search_icon_btn">
              <SearchIcon style={{ fontSize: 20 }} />
            </button>

            {text && (
              <List className="extrasearch_dropdown">
                {isSearching ? (
                  <ListItem className="searching_status">Searching…</ListItem>
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
          </div>
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

          <NavLink to={account ? "/buynow" : "/login"} className="cart_action">
            <Badge
              badgeContent={account ? account.carts.length : 0}
              color="error"
            >
              <ShoppingCartIcon />
            </Badge>
            <span className="cart_label">{t("navigation.cart")}</span>
          </NavLink>

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
                history.push("/profile");
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

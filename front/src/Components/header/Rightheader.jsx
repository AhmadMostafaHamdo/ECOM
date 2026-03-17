import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Logincontext } from "../context/Contextprovider";
import "./rightheader.css";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import StoreIcon from "@mui/icons-material/Store";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LoginIcon from "@mui/icons-material/Login";
import LanguageSwitcher from "../common/LanguageSwitcher";
import CountrySelector from "../common/CountrySelector";

const Rightheader = ({ userlog, logclose }) => {
  const { account, setShowLoginPrompt } = useContext(Logincontext);
  const { t } = useTranslation();
  const isAdmin = account?.role === "admin";

  return (
    <div className="drawer">
      {/* Profile Section */}
      <div className="drawer_profile" onClick={() => { if (account) { logclose(); } }}>
        <Avatar className="drawer_avatar">
          {account ? account.fname[0].toUpperCase() : "?"}
        </Avatar>
        <div>
          <h3>{account ? `${t('auth.hello', 'Hello')}, ${account.fname}` : t('auth.welcomeGuest', 'Welcome Guest')}</h3>
          <p>{t('home.premiumExperience', 'Curated shopping experience')}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="drawer_nav">
        <NavLink to="/" onClick={logclose}>
          <HomeIcon /> {t('navigation.home')}
        </NavLink>

        <NavLink to="/products/all" onClick={(e) => {
          if (!account) {
            e.preventDefault();
            setShowLoginPrompt(true);
            logclose();
          } else {
            logclose();
          }
        }}>
          <StoreIcon /> {t('navigation.products', 'Products')}
        </NavLink>

        {account && (
          <>
            <NavLink to="/profile" onClick={logclose}>
              <AccountCircleIcon /> {t('navigation.profile')}
            </NavLink>
            <NavLink to="/wishlist" onClick={logclose}>
              <FavoriteIcon /> {t('navigation.wishlist', 'My Wishlist')}
            </NavLink>
            <NavLink to="/buynow" onClick={logclose}>
              <ShoppingCartIcon /> {t('cart.title', 'My Bag')}
            </NavLink>
          </>
        )}

        {isAdmin && (
          <NavLink to="/dashboard" onClick={logclose}>
            <DashboardIcon /> {t('navigation.dashboard', 'Dashboard')}
          </NavLink>
        )}

        <NavLink to="/contact" onClick={logclose}>
          <ContactSupportIcon /> {t('navigation.contact', 'Contact Us')}
        </NavLink>
      </nav>

      <Divider className="divider_custom" />

      <div className="drawer_settings">
        <CountrySelector />
        <LanguageSwitcher />
      </div>

      <Divider className="divider_custom" />

      {/* Auth Action */}
      {account ? (
        <button
          className="logout"
          onClick={() => {
            userlog();
            logclose();
          }}
        >
          <LogoutIcon fontSize="small" /> {t('navigation.logout')}
        </button>
      ) : (
        <NavLink to="/login" className="signin_btn" onClick={logclose}>
          <LoginIcon fontSize="small" /> {t('navigation.login')}
        </NavLink>
      )}
    </div>
  );
};

export default Rightheader;

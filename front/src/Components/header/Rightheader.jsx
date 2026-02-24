import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Logincontext } from "../context/Contextprovider";
import "./Rightheader.css";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LoginIcon from "@mui/icons-material/Login";

const Rightheader = ({ userlog, logclose }) => {
  const { account } = useContext(Logincontext);

  return (
    <div className="drawer">
      {/* Profile Section */}
      <div className="drawer_profile">
        <Avatar className="drawer_avatar">
          {account ? account.fname[0].toUpperCase() : "?"}
        </Avatar>
        <div>
          <h3>{account ? `Hello, ${account.fname}` : "Welcome Guest"}</h3>
          <p>Curated shopping experience</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="drawer_nav">
        <NavLink to="/" onClick={logclose} exact activeClassName="active">
          <HomeIcon /> Home
        </NavLink>

        <NavLink
          to={account ? "/buynow" : "/login"}
          onClick={logclose}
          activeClassName="active"
        >
          <ShoppingBagIcon /> Your Orders
        </NavLink>

        {/* Add more links here as needed */}
      </nav>

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
          <LogoutIcon fontSize="small" /> Logout
        </button>
      ) : (
        <NavLink to="/login" className="signin_btn" onClick={logclose}>
          <LoginIcon fontSize="small" /> Sign In
        </NavLink>
      )}
    </div>
  );
};

export default Rightheader;

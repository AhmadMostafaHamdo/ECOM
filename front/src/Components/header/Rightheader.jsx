import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { Logincontext } from "../context/Contextprovider";
import "./rightheader.css";
import { Divider } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import LoginIcon from "@mui/icons-material/Login";

const Rightheader = ({ userlog, logclose }) => {
    const { account } = useContext(Logincontext);

    return (
        <div className="rightheader">
            <div className="right_nav">
                {account ? (
                    <Avatar className="avtar2" title={account.fname.toUpperCase()}>
                        {account.fname[0].toUpperCase()}
                    </Avatar>
                ) : (
                    <Avatar className="avtar" />
                )}
                <div className="drawer_identity">
                    <h3>{account ? `Hello, ${account.fname}` : "Welcome"}</h3>
                    <p>Curated shopping, simplified.</p>
                </div>
            </div>

            <div className="nav_btn">
                <NavLink to="/" className="nav_link" onClick={() => logclose()}>
                    <HomeIcon className="nav_icon" />
                    <span>Home</span>
                </NavLink>

                <NavLink to="/" className="nav_link" onClick={() => logclose()}>
                    <CategoryIcon className="nav_icon" />
                    <span>Browse Categories</span>
                </NavLink>

                <NavLink to="/" className="nav_link" onClick={() => logclose()}>
                    <LocalOfferIcon className="nav_icon" />
                    <span>Today's Offers</span>
                </NavLink>

                <NavLink to={account ? "/buynow" : "/login"} className="nav_link" onClick={() => logclose()}>
                    <ShoppingBagIcon className="nav_icon" />
                    <span>Your Orders</span>
                </NavLink>

                <Divider className="drawer_divider" />

                <NavLink to="/dashboard" className="nav_link" onClick={() => logclose()}>
                    <DashboardCustomizeIcon className="nav_icon" />
                    <span>Admin Dashboard</span>
                </NavLink>

                {account ? (
                    <div className="flag nav_link logout_link" onClick={() => userlog()}>
                        <LogoutIcon className="nav_icon logout_icon" />
                        <span>Log Out</span>
                    </div>
                ) : (
                    <NavLink to="/login" className="nav_link signin_link" onClick={() => logclose()}>
                        <LoginIcon className="nav_icon" />
                        <span>Sign in</span>
                    </NavLink>
                )}
            </div>
        </div>
    );
};

export default Rightheader;

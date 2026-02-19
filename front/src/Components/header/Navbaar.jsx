import React, { useContext, useEffect, useMemo, useState } from "react";
import "../header/navbaar.css";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { NavLink } from "react-router-dom";
import { Logincontext } from "../context/Contextprovider";
import { ToastContainer, toast } from "react-toastify";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import "react-toastify/dist/ReactToastify.css";
import { useHistory } from "react-router";
import { Drawer, IconButton, List, ListItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Rightheader from "./Rightheader";
import { getProducts } from "../redux/actions/action";
import { useSelector, useDispatch } from "react-redux";
import { apiUrl } from "../../api";
import { useCallback } from 'react';
import './Navbaar.css';
import LanguageSwitcher from '../common/LanguageSwitcher';

const Navbaar = React.memo(() => {
    const history = useHistory("");
    const [text, setText] = useState("");
    const { products } = useSelector((state) => state.getproductsdata);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getProducts());
    }, [dispatch]);

    const [anchorEl, setAnchorEl] = useState(null);
    const [liopen, setLiopen] = useState(true);
    const [dropen, setDropen] = useState(false);
    const { account, setAccount } = useContext(Logincontext);

    const handleClick = useCallback((event) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleMyAccountClick = useCallback(() => {
        handleClose();
        history.push("/profile");
    }, [handleClose, history]);

    useEffect(() => {
        const getdetailsvaliduser = async () => {
            const res = await fetch(apiUrl("/validuser"), {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            const data = await res.json();

            if (res.status !== 201) {
                return;
            }
            setAccount(data);
        };

        getdetailsvaliduser();
    }, [setAccount]);

    const isAdmin = account?.role === "admin";

    const logoutuser = useCallback(async () => {
        const res2 = await fetch(apiUrl("/logout"), {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        const data2 = await res2.json();

        if (res2.status !== 201) {
            const error = new Error(data2.error);
            throw error;
        } else {
            setAccount(false);
            setAnchorEl(null);
            toast.success("Logged out successfully.", {
                position: "top-center",
                autoClose: 2400,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
            history.push("/");
        }
    }, [history, setAccount]);

    const getText = useCallback((searchText) => {
        setText(searchText);
        setLiopen(searchText.trim().length === 0);
    }, []);

    const filteredProducts = useMemo(() => {
        if (!text.trim()) {
            return [];
        }
        return products.filter((product) =>
            product.title.longTitle.toLowerCase().includes(text.toLowerCase())
        );
    }, [products, text]);

    return (
        <header>
            <nav className="main_nav">
                <div className="left">
                    <IconButton className="hamburgur" onClick={() => setDropen(true)}>
                        <MenuIcon />
                    </IconButton>

                    <Drawer open={dropen} onClose={() => setDropen(false)}>
                        <Rightheader userlog={logoutuser} logclose={() => setDropen(false)} />
                    </Drawer>

                    <div className="navlogo">
                        <NavLink to="/">
                            <img src="./amazon_PNG25.png" alt="logo" />
                            <span>Studio Commerce</span>
                        </NavLink>
                    </div>

                    <div className="nav_searchbaar">
                        <SearchIcon className="search_leading_icon" />
                        <input
                            type="text"
                            onChange={(e) => getText(e.target.value)}
                            value={text}
                            placeholder="Search products, categories, and brands"
                        />
                        <button type="button" className="search_icon" aria-label="Search products">
                            <SearchIcon id="search" />
                        </button>
                        {text.trim().length > 0 && (
                            <List className="extrasearch" hidden={liopen}>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <ListItem key={product.id}>
                                            <NavLink to={`/getproductsone/${product.id}`} onClick={() => setLiopen(true)}>
                                                {/* {product.title.longTitle} */}
                                            </NavLink>
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem className="no_search_result">No matching products found.</ListItem>
                                )}
                            </List>
                        )}
                    </div>
                </div>

                <div className="right">
                    <LanguageSwitcher />
                    
                    {isAdmin && (
                        <div className="nav_btn">
                            <NavLink to="/dashboard">
                                <span>Dashboard</span>
                            </NavLink>
                        </div>
                    )}

                    {!account && <div className="nav_btn">
                        <NavLink to="/login">
                            <span>Sign in</span>
                        </NavLink>
                    </div>}

                    <NavLink to={account ? "/buynow" : "/login"}>
                        <div className="cart_btn">
                            <Badge badgeContent={account ? account.carts.length : 0} color="secondary">
                                <ShoppingCartIcon id="icon" />
                            </Badge>
                            <p>Cart</p>
                        </div>
                    </NavLink>

                    {account ? (
                        <Avatar className="avtar2" onClick={handleClick} title={account.fname.toUpperCase()}>
                            {account.fname[0].toUpperCase()}
                        </Avatar>
                    ) : (
                        <Avatar className="avtar" onClick={handleClick} />
                    )}

                    <div className="menu_div">
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} className="profile_menu">
                            <MenuItem onClick={handleMyAccountClick} style={{ margin: 10 }}>
                                <AccountCircleIcon style={{ fontSize: 18, marginRight: 8 }} />
                                My Account
                            </MenuItem>
                            {account && (
                                <MenuItem onClick={logoutuser} style={{ margin: 10 }}>
                                    <LogoutIcon style={{ fontSize: 18, marginRight: 8 }} />
                                    Logout
                                </MenuItem>
                            )}
                        </Menu>
                    </div>
                    <ToastContainer />
                </div>
            </nav>
        </header>
    );
});

export default Navbaar;

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
import { useTranslation } from "react-i18next";
import './Navbaar.css';
import LanguageSwitcher from '../common/LanguageSwitcher';

const Navbaar = React.memo(({ onSearch }) => {
    const { t } = useTranslation();
    const history = useHistory("");
    const [text, setText] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const dispatch = useDispatch();

    const [anchorEl, setAnchorEl] = useState(null);
    const [liopen, setLiopen] = useState(true);
    const [dropen, setDropen] = useState(false);
    const { account, setAccount } = useContext(Logincontext);

    const fetchSuggestions = useCallback(async (query) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(apiUrl(`/getproducts?search=${encodeURIComponent(query)}&limit=6`));
            const resData = await res.json();
            if (resData.products) {
                setSuggestions(resData.products);
            } else if (Array.isArray(resData)) {
                setSuggestions(resData);
            }
        } catch (error) {
            console.log("Suggestions fetch failed:", error.message);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        const delaySearchFn = setTimeout(() => {
            if (text.trim()) {
                fetchSuggestions(text);
            } else {
                setSuggestions([]);
            }

            if (onSearch) {
                onSearch(text);
            }
        }, 400);

        return () => clearTimeout(delaySearchFn);
    }, [text, onSearch, fetchSuggestions]);

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
            toast.success(t('auth.logoutSuccess') || "Logged out successfully.", {
                position: "top-center",
                autoClose: 2400,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
            history.push("/");
        }
    }, [history, setAccount, t]);

    const getText = useCallback((searchText) => {
        setText(searchText);
        setLiopen(searchText.trim().length === 0);
    }, []);
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
                            <img src="/amazon_PNG25.png" alt="logo" />
                            <span>Studio Commerce</span>
                        </NavLink>
                    </div>
                    <div className="nav_searchbaar">
                        <SearchIcon className="search_leading_icon" />
                        <input
                            type="text"
                            onChange={(e) => getText(e.target.value)}
                            value={text}
                            placeholder={t('allProducts.searchPlaceholder')}
                        />
                        <button type="button" className="search_icon" aria-label="Search products">
                            <SearchIcon id="search" />
                        </button>
                        {text.trim().length > 0 && (
                            <List className="extrasearch" hidden={liopen}>
                                {isSearching ? (
                                    <ListItem className="no_search_result">Searching...</ListItem>
                                ) : suggestions.length > 0 ? (
                                    suggestions.map((product) => (
                                        <ListItem key={product.id}>
                                            <NavLink to={`/getproductsone/${product.id}`} onClick={() => setLiopen(true)}>
                                                {product.title.longTitle}
                                            </NavLink>
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem className="no_search_result">{t('allProducts.noProductsFound')}</ListItem>
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
                                <span>{t('navigation.dashboard')}</span>
                            </NavLink>
                        </div>
                    )}

                    {!account && <div className="nav_btn">
                        <NavLink to="/login">
                            <span>{t('auth.login')}</span>
                        </NavLink>
                    </div>}

                    <NavLink to={account ? "/buynow" : "/login"}>
                        <div className="cart_btn">
                            <Badge badgeContent={account ? account.carts.length : 0} color="secondary">
                                <ShoppingCartIcon id="icon" />
                            </Badge>
                            <p>{t('navigation.cart')}</p>
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
                                {t('navigation.profile')}
                            </MenuItem>
                            {account && (
                                <MenuItem onClick={logoutuser} style={{ margin: 10 }}>
                                    <LogoutIcon style={{ fontSize: 18, marginRight: 8 }} />
                                    {t('navigation.logout')}
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

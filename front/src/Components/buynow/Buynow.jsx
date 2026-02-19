import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Empty from "./Empty";
import Option from "./Option";
import Right from "./Right";
import Subtotal from "./Subtotal";
import { apiUrl } from "../../api";
import "./buynow.css";

const Buynow = () => {
    const { t } = useTranslation();
    const [cartdata, setCartdata] = useState([]);

    const getdatabuy = async () => {
        const res = await fetch(apiUrl("/cartdetails"), {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        const data = await res.json();

        if (res.status !== 201) {
            alert(t('errors.noDataAvailable'));
        } else {
            setCartdata(data.carts);
        }
    };

    useEffect(() => {
        getdatabuy();
    }, []);

    return (
        <>
            {cartdata.length ? (
                <div className="cart-wrapper">
                    <div className="cart-container">
                        {/* Left Section - Cart Items */}
                        <div className="cart-main">
                            <div className="cart-header">
                                <div className="header-content">
                                    <h1 className="cart-title">{t('cart.title')}</h1>
                                    <p className="cart-subtitle">
                                        {cartdata.length} {cartdata.length === 1 ? t('cart.item') : t('cart.items')} {t('cart.inYourCart')}
                                    </p>
                                </div>
                                <div className="header-decoration"></div>
                            </div>

                            <div className="cart-items">
                                {cartdata.map((item, index) => (
                                    <div key={item.id} className="cart-item" style={{ '--item-index': index }}>
                                        <div className="item-image-wrapper">
                                            <img src={item.detailUrl} alt={item.title.shortTitle} className="item-image" />
                                        </div>

                                        <div className="item-content">
                                            <div className="item-info">
                                                <h3 className="item-title">
                                                    {item.title.longTitle}
                                                </h3>
                                                <p className="item-subtitle">
                                                    {item.title.shortTitle}
                                                </p>
                                                
                                                <div className="item-badges">
                                                    <span className="badge badge-shipping">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M16 3h5v5M4 20L21 3"/>
                                                        </svg>
                                                        Free Shipping
                                                    </span>
                                                    <span className="badge badge-delivery">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <rect x="1" y="3" width="15" height="13"/>
                                                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 16 8"/>
                                                            <circle cx="5.5" cy="18.5" r="2.5"/>
                                                            <circle cx="18.5" cy="18.5" r="2.5"/>
                                                        </svg>
                                                        48h Dispatch
                                                    </span>
                                                </div>

                                                <div className="item-meta">
                                                    <img 
                                                        src="https://m.media-amazon.com/images/G/31/marketing/fba/fba-badge_18px-2x._CB485942108_.png" 
                                                        alt="Prime badge" 
                                                        className="prime-badge"
                                                    />
                                                </div>
                                            </div>

                                            <div className="item-actions">
                                                <div className="item-price-tag">
                                                    <span className="price-label">{t('cart.price')}</span>
                                                    <span className="price-value">₹{item.price.cost.toLocaleString()}</span>
                                                </div>
                                                <Option deletedata={item.id} get={getdatabuy} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-subtotal-section">
                                <Subtotal iteam={cartdata} />
                            </div>
                        </div>

                        {/* Right Section - Summary */}
                        <div className="cart-sidebar">
                            <Right iteam={cartdata} />
                        </div>
                    </div>
                </div>
            ) : (
                <Empty />
            )}
        </>
    );
};

export default Buynow;
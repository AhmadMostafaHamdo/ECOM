import React from "react";
import { NavLink } from "react-router-dom";
import "./buynow.css";

const Empty = () => {
    return (
        <div className="buynow_section empty_state_wrap">
            <div className="buynow_container">
                <div className="empty_buy">
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2xpOr8GbZhxyLr0uD8mEn9L6lsHT-jHq2Kg&usqp=CAU"
                        alt="cart"
                    />
                    <div className="emptydata">
                        <h1>Your basket is currently empty</h1>
                        <p>Discover curated recommendations and add your favorites.</p>
                    </div>
                    <div className="empty_actions">
                        <NavLink className="empty_btn" to="/">
                            Start Shopping
                        </NavLink>
                        <NavLink className="empty_btn secondary" to="/products/new">
                            Add Product
                        </NavLink>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Empty;

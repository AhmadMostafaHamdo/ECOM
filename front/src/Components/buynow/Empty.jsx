import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./buynow.css";

const Empty = () => {
  const { t } = useTranslation();
  return (
    <div className="buynow_section empty_state_wrap">
      <div className="buynow_container">
        <div className="empty_buy">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2xpOr8GbZhxyLr0uD8mEn9L6lsHT-jHq2Kg&usqp=CAU"
            alt="cart"
          />
          <div className="emptydata">
            <h1>{t("cart.empty")}</h1>
            <p>{t("cart.emptyDesc")}</p>
          </div>
          <div className="empty_actions">
            <NavLink className="empty_btn" to="/">
              {t("cart.continueShopping")}
            </NavLink>
            <NavLink className="empty_btn secondary" to="/products/new">
              {t("productCreator.addProduct", "Add Product")}
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Empty;

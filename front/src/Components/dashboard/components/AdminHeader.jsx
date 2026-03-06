import React from 'react';
import { NavLink } from "react-router-dom";
import RateReviewIcon from "@mui/icons-material/RateReview";
import Inventory2Icon from "@mui/icons-material/Inventory2";

const AdminHeader = ({ t }) => {
    return (
        <header className="admin_top_header">
            <div className="admin_search_bar">
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" placeholder={t("navigation.search")} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                <div
                    className="admin_header_icon_group"
                    style={{ display: "flex", gap: "16px" }}
                >
                    <div className="admin_header_icon">
                        <RateReviewIcon style={{ fontSize: "18px" }} />
                        <span className="admin_notification_badge">5</span>
                    </div>
                    <div className="admin_header_icon">
                        <Inventory2Icon style={{ fontSize: "18px" }} />
                    </div>
                </div>
                <div
                    style={{
                        height: "32px",
                        width: "1px",
                        background: "var(--color-border)",
                    }}
                ></div>
                <NavLink
                    to="/"
                    className="admin_btn primary sm"
                    style={{
                        textDecoration: "none",
                        padding: "10px 24px",
                        fontSize: "12px",
                        fontWeight: "800",
                        boxShadow: "0 8px 20px rgba(59, 130, 246, 0.25)",
                    }}
                >
                    {t("navigation.home").toUpperCase()}
                </NavLink>
            </div>
        </header>
    );
};

export default AdminHeader;

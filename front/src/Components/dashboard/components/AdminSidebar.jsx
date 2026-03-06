import React from 'react';
import { NavLink } from "react-router-dom";
import CategoryIcon from "@mui/icons-material/Category";
import LogoutIcon from "@mui/icons-material/Logout";

const AdminSidebar = ({
    sidebarOpen,
    navItems,
    closeSidebar,
    t,
    setConfirmLogoutOpen,
    url = "/dashboard"
}) => {
    return (
        <aside className={sidebarOpen ? "admin_sidebar open" : "admin_sidebar"}>
            <div className="admin_sidebar_brand">
                <div className="logo_icon">
                    <CategoryIcon style={{ fontSize: "20px" }} />
                </div>
                <h2>Nexus v2</h2>
            </div>
            <nav className="admin_sidebar_nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const route = `${url}${item.path}`;
                    return (
                        <NavLink
                            key={item.key}
                            to={route}
                            end={item.path === ""}
                            className={({ isActive }) => `admin_nav_link ${isActive ? "active" : ""}`}
                            onClick={closeSidebar}
                        >
                            <Icon />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
            <div className="admin_sidebar_footer">
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                background: "#f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#64748b",
                                fontWeight: "bold",
                                fontSize: "13px",
                            }}
                        >
                            AH
                        </div>
                        <div>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "13px",
                                    color: "#e2e8f0",
                                    fontWeight: "800",
                                }}
                            >
                                {t("admin.dashboard")}
                            </p>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "11px",
                                    color: "#bcd3ff",
                                    fontWeight: "700",
                                    letterSpacing: "0.02em",
                                }}
                            >
                                SUPERUSER
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setConfirmLogoutOpen(true)}
                        style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#94a3b8",
                            padding: "8px",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                        }}
                        className="admin_logout_btn"
                        title="Disconnect Session"
                    >
                        <LogoutIcon style={{ fontSize: "20px" }} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;

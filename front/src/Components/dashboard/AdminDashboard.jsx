import React, { useState } from "react";
import { NavLink, Route, Switch, useRouteMatch } from "react-router-dom";
import DashboardHome from "./DashboardHome";
import UsersManagement from "./UsersManagement";
import CategoriesManagement from "./CategoriesManagement";
import StatisticsPage from "./StatisticsPage";
import ProductsManagement from "./ProductsManagement";
import "./admin-dashboard.css";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import CategoryIcon from "@mui/icons-material/Category";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const navItems = [
    { key: "home", label: "Dashboard Home", icon: DashboardIcon, path: "" },
    { key: "users", label: "Users Management", icon: GroupIcon, path: "/users" },
    { key: "products", label: "Products Management", icon: Inventory2Icon, path: "/products" },
    { key: "categories", label: "Categories Management", icon: CategoryIcon, path: "/categories" },
    { key: "stats", label: "Statistics", icon: QueryStatsIcon, path: "/statistics" }
];

const AdminDashboard = ({ onCategoriesChanged = () => {} }) => {
    const { path, url } = useRouteMatch();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <section className="admin_dashboard_shell">
            <button
                type="button"
                className="admin_sidebar_toggle"
                onClick={() => setSidebarOpen((value) => !value)}
                aria-label="Toggle admin menu"
            >
                {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <aside className={sidebarOpen ? "admin_sidebar open" : "admin_sidebar"}>
                <div className="admin_sidebar_brand">
                    <p className="admin_brand_kicker">Control Panel</p>
                    <h2>Admin Dashboard</h2>
                </div>

                <nav className="admin_sidebar_nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const route = `${url}${item.path}`;
                        return (
                            <NavLink
                                key={item.key}
                                exact={item.path === ""}
                                to={route}
                                className="admin_nav_link"
                                activeClassName="active"
                                onClick={closeSidebar}
                            >
                                <Icon />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            <div className="admin_dashboard_content" onClick={closeSidebar}>
                <Switch>
                    <Route exact path={path}>
                        <DashboardHome />
                    </Route>
                    <Route exact path={`${path}/users`}>
                        <UsersManagement />
                    </Route>
                    <Route exact path={`${path}/products`}>
                        <ProductsManagement />
                    </Route>
                    <Route exact path={`${path}/categories`}>
                        <CategoriesManagement onCategoriesChanged={onCategoriesChanged} />
                    </Route>
                    <Route exact path={`${path}/statistics`}>
                        <StatisticsPage />
                    </Route>
                    <Route path={path}>
                        <DashboardHome />
                    </Route>
                </Switch>
            </div>
        </section>
    );
};

export default AdminDashboard;

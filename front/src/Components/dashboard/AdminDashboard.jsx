import React, { useState, Suspense, lazy } from "react";
import { NavLink, Route, Switch, useRouteMatch } from "react-router-dom";
import "./admin-dashboard.css";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import CategoryIcon from "@mui/icons-material/Category";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import RateReviewIcon from "@mui/icons-material/RateReview";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const DashboardHome = lazy(() => import("./DashboardHome"));
const UsersManagement = lazy(() => import("./UsersManagement"));
const CategoriesManagement = lazy(() => import("./CategoriesManagement"));
const StatisticsPage = lazy(() => import("./StatisticsPage"));
const ProductsManagement = lazy(() => import("./ProductsManagement"));
const ReviewManagement = lazy(() => import("./ReviewManagement"));
const DesignSystemShowcase = lazy(() => import("./DesignSystemShowcase"));

const navItems = [
    { key: "home", label: "Dashboard Home", icon: DashboardIcon, path: "" },
    { key: "design-system", label: "Design System (BETA)", icon: Inventory2Icon, path: "/design-system" },
    { key: "users", label: "Users Management", icon: GroupIcon, path: "/users" },
    { key: "products", label: "Products Management", icon: Inventory2Icon, path: "/products" },
    { key: "categories", label: "Categories Management", icon: CategoryIcon, path: "/categories" },
    { key: "reviews", label: "Review Management", icon: RateReviewIcon, path: "/reviews" },
    { key: "stats", label: "Statistics", icon: QueryStatsIcon, path: "/statistics" }
];

const AdminDashboard = ({ onCategoriesChanged = () => { } }) => {
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
                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                        <CategoryIcon style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                        <p className="admin_brand_kicker">Nexus Console</p>
                        <h2 style={{ letterSpacing: '0.05em' }}>E-COM v2</h2>
                    </div>
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

                <div className="admin_sidebar_footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--admin-sidebar-gradient)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>AH</div>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '14px', color: 'white', fontWeight: '800' }}>Admin Hub</p>
                            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '700' }}>SYSTEM ONLINE</p>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="admin_dashboard_content">
                <header className="admin_top_header">
                    <div className="admin_search_bar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" placeholder="Access terminal records, statistics..." />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <div className="admin_header_icon_group" style={{ display: 'flex', gap: '16px' }}>
                            <div className="admin_header_icon">
                                <RateReviewIcon style={{ fontSize: '18px' }} />
                                <span className="admin_notification_badge">5</span>
                            </div>
                            <div className="admin_header_icon">
                                <Inventory2Icon style={{ fontSize: '18px' }} />
                            </div>
                        </div>

                        <div style={{ height: '32px', width: '1px', background: 'var(--color-border)' }}></div>

                        <NavLink to="/" className="admin_btn primary sm" style={{ textDecoration: 'none', padding: '10px 24px', fontSize: '12px', fontWeight: '800', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)' }}>
                            LAUNCH SITE
                        </NavLink>
                    </div>
                </header>

                <main className="admin_page_wrapper" onClick={closeSidebar} style={{ position: 'relative' }}>
                    <Suspense fallback={
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: '20px' }}>
                            <div style={{ width: '48px', height: '48px', border: '4px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ color: 'var(--color-text-secondary)', fontWeight: '700', fontSize: '15px', letterSpacing: '0.05em' }}>SYNCHRONIZING MODULES...</p>
                        </div>
                    }>
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
                            <Route exact path={`${path}/reviews`}>
                                <ReviewManagement />
                            </Route>
                            <Route exact path={`${path}/statistics`}>
                                <StatisticsPage />
                            </Route>
                            <Route exact path={`${path}/design-system`}>
                                <DesignSystemShowcase />
                            </Route>
                            <Route path={path}>
                                <DashboardHome />
                            </Route>
                        </Switch>
                    </Suspense>
                </main>
            </div>
        </section>
    );
};

export default AdminDashboard;

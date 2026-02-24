import React, { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../../api";
import { useTranslation } from "react-i18next";
import Pagination from "../common/Pagination";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table";

const defaultForm = {
    fname: "",
    lname: "",
    email: "",
    mobile: "",
    password: "",
    cpassword: "",
    role: "user"
};

const UsersManagement = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(defaultForm);
    const [editingUserId, setEditingUserId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState('all'); // all, admin, user
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    });

    const loadUsers = useCallback(async (page = 1) => {
        setLoading(true);
        setError("");
        try {
            const queryParams = new URLSearchParams({
                page,
                limit: 10,
                search: searchTerm
            });
            const response = await fetch(apiUrl(`/admin/users?${queryParams.toString()}`), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to load users");
            }

            const resData = await response.json();
            setUsers(resData.data || []);
            setPagination(resData.pagination);
        } catch (loadError) {
            setError(loadError.message);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            loadUsers(1);
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [loadUsers]);

    const handlePageChange = (newPage) => {
        loadUsers(newPage);
    };

    const isEditing = Boolean(editingUserId);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = (user) => {
        setEditingUserId(user._id);
        setForm({
            fname: user.fname || "",
            lname: user.lname || "",
            email: user.email || "",
            mobile: user.mobile || "",
            password: "",
            cpassword: "",
            role: user.role || "user"
        });
        setShowForm(true);
        setError("");
    };

    const resetForm = () => {
        setForm(defaultForm);
        setEditingUserId("");
        setShowForm(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = {
                fname: form.fname,
                lname: form.lname,
                email: form.email,
                mobile: form.mobile,
                role: form.role
            };

            if (form.password.trim()) {
                payload.password = form.password;
                payload.cpassword = form.cpassword || form.password;
            }

            const response = await fetch(
                isEditing ? apiUrl(`/admin/users/${editingUserId}`) : apiUrl("/admin/users"),
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to save user");
            }

            resetForm();
            loadUsers(pagination.currentPage);
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin_page" style={{ background: 'transparent' }}>
            <header className="admin_page_header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{t("admin.manageUsers")}</h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>{t("admin.welcomeMessage")}</p>
                </div>
                {!showForm && (
                    <button className="btn_primary" onClick={() => setShowForm(true)}>
                        {t("admin.createUser")}
                    </button>
                )}
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr 400px' : '1fr', gap: '32px', alignItems: 'start' }}>
                <section className="dashboard-section">
                    <div className="dashboard-header">
                        <div className="dashboard-title">User Management</div>
                        <div className="dashboard-subtitle">Manage user accounts and permissions</div>
                    </div>

                    <div className="dashboard-controls">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="action-buttons">
                            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                                Add User
                            </button>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("profile.personalInfo")}</TableHead>
                                <TableHead>{t("auth.email")}</TableHead>
                                <TableHead>{t("auth.role")}</TableHead>
                                <TableHead>{t("common.status")}</TableHead>
                                <TableHead className="text-right">{t("common.edit")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan="5" className="loading-state">
                                        <div className="loading-spinner"></div>
                                        Synchronizing Citizen Data...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan="5" className="empty-state">
                                        <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        No citizens found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            ) : users.map(user => (
                                <TableRow key={user._id}>
                                    <TableCell>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {user.fname ? user.fname[0].toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <div className="user-name">{user.fname} {user.lname}</div>
                                                <div className="user-id">ID: {user._id.substring(user._id.length - 8)}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-gray-600">{user.email}</TableCell>
                                    <TableCell>
                                        <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="status-badge active">
                                            Active
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="action-buttons">
                                            <button className="btn-secondary" onClick={() => handleEdit(user)}>Edit</button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="pagination-container">
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </section>

                {showForm && (
                    <section className="admin_card" style={{ position: 'sticky', top: '104px', animation: 'slideRight 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                                {isEditing ? "Modify Portal Access" : "Grant New Access"}
                            </h2>
                            <button onClick={resetForm} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                        </div>

                        <form className="admin_form" onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label>{t("auth.firstName")}</label>
                                    <input type="text" name="fname" value={form.fname} onChange={handleInputChange} required />
                                </div>
                                <div>
                                    <label>{t("auth.lastName")}</label>
                                    <input type="text" name="lname" value={form.lname} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div>
                                <label>{t("auth.email")}</label>
                                <input type="email" name="email" value={form.email} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <label>{t("auth.mobile")}</label>
                                <input type="text" name="mobile" value={form.mobile} onChange={handleInputChange} />
                            </div>
                            <div>
                                <label>{t("auth.role")}</label>
                                <select name="role" value={form.role} onChange={handleInputChange}>
                                    <option value="user">{t("auth.role_user") || "User"}</option>
                                    <option value="admin">{t("auth.role_admin") || "Admin"}</option>
                                </select>
                            </div>
                            <div>
                                <label>{t("auth.password")} {isEditing && `(${t("common.optional") || "Optional"})`}</label>
                                <input type="password" name="password" value={form.password} onChange={handleInputChange} required={!isEditing} />
                            </div>

                            {error && <div className="admin_notice error" style={{ padding: '8px 12px', fontSize: '12px', marginTop: '8px' }}>{error}</div>}

                            <div style={{ marginTop: '24px' }}>
                                <button type="submit" className="btn_primary" style={{ width: '100%' }} disabled={saving}>
                                    {saving ? t("common.loading") : isEditing ? t("admin.editUser") : t("admin.createUser")}
                                </button>
                            </div>
                        </form>
                    </section>
                )}
            </div>
        </div>
    );
};

export default UsersManagement;

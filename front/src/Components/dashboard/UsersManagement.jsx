import React, { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../../api";
import { useTranslation } from "react-i18next";
import Pagination from "../common/Pagination";

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
                <section className="admin_table_wrapper">
                    <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="admin_search_bar" style={{ width: '340px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input
                                type="text"
                                placeholder="Search by name, email or mobile..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <table className="admin_table">
                        <thead>
                            <tr>
                                <th>{t("profile.personalInfo")}</th>
                                <th>{t("auth.email")}</th>
                                <th>{t("auth.role")}</th>
                                <th>{t("common.status")}</th>
                                <th style={{ textAlign: 'right' }}>{t("common.edit")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Synchronizing Citizen Data...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>No citizens found matching your criteria.</td></tr>
                            ) : users.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px' }}>
                                                {user.fname ? user.fname[0].toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: '#1e293b' }}>{user.fname} {user.lname}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {user._id.substring(user._id.length - 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: '600', color: '#64748b' }}>{user.email}</td>
                                    <td>
                                        <span style={{ fontSize: '12px', fontWeight: '800', color: user.role === 'admin' ? '#3b82f6' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="status_pill active">Active</span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button className="btn_outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEdit(user)}>Edit</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ padding: '16px' }}>
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

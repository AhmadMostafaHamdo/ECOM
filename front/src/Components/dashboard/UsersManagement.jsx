import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiUrl } from "../../api";

const defaultForm = {
    fname: "",
    email: "",
    mobile: "",
    password: "",
    cpassword: "",
    role: "user"
};

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(defaultForm);
    const [editingUserId, setEditingUserId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(apiUrl("/admin/users"), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to load users");
            }

            const payload = await response.json();
            setUsers(Array.isArray(payload) ? payload : []);
        } catch (loadError) {
            setError(loadError.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const isEditing = Boolean(editingUserId);

    const submitLabel = useMemo(() => {
        if (saving) {
            return isEditing ? "Updating..." : "Creating...";
        }
        return isEditing ? "Update User" : "Create User";
    }, [isEditing, saving]);

    const resetForm = () => {
        setForm(defaultForm);
        setEditingUserId("");
    };

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
            email: user.email || "",
            mobile: user.mobile || "",
            password: "",
            cpassword: "",
            role: user.role || "user"
        });
        setError("");
        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const payload = {
                fname: form.fname,
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

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || "Unable to save user");
            }

            setMessage(isEditing ? "User updated successfully" : "User created successfully");
            resetForm();
            await loadUsers();
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user) => {
        const confirmed = window.confirm(`Delete user "${user.fname}"?`);
        if (!confirmed) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch(apiUrl(`/admin/users/${user._id}`), {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.error || "Unable to delete user");
            }

            setMessage("User deleted successfully");
            await loadUsers();
            if (editingUserId === user._id) {
                resetForm();
            }
        } catch (deleteError) {
            setError(deleteError.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin_page">
            <header className="admin_page_header" style={{ marginBottom: '40px' }}>
                <p className="admin_page_kicker">Management</p>
                <h1>User Accounts</h1>
                <p>Manage access levels, account settings, and contact information for all platform users.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '32px', alignItems: 'start' }}>
                {/* User List Table */}
                <section className="admin_table_container">
                    <div style={{ padding: '32px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Active Accounts</h2>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>Found {users.length} registered users</p>
                        </div>
                        <button className="admin_btn secondary" onClick={loadUsers} style={{ padding: '10px 16px' }}>
                            Update List
                        </button>
                    </div>

                    {message ? <div style={{ margin: '24px' }} className="admin_notice success">{message}</div> : null}
                    {error ? <div style={{ margin: '24px' }} className="admin_notice error">{error}</div> : null}

                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin_table">
                            <thead>
                                <tr>
                                    <th>Account Holder</th>
                                    <th>Access level</th>
                                    <th>Contact Points</th>
                                    <th style={{ textAlign: 'right' }}>Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '80px', textAlign: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                                            <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Synchronizing data...</span>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '80px', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No user records available in the system.</td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.1)' }}>
                                                        {user.fname?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontSize: '15px' }}>{user.fname}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '500' }}>{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`admin_badge ${user.role === 'admin' ? 'success' : 'warning'}`}
                                                    style={{ letterSpacing: '0.05em', padding: '6px 14px' }}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>{user.mobile}</div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                    <button type="button" className="admin_btn secondary" onClick={() => handleEdit(user)} disabled={saving} style={{ padding: '8px 16px', fontSize: '12px' }}>
                                                        Configure
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin_btn"
                                                        onClick={() => handleDelete(user)}
                                                        disabled={saving}
                                                        style={{ padding: '8px 16px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}
                                                    >
                                                        Terminate
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Edit/Create Form Card */}
                <section className="admin_form_card" style={{ position: 'sticky', top: 'calc(var(--admin-header-height) + 32px)' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                            {isEditing ? "Modify Account" : "Deploy Account"}
                        </h2>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                            {isEditing ? "Update existing user credentials." : "Provision a new access profile."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="admin_form">
                        <section>
                            <label htmlFor="fname">Legal Full Name</label>
                            <input id="fname" name="fname" value={form.fname} onChange={handleInputChange} required placeholder="e.g. Johnathan Doe" />
                        </section>

                        <section>
                            <label htmlFor="email">Work Email Address</label>
                            <input id="email" type="email" name="email" value={form.email} onChange={handleInputChange} required placeholder="corp@example.com" />
                        </section>

                        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label htmlFor="mobile">Contact Phone</label>
                                <input id="mobile" name="mobile" style={{ width: '100%' }} value={form.mobile} onChange={handleInputChange} required placeholder="+1..." />
                            </div>
                            <div>
                                <label htmlFor="role">Security Role</label>
                                <select id="role" name="role" style={{ width: '100%' }} value={form.role} onChange={handleInputChange}>
                                    <option value="user">Standard User</option>
                                    <option value="admin">System Admin</option>
                                </select>
                            </div>
                        </section>

                        <div style={{ background: 'var(--color-background)', padding: '24px', borderRadius: '18px', border: '1px solid var(--color-border)', marginTop: '8px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="password" style={{ color: 'var(--color-primary)', fontWeight: '800', marginBottom: '8px', display: 'block' }}>
                                    Access Credentials
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleInputChange}
                                    required={!isEditing}
                                    minLength={6}
                                    placeholder={isEditing ? "Keep blank to retain security" : "Min. 6 alphanumeric"}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <section>
                                <label htmlFor="cpassword">Verify Credentials</label>
                                <input
                                    id="cpassword"
                                    type="password"
                                    name="cpassword"
                                    value={form.cpassword}
                                    onChange={handleInputChange}
                                    required={!isEditing || Boolean(form.password)}
                                    minLength={6}
                                    placeholder="Confirm access phrase"
                                    style={{ width: '100%' }}
                                />
                            </section>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                            <button type="submit" className="admin_btn primary" disabled={saving} style={{ width: '100%' }}>
                                {submitLabel}
                            </button>
                            {isEditing ? (
                                <button type="button" className="admin_btn secondary" onClick={resetForm} disabled={saving} style={{ width: '100%' }}>
                                    Abort Modification
                                </button>
                            ) : null}
                        </div>
                    </form>
                </section>
            </div>
        </div >
    );
};

export default UsersManagement;

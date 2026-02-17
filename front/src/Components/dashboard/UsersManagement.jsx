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
            <header className="admin_page_header">
                <p className="admin_page_kicker">Users</p>
                <h1>Users Management</h1>
                <p>Create, update, and remove platform users.</p>
            </header>

            <div className="admin_split_layout">
                <section className="admin_form_card">
                    <h2>{isEditing ? "Edit User" : "Add New User"}</h2>
                    <form onSubmit={handleSubmit} className="admin_form">
                        <label htmlFor="fname">Name</label>
                        <input id="fname" name="fname" value={form.fname} onChange={handleInputChange} required />

                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" name="email" value={form.email} onChange={handleInputChange} required />

                        <label htmlFor="mobile">Mobile</label>
                        <input id="mobile" name="mobile" value={form.mobile} onChange={handleInputChange} required />

                        <label htmlFor="role">Role</label>
                        <select id="role" name="role" value={form.role} onChange={handleInputChange}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>

                        <label htmlFor="password">
                            Password {isEditing ? "(optional, only to change)" : ""}
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleInputChange}
                            required={!isEditing}
                            minLength={6}
                        />

                        <label htmlFor="cpassword">Confirm Password</label>
                        <input
                            id="cpassword"
                            type="password"
                            name="cpassword"
                            value={form.cpassword}
                            onChange={handleInputChange}
                            required={!isEditing || Boolean(form.password)}
                            minLength={6}
                        />

                        <div className="admin_form_actions">
                            <button type="submit" className="admin_btn" disabled={saving}>
                                {submitLabel}
                            </button>
                            {isEditing ? (
                                <button type="button" className="admin_btn secondary" onClick={resetForm} disabled={saving}>
                                    Cancel Edit
                                </button>
                            ) : null}
                        </div>
                    </form>
                </section>

                <section className="admin_form_card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <h2 style={{ marginBottom: 0 }}>User List</h2>
                        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{loading ? "..." : `${users.length} users`}</span>
                    </div>

                    {message ? <p className="admin_notice success">{message}</p> : null}
                    {error ? <p className="admin_notice error">{error}</p> : null}

                    {loading ? (
                        <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading users...</p>
                    ) : (
                        <div className="admin_table_container">
                            <table className="admin_table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Mobile</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id}>
                                            <td style={{ fontWeight: 500 }}>{user.fname}</td>
                                            <td>{user.email}</td>
                                            <td>{user.mobile}</td>
                                            <td>
                                                <span className={`admin_badge ${user.role === 'admin' ? 'info' : 'warning'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button type="button" className="admin_btn secondary sm" onClick={() => handleEdit(user)} disabled={saving}>
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin_btn danger sm"
                                                        onClick={() => handleDelete(user)}
                                                        disabled={saving}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default UsersManagement;

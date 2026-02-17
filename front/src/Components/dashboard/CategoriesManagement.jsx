import React, { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../../api";

const UNCATEGORIZED = "Uncategorized";

const CategoriesManagement = ({ onCategoriesChanged = () => { } }) => {
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [editingId, setEditingId] = useState("");
    const [editName, setEditName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadCategories = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(apiUrl("/admin/categories"), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to load categories");
            }

            const payload = await response.json();
            setCategories(Array.isArray(payload) ? payload : []);
        } catch (loadError) {
            setError(loadError.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const addCategory = async (event) => {
        event.preventDefault();
        if (!categoryName.trim()) {
            setError("Category name is required");
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch(apiUrl("/admin/categories"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ name: categoryName.trim() })
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.error || "Could not add category");
            }

            setCategoryName("");
            setMessage(`Category "${payload.name}" created`);
            await loadCategories();
            await onCategoriesChanged();
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (category) => {
        setEditingId(category._id);
        setEditName(category.name);
        setMessage("");
        setError("");
    };

    const saveEdit = async () => {
        if (!editingId) return;

        setSaving(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch(apiUrl(`/admin/categories/${editingId}`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ name: editName.trim() })
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.error || "Could not update category");
            }

            setMessage(`Category updated. ${payload.renamedProducts || 0} product(s) relinked.`);
            setEditingId("");
            setEditName("");
            await loadCategories();
            await onCategoriesChanged();
        } catch (updateError) {
            setError(updateError.message);
        } finally {
            setSaving(false);
        }
    };

    const deleteCategory = async (category) => {
        const confirmed = window.confirm(`Delete "${category.name}"?`);
        if (!confirmed) return;

        setSaving(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch(apiUrl(`/admin/categories/${category._id}`), {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.error || "Could not delete category");
            }

            setMessage(`Category deleted. ${payload.movedProducts || 0} product(s) moved to Uncategorized.`);
            await loadCategories();
            await onCategoriesChanged();
        } catch (deleteError) {
            setError(deleteError.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin_page">
            <header className="admin_page_header">
                <p className="admin_page_kicker">Categories</p>
                <h1>Categories Management</h1>
                <p>Create, rename, and delete categories dynamically.</p>
            </header>

            <section className="admin_form_card">
                <h2>Add Category</h2>
                <form className="admin_form inline" onSubmit={addCategory}>
                    <input
                        type="text"
                        value={categoryName}
                        onChange={(event) => setCategoryName(event.target.value)}
                        placeholder="Category name"
                        maxLength={50}
                    />
                    <button type="submit" className="admin_btn" disabled={saving}>
                        {saving ? "Saving..." : "Add Category"}
                    </button>
                </form>

                {message ? <p className="admin_notice success">{message}</p> : null}
                {error ? <p className="admin_notice error">{error}</p> : null}
            </section>

            <section className="admin_form_card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h2 style={{ marginBottom: 0 }}>Category List</h2>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{loading ? "..." : `${categories.length} categories`}</span>
                </div>

                {loading ? (
                    <p style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading categories...</p>
                ) : (
                    <div className="admin_table_container">
                        <table className="admin_table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Products</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category._id}>
                                        <td>
                                            {editingId === category._id ? (
                                                <input
                                                    className="table_input"
                                                    value={editName}
                                                    onChange={(event) => setEditName(event.target.value)}
                                                    disabled={saving}
                                                    style={{ marginBottom: 0 }}
                                                />
                                            ) : (
                                                category.name
                                            )}
                                        </td>
                                        <td>
                                            <span className="admin_badge info">{category.productCount}</span>
                                        </td>
                                        <td>
                                            {category.name === UNCATEGORIZED ? (
                                                <span className="admin_badge warning">Protected</span>
                                            ) : editingId === category._id ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button type="button" className="admin_btn sm" onClick={saveEdit} disabled={saving}>
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin_btn secondary sm"
                                                        onClick={() => {
                                                            setEditingId("");
                                                            setEditName("");
                                                        }}
                                                        disabled={saving}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button type="button" className="admin_btn secondary sm" onClick={() => startEdit(category)} disabled={saving}>
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin_btn danger sm"
                                                        onClick={() => deleteCategory(category)}
                                                        disabled={saving}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default CategoriesManagement;

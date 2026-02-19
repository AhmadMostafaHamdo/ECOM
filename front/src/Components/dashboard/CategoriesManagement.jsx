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
            <header className="admin_page_header" style={{ marginBottom: '48px' }}>
                <p className="admin_page_kicker">Structure</p>
                <h1>Categories Hub</h1>
                <p>Organize your products by creating and managing logical categories for easy navigation.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '40px', alignItems: 'start' }}>
                {/* Category List */}
                <section className="admin_table_container">
                    <div style={{ padding: '32px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>System Segments</h2>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>{loading ? "Counting active segments..." : `${categories.length} segments identified`}</p>
                        </div>
                        <button className="admin_btn secondary" onClick={loadCategories} style={{ padding: '10px 16px' }}>Sync</button>
                    </div>

                    {loading ? (
                        <div style={{ padding: '100px', textAlign: 'center' }}>
                            <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                            <p style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Structuring data points...</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="admin_table">
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: '32px' }}>Label</th>
                                        <th>Platform Usage</th>
                                        <th style={{ textAlign: 'right', paddingRight: '32px' }}>Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        <tr key={category._id}>
                                            <td style={{ paddingLeft: '32px' }}>
                                                {editingId === category._id ? (
                                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                        <input
                                                            value={editName}
                                                            onChange={(event) => setEditName(event.target.value)}
                                                            disabled={saving}
                                                            style={{
                                                                margin: 0,
                                                                padding: '10px 16px',
                                                                borderRadius: '12px',
                                                                border: '1px solid var(--color-primary)',
                                                                background: 'white',
                                                                fontWeight: '600',
                                                                minWidth: '220px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button className="admin_btn primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={saveEdit} disabled={saving}>Confirm</button>
                                                        <button className="admin_btn secondary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => { setEditingId(""); setEditName(""); }} disabled={saving}>Dismiss</button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: category.name === UNCATEGORIZED ? 'var(--color-warning)' : 'var(--color-primary)' }}></div>
                                                        <div style={{ fontWeight: '800', color: 'var(--color-text-primary)', fontSize: '15px' }}>{category.name}</div>
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ flex: '1', maxWidth: '120px', height: '8px', background: 'rgba(0,0,0,0.04)', borderRadius: '10px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${Math.min(100, (category.productCount || 0) * 10)}%`, height: '100%', background: 'var(--color-primary)', boxShadow: '0 0 10px var(--color-primary-light)' }}></div>
                                                    </div>
                                                    <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--color-text-primary)' }}>{category.productCount || 0}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Units</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: '32px' }}>
                                                {category.name === UNCATEGORIZED ? (
                                                    <span className="admin_badge warning" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Protected Hub</span>
                                                ) : editingId !== category._id && (
                                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                        <button type="button" className="admin_btn secondary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => startEdit(category)} disabled={saving}>Modify</button>
                                                        <button
                                                            type="button"
                                                            className="admin_btn"
                                                            style={{ padding: '8px 16px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}
                                                            onClick={() => deleteCategory(category)}
                                                            disabled={saving}
                                                        >
                                                            Eliminate
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

                {/* Add Category Sidebar */}
                <section className="admin_form_card" style={{ position: 'sticky', top: 'calc(var(--admin-header-height) + 40px)' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Initialize Hub</h2>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>Create a new structural node for the product catalog.</p>
                    </div>

                    <form className="admin_form" onSubmit={addCategory}>
                        <section>
                            <label>Designation Label</label>
                            <input
                                type="text"
                                value={categoryName}
                                onChange={(event) => setCategoryName(event.target.value)}
                                placeholder="e.g. Next-Gen Computing"
                                maxLength={50}
                                required
                            />
                        </section>

                        <button type="submit" className="admin_btn primary" style={{ width: '100%', marginTop: '24px', height: '48px' }} disabled={saving}>
                            {saving ? "Deploying..." : "Provision Segment"}
                        </button>
                    </form>

                    {message && <div style={{ marginTop: '24px' }} className="admin_notice success">{message}</div>}
                    {error && <div style={{ marginTop: '24px' }} className="admin_notice error">{error}</div>}
                </section>
            </div>
        </div>
    );
};

export default CategoriesManagement;

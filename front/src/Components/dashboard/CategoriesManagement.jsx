import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiUrl } from "../../api";

const UNCATEGORIZED = "Uncategorized";

const CategoriesManagement = ({ onCategoriesChanged = () => { } }) => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [editingId, setEditingId] = useState("");
    const [editName, setEditName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");

    const loadCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(apiUrl("/admin/categories"), {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            if (response.ok) {
                const payload = await response.json();
                setCategories(Array.isArray(payload) ? payload : []);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadCategories(); }, [loadCategories]);

    const addCategory = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch(apiUrl("/admin/categories"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: categoryName.trim() })
            });
            if (response.ok) {
                setCategoryName("");
                setShowForm(false);
                loadCategories();
                onCategoriesChanged();
            }
        } catch (err) { console.error(err); } finally { setSaving(false); }
    };

    const deleteCategory = async (category) => {
        if (!window.confirm(`Delete ${category.name}?`)) return;
        setSaving(true);
        try {
            const response = await fetch(apiUrl(`/admin/categories/${category._id}`), {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            if (response.ok) {
                loadCategories();
                onCategoriesChanged();
            }
        } catch (err) { console.error(err); } finally { setSaving(false); }
    };

    return (
        <div className="admin_page" style={{ background: 'transparent' }}>
            <header className="admin_page_header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{t('admin.manageCategories')}</h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>{t('admin.welcomeMessage')}</p>
                </div>
                {!showForm && (
                    <button className="btn_primary" onClick={() => setShowForm(true)}>{t('admin.createCategory')}</button>
                )}
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr 400px' : '1fr', gap: '32px', alignItems: 'start' }}>
                <section className="admin_table_wrapper">
                    <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>
                            Segments <span style={{ color: '#94a3b8', fontSize: '13px', marginLeft: '8px', fontWeight: '500' }}>{categories.length} Total</span>
                        </div>
                        <div className="admin_search_bar" style={{ width: '280px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" placeholder="Filter segments..." />
                        </div>
                    </div>

                    <table className="admin_table">
                        <thead>
                            <tr>
                                <th>{t('auth.firstName')}</th>
                                <th>{t('admin.totalProducts')}</th>
                                <th>{t('common.status')}</th>
                                <th style={{ textAlign: 'right' }}>{t('common.results')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '80px' }}>Mapping Sectors...</td></tr>
                            ) : categories.map(cat => (
                                <tr key={cat._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#3b82f6' }}></div>
                                            <div style={{ fontWeight: 800, color: '#1e293b' }}>{cat.name}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: '1', maxWidth: '80px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${Math.min(100, (cat.productCount || 0) * 10)}%`, height: '100%', background: '#3b82f6' }}></div>
                                            </div>
                                            <span style={{ fontWeight: 700, color: '#64748b', fontSize: '13px' }}>{cat.productCount || 0}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status_pill active">Operational</span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button className="btn_outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => { setEditingId(cat._id); setEditName(cat.name); setShowForm(true); }}>Edit</button>
                                            {cat.name !== UNCATEGORIZED && (
                                                <button className="btn_outline" style={{ padding: '6px 12px', fontSize: '12px', color: '#ef4444' }} onClick={() => deleteCategory(cat)}>Delete</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {showForm && (
                    <section className="admin_card" style={{ position: 'sticky', top: '104px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                                {editingId ? t('admin.editCategory') : t('admin.createCategory')}
                            </h2>
                            <button onClick={() => { setShowForm(false); setEditingId(""); setCategoryName(""); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                        </div>
                        <form className="admin_form" onSubmit={editingId ? (e) => { e.preventDefault(); /* implement update logic if needed or use same as add */ } : addCategory}>
                            <div>
                                <label>Segment Identifier</label>
                                <input
                                    type="text"
                                    value={editingId ? editName : categoryName}
                                    onChange={(e) => editingId ? setEditName(e.target.value) : setCategoryName(e.target.value)}
                                    required
                                    placeholder="e.g. Next-Gen Tech"
                                />
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                <button type="submit" className="btn_primary" style={{ width: '100%' }} disabled={saving}>
                                    {saving ? t('common.loading') : editingId ? t('admin.editCategory') : t('admin.createCategory')}
                                </button>
                            </div>
                        </form>
                    </section>
                )}
            </div>
        </div>
    );
};

export default CategoriesManagement;

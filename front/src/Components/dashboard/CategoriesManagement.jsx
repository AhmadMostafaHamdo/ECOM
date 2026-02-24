import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiUrl } from "../../api";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table";

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
           

            <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr 400px' : '1fr', gap: '32px', alignItems: 'start' }}>
                <section className="dashboard-section">
                    <div className="dashboard-header">
                        <div className="dashboard-title">
                            Segments <span className="user-id">{categories.length} Total</span>
                        </div>
                        <div className="search-container">
                            <div className="search-icon-wrapper">
                                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Filter segments..." 
                                className="search-input"
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('auth.firstName')}</TableHead>
                                <TableHead>{t('admin.totalProducts')}</TableHead>
                                <TableHead>{t('common.status')}</TableHead>
                                <TableHead className="text-right">{t('common.results')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan="4" className="loading-state">
                                        <div className="loading-spinner"></div>
                                        Mapping Sectors...
                                    </TableCell>
                                </TableRow>
                            ) : categories.map(cat => (
                                <TableRow key={cat._id}>
                                    <TableCell>
                                        <div className="product-info">
                                            <div className="category-badge"></div>
                                            <div className="product-name">{cat.name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="product-info">
                                            <div className="flex-1 max-w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="progress-bar-fill"
                                                    style={{ width: `${Math.min(100, (cat.productCount || 0) * 10)}%` }}
                                                ></div>
                                            </div>
                                            <span className="product-category">{cat.productCount || 0}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="status-badge active">
                                            Operational
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-secondary" 
                                                onClick={() => { setEditingId(cat._id); setEditName(cat.name); setShowForm(true); }}
                                            >
                                                Edit
                                            </button>
                                            {cat.name !== UNCATEGORIZED && (
                                                <button 
                                                    className="btn-secondary" 
                                                    onClick={() => deleteCategory(cat)}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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

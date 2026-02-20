import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiUrl } from "../../api";
import Pagination from "../common/Pagination";

const CATEGORY_ALL = "All Categories";

const emptyForm = {
    shortTitle: "",
    longTitle: "",
    description: "",
    mrp: "",
    cost: "",
    priceDiscount: "",
    offerText: "",
    tagline: "",
    url: "",
    detailUrl: "",
    category: ""
};

const ProductsManagement = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    });

    const isEditing = Boolean(editingId);

    const loadCategories = useCallback(async () => {
        try {
            const response = await fetch(apiUrl("/admin/categories"), {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            if (response.ok) {
                const payload = await response.json();
                const list = Array.isArray(payload) ? payload.map(item => item.name) : [];
                setCategories(list);
            }
        } catch (err) { console.error(err); }
    }, []);

    const loadProducts = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page,
                limit: 10,
                search: searchTerm
            });
            if (selectedCategory !== CATEGORY_ALL) {
                queryParams.set("category", selectedCategory);
            }
            const response = await fetch(apiUrl(`/admin/products?${queryParams.toString()}`), {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            if (response.ok) {
                const resData = await response.json();
                setProducts(resData.data || []);
                setPagination(resData.pagination);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, [selectedCategory, searchTerm]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            loadProducts(1);
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [loadProducts]);

    const handlePageChange = (newPage) => {
        loadProducts(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEdit = (product) => {
        setEditingId(product._id);
        setForm({
            shortTitle: product?.title?.shortTitle || "",
            longTitle: product?.title?.longTitle || "",
            description: product?.description || "",
            mrp: product?.price?.mrp ?? "",
            cost: product?.price?.cost ?? "",
            priceDiscount: product?.price?.discount || "",
            offerText: product?.discount || "",
            tagline: product?.tagline || "",
            url: product?.url || "",
            detailUrl: product?.detailUrl || "",
            category: product?.category || ""
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId("");
        setShowForm(false);
    };

    const updateField = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, mrp: Number(form.mrp), cost: Number(form.cost) };
            const response = await fetch(
                isEditing ? apiUrl(`/admin/products/${editingId}`) : apiUrl("/admin/products"),
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload)
                }
            );
            if (response.ok) {
                resetForm();
                loadProducts(pagination.currentPage);
            }
        } catch (err) { console.error(err); } finally { setSaving(false); }
    };

    return (
        <div className="admin_page" style={{ background: 'transparent' }}>
            <header className="admin_page_header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{t('admin.manageProducts')}</h1>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>{t('admin.welcomeMessage')}</p>
                </div>
                {!showForm && (
                    <button className="btn_primary" onClick={() => setShowForm(true)}>{t('admin.createProduct')}</button>
                )}
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr 420px' : '1fr', gap: '32px', alignItems: 'start' }}>
                <section className="admin_table_wrapper">
                    <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="btn_outline"
                                style={{ padding: '6px 12px', fontSize: '13px' }}
                            >
                                <option value={CATEGORY_ALL}>{t('navigation.allCategories')}</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="admin_search_bar" style={{ width: '280px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <table className="admin_table">
                        <thead>
                            <tr>
                                <th>{t('productCreator.productName')}</th>
                                <th>{t('navigation.categories')}</th>
                                <th>{t('product.price')}</th>
                                <th>{t('common.status')}</th>
                                <th style={{ textAlign: 'right' }}>{t('common.results')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && products.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '100px' }}>Auditing Inventory...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '100px' }}>No products found.</td></tr>
                            ) : products.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'white', border: '1px solid #f1f5f9', overflow: 'hidden', padding: '4px' }}>
                                                <img src={product.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            </div>
                                            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '14px' }}>{product?.title?.shortTitle}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>{product.category}</span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 900, color: '#1e293b' }}>${product?.price?.cost}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through' }}>${product?.price?.mrp}</div>
                                    </td>
                                    <td>
                                        <span className="status_pill active">{t('common.approved')}</span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button className="btn_outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEdit(product)}>{t('common.edit')}</button>
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
                    <section className="admin_card" style={{ position: 'sticky', top: '104px', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                                {isEditing ? t('admin.editProduct') : t('admin.createProduct')}
                            </h2>
                            <button onClick={resetForm} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                        </div>
                        <form className="admin_form" onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label>Mark Name</label>
                                    <input type="text" name="shortTitle" value={form.shortTitle} onChange={updateField} required />
                                </div>
                                <div>
                                    <label>Sector</label>
                                    <select name="category" value={form.category} onChange={updateField} required>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label>Legal Designation</label>
                                <input type="text" name="longTitle" value={form.longTitle} onChange={updateField} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label>Market Price ($)</label>
                                    <input type="number" name="cost" value={form.cost} onChange={updateField} required />
                                </div>
                                <div>
                                    <label>Base MSRP ($)</label>
                                    <input type="number" name="mrp" value={form.mrp} onChange={updateField} required />
                                </div>
                            </div>
                            <div>
                                <label>Product Resource URL</label>
                                <input type="text" name="url" value={form.url} onChange={updateField} required />
                            </div>
                            <div>
                                <label>Description</label>
                                <textarea name="description" value={form.description} onChange={updateField} rows="3" style={{ resize: 'none' }} />
                            </div>
                            <div style={{ marginTop: '16px' }}>
                                <button type="submit" className="btn_primary" style={{ width: '100%' }} disabled={saving}>
                                    {saving ? t('common.loading') : isEditing ? t('common.save') : t('admin.createProduct')}
                                </button>
                            </div>
                        </form>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProductsManagement;

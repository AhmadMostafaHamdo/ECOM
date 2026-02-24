import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiUrl } from "../../api";
import Pagination from "../common/Pagination";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table";

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
                <section className="dashboard-section">
                    <div className="dashboard-header">
                        <div className="dashboard-controls">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="filter-btn"
                            >
                                <option value={CATEGORY_ALL}>{t('navigation.allCategories')}</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="search-container">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                    style={{ paddingLeft: '40px', width: '256px' }}
                                />
                            </div>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('productCreator.productName')}</TableHead>
                                <TableHead>{t('navigation.categories')}</TableHead>
                                <TableHead>{t('product.price')}</TableHead>
                                <TableHead>{t('common.status')}</TableHead>
                                <TableHead className="text-right">{t('common.results')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan="5" className="loading-state">
                                        <div className="loading-spinner"></div>
                                        Auditing Inventory...
                                    </TableCell>
                                </TableRow>
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan="5" className="empty-state">
                                        <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            ) : products.map(product => (
                                <TableRow key={product._id}>
                                    <TableCell>
                                        <div className="product-info">
                                            <div className="product-image">
                                                <img src={product.url} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="product-details">
                                                <div className="product-name">{product?.title?.shortTitle}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="category-badge">{product.category}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="product-price">${product?.price?.cost}</div>
                                        <div className="product-category line-through">${product?.price?.mrp}</div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="status-badge active">
                                            {t('common.approved')}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-secondary" 
                                                onClick={() => handleEdit(product)}
                                            >
                                                Edit
                                            </button>
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

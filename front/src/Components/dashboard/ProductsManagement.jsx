import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiUrl } from "../../api";

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
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const isEditing = Boolean(editingId);

    const loadCategories = useCallback(async () => {
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
        const list = Array.isArray(payload) ? payload.map((item) => item.name) : [];
        setCategories(list);
        if (!form.category && list.length) {
            setForm((prev) => ({
                ...prev,
                category: list[0]
            }));
        }
    }, [form.category]);

    const loadProducts = useCallback(async (category = selectedCategory) => {
        setLoading(true);
        setError("");
        try {
            const query = category !== CATEGORY_ALL ? `?category=${encodeURIComponent(category)}` : "";
            const response = await fetch(apiUrl(`/admin/products${query}`), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to load products");
            }

            const payload = await response.json();
            setProducts(Array.isArray(payload) ? payload : []);
        } catch (loadError) {
            setError(loadError.message);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory]);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                await loadCategories();
                await loadProducts(selectedCategory);
            } catch (bootstrapError) {
                setError(bootstrapError.message);
                setLoading(false);
            }
        };

        bootstrap();
    }, [loadCategories, loadProducts, selectedCategory]);

    const resetForm = () => {
        setForm({
            ...emptyForm,
            category: categories[0] || ""
        });
        setEditingId("");
    };

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const submitLabel = useMemo(() => {
        if (saving) {
            return isEditing ? "Updating..." : "Creating...";
        }
        return isEditing ? "Update Product" : "Create Product";
    }, [isEditing, saving]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const payload = {
                ...form,
                mrp: Number(form.mrp),
                cost: Number(form.cost)
            };

            const response = await fetch(
                isEditing ? apiUrl(`/admin/products/${editingId}`) : apiUrl("/admin/products"),
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
                throw new Error(data.error || "Unable to save product");
            }

            setMessage(isEditing ? "Product updated successfully" : "Product created successfully");
            resetForm();
            await loadProducts(selectedCategory);
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSaving(false);
        }
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
            category: product?.category || categories[0] || ""
        });
    };

    const handleDelete = async (product) => {
        const confirmed = window.confirm(`Delete "${product?.title?.shortTitle}"?`);
        if (!confirmed) return;

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(apiUrl(`/admin/products/${product._id}`), {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.error || "Unable to delete product");
            }

            setMessage("Product deleted successfully");
            await loadProducts(selectedCategory);
            if (editingId === product._id) {
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
                <p className="admin_page_kicker">Catalog</p>
                <h1>Products Inventory</h1>
                <p>Manage your product listings, pricing, and availability. Use filters to narrow down your search.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: '32px', alignItems: 'start' }}>
                {/* Product List Table */}
                <section className="admin_table_container">
                    <div style={{ padding: '32px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Warehouse Assets</h2>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>Found {products.length} units in store</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Sort by Category:</span>
                            <select
                                style={{
                                    minWidth: '200px',
                                    padding: '10px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-background)',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}
                                value={selectedCategory}
                                onChange={(event) => {
                                    const nextCategory = event.target.value;
                                    setSelectedCategory(nextCategory);
                                    loadProducts(nextCategory);
                                }}
                            >
                                <option value={CATEGORY_ALL}>{CATEGORY_ALL}</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {message ? <div style={{ margin: '24px' }} className="admin_notice success">{message}</div> : null}
                    {error ? <div style={{ margin: '24px' }} className="admin_notice error">{error}</div> : null}

                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin_table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '32px' }}>Product Profile</th>
                                    <th>Inventory Status</th>
                                    <th>Valuation</th>
                                    <th style={{ textAlign: 'right', paddingRight: '32px' }}>Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '100px', textAlign: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                                            <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Archiving assets...</span>
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '100px', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No assets found in the selected sector.</td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product._id}>
                                            <td style={{ paddingLeft: '32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        borderRadius: '14px',
                                                        background: 'white',
                                                        border: '1px solid var(--color-border)',
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: 'var(--shadow-sm)'
                                                    }}>
                                                        {product.url ? <img src={product.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} /> : <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Empty</span>}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontSize: '15px' }}>{product?.title?.shortTitle}</div>
                                                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                                            <span className="admin_badge success" style={{ fontSize: '10px', padding: '4px 10px' }}>{product.category}</span>
                                                            {product.discount && <span className="admin_badge warning" style={{ fontSize: '10px', padding: '4px 10px' }}>{product.discount}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>Available</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Active Listing</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '900', color: 'var(--color-text-primary)', fontSize: '16px' }}>${product?.price?.cost}</div>
                                                {product?.price?.mrp > product?.price?.cost && (
                                                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textDecoration: 'line-through', fontWeight: '500' }}>${product?.price?.mrp}</div>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: '32px' }}>
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                    <button type="button" className="admin_btn secondary" onClick={() => handleEdit(product)} disabled={saving} style={{ padding: '8px 16px', fontSize: '12px' }}>
                                                        Configure
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin_btn"
                                                        onClick={() => handleDelete(product)}
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
                    <div style={{ maxHeight: 'calc(100vh - var(--admin-header-height) - 100px)', overflowY: 'auto' }} className="admin_sidebar_nav">
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--color-text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                                {isEditing ? "Modify Asset" : "Deploy Asset"}
                            </h2>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                                {isEditing ? "Sync configuration with global catalog." : "Bootstrap a new SKU entrance."}
                            </p>
                        </div>

                        <form className="admin_form" onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                                <section>
                                    <label htmlFor="shortTitle">Marketing Name</label>
                                    <input id="shortTitle" name="shortTitle" value={form.shortTitle} onChange={updateField} required placeholder="iPhone 15 Pro" />
                                </section>
                                <section>
                                    <label htmlFor="category">Sector</label>
                                    <select id="category" name="category" value={form.category} onChange={updateField} required>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </section>
                            </div>

                            <section>
                                <label htmlFor="longTitle">Legal Designation</label>
                                <input id="longTitle" name="longTitle" value={form.longTitle} onChange={updateField} required placeholder="Apple iPhone 15 Pro Max (256GB)" />
                            </section>

                            <section>
                                <label htmlFor="description">Executive Summary</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={form.description}
                                    onChange={updateField}
                                    rows="4"
                                    style={{ width: '100%', resize: 'none' }}
                                    placeholder="Enter high-fidelity description..."
                                ></textarea>
                            </section>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <section>
                                    <label htmlFor="cost">Market Valuation ($)</label>
                                    <input id="cost" name="cost" type="number" value={form.cost} onChange={updateField} required placeholder="99.00" />
                                </section>
                                <section>
                                    <label htmlFor="mrp">Base MSRP ($)</label>
                                    <input id="mrp" name="mrp" type="number" value={form.mrp} onChange={updateField} required placeholder="120.00" />
                                </section>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <section>
                                    <label htmlFor="priceDiscount">Discount Logic</label>
                                    <input id="priceDiscount" name="priceDiscount" value={form.priceDiscount} onChange={updateField} placeholder="15% OFF" />
                                </section>
                                <section>
                                    <label htmlFor="offerText">Product Badge</label>
                                    <input id="offerText" name="offerText" value={form.offerText} onChange={updateField} placeholder="Premium" />
                                </section>
                            </div>

                            <section>
                                <label htmlFor="url">Resource Identifier (URL)</label>
                                <input id="url" name="url" value={form.url} onChange={updateField} required placeholder="https://cdn.assets.com/img.png" />
                            </section>

                            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button type="submit" className="admin_btn primary" disabled={saving} style={{ width: '100%', height: '50px' }}>
                                    {submitLabel}
                                </button>
                                {isEditing ? (
                                    <button type="button" className="admin_btn secondary" onClick={resetForm} disabled={saving} style={{ width: '100%' }}>
                                        Abort Operations
                                    </button>
                                ) : null}
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProductsManagement;

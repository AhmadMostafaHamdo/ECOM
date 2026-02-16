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
            <header className="admin_page_header">
                <p className="admin_page_kicker">Products</p>
                <h1>Products Management</h1>
                <p>Create, edit, filter, and remove products from catalog.</p>
            </header>

            <div className="admin_split_layout">
                <section className="admin_form_card">
                    <h2>{isEditing ? "Edit Product" : "Add Product"}</h2>
                    <form className="admin_form" onSubmit={handleSubmit}>
                        <label htmlFor="shortTitle">Product Name</label>
                        <input id="shortTitle" name="shortTitle" value={form.shortTitle} onChange={updateField} required />

                        <label htmlFor="longTitle">Full Title</label>
                        <input id="longTitle" name="longTitle" value={form.longTitle} onChange={updateField} required />

                        <label htmlFor="category">Category</label>
                        <select id="category" name="category" value={form.category} onChange={updateField} required>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="description">Description</label>
                        <input id="description" name="description" value={form.description} onChange={updateField} />

                        <label htmlFor="mrp">MRP</label>
                        <input id="mrp" name="mrp" type="number" value={form.mrp} onChange={updateField} required />

                        <label htmlFor="cost">Cost</label>
                        <input id="cost" name="cost" type="number" value={form.cost} onChange={updateField} required />

                        <label htmlFor="priceDiscount">Price Discount Text</label>
                        <input id="priceDiscount" name="priceDiscount" value={form.priceDiscount} onChange={updateField} />

                        <label htmlFor="offerText">Offer Badge</label>
                        <input id="offerText" name="offerText" value={form.offerText} onChange={updateField} />

                        <label htmlFor="tagline">Tagline</label>
                        <input id="tagline" name="tagline" value={form.tagline} onChange={updateField} />

                        <label htmlFor="url">Primary Image URL</label>
                        <input id="url" name="url" value={form.url} onChange={updateField} required />

                        <label htmlFor="detailUrl">Detail Image URL</label>
                        <input id="detailUrl" name="detailUrl" value={form.detailUrl} onChange={updateField} />

                        <div className="admin_form_actions">
                            <button type="submit" disabled={saving}>
                                {submitLabel}
                            </button>
                            {isEditing ? (
                                <button type="button" className="secondary_btn" onClick={resetForm} disabled={saving}>
                                    Cancel Edit
                                </button>
                            ) : null}
                        </div>
                    </form>
                </section>

                <section className="admin_table_card">
                    <div className="admin_table_header">
                        <h2>Product List</h2>
                        <span>{loading ? "..." : `${products.length} products`}</span>
                    </div>

                    <div className="admin_form inline">
                        <select
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

                    {message ? <p className="admin_notice success">{message}</p> : null}
                    {error ? <p className="admin_notice error">{error}</p> : null}

                    {loading ? (
                        <p className="admin_loading">Loading products...</p>
                    ) : (
                        <div className="admin_table_wrap">
                            <table className="admin_table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Created By</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product._id}>
                                            <td>{product?.title?.shortTitle}</td>
                                            <td>{product.category}</td>
                                            <td>Rs. {product?.price?.cost}</td>
                                            <td>{product?.createdBy?.fname || "-"}</td>
                                            <td>
                                                <div className="table_actions">
                                                    <button type="button" onClick={() => handleEdit(product)} disabled={saving}>
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="danger_btn"
                                                        onClick={() => handleDelete(product)}
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

export default ProductsManagement;


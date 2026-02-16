import React, { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { apiUrl } from "../../api";
import "./category-dashboard.css";

const UNCATEGORIZED = "Uncategorized";

const CategoryDashboard = ({ onCategoriesChanged = () => {} }) => {
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadCategories = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(apiUrl("/categories"), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
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

    const handleAddCategory = async (event) => {
        event.preventDefault();

        const nextName = categoryName.trim();
        if (!nextName) {
            setError("Enter a category name");
            return;
        }

        setSubmitting(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(apiUrl("/categories"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: nextName })
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
            setSubmitting(false);
        }
    };

    const handleDeleteCategory = async (category) => {
        const confirmed = window.confirm(`Delete "${category.name}"?`);
        if (!confirmed) {
            return;
        }

        setSubmitting(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(apiUrl(`/categories/${category._id}`), {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.error || "Could not delete category");
            }

            setMessage(`Deleted "${category.name}". Reassigned ${payload.movedProducts || 0} product(s).`);
            await loadCategories();
            await onCategoriesChanged();
        } catch (deleteError) {
            setError(deleteError.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="category_dashboard_page">
            <div className="category_dashboard_header">
                <div>
                    <p className="dashboard_kicker">Dashboard</p>
                    <h1>Category Manager</h1>
                    <p>Add or remove product categories dynamically.</p>
                </div>
                <NavLink to="/" className="dashboard_back_btn">
                    Back to Store
                </NavLink>
            </div>

            <div className="category_dashboard_card">
                <form className="category_form" onSubmit={handleAddCategory}>
                    <label htmlFor="category-name">New Category</label>
                    <div className="category_form_row">
                        <input
                            id="category-name"
                            type="text"
                            value={categoryName}
                            onChange={(event) => setCategoryName(event.target.value)}
                            placeholder="e.g. Gaming"
                            maxLength={50}
                        />
                        <button type="submit" disabled={submitting}>
                            {submitting ? "Saving..." : "Add Category"}
                        </button>
                    </div>
                </form>

                {message ? <p className="category_notice success">{message}</p> : null}
                {error ? <p className="category_notice error">{error}</p> : null}

                <div className="category_list_wrap">
                    <div className="category_list_head">
                        <h2>Available Categories</h2>
                        <span>{categories.length} total</span>
                    </div>

                    {loading ? (
                        <p className="category_loading">Loading categories...</p>
                    ) : (
                        <ul className="category_list">
                            {categories.map((category) => (
                                <li key={category._id} className="category_item">
                                    <div>
                                        <h3>{category.name}</h3>
                                        <p>{category.productCount} product(s)</p>
                                    </div>
                                    {category.name === UNCATEGORIZED ? (
                                        <span className="protected_badge">Protected</span>
                                    ) : (
                                        <button
                                            type="button"
                                            className="delete_btn"
                                            onClick={() => handleDeleteCategory(category)}
                                            disabled={submitting}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CategoryDashboard;

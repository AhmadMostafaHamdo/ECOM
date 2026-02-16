import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { apiUrl } from "../../api";
import "./create-product.css";

const CATEGORY_ALL = "All Categories";

const initialForm = {
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

const CreateProduct = () => {
    const history = useHistory();
    const [form, setForm] = useState(initialForm);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const profileRes = await fetch(apiUrl("/profile"), {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });

                if (!profileRes.ok) {
                    history.push("/login");
                    return;
                }

                const categoryRes = await fetch(apiUrl("/getcategories"), {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (categoryRes.ok) {
                    const payload = await categoryRes.json();
                    const list = Array.isArray(payload)
                        ? payload.filter((item) => item !== CATEGORY_ALL)
                        : [];
                    setCategories(list);
                    setForm((prev) => ({
                        ...prev,
                        category: list[0] || ""
                    }));
                }
            } catch (loadError) {
                setError(loadError.message);
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, [history]);

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const submitProduct = async (event) => {
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

            const response = await fetch(apiUrl("/products"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || "Failed to create product");
            }

            setMessage("Product created successfully. Redirecting to profile...");
            setTimeout(() => history.push("/profile"), 900);
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section className="create_product_page">
                <div className="create_product_card">
                    <h2>Loading product builder...</h2>
                </div>
            </section>
        );
    }

    return (
        <section className="create_product_page">
            <div className="create_product_card">
                <header className="create_product_header">
                    <p className="kicker">Product Creator</p>
                    <h1>Add New Product</h1>
                    <p>Create a product and publish it to the storefront.</p>
                </header>

                <form className="create_product_form" onSubmit={submitProduct}>
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
                    <textarea id="description" name="description" value={form.description} onChange={updateField} rows={4} />

                    <div className="split_fields">
                        <div>
                            <label htmlFor="mrp">MRP</label>
                            <input id="mrp" name="mrp" type="number" value={form.mrp} onChange={updateField} required />
                        </div>
                        <div>
                            <label htmlFor="cost">Selling Price</label>
                            <input id="cost" name="cost" type="number" value={form.cost} onChange={updateField} required />
                        </div>
                    </div>

                    <div className="split_fields">
                        <div>
                            <label htmlFor="priceDiscount">Price Discount Text</label>
                            <input id="priceDiscount" name="priceDiscount" value={form.priceDiscount} onChange={updateField} />
                        </div>
                        <div>
                            <label htmlFor="offerText">Offer Badge</label>
                            <input id="offerText" name="offerText" value={form.offerText} onChange={updateField} />
                        </div>
                    </div>

                    <label htmlFor="tagline">Tagline</label>
                    <input id="tagline" name="tagline" value={form.tagline} onChange={updateField} />

                    <label htmlFor="url">Primary Image URL</label>
                    <input id="url" name="url" value={form.url} onChange={updateField} required />

                    <label htmlFor="detailUrl">Detail Image URL</label>
                    <input id="detailUrl" name="detailUrl" value={form.detailUrl} onChange={updateField} />

                    <button type="submit" disabled={saving}>
                        {saving ? "Publishing..." : "Publish Product"}
                    </button>
                </form>

                {message ? <p className="create_notice success">{message}</p> : null}
                {error ? <p className="create_notice error">{error}</p> : null}
            </div>
        </section>
    );
};

export default CreateProduct;


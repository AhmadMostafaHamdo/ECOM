import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiUrl } from "../../api";
import ImageUpload from "./ImageUpload";
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

const CreateProduct = ({ mode = "create" }) => {
    const { t } = useTranslation();
    const history = useHistory();
    const { id: editId } = useParams();
    const isEdit = mode === "edit" && Boolean(editId);
    const [form, setForm] = useState(initialForm);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [images, setImages] = useState([]);

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

                let categoryList = [];
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
                    categoryList = list;
                    setCategories(list);
                    if (!isEdit) {
                        setForm((prev) => ({
                            ...prev,
                            category: list[0] || ""
                        }));
                    }
                }

                if (isEdit && editId) {
                    const productRes = await fetch(apiUrl(`/products/${editId}`), {
                        method: "GET",
                        credentials: "include"
                    });

                    const productPayload = await productRes.json().catch(() => ({}));

                    if (!productRes.ok) {
                        throw new Error(productPayload.error || "Failed to load product");
                    }

                    if (productPayload?.category && !categoryList.includes(productPayload.category)) {
                        setCategories((prev) => [...prev, productPayload.category]);
                    }

                    setForm({
                        shortTitle: productPayload?.title?.shortTitle || "",
                        longTitle: productPayload?.title?.longTitle || "",
                        description: productPayload?.description || "",
                        mrp: productPayload?.price?.mrp ?? "",
                        cost: productPayload?.price?.cost ?? "",
                        priceDiscount: productPayload?.price?.discount || "",
                        offerText: productPayload?.discount || "",
                        tagline: productPayload?.tagline || "",
                        url: productPayload?.url || "",
                        detailUrl: productPayload?.detailUrl || "",
                        category: productPayload?.category || categoryList[0] || ""
                    });

                    const normalizedImages = Array.isArray(productPayload?.images)
                        ? productPayload.images
                            .filter(Boolean)
                            .map((url, index) => ({
                                url,
                                name: `Image ${index + 1}`,
                                isUrl: true
                            }))
                        : [];
                    setImages(normalizedImages);
                }
            } catch (loadError) {
                setError(loadError.message);
                if (isEdit) {
                    setTimeout(() => history.push("/profile"), 800);
                }
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, [history, isEdit, editId]);

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
            // Process images - extract URLs from image objects
            const processedImages = images.map(image => image.url);

            const payload = {
                ...form,
                mrp: Number(form.mrp),
                cost: Number(form.cost),
                images: processedImages,
                // Set primary URL if no URL provided but images exist
                url: form.url || (processedImages.length > 0 ? processedImages[0] : ""),
                detailUrl: form.detailUrl || (processedImages.length > 1 ? processedImages[1] : processedImages[0] || "")
            };

            const response = await fetch(apiUrl(isEdit ? `/products/${editId}` : "/products"), {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || (isEdit ? "Failed to update product" : "Failed to create product"));
            }

            setMessage(isEdit ? "Product updated successfully" : t('productCreator.success'));
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
                    <h2>{t('productCreator.loading')}</h2>
                </div>
            </section>
        );
    }

    return (
        <section className="create_product_page">
            <div className="create_product_card">
                <header className="create_product_header">
                    <p className="kicker">{isEdit ? "Edit your product" : t('productCreator.kicker')}</p>
                    <h1>{isEdit ? "Update product" : t('productCreator.title')}</h1>
                    <p>{isEdit ? "Make changes and save to keep your listing fresh." : t('productCreator.subtitle')}</p>
                </header>

                <form className="create_product_form" onSubmit={submitProduct}>
                    <label htmlFor="shortTitle">{t('productCreator.productName')}</label>
                    <input id="shortTitle" name="shortTitle" value={form.shortTitle} onChange={updateField} required />

                    <label htmlFor="longTitle">{t('productCreator.fullTitle')}</label>
                    <input id="longTitle" name="longTitle" value={form.longTitle} onChange={updateField} required />

                    <label htmlFor="category">{t('navigation.categories')}</label>
                    <select id="category" name="category" value={form.category} onChange={updateField} required>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="description">{t('product.description')}</label>
                    <textarea id="description" name="description" value={form.description} onChange={updateField} rows={4} />

                    <div className="split_fields">
                        <div>
                            <label htmlFor="mrp">{t('productCreator.mrp')}</label>
                            <input id="mrp" name="mrp" type="number" value={form.mrp} onChange={updateField} required />
                        </div>
                        <div>
                            <label htmlFor="cost">{t('productCreator.sellingPrice')}</label>
                            <input id="cost" name="cost" type="number" value={form.cost} onChange={updateField} required />
                        </div>
                    </div>

                    <div className="split_fields">
                        <div>
                            <label htmlFor="priceDiscount">{t('productCreator.discountText')}</label>
                            <input id="priceDiscount" name="priceDiscount" value={form.priceDiscount} onChange={updateField} />
                        </div>
                        <div>
                            <label htmlFor="offerText">{t('productCreator.offerBadge')}</label>
                            <input id="offerText" name="offerText" value={form.offerText} onChange={updateField} />
                        </div>
                    </div>

                    <label htmlFor="tagline">Tagline</label>
                    <input id="tagline" name="tagline" value={form.tagline} onChange={updateField} />

                    <ImageUpload
                        images={images}
                        onChange={setImages}
                        maxImages={5}
                    />

                    <div className="split_fields">
                        <div>
                            <label htmlFor="url">{t('productCreator.primaryImage')}</label>
                            <input id="url" name="url" value={form.url} onChange={updateField} placeholder="Auto-filled from first image" />
                        </div>
                        <div>
                            <label htmlFor="detailUrl">{t('productCreator.detailImage')}</label>
                            <input id="detailUrl" name="detailUrl" value={form.detailUrl} onChange={updateField} placeholder="Auto-filled from images" />
                        </div>
                    </div>

                    <button type="submit" disabled={saving}>
                        {saving
                            ? (isEdit ? "Saving..." : t('productCreator.publishing'))
                            : (isEdit ? "Save changes" : t('productCreator.publish'))}
                    </button>
                </form>

                {message ? <p className="create_notice success">{message}</p> : null}
                {error ? <p className="create_notice error">{error}</p> : null}
            </div>
        </section>
    );
};

export default CreateProduct;


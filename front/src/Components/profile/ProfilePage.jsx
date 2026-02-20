import React, { useContext, useEffect, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiUrl } from "../../api";
import { Logincontext } from "../context/Contextprovider";
import "../../styles/design-system-proposal.css";

const ProfilePage = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const { account, setAccount } = useContext(Logincontext);
    const [form, setForm] = useState({
        fname: "",
        email: "",
        mobile: ""
    });
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profileResponse = await fetch(apiUrl("/profile"), {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });

                if (!profileResponse.ok) {
                    history.push("/login");
                    return;
                }

                const profileData = await profileResponse.json();
                setAccount(profileData);
                setForm({
                    fname: profileData.fname || "",
                    email: profileData.email || "",
                    mobile: profileData.mobile || ""
                });

                const productsResponse = await fetch(apiUrl("/profile/products"), {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });

                if (productsResponse.ok) {
                    const productsData = await productsResponse.json();
                    setMyProducts(Array.isArray(productsData) ? productsData : []);
                }
            } catch (loadError) {
                setError(loadError.message);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [history, setAccount]);

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const saveProfile = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch(apiUrl("/profile"), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(form)
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.error || "Failed to update profile");
            }

            setAccount(payload);
            setMessage(t('profile.updateSuccess'));
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section className="ds-container">
                <div className="ds-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <h2 className="ds-heading-3">{t('profile.loading')}</h2>
                </div>
            </section>
        );
    }

    return (
        <section className="ds-container">
            <div className="ds-grid-2">
                <article className="ds-card">
                    <header style={{ marginBottom: 'var(--space-6)' }}>
                        <p className="ds-subtitle">{t('navigation.profile')}</p>
                        <h1 className="ds-heading-2">{account?.fname || t('profile.title')}</h1>
                        <p className="ds-body">{t('profile.manageAccount')}</p>
                    </header>

                    <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div className="ds-input-group">
                            <label htmlFor="fname" className="ds-label">{t('auth.firstName')}</label>
                            <input id="fname" name="fname" className="ds-input" value={form.fname} onChange={updateField} required />
                        </div>

                        <div className="ds-input-group">
                            <label htmlFor="email" className="ds-label">{t('auth.email')}</label>
                            <input id="email" name="email" type="email" className="ds-input" value={form.email} onChange={updateField} required />
                        </div>

                        <div className="ds-input-group">
                            <label htmlFor="mobile" className="ds-label">{t('auth.mobile')}</label>
                            <input id="mobile" name="mobile" className="ds-input" value={form.mobile} onChange={updateField} required />
                        </div>

                        <button type="submit" disabled={saving} className="ds-btn ds-btn-primary" style={{ marginTop: 'var(--space-2)' }}>
                            {saving ? t('profile.saving') : t('profile.saveProfile')}
                        </button>
                    </form>

                    {message ? <p className="ds-body" style={{ color: 'hsl(var(--color-success))', marginTop: 'var(--space-4)' }}>{message}</p> : null}
                    {error ? <p className="ds-body" style={{ color: 'hsl(var(--color-danger))', marginTop: 'var(--space-4)' }}>{error}</p> : null}
                </article>

                <article className="ds-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                        <h2 className="ds-heading-3" style={{ margin: 0 }}>{t('profile.yourProducts')}</h2>
                        <NavLink to="/products/new" className="ds-btn ds-btn-secondary">
                            {t('admin.createProduct')}
                        </NavLink>
                    </div>

                    {myProducts.length ? (
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {myProducts.map((product) => (
                                <li key={product._id} style={{
                                    padding: 'var(--space-4)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h3 className="ds-heading-3" style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-1)' }}>
                                            {product?.title?.shortTitle || "Untitled"}
                                        </h3>
                                        <p className="ds-body" style={{ fontSize: 'var(--text-sm)', margin: 0 }}>
                                            {product.category}
                                        </p>
                                    </div>
                                    <NavLink to={`/getproductsone/${product.id}`} className="ds-btn ds-btn-ghost" style={{ fontSize: 'var(--text-xs)' }}>
                                        View
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                            <p>{t('profile.noProducts')}</p>
                        </div>
                    )}
                </article>
            </div>
        </section>
    );
};

export default ProfilePage;


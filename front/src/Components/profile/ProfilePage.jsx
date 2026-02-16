import React, { useContext, useEffect, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { apiUrl } from "../../api";
import { Logincontext } from "../context/Contextprovider";
import "./profile.css";

const ProfilePage = () => {
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
            setMessage("Profile updated successfully.");
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section className="profile_page">
                <div className="profile_card">
                    <h2>Loading profile...</h2>
                </div>
            </section>
        );
    }

    return (
        <section className="profile_page">
            <div className="profile_grid">
                <article className="profile_card">
                    <header className="profile_header">
                        <p className="profile_kicker">Account</p>
                        <h1>{account?.fname || "Your Profile"}</h1>
                        <p>Manage your personal details and account settings.</p>
                    </header>

                    <form className="profile_form" onSubmit={saveProfile}>
                        <label htmlFor="fname">Name</label>
                        <input id="fname" name="fname" value={form.fname} onChange={updateField} required />

                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" value={form.email} onChange={updateField} required />

                        <label htmlFor="mobile">Mobile</label>
                        <input id="mobile" name="mobile" value={form.mobile} onChange={updateField} required />

                        <button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </form>

                    {message ? <p className="profile_notice success">{message}</p> : null}
                    {error ? <p className="profile_notice error">{error}</p> : null}
                </article>

                <article className="profile_card">
                    <div className="profile_products_head">
                        <h2>Your Products</h2>
                        <NavLink to="/products/new" className="create_product_btn">
                            Create Product
                        </NavLink>
                    </div>

                    {myProducts.length ? (
                        <ul className="profile_products_list">
                            {myProducts.map((product) => (
                                <li key={product._id}>
                                    <div>
                                        <h3>{product?.title?.shortTitle || "Untitled"}</h3>
                                        <p>{product.category}</p>
                                    </div>
                                    <NavLink to={`/getproductsone/${product.id}`}>View</NavLink>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="profile_empty">
                            You have not created products yet.
                        </p>
                    )}
                </article>
            </div>
        </section>
    );
};

export default ProfilePage;


import React, { useContext, useEffect, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiUrl } from "../../api";
import { Logincontext } from "../context/Contextprovider";
import "./profile.css";
import BackButton from "../common/BackButton";
import Pagination from "../common/Pagination";
import ConfirmDialog from "../common/ConfirmDialog";

// Icons (Using standard MUI or Heroicons style)
import PersonIcon from "@mui/icons-material/Person";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddIcon from "@mui/icons-material/Add";
import PhoneIcon from "@mui/icons-material/Phone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { account, setAccount } = useContext(Logincontext);
  const [form, setForm] = useState({ fname: "", email: "", mobile: "" });
  const [myProducts, setMyProducts] = useState([]);
  const [prodPage, setProdPage] = useState(1);
  const [prodTotalPages, setProdTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileResponse = await fetch(apiUrl("/profile"), {
          credentials: "include",
        });
        if (!profileResponse.ok) return navigate("/login");

        const profileData = await profileResponse.json();
        setAccount(profileData);
        setForm({
          fname: profileData.fname || "",
          email: profileData.email || "",
          mobile: profileData.mobile || "",
        });

        const productsResponse = await fetch(apiUrl("/profile/products"), {
          credentials: "include",
        });
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setMyProducts(Array.isArray(productsData) ? productsData : []);
          setProdTotalPages(productsData.total_pages || 1);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [setAccount, navigate]);

  const handlePageChange = async (newPage) => {
    setProdPage(newPage);
    try {
      const productsResponse = await fetch(apiUrl("/profile/products?page=" + newPage), { credentials: "include" });
      if (productsResponse.ok) {
        const resData = await productsResponse.json();
        setMyProducts(resData.data || []);
        setProdTotalPages(resData.total_pages || 1);
      }
    } catch(e){}
  };
    
  const updateField = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(apiUrl("/profile"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed");
      setAccount(payload);
      setMessage(t("profile.updateSuccess"));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = (productId) => {
    setProductToDelete(productId);
    setIsConfirmOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    setDeletingId(productToDelete);
    setError("");
    setMessage("");
    try {
      const response = await fetch(apiUrl(`/products/${productToDelete}`), {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Failed to delete product");

      setMyProducts((prev) => prev.filter((product) => (product.id || product._id) !== productToDelete));
      setMessage(t("profile.deleteSuccess", { defaultValue: "Product deleted." }));
      setIsConfirmOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
      setProductToDelete(null);
    }
  };

  if (loading)
    return (
      <div className="loader_container">
        <div className="spinner"></div>
      </div>
    );

  return (
    <main className="profile_wrapper">
      <div className="profile_container">
        <div style={{ width: '100%', marginBottom: '10px' }}>
          <BackButton />
        </div>
        {/* LEFT SIDEBAR: User Overview */}
        <aside className="profile_sidebar">
          <div className="profile_card user_summary">
            <div className="avatar_large">
              {account?.fname ? account.fname[0].toUpperCase() : "?"}
            </div>
            <h2>{account?.fname}</h2>
            <p className="user_role">{account?.role || "Customer"}</p>

            <div className="quick_info">
              <div className="info_item">
                <MailOutlineIcon fontSize="small" />{" "}
                <span>{account?.email}</span>
              </div>
              <div className="info_item">
                <PhoneIcon fontSize="small" />{" "}
                <span>{account?.mobile || "No phone added"}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT: Forms and Products */}
        <section className="profile_main_content">
          {/* Account Settings Card */}
          <div className="profile_card">
            <div className="card_header">
              <h3>
                <PersonIcon /> {t("profile.manageAccount")}
              </h3>
            </div>
            <form onSubmit={saveProfile} className="modern_form">
              <div className="input_grid">
                <div className="input_box">
                  <label>{t("auth.firstName")}</label>
                  <input
                    name="fname"
                    value={form.fname}
                    onChange={updateField}
                    required
                  />
                </div>
                <div className="input_box">
                  <label>{t("auth.mobile")}</label>
                  <input
                    name="mobile"
                    value={form.mobile}
                    onChange={updateField}
                    required
                  />
                </div>
              </div>
              <div className="input_box">
                <label>{t("auth.email")}</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  required
                />
              </div>

              <div className="form_footer">
                <button type="submit" className="save_btn" disabled={saving}>
                  {saving ? "Saving..." : t("profile.saveProfile")}
                </button>
                {message && (
                  <span className="status_msg success">{message}</span>
                )}
                {error && <span className="status_msg error">{error}</span>}
              </div>
            </form>
          </div>

          {/* Products Management Card */}
          <div className="profile_card products_card">
            <div className="card_header">
              <h3>
                <InventoryIcon /> {t("profile.yourProducts")}
              </h3>
              <NavLink to="/products/new" className="add_btn">
                <AddIcon /> {t("admin.createProduct")}
              </NavLink>
            </div>

            <div className="product_list">
              {myProducts.length > 0 ? (
                myProducts.map((product) => (
                  <div key={product._id} className="product_row">
                    <div className="p_info">
                      <strong>{product?.title?.shortTitle}</strong>
                      <span>{product.category}</span>
                    </div>
                    <div className="product_actions">
                      <NavLink
                        to={`/getproductsone/${product.id || product._id}`}
                        className="view_link"
                      >
                        View
                      </NavLink>
                      <NavLink
                        to={`/products/edit/${product.id || product._id}`}
                        className="view_link"
                      >
                        Edit
                      </NavLink>
                      <button
                        type="button"
                        className="delete_btn"
                        onClick={() => deleteProduct(product.id || product._id)}
                        disabled={deletingId === (product.id || product._id)}
                      >
                        {deletingId === (product.id || product._id) ? "Removing..." : t("profile.delete", { defaultValue: "Delete" })}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty_state">{t("profile.noProducts")}</p>
              )}
            </div>
            
            {prodTotalPages > 1 && (
                <div style={{ marginTop: '20px' }}>
                    <Pagination 
                        currentPage={prodPage} 
                        totalPages={prodTotalPages} 
                        onPageChange={handlePageChange} 
                    />
                </div>
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title={t("profile.deleteProductTitle") || "Delete Product"}
        message={t("profile.confirmDelete") || "Are you sure you want to delete this product? This action cannot be undone."}
        confirmText={t("common.delete") || "Delete"}
        cancelText={t("common.cancel") || "Cancel"}
        onConfirm={confirmDeleteProduct}
        onCancel={() => {
          setIsConfirmOpen(false);
          setProductToDelete(null);
        }}
        loading={!!deletingId}
        type="danger"
      />
    </main>
  );
};

export default ProfilePage;

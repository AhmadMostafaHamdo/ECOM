/**
 * ProfilePage.jsx — Complete redesign
 *
 * Layout:
 *  1. HERO — full-width banner with avatar, name, role badge, quick stats
 *  2. BODY (2-column grid on desktop, stacked on mobile)
 *     LEFT  → Identity card + quick-info list
 *     RIGHT → Account Settings form + Products list
 */

import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { axiosInstance, ROOT_URL } from "../../api";
import { Logincontext } from "../context/Contextprovider";
import "./profile.css";
import BackButton from "../common/BackButton";
import Pagination from "../common/Pagination";
import ConfirmDialog from "../common/ConfirmDialog";
import PhoneInput from "../ui/PhoneInput";
import { useLocalize } from "../context/LocalizeContext";
import {
  User,
  Mail,
  Phone,
  Package,
  Plus,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  MapPin,
  Settings,
  Box,
  ChevronRight,
} from "lucide-react";

/* ── Utility ────────────────────────────────────────────────────── */
const getImageSrc = (url) => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${ROOT_URL}${url}`;
};

/* ── Sub-components ─────────────────────────────────────────────── */

/** Section card wrapper */
const Card = ({ className = "", children, ...props }) => (
  <div className={`pp-card ${className}`} {...props}>{children}</div>
);

/** Card header row */
const CardHead = ({ icon: Icon, title, action }) => (
  <div className="pp-card__head">
    <div className="pp-card__head-left">
      {Icon && <span className="pp-card__head-icon"><Icon size={16} /></span>}
      <h3 className="pp-card__head-title">{title}</h3>
    </div>
    {action && <div className="pp-card__head-action">{action}</div>}
  </div>
);

/** Stat pill */
const Stat = ({ value, label }) => (
  <div className="pp-stat">
    <span className="pp-stat__value">{value}</span>
    <span className="pp-stat__label">{label}</span>
  </div>
);

/** Inline form field with icon */
const Field = ({ id, label, icon: Icon, hint, children }) => (
  <div className="pp-field">
    <div className="pp-field__label-row">
      <label className="pp-field__label" htmlFor={id}>{label}</label>
      {hint && <span className="pp-field__hint">{hint}</span>}
    </div>
    <div className="pp-field__wrap">
      {Icon && <span className="pp-field__icon"><Icon size={15} /></span>}
      {children}
    </div>
  </div>
);

/* ── Main Component ─────────────────────────────────────────────── */
const ProfilePage = () => {
  const { t } = useTranslation();
  const { activeCountry } = useLocalize();
  const navigate = useNavigate();
  const { account, setAccount } = useContext(Logincontext);

  const [form, setForm] = useState({ fname: "", email: "", mobile: "", country: "N/A" });
  const [myProducts, setMyProducts] = useState([]);
  const [prodPage, setProdPage] = useState(1);
  const [prodTotalPages, setProdTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "success"|"error", text }
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // productId | null
  /* ── Data loading ─────────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, productsRes] = await Promise.all([
          axiosInstance.get("/profile"),
          axiosInstance.get("/profile/products"),
        ]);
        const p = profileRes.data;
        setAccount(p);
        setForm({ fname: p.fname || "", email: p.email || "", mobile: p.mobile || "", country: p.country || "N/A" });
        setMyProducts(productsRes.data.data || []);
        setProdTotalPages(productsRes.data.pagination?.totalPages || 1);
      } catch (err) {
        if (err.response?.status === 401) return navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setAccount, navigate]);

  const handlePageChange = async (page) => {
    setProdPage(page);
    const res = await axiosInstance.get(`/profile/products?page=${page}`).catch(() => null);
    if (res?.status === 200) {
      setMyProducts(res.data.data || []);
      setProdTotalPages(res.data.pagination?.totalPages || 1);
    }
  };

  const updateField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  /* ── Save profile ─────────────────────────────────────────────── */
  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const res = await axiosInstance.put("/profile", form);
      setAccount(res.data);
      toast.success(t("profile.updateSuccess", "Profile updated!"));
      setNotice({ type: "success", text: t("profile.updateSuccess", "Your profile has been updated successfully.") });
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      toast.error(msg);
      setNotice({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete product ───────────────────────────────────────────── */
  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete);
    try {
      await axiosInstance.delete(`/products/${confirmDelete}`);
      toast.success(t("profile.deleteSuccess", "Product deleted."));
      setMyProducts((prev) => prev.filter((p) => p.id !== confirmDelete && p._id !== confirmDelete));
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Loading state ────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="pp-loading">
        <Loader2 size={28} className="pp-loading__spinner" />
        <span>{t("common.loading", "Loading…")}</span>
      </div>
    );
  }

  const initials = account?.fname ? account.fname[0].toUpperCase() : "?";
  const role = account?.role || "customer";
  const joinYear = account?.createdAt ? new Date(account.createdAt).getFullYear() : null;

  return (
    <div className="pp-root">
      {/* ── Back nav ──────────────────────────────────────────────── */}
      <div className="pp-nav">
        <BackButton />
      </div>

      {/* ════════════════════════════════════════════════════════════
          HERO — gradient banner, avatar, name, role, stats
          ════════════════════════════════════════════════════════════ */}
      <section className="pp-hero">
        {/* Decorative gradient orbs */}
        <div className="pp-hero__orb pp-hero__orb--1" aria-hidden />
        <div className="pp-hero__orb pp-hero__orb--2" aria-hidden />

        <div className="pp-hero__inner">
          {/* Avatar + Identity grouped as left cluster */}
          <div className="pp-hero__left">
            <div className="pp-hero__avatar-wrap">
              <div className="pp-hero__avatar">{initials}</div>
              <div className="pp-hero__avatar-ring" aria-hidden />
            </div>
            <div className="pp-hero__identity">
              <h1 className="pp-hero__name">{account?.fname}</h1>
              <div className="pp-hero__meta">
                <span className="pp-hero__role">
                  <ShieldCheck size={12} />
                  {role}
                </span>
                {account?.email && (
                  <span className="pp-hero__email">
                    <Mail size={12} />
                    {account.email}
                  </span>
                )}
                {account?.mobile && (
                  <span className="pp-hero__phone">
                    <Phone size={12} />
                    <span dir="ltr">{account.mobile}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats — right side */}
          <div className="pp-hero__stats">
            <Stat value={myProducts.length} label={t("profile.products", "Products")} />
            {joinYear && <Stat value={joinYear} label={t("profile.memberSince", "Member since")} />}
            <Stat value={role === "admin" ? "Admin" : "Member"} label={t("profile.accountType", "Account type")} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          BODY — top row: info + form side-by-side, bottom: products
          ════════════════════════════════════════════════════════════ */}
      <div className="pp-body">

        {/* ── TOP ROW: Contact info (left) + Settings form (right) ── */}
        <div className="pp-row pp-row--top">

          {/* ── Contact info card ────────────────────────────────── */}
          <Card className="pp-contact-card">
            <CardHead icon={User} title={t("profile.contactInfo", "Contact Info")} />

            {/* Avatar + name block */}
            <div className="pp-contact-card__profile">
              <div className="pp-contact-card__avatar">{initials}</div>
              <div>
                <div className="pp-contact-card__name">{account?.fname}</div>
                <span className="pp-sidebar__badge">{role}</span>
              </div>
            </div>

            {/* Info grid */}
            <ul className="pp-info-grid">
              <li className="pp-info-grid__item">
                <span className="pp-info-grid__icon"><Mail size={15} /></span>
                <div>
                  <span className="pp-info-grid__label">{t("auth.email", "Email")}</span>
                  <span className="pp-info-grid__value">{account?.email || "—"}</span>
                </div>
              </li>
              <li className="pp-info-grid__item">
                <span className="pp-info-grid__icon"><Phone size={15} /></span>
                <div>
                  <span className="pp-info-grid__label">{t("auth.mobile", "Mobile")}</span>
                  <span className="pp-info-grid__value" dir="ltr">{account?.mobile || "—"}</span>
                </div>
              </li>
              <li className="pp-info-grid__item">
                <span className="pp-info-grid__icon"><MapPin size={15} /></span>
                <div>
                  <span className="pp-info-grid__label">{t("admin.country", "Country")}</span>
                  <span className="pp-info-grid__value">{account?.country || "—"}</span>
                </div>
              </li>
              <li className="pp-info-grid__item">
                <span className="pp-info-grid__icon"><Box size={15} /></span>
                <div>
                  <span className="pp-info-grid__label">{t("profile.products", "Products")}</span>
                  <span className="pp-info-grid__value pp-info-grid__value--accent">{myProducts.length}</span>
                </div>
              </li>
            </ul>
          </Card>

          {/* ── Account settings form ─────────────────────────────── */}
          <Card className="pp-settings-card">
            <CardHead icon={Settings} title={t("profile.manageAccount", "Account Settings")} />

              <form onSubmit={saveProfile} className="pp-form" noValidate>
                {/* ── Row 1: Name + Phone ─────────────────────────── */}
                <div className="pp-form__grid pp-form__grid--2">
                  <Field id="pp-fname" label={t("auth.firstName", "Full Name")} icon={User}>
                    <input
                      id="pp-fname"
                      name="fname"
                      value={form.fname}
                      onChange={updateField}
                      required
                      className="pp-input"
                      placeholder={t("auth.firstName", "Your name")}
                      autoComplete="given-name"
                    />
                  </Field>

                  <Field label={t(`localization.countries.${activeCountry?.id}.phone_label`, "Phone Number")} icon={Phone}>
                    <PhoneInput
                      value={form.mobile}
                      onChange={(val) => setForm({ ...form, mobile: val })}
                    />
                  </Field>
                </div>

                {/* ── Row 2: Email (full width) ───────────────────── */}
                <Field id="pp-email" label={t("auth.email", "Email Address")} icon={Mail}>
                  <input
                    id="pp-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    required
                    className="pp-input"
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </Field>

                {/* ── Notice ─────────────────────────────────────── */}
                {notice && (
                  <div className={`pp-notice pp-notice--${notice.type}`} role="alert">
                    {notice.type === "success"
                      ? <CheckCircle2 size={15} />
                      : <AlertCircle size={15} />}
                    <span>{notice.text}</span>
                  </div>
                )}

                {/* ── Submit ─────────────────────────────────────── */}
                <div className="pp-form__footer">
                  <button type="submit" className="pp-btn pp-btn--primary" disabled={saving}>
                    {saving ? <Loader2 size={15} className="pp-spin" /> : null}
                    <span>{saving ? t("common.loading", "Saving…") : t("profile.saveProfile", "Save Changes")}</span>
                  </button>
                </div>
              </form>
            </Card>
          </div>{/* end pp-row--top */}

          {/* ── BOTTOM ROW: Products (full width) ────────────────── */}
          <div className="pp-row pp-row--bottom">
            <Card>
              <CardHead
                icon={Package}
                title={t("profile.yourProducts", "My Products")}
                action={
                  <NavLink to="/products/new" className="pp-btn pp-btn--outline pp-btn--sm">
                    <Plus size={14} />
                    {t("admin.createProduct", "Add Product")}
                  </NavLink>
                }
              />

              {myProducts.length === 0 ? (
                /* Empty state */
                <div className="pp-empty">
                  <div className="pp-empty__icon"><Package size={32} /></div>
                  <h4 className="pp-empty__title">{t("profile.noProducts", "No products yet")}</h4>
                  <p className="pp-empty__body">
                    {t("profile.noProductsDesc", "Start by listing your first product.")}
                  </p>
                  <NavLink to="/products/new" className="pp-btn pp-btn--primary pp-btn--sm">
                    <Plus size={14} />
                    {t("admin.createProduct", "Create your first product")}
                  </NavLink>
                </div>
              ) : (
                /* Product list */
                <ul className="pp-product-list">
                  {myProducts.map((product) => {
                    const id = product.id || product._id;
                    const isDeleting = deletingId === id;
                    const imgSrc = getImageSrc(product.url);

                    return (
                      <li key={id} className="pp-product">
                        {/* Thumbnail */}
                        <div className="pp-product__thumb">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={product?.title?.shortTitle || "Product"}
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          ) : (
                            <Package size={18} className="pp-product__thumb-icon" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="pp-product__info">
                          <span className="pp-product__name">
                            {product?.title?.shortTitle || t("profile.untitledProduct", "Untitled")}
                          </span>
                          <div className="pp-product__meta">
                            {product.category && (
                              <span className="pp-product__tag">{product.category}</span>
                            )}
                            <span className="pp-product__price">
                              {product?.price?.currency || "SYP"} {product?.price?.cost ?? 0}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pp-product__actions">
                          <NavLink
                            to={`/getproductsone/${id}`}
                            className="pp-icon-btn"
                            title={t("common.view", "View")}
                          >
                            <Eye size={15} />
                          </NavLink>
                          <NavLink
                            to={`/products/edit/${id}`}
                            className="pp-icon-btn pp-icon-btn--edit"
                            title={t("common.edit", "Edit")}
                          >
                            <Edit2 size={15} />
                          </NavLink>
                          <button
                            type="button"
                            className="pp-icon-btn pp-icon-btn--delete"
                            onClick={() => setConfirmDelete(id)}
                            disabled={isDeleting}
                            title={t("common.delete", "Delete")}
                          >
                            {isDeleting
                              ? <Loader2 size={15} className="pp-spin" />
                              : <Trash2 size={15} />}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Pagination */}
              {prodTotalPages > 1 && (
                <div className="pp-product-list__pagination">
                  <Pagination
                    currentPage={prodPage}
                    totalPages={prodTotalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </Card>
          </div>{/* end pp-row--bottom */}
        </div>{/* end pp-body */}

      {/* ── Delete confirmation dialog ────────────────────────────── */}
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={t("profile.deleteProductTitle", "Delete Product")}
        message={t("profile.confirmDelete", "This action cannot be undone. Are you sure?")}
        confirmText={t("common.delete", "Delete")}
        cancelText={t("common.cancel", "Cancel")}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
        loading={Boolean(deletingId)}
        type="danger"
      />
    </div>
  );
};

export default ProfilePage;

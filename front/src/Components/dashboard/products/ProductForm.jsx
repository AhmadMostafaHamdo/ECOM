import React from "react";
import {
  Tag,
  Layers,
  FileText,
  DollarSign,
  BarChart2,
  MapPin,
  Map,
  Building2,
  Phone,
  Link2,
  AlignLeft,
  AlertCircle,
} from "lucide-react";
import PhoneInput from "../../ui/PhoneInput";
import "./product-form.css";

/* ── Reusable field wrapper ─────────────────────────────────────── */
const Field = ({ label, hint, icon: Icon, full = false, children }) => (
  <div className={`pf-field${full ? " pf-field--full" : ""}`}>
    <div className="pf-field__label-row">
      <label className="pf-field__label">{label}</label>
      {hint && <span className="pf-field__hint">{hint}</span>}
    </div>
    <div className="pf-field__control">
      {Icon && (
        <span className="pf-field__icon" aria-hidden="true">
          <Icon size={15} />
        </span>
      )}
      {children}
    </div>
  </div>
);

/* ── Component ──────────────────────────────────────────────────── */
const ProductForm = ({
  isEditing,
  form,
  categories,
  updateField,
  handleSubmit,
  resetForm,
  saving,
  t,
  error,
}) => {
  return (
    <form className="pf-root" onSubmit={handleSubmit} noValidate>

      {/* ── Identity ────────────────────────────────────────────── */}
      <fieldset className="pf-section">
        <legend className="pf-section__legend">
          <Tag size={13} />
          {t("admin.productIdentity", "Product Identity")}
        </legend>
        <div className="pf-grid pf-grid--2">
          <Field label={t("admin.markName", "Mark Name")} icon={Tag}>
            <input
              id="pf-shortTitle"
              type="text"
              name="shortTitle"
              value={form.shortTitle}
              onChange={updateField}
              required
              className="pf-input"
              placeholder={t("admin.markNamePlaceholder", "e.g. iPhone 15 Pro")}
            />
          </Field>

          <Field label={t("admin.sector", "Sector / Category")} icon={Layers}>
            <select
              id="pf-category"
              name="category"
              value={form.category}
              onChange={updateField}
              required
              className="pf-input pf-select"
            >
              <option value="">{t("admin.selectCategory", "Select category…")}</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label={t("admin.legalDesignation", "Legal Designation")} icon={FileText} full>
          <input
            id="pf-longTitle"
            type="text"
            name="longTitle"
            value={form.longTitle}
            onChange={updateField}
            required
            className="pf-input"
            placeholder={t("admin.legalDesignationPlaceholder", "Full official product name")}
          />
        </Field>
      </fieldset>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <fieldset className="pf-section">
        <legend className="pf-section__legend">
          <DollarSign size={13} />
          {t("admin.pricing", "Pricing")}
        </legend>
        <div className="pf-grid pf-grid--2">
          <Field label={t("admin.marketPrice", "Market Price")} icon={DollarSign}>
            <div className="pf-price-group">
              <input
                id="pf-cost"
                type="number"
                name="cost"
                value={form.cost}
                onChange={updateField}
                required
                className="pf-input pf-price-group__amount"
                placeholder="0.00"
                min="0"
                step="any"
              />
              <select
                name="currency"
                value={form.currency}
                onChange={updateField}
                className="pf-input pf-select pf-price-group__currency"
              >
                <option value="SYP">SYP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </Field>

          <Field label={t("admin.msrp", "Base MSRP")} icon={BarChart2}>
            <input
              id="pf-mrp"
              type="number"
              name="mrp"
              value={form.mrp}
              onChange={updateField}
              required
              className="pf-input"
              placeholder="0.00"
              min="0"
              step="any"
            />
          </Field>
        </div>
      </fieldset>

      {/* ── Location ────────────────────────────────────────────── */}
      <fieldset className="pf-section">
        <legend className="pf-section__legend">
          <MapPin size={13} />
          {t("admin.location", "Location")}
        </legend>
        <div className="pf-grid pf-grid--3">
          <Field label={t("admin.country", "الدولة")} icon={MapPin}>
            <select
              id="pf-country"
              name="country"
              value={form.country}
              onChange={updateField}
              className="pf-input pf-select"
            >
              <option value="">{t("admin.selectCountry", "اختر الدولة")}</option>
              <option value="Syria">سوريا</option>
              <option value="Lebanon">لبنان</option>
              <option value="Jordan">الأردن</option>
            </select>
          </Field>

          <Field label={t("admin.province", "المحافظة")} icon={Map}>
            <select
              id="pf-province"
              name="province"
              value={form.province}
              onChange={updateField}
              className="pf-input pf-select"
            >
              <option value="">{t("admin.selectProvince", "اختر المحافظة")}</option>
              {form.country === "Syria" && (
                <>
                  <option value="Damascus">دمشق</option>
                  <option value="Aleppo">حلب</option>
                  <option value="Homs">حمص</option>
                  <option value="Latakia">اللاذقية</option>
                  <option value="Tartus">طرطوس</option>
                  <option value="Hama">حماة</option>
                </>
              )}
              {form.country && form.country !== "Syria" && (
                <option value="Other">أخرى</option>
              )}
            </select>
          </Field>

          <Field label={t("admin.city", "المدينة")} icon={Building2}>
            <input
              id="pf-city"
              type="text"
              name="city"
              value={form.city}
              onChange={updateField}
              className="pf-input"
              placeholder={t("admin.cityPlaceholder", "المدينة")}
            />
          </Field>
        </div>

        <Field label={t("auth.mobile", "رقم الهاتف")} icon={Phone} full>
          <PhoneInput
            value={form.mobile}
            onChange={(val) =>
              updateField({ target: { name: "mobile", value: val } })
            }
            onCountryChange={(c) => {
              if (c && !form.country) {
                updateField({ target: { name: "country", value: c.name } });
              }
            }}
          />
        </Field>
      </fieldset>

      {/* ── Details ─────────────────────────────────────────────── */}
      <fieldset className="pf-section">
        <legend className="pf-section__legend">
          <AlignLeft size={13} />
          {t("admin.details", "Details")}
        </legend>

        <Field label={t("admin.resourceUrl", "Product Resource URL")} icon={Link2} full>
          <input
            id="pf-url"
            type="text"
            name="url"
            value={form.url}
            onChange={updateField}
            required
            className="pf-input"
            placeholder="https://example.com/product"
          />
        </Field>

        <Field label={t("admin.description", "Description")} icon={AlignLeft} full>
          <textarea
            id="pf-description"
            name="description"
            value={form.description}
            onChange={updateField}
            rows={3}
            className="pf-input pf-textarea"
            placeholder={t("admin.descriptionPlaceholder", "Brief product description…")}
          />
        </Field>
      </fieldset>

      {/* ── Error notice ─────────────────────────────────────────── */}
      {error ? (
        <div className="pf-error" role="alert">
          <AlertCircle size={16} className="pf-error__icon" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* ── Actions ──────────────────────────────────────────────── */}
      <div className="pf-actions">
        <button
          type="button"
          className="pf-btn pf-btn--ghost"
          onClick={resetForm}
          disabled={saving}
        >
          {t("dialog.cancel", "Cancel")}
        </button>
        <button
          type="submit"
          className="pf-btn pf-btn--primary"
          disabled={saving}
        >
          {saving ? <span className="pf-btn__spinner" aria-hidden="true" /> : null}
          <span>
            {saving
              ? t("common.loading", "Saving…")
              : isEditing
                ? t("common.save", "Save Changes")
                : t("admin.createProduct", "Create Product")}
          </span>
        </button>
      </div>
    </form>
  );
};

export default ProductForm;

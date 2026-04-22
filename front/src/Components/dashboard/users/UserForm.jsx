"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { User, Mail, Phone, ShieldCheck, Lock, AlertCircle } from "lucide-react";
import "./user-form.css";

const Field = ({ label, hint, icon: Icon, children }) => (
  <div className="uf-field">
    <div className="uf-field__label-row">
      <label className="uf-field__label">{label}</label>
      {hint && <span className="uf-field__hint">{hint}</span>}
    </div>
    <div className="uf-field__control">
      {Icon && (
        <span className="uf-field__icon" aria-hidden="true">
          <Icon size={16} />
        </span>
      )}
      {children}
    </div>
  </div>
);

const UserForm = ({
  form,
  setForm,
  isEditing,
  saving,
  onSubmit,
  onCancel,
  error,
}) => {
  const { t } = useTranslation();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  return (
    <form className="uf-root" onSubmit={onSubmit} noValidate>
      {/* ── Personal info ── */}
      <fieldset className="uf-section">
        <legend className="uf-section__legend">
          <User size={14} />
          {t("profile.personalInfo")}
        </legend>

        <div className="uf-grid">
          <Field label={t("auth.firstName")} icon={User}>
            <input
              id="user-fname"
              type="text"
              name="fname"
              value={form.fname}
              onChange={handleInputChange}
              required
              className="uf-input"
              placeholder={t("auth.firstName")}
              autoComplete="given-name"
            />
          </Field>

          <Field label={t("auth.email")} icon={Mail}>
            <input
              id="user-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              required
              className="uf-input"
              placeholder="name@example.com"
              autoComplete="email"
            />
          </Field>

          <Field label={t("auth.mobile")} icon={Phone}>
            <input
              id="user-mobile"
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleInputChange}
              className="uf-input"
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
            />
          </Field>

          <Field label={t("auth.role")} icon={ShieldCheck}>
            <select
              id="user-role"
              name="role"
              value={form.role}
              onChange={handleInputChange}
              className="uf-input uf-select"
            >
              <option value="user">{t("auth.role_user")}</option>
              <option value="admin">{t("auth.role_admin")}</option>
            </select>
          </Field>
        </div>
      </fieldset>

      {/* ── Security ── */}
      <fieldset className="uf-section">
        <legend className="uf-section__legend">
          <Lock size={14} />
          {t("auth.password")}
        </legend>

        <Field
          label={t("auth.password")}
          hint={isEditing ? `(${t("common.optional")})` : null}
          icon={Lock}
        >
          <input
            id="user-password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleInputChange}
            required={!isEditing}
            className="uf-input"
            placeholder={isEditing ? t("auth.passwordPlaceholder") : "••••••••"}
            autoComplete={isEditing ? "new-password" : "new-password"}
          />
        </Field>
      </fieldset>

      {/* ── Error notice ── */}
      {error ? (
        <div className="uf-error" role="alert">
          <AlertCircle size={16} className="uf-error__icon" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* ── Actions ── */}
      <div className="uf-actions">
        <button
          type="button"
          className="uf-btn uf-btn--ghost"
          onClick={onCancel}
          disabled={saving}
        >
          {t("dialog.cancel")}
        </button>
        <button
          type="submit"
          className="uf-btn uf-btn--primary"
          disabled={saving}
        >
          {saving ? <span className="uf-btn__spinner" aria-hidden="true" /> : null}
          <span>
            {saving
              ? t("common.loading")
              : isEditing
                ? t("admin.editUser")
                : t("admin.createUser")}
          </span>
        </button>
      </div>
    </form>
  );
};

export default React.memo(UserForm);

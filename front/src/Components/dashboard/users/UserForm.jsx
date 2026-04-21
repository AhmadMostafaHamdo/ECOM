"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import "./user-form.css";

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
    <form className="admin-form user-form" onSubmit={onSubmit}>
      <div className="admin-form__grid">
        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="user-fname">
            {t("auth.firstName")}
          </label>
          <input
            id="user-fname"
            type="text"
            name="fname"
            value={form.fname}
            onChange={handleInputChange}
            required
            className="admin_input"
          />
        </div>

        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="user-email">
            {t("auth.email")}
          </label>
          <input
            id="user-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            required
            className="admin_input"
          />
        </div>

        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="user-mobile">
            {t("auth.mobile")}
          </label>
          <input
            id="user-mobile"
            type="text"
            name="mobile"
            value={form.mobile}
            onChange={handleInputChange}
            className="admin_input"
          />
        </div>

        <div className="admin-form__field">
          <label className="admin-form__label" htmlFor="user-role">
            {t("auth.role")}
          </label>
          <select
            id="user-role"
            name="role"
            value={form.role}
            onChange={handleInputChange}
            className="admin_select"
          >
            <option value="user">{t("auth.role_user")}</option>
            <option value="admin">{t("auth.role_admin")}</option>
          </select>
        </div>

        <div className="admin-form__field admin-form__field--full">
          <label className="admin-form__label" htmlFor="user-password">
            {t("auth.password")}
          </label>
          <div className="admin-form__meta">
            {isEditing ? t("common.optional") : t("auth.passwordRequired")}
          </div>
          <input
            id="user-password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleInputChange}
            required={!isEditing}
            className="admin_input"
            placeholder={t("auth.passwordPlaceholder")}
          />
        </div>
      </div>

      {error ? <div className="admin-form__notice">{error}</div> : null}

      <div className="admin-form__actions">
        <button type="button" className="ui-button ui-button--ghost" onClick={onCancel}>
          {t("dialog.cancel")}
        </button>
        <button type="submit" className="ui-button ui-button--primary" disabled={saving}>
          {saving ? <span className="ui-button__spinner" /> : null}
          <span>{saving ? t("common.loading") : isEditing ? t("admin.editUser") : t("admin.createUser")}</span>
        </button>
      </div>
    </form>
  );
};

export default React.memo(UserForm);

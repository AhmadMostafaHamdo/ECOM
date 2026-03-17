"use client";

import React from "react";
import "./user-form.css"
import { useTranslation } from "react-i18next";
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form className="admin_form" onSubmit={onSubmit}>
    <div>
          <label>
            {t("auth.firstName")}
          </label>
          <input
            type="text"
            name="fname"
            value={form.fname}
            onChange={handleInputChange}
            required
            className="admin_input text-sm"
          />
        </div>
      <div className="mb-4">
        <label >
          {t("auth.email")}
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleInputChange}
          required
          className="admin_input text-sm"
        />
      </div>

      <div className="mb-4">
        <label >
          {t("auth.mobile")}
        </label>
        <input
          type="text"
          name="mobile"
          value={form.mobile}
          onChange={handleInputChange}
          className="admin_input text-sm"
        />
      </div>

      <div className="mb-4">
        <label>
          {t("auth.role")}
        </label>
        <select
          name="role"
          value={form.role}
          onChange={handleInputChange}
          className="admin_input text-sm"
        >
          <option value="user">{t("auth.role_user") || "User"}</option>
          <option value="admin">{t("auth.role_admin") || "Admin"}</option>
        </select>
      </div>

      <div className="mb-4">
        <label >
          {t("auth.password")}{" "}
          {isEditing && `(${t("common.optional") || "Optional"})`}
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleInputChange}
          required={!isEditing}
          className="admin_input text-sm"
        />
      </div>

      {error && (
        <div className="admin_notice error text-sm mb-4">
          {error}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          className="flex-1 btn-ghost text-sm font-semibold"
          onClick={onCancel}
        >
          {t("dialog.cancel") || "Cancel"}
        </button>
        <button
          type="submit"
          className="flex-2 btn_primary"
          disabled={saving}
        >
          {saving
            ? t("common.loading")
            : isEditing
              ? t("admin.editUser")
              : t("admin.createUser")}
        </button>
      </div>
    </form>
  );
};

export default React.memo(UserForm);

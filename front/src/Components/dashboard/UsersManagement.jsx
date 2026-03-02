import React, { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../../api";
import { useTranslation } from "react-i18next";
import Pagination from "../common/Pagination";
import DynamicTable from "./DynamicTable";
import DialogComponent from "./DialogComponent";
import { Button } from "./Button";
import { Pencil, Trash2 } from "lucide-react";

const defaultForm = {
  fname: "",
  lname: "",
  email: "",
  mobile: "",
  password: "",
  cpassword: "",
  role: "user",
};

const UsersManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingUserId, setEditingUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  // ── loadUsers accepts explicit page + search to avoid stale closure issues ──
  const loadUsers = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams({ page, limit: 10, search });
      const response = await fetch(
        apiUrl(`/admin/users?${queryParams.toString()}`),
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );
      if (!response.ok) throw new Error("Failed to load users");
      const resData = await response.json();
      setUsers(resData.data || []);
      setPagination(resData.pagination);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(1, "");
  }, [loadUsers]);

  // Server-side search handler passed to DynamicTable
  const handleSearch = useCallback((term) => loadUsers(1, term), [loadUsers]);

  const handlePageChange = (newPage) => loadUsers(newPage, "");
  const handlePageSizeChange = (newSize) => loadUsers(1, "", newSize);

  const isEditing = Boolean(editingUserId);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (user) => {
    setEditingUserId(user._id);
    setForm({
      fname: user.fname || "",
      lname: user.lname || "",
      email: user.email || "",
      mobile: user.mobile || "",
      password: "",
      cpassword: "",
      role: user.role || "user",
    });
    setShowForm(true);
    setError("");
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingUserId("");
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        fname: form.fname,
        lname: form.lname,
        email: form.email,
        mobile: form.mobile,
        role: form.role,
      };
      if (form.password.trim()) {
        payload.password = form.password;
        payload.cpassword = form.cpassword || form.password;
      }
      const response = await fetch(
        isEditing
          ? apiUrl(`/admin/users/${editingUserId}`)
          : apiUrl("/admin/users"),
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save user");
      }
      resetForm();
      loadUsers(pagination.currentPage, "");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (user) => {
    setDeleteTarget(user);
    setConfirmOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(apiUrl(`/admin/users/${deleteTarget._id}`), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (response.ok) loadUsers(Math.max(1, pagination.currentPage), "");
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="admin_page" style={{ background: "transparent" }}>
      <header
        className="admin_page_header"
        style={{
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#0f1729",
              margin: 0,
            }}
          >
            {t("admin.manageUsers")}
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
            {t("admin.welcomeMessage")}
          </p>
        </div>
        {!showForm && (
          <button className="btn_primary" onClick={() => setShowForm(true)}>
            {t("admin.createUser")}
          </button>
        )}
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: showForm ? "1fr 400px" : "1fr",
          gap: "32px",
          alignItems: "start",
        }}
      >
        <section className="dashboard-section">
          <DynamicTable
            data={users}
            loading={loading}
            emptyMessage={t("admin.noUsersFound")}
            loadingMessage={t("admin.synchronizingUsers")}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRefresh={() => loadUsers(pagination.currentPage, "")}
            cacheKey="users-management"
            cacheTTL={30000}
            title={t("admin.manageUsers")}
            subtitle={t("admin.manageUserAccounts")}
            searchable={true}
            searchPlaceholder={t("admin.searchByName")}
            searchMode="server"
            onSearch={handleSearch}
            searchDebounceMs={450}
            searchKeys={["fname", "lname", "email", "mobile"]}
            filters={[
              {
                key: "role",
                label: t("admin.role"),
                options: [
                  { value: "all", label: t("admin.allRoles") },
                  { value: "admin", label: t("admin.adminRole") },
                  { value: "user", label: t("admin.userRole") },
                ],
              },
            ]}
            columns={[
              {
                // FIX: key can be any string for avatar type — the actual data
                // is retrieved via getName/getAvatarText/getSubtitle callbacks,
                // NOT via item[key]. Using "fname" as key so sorting also works.
                key: "fname",
                title: t("profile.personalInfo"),
                type: "avatar",
                getAvatarText: (user) =>
                  user.fname ? user.fname[0].toUpperCase() : "?",
                getName: (user) =>
                  `${user.fname ?? ""} ${user.lname ?? ""}`.trim() || "—",
                getSubtitle: (user) =>
                  user._id ? `ID: ${user._id.slice(-8)}` : "",
                sortable: true,
              },
              {
                key: "email",
                title: t("auth.email"),
                sortable: true,
              },
              {
                key: "mobile",
                title: t("auth.mobile") || "Mobile",
                sortable: false,
              },
              {
                key: "role",
                title: t("auth.role"),
                type: "role",
                align: "center",
                sortable: true,
              },
              {
                key: "role", // re-use role field — status is always "active" for fetched users
                title: t("common.status"),
                type: "status",
                getStatusClass: () => "active",
                getStatusText: () => t("common.active") || "Active",
                align: "center",
              },
              {
                key: "actions",
                title: t("common.actions") || "Actions",
                type: "actions",
                align: "center",
              },
            ]}
            actions={[
              {
                icon: Pencil,
                label: t("common.edit"),
                tooltipKey: "common.edit",
                variant: "edit",
                onClick: (user) => handleEdit(user),
              },
              {
                icon: Trash2,
                label: t("common.delete"),
                tooltipKey: "common.delete",
                variant: "delete",
                onClick: (user) => requestDelete(user),
              },
            ]}
          />
        </section>

        {showForm && (
          <section
            className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sticky top-22 animate-slide-in-right"
            style={{
              position: "sticky",
              top: "88px",
              animation: "slideRight 0.3s ease",
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 m-0">
                {isEditing
                  ? t("admin.modifyPortalAccess")
                  : t("admin.grantNewAccess")}
              </h2>
              <button
                onClick={resetForm}
                className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer flex items-center justify-center transition-all duration-200"
              >
                ✕
              </button>
            </div>

            <form className="admin_form" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("auth.firstName")}
                  </label>
                  <input
                    type="text"
                    name="fname"
                    value={form.fname}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("auth.lastName")}
                  </label>
                  <input
                    type="text"
                    name="lname"
                    value={form.lname}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("auth.email")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("auth.mobile")}
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("auth.role")}
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="user">{t("auth.role_user") || "User"}</option>
                  <option value="admin">
                    {t("auth.role_admin") || "Admin"}
                  </option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("auth.password")}{" "}
                  {isEditing && `(${t("common.optional") || "Optional"})`}
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  required={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
          </section>
        )}
      </div>

      <DialogComponent
        open={confirmOpen}
        title={
          deleteTarget
            ? `${t("admin.deleteUserTitle")} ${deleteTarget.fname || "this user"}?`
            : t("admin.deleteUserTitle")
        }
        description={t("admin.deleteUserConfirm")}
        confirmLabel={deleting ? t("admin.deleting") : t("dialog.delete")}
        cancelLabel={t("dialog.cancel")}
        tone="danger"
        placement="center"
        onConfirm={handleDeleteUser}
        onClose={() => {
          if (!deleting) {
            setConfirmOpen(false);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
};

export default UsersManagement;

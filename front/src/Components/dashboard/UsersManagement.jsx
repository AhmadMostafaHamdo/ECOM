import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import DynamicTable from "./DynamicTable";
import DialogComponent from "./DialogComponent";
import { Pencil, Trash2, Ban, ShieldCheck, ShieldOff } from "lucide-react";
import { useUsersManagement } from "./users/useUsersManagement";
import UserForm from "./users/UserForm";
import UserBanDialog from "./users/UserBanDialog";

const defaultForm = {
  fname: "", lname: "", email: "", mobile: "",
  password: "", cpassword: "", role: "user",
};

const UsersManagement = () => {
  const { t } = useTranslation();
  const {
    users, loading, error: listError, pagination,
    saving, deleting, banning,
    loadUsers, saveUser, deleteUser, banUser, unbanUser, toggleAdmin
  } = useUsersManagement();

  // Local Form and Dialog States
  const [form, setForm] = useState(defaultForm);
  const [editingUserId, setEditingUserId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [banTarget, setBanTarget] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [banDialogOpen, setBanDialogOpen] = useState(false);

  const [unbanTarget, setUnbanTarget] = useState(null);
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);

  const isEditing = Boolean(editingUserId);

  useEffect(() => {
    loadUsers(1, "", 10);
  }, [loadUsers]);

  // Data Actions
  const handleSearch = useCallback((term) => loadUsers(1, term, pagination.limit), [loadUsers, pagination.limit]);
  const handlePageChange = useCallback((newPage) => loadUsers(newPage, "", pagination.limit), [loadUsers, pagination.limit]);
  const handlePageSizeChange = useCallback((newSize) => loadUsers(1, "", newSize), [loadUsers]);

  // Form Management
  const resetForm = useCallback(() => {
    setForm(defaultForm);
    setEditingUserId("");
    setShowForm(false);
    setFormError("");
  }, []);

  const handleEdit = useCallback((user) => {
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
    setFormError("");
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const payload = {
      fname: form.fname,
      lname: form.lname,
      email: form.email,
      mobile: form.mobile,
      role: form.role,
    };
    if (form.password.trim()) {
      payload.password = form.password;
      payload.cpassword = form.password;
    }

    const res = await saveUser(editingUserId, payload, isEditing);
    if (!res.success) {
      setFormError(res.error || t("admin.failedSaveUser") || "Failed to save user");
    } else {
      resetForm();
    }
  };

  // Delete Management
  const requestDelete = useCallback((user) => {
    setDeleteTarget(user);
    setConfirmOpen(true);
  }, []);

  const handleDeleteUser = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteUser(deleteTarget._id);
    setConfirmOpen(false);
    setDeleteTarget(null);
  }, [deleteTarget, deleteUser]);

  // Ban Management
  const requestBan = useCallback((user) => {
    setBanTarget(user);
    setBanReason("");
    setBanDialogOpen(true);
  }, []);

  const handleBanUser = useCallback(async () => {
    if (!banTarget) return;
    await banUser(banTarget._id, banReason);
    setBanDialogOpen(false);
    setBanTarget(null);
  }, [banTarget, banUser, banReason]);

  const requestUnban = useCallback((user) => {
    setUnbanTarget(user);
    setUnbanDialogOpen(true);
  }, []);

  const handleUnbanUser = useCallback(async () => {
    if (!unbanTarget) return;
    await unbanUser(unbanTarget._id);
    setUnbanDialogOpen(false);
    setUnbanTarget(null);
  }, [unbanTarget, unbanUser]);

  const handleToggleAdmin = useCallback(async (user) => {
    const res = await toggleAdmin(user);
    if (!res.success) {
      alert(res.error || "فشل تحديث دور المستخدم");
    }
  }, [toggleAdmin]);

  const tableFilters = React.useMemo(() => [
    {
      key: "role",
      label: t("admin.role"),
      options: [
        { value: "all", label: t("admin.allRoles") },
        { value: "admin", label: t("admin.adminRole") },
        { value: "user", label: t("admin.userRole") },
      ],
    },
  ], [t]);

  const tableColumns = React.useMemo(() => [
    {
      key: "fname",
      title: t("profile.personalInfo"),
      type: "avatar",
      getAvatarText: (user) => (user.fname ? user.fname[0].toUpperCase() : "?"),
      getName: (user) => `${user.fname ?? ""} ${user.lname ?? ""}`.trim() || "—",
      getSubtitle: (user) => (user._id ? `ID: ${user._id.slice(-8)}` : ""),
      sortable: true,
    },
    { key: "email", title: t("auth.email"), sortable: true },
    { key: "mobile", title: t("auth.mobile") || "Mobile", sortable: false },
    { key: "role", title: t("auth.role"), type: "role", align: "center", sortable: true },
    {
      key: "status",
      title: t("common.status"),
      type: "status",
      getStatusClass: (_, item) => (item?.isBanned ? "banned" : "active"),
      getStatusText: (_, item) => (item?.isBanned ? "محظور" : t("common.active") || "Active"),
      align: "center",
    },
    { key: "actions", title: t("common.actions") || "Actions", type: "actions", align: "center" },
  ], [t]);

  const tableActions = React.useMemo(() => [
    {
      icon: Pencil, label: t("common.edit"), tooltipKey: "common.edit",
      variant: "edit", onClick: handleEdit,
    },
    {
      icon: Trash2, label: t("common.delete"), tooltipKey: "common.delete",
      variant: "delete", onClick: requestDelete,
    },
    {
      icon: Ban, label: "حظر", tooltipKey: "حظر المستخدم",
      variant: "delete", isVisible: (user) => !user.isBanned && user.role !== "admin",
      onClick: requestBan,
    },
    {
      icon: ShieldCheck, label: "إلغاء حظر", tooltipKey: "إلغاء الحظر",
      variant: "edit", isVisible: (user) => user.isBanned,
      onClick: requestUnban,
    },
    {
      icon: ShieldCheck, label: "أدمن", tooltipKey: "ترقية كمسؤول",
      variant: "edit", isVisible: (user) => user.role !== "admin" && !user.isBanned,
      onClick: handleToggleAdmin,
    },
    {
      icon: ShieldOff, label: "سحب أدمن", tooltipKey: "إلغاء المسؤول",
      variant: "delete", isVisible: (user) => user.role === "admin",
      onClick: handleToggleAdmin,
    },
  ], [t, handleEdit, requestDelete, requestBan, requestUnban, handleToggleAdmin]);

  return (
    <div className="admin_page bg-transparent">
      <header className="admin_page_header flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f1729] m-0">
            {t("admin.manageUsers")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("admin.welcomeMessage")}
          </p>
        </div>
        {!showForm && (
          <button className="btn_primary" onClick={() => setShowForm(true)}>
            {t("admin.createUser")}
          </button>
        )}
      </header>

      {listError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {listError}
        </div>
      )}

      <div
        className="grid gap-8 items-start relative"
        style={{ gridTemplateColumns: showForm ? "1fr 400px" : "1fr" }}
      >
        <section className="dashboard-section w-full">
          <DynamicTable
            data={users}
            loading={loading}
            emptyMessage={t("admin.noUsersFound")}
            loadingMessage={t("admin.synchronizingUsers")}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRefresh={() => loadUsers(pagination.currentPage, "", pagination.limit)}
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
            filters={tableFilters}
            columns={tableColumns}
            actions={tableActions}
          />
        </section>

        {showForm && (
          <UserForm
            form={form}
            setForm={setForm}
            isEditing={isEditing}
            saving={saving}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            error={formError}
          />
        )}
      </div>

      <DialogComponent
        open={confirmOpen}
        title={deleteTarget ? `${t("admin.deleteUserTitle")} ${deleteTarget.fname || "this user"}?` : t("admin.deleteUserTitle")}
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

      <UserBanDialog
        banDialogOpen={banDialogOpen}
        setBanDialogOpen={setBanDialogOpen}
        banTarget={banTarget}
        banReason={banReason}
        setBanReason={setBanReason}
        handleBanUser={handleBanUser}
        banning={banning}
      />

      <DialogComponent
        open={unbanDialogOpen}
        title="إلغاء حظر المستخدم"
        description={`هل تريد إلغاء حظر ${unbanTarget?.fname || "هذا المستخدم"}؟ سيتمكن من تسجيل الدخول مجدداً.`}
        confirmLabel={banning ? "جاري الإلغاء..." : "إلغاء الحظر"}
        cancelLabel="إلغاء"
        tone="success"
        placement="center"
        onConfirm={handleUnbanUser}
        onClose={() => {
          if (!banning) {
            setUnbanDialogOpen(false);
            setUnbanTarget(null);
          }
        }}
      />
    </div>
  );
};

export default UsersManagement;

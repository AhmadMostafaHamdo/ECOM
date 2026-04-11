import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import DynamicTable from "./DynamicTable";
import ConfirmDialog from "../common/ConfirmDialog";
import { Pencil, Trash2, Ban, ShieldCheck, ShieldOff } from "lucide-react";
import { useUsersManagement } from "./users/useUsersManagement";
import UserForm from "./users/UserForm";
import UserBanDialog from "./users/UserBanDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

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
  const {
    users,
    loading,
    error: listError,
    pagination,
    saving,
    deleting,
    banning,
    loadUsers,
    saveUser,
    deleteUser,
    banUser,
    unbanUser,
    toggleAdmin,
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

  const [adminTarget, setAdminTarget] = useState(null);
  const [adminConfirmOpen, setAdminConfirmOpen] = useState(false);
  const [roleUpdating, setRoleUpdating] = useState(false);

  const [roleFilter, setRoleFilter] = useState("");

  const isEditing = Boolean(editingUserId);

  useEffect(() => {
    loadUsers(1, "", 10, roleFilter);
  }, [loadUsers, roleFilter]);

  // Data Actions
  const handleSearch = useCallback(
    (term) => loadUsers(1, term, pagination.limit, roleFilter),
    [loadUsers, pagination.limit, roleFilter],
  );
  const handlePageChange = useCallback(
    (newPage) => loadUsers(newPage, "", pagination.limit, roleFilter),
    [loadUsers, pagination.limit, roleFilter],
  );
  const handlePageSizeChange = useCallback(
    (newSize) => loadUsers(1, "", newSize, roleFilter),
    [loadUsers, roleFilter],
  );

  const handleFilterChange = useCallback((key, value) => {
    if (key === "role") {
      setRoleFilter(value);
      loadUsers(1, "", pagination.limit, value);
    }
  }, [loadUsers, pagination.limit]);

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
      setFormError(
        res.error || t("admin.failedSaveUser") || "Failed to save user",
      );
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

  const requestToggleAdmin = useCallback((user) => {
    setAdminTarget(user);
    setAdminConfirmOpen(true);
  }, []);

  const confirmToggleAdmin = useCallback(async () => {
    if (!adminTarget) return;
    setRoleUpdating(true);
    const res = await toggleAdmin(adminTarget);
    setRoleUpdating(false);
    if (!res.success) {
      alert(res.error || t("admin.roleUpdateFailed"));
    }
    setAdminConfirmOpen(false);
    setAdminTarget(null);
  }, [adminTarget, toggleAdmin, t]);

  const tableFilters = React.useMemo(
    () => [
      {
        key: "role",
        label: t("admin.role"),
        options: [
          { value: "all", label: t("admin.allRoles") },
          { value: "admin", label: t("admin.adminRole") },
          { value: "user", label: t("admin.userRole") },
        ],
      },
    ],
    [t],
  );

  const tableColumns = React.useMemo(
    () => [
      {
        key: "fname",
        title: t("profile.personalInfo"),
        type: "avatar",
        getAvatarText: (user) =>
          user.fname ? user.fname[0].toUpperCase() : "?",
        getName: (user) =>
          `${user.fname ?? ""} ${user.lname ?? ""}`.trim() || "—",
        getSubtitle: (user) => (user._id ? `ID: ${user._id.slice(-8)}` : ""),
        sortable: true,
      },
      { key: "email", title: t("auth.email"), sortable: true },
      { key: "mobile", title: t("auth.mobile") || "Mobile", sortable: false },
      {
        key: "role",
        title: t("auth.role"),
        type: "role",
        align: "center",
        sortable: true,
      },
      {
        key: "status",
        title: t("common.status"),
        type: "status",
        getStatusClass: (_, item) => (item?.isBanned ? "banned" : "active"),
        getStatusText: (_, item) =>
          item?.isBanned ? t("admin.banned") : t("common.active") || "Active",
        align: "center",
      },
      {
        key: "actions",
        title: t("common.actions") || "Actions",
        type: "actions",
        align: "center",
      },
    ],
    [t],
  );

  const tableActions = React.useMemo(
    () => [
      {
        icon: Pencil,
        label: t("common.edit"),
        tooltipKey: "common.edit",
        variant: "edit",
        onClick: handleEdit,
      },
      {
        icon: Trash2,
        label: t("common.delete"),
        tooltipKey: "common.delete",
        variant: "delete",
        onClick: requestDelete,
      },
      {
        icon: Ban,
        label: t("admin.banUser"),
        tooltipKey: t("admin.banUser"),
        variant: "delete",
        isVisible: (user) => !user.isBanned && user.role !== "admin",
        onClick: requestBan,
      },
      {
        icon: ShieldCheck,
        label: t("admin.unbanUser"),
        tooltipKey: t("admin.unbanUser"),
        variant: "edit",
        isVisible: (user) => user.isBanned,
        onClick: requestUnban,
      },
      {
        icon: ShieldCheck,
        label: t("admin.adminRole"),
        tooltipKey: t("admin.promoteAdmin"),
        variant: "edit",
        isVisible: (user) => user.role !== "admin" && !user.isBanned,
        onClick: requestToggleAdmin,
      },
      {
        icon: ShieldOff,
        label: t("admin.userRole"),
        tooltipKey: t("admin.demoteAdmin"),
        variant: "delete",
        isVisible: (user) => user.role === "admin",
        onClick: requestToggleAdmin,
      },
    ],
    [t, handleEdit, requestDelete, requestBan, requestUnban, requestToggleAdmin],
  );

  return (
    <div className="admin_page">
      <header className="admin_page_header admin_flex_between">
        <div>
          <h1 className="admin_page_title">
            {t("admin.manageUsers")}
          </h1>
          <p className="admin_page_subtitle">
            {t("admin.welcomeMessage")}
          </p>
        </div>
        <button className="btn_primary" onClick={() => setShowForm(true)}>
          {t("admin.createUser")}
        </button>
      </header>

      {listError && (
        <div className="admin_error_alert">
          {listError}
        </div>
      )}

      <div className="admin_page_body">
        <section className="dashboard-section">
          <DynamicTable
            data={users}
            loading={loading}
            emptyMessage={t("admin.noUsersFound")}
            loadingMessage={t("admin.synchronizingUsers")}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRefresh={() =>
              loadUsers(pagination.currentPage, "", pagination.limit)
            }
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
            onFilterChange={handleFilterChange}
            columns={tableColumns}
            actions={tableActions}
          />
        </section>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="admin_dialog_content admin_dialog_large">
            <DialogHeader>
              <DialogTitle>
                {isEditing
                  ? t("admin.modifyPortalAccess")
                  : t("admin.grantNewAccess")}
              </DialogTitle>
            </DialogHeader>
            <UserForm
              form={form}
              setForm={setForm}
              isEditing={isEditing}
              saving={saving}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              error={formError}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={
          deleteTarget
            ? `${t("admin.deleteUserTitle")} ${deleteTarget.fname || "this user"}?`
            : t("admin.deleteUserTitle")
        }
        message={
          t("admin.deleteUserConfirm") ||
          "Are you sure you want to delete this user? This action cannot be undone."
        }
        confirmText={deleting ? t("admin.deleting") : t("dialog.delete")}
        cancelText={t("dialog.cancel")}
        onConfirm={handleDeleteUser}
        onCancel={() => {
          if (!deleting) {
            setConfirmOpen(false);
            setDeleteTarget(null);
          }
        }}
        loading={deleting}
        type="danger"
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

      <ConfirmDialog
        open={unbanDialogOpen}
        title="إلغاء حظر المستخدم"
        message={`هل تريد إلغاء حظر ${unbanTarget?.fname || "هذا المستخدم"}؟ سيتمكن من تسجيل الدخول مجدداً.`}
        confirmText={banning ? "جاري الإلغاء..." : "إلغاء الحظر"}
        cancelText="إلغاء"
        onConfirm={handleUnbanUser}
        onCancel={() => {
          if (!banning) {
            setUnbanDialogOpen(false);
            setUnbanTarget(null);
          }
        }}
        loading={banning}
        type="info"
      />

      <ConfirmDialog
        open={adminConfirmOpen}
        title={
          adminTarget?.role === "admin"
            ? t("admin.demoteAdminTitle") || "إزالة صلاحية الإدارة"
            : t("admin.promoteAdminTitle") || "ترقية لمدير"
        }
        message={
          adminTarget?.role === "admin"
            ? `هل تريد إزالة صلاحية الإدارة من ${adminTarget?.fname || "المستخدم"} وتقليصه إلى مستخدم عادي؟`
            : `هل أنت متأكد من ترقية ${adminTarget?.fname || "المستخدم"} إلى مدير (Admin)؟`
        }
        confirmText={roleUpdating ? "جاري التحديث..." : "تأكيد"}
        cancelText="إلغاء"
        onConfirm={confirmToggleAdmin}
        onCancel={() => {
          if (!roleUpdating) {
            setAdminConfirmOpen(false);
            setAdminTarget(null);
          }
        }}
        loading={roleUpdating}
        type={adminTarget?.role === "admin" ? "danger" : "info"}
      />
    </div>
  );
};

export default UsersManagement;

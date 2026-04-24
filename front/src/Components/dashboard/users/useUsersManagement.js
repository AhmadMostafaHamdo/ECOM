import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../../api";

export const useUsersManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [banning, setBanning] = useState(false);

  const loadUsers = useCallback(async (page = 1, search = "", limit = 10, role = "") => {
    setLoading(true);
    setError("");

    try {
      const params = { page, limit, search };

      if (role && role !== "all") {
        params.role = role;
      }

      const response = await axiosInstance.get("/admin/users", { params });

      if (response.status === 200) {
        const payload = response.data;
        setUsers(payload.data || []);
        // Backend returns pagination nested under payload.pagination
        const pag = payload.pagination || {};
        setPagination({
          totalItems: pag.totalItems ?? payload.total ?? (payload.data?.length || 0),
          totalPages: pag.totalPages ?? payload.total_pages ?? 1,
          currentPage: pag.currentPage ?? payload.page ?? 1,
          limit: pag.limit ?? payload.limit ?? 10,
        });
      }
    } catch (loadError) {
      setError(loadError.response?.data?.error || loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const saveUser = async (userId, payload, isEditing) => {
    setSaving(true);

    try {
      const response = isEditing
        ? await axiosInstance.put(`/admin/users/${userId}`, payload)
        : await axiosInstance.post("/admin/users", payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(
          isEditing
            ? t("admin.userUpdatedSuccess", "User updated successfully")
            : t("admin.userCreatedSuccess", "User created successfully"),
        );
        loadUsers(pagination.currentPage, "", pagination.limit);
        return { success: true };
      }
    } catch (requestError) {
      const message = requestError.response?.data?.error || requestError.message;
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setSaving(false);
    }

    return { success: false, error: t("errors.somethingWentWrong") };
  };

  const deleteUser = async (userId) => {
    setDeleting(true);

    try {
      const response = await axiosInstance.delete(`/admin/users/${userId}`);

      if (response.status === 200) {
        toast.success(t("admin.userDeletedSuccess", "User deleted successfully"));
        loadUsers(Math.max(1, pagination.currentPage), "", pagination.limit);
      }
    } catch (requestError) {
      console.error(requestError);
      toast.error(t("admin.userDeleteError", "Failed to delete user"));
    } finally {
      setDeleting(false);
    }
  };

  const banUser = async (userId, reason) => {
    setBanning(true);

    try {
      const response = await axiosInstance.post(`/admin/users/${userId}/ban`, {
        isBanned: true,
        banReason: reason || t("admin.banPlaceholder"),
      });

      if (response.status === 200) {
        toast.success(t("admin.userBannedSuccess", "User banned successfully"));
        loadUsers(pagination.currentPage, "", pagination.limit);
      }
    } catch (requestError) {
      console.error(requestError);
      toast.error(t("admin.userBanError", "Failed to ban user"));
    } finally {
      setBanning(false);
    }
  };

  const unbanUser = async (userId) => {
    setBanning(true);

    try {
      const response = await axiosInstance.post(`/admin/users/${userId}/ban`, {
        isBanned: false,
        banReason: "",
      });

      if (response.status === 200) {
        toast.success(t("admin.userUnbannedSuccess", "User unbanned successfully"));
        loadUsers(pagination.currentPage, "", pagination.limit);
      }
    } catch (requestError) {
      console.error(requestError);
      toast.error(t("admin.userUnbanError", "Failed to unban user"));
    } finally {
      setBanning(false);
    }
  };

  const toggleAdmin = async (user) => {
    try {
      const newRole = user.role === "admin" ? "user" : "admin";
      const response = await axiosInstance.put(`/admin/users/${user._id}`, { role: newRole });

      if (response.status === 200) {
        toast.success(
          newRole === "admin"
            ? t("admin.userPromotedSuccess", "User promoted to admin")
            : t("admin.userDemotedSuccess", "Admin access removed"),
        );
        loadUsers(pagination.currentPage, "", pagination.limit);
        return { success: true };
      }
    } catch (requestError) {
      console.error("Error updating user role:", requestError);
      const message =
        requestError.response?.data?.error ||
        t("admin.roleUpdateFailed", "Failed to update user role");
      toast.error(message);
      return { success: false, error: message };
    }

    return { success: false, error: t("errors.somethingWentWrong") };
  };

  return {
    users,
    loading,
    error,
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
  };
};

import { useState, useCallback, useEffect } from "react";
import { fetchViaAxios } from "../../../api";

export const useUsersManagement = () => {
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

    // Load Users function
    const loadUsers = useCallback(async (page = 1, search = "", limit = 10) => {
        setLoading(true);
        setError("");
        try {
            const queryParams = new URLSearchParams({ page, limit, search });
            const response = await fetchViaAxios(`/admin/users?${queryParams.toString()}`);
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

    // API Action: Create or Update User
    const saveUser = async (userId, payload, isEditing) => {
        setSaving(true);
        try {
            const response = await fetchViaAxios(
                isEditing ? `/admin/users/${userId}` : "/admin/users",
                {
                    method: isEditing ? "PUT" : "POST",
                    body: JSON.stringify(payload),
                }
            );
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to save user");
            }
            loadUsers(pagination.currentPage, "");
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setSaving(false);
        }
    };

    // API Action: Delete User
    const deleteUser = async (userId) => {
        setDeleting(true);
        try {
            const response = await fetchViaAxios(`/admin/users/${userId}`, { method: "DELETE" });
            if (response.ok) {
                loadUsers(Math.max(1, pagination.currentPage), "");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    // API Action: Ban User
    const banUser = async (userId, reason) => {
        setBanning(true);
        try {
            const response = await fetchViaAxios(`/admin/users/${userId}/ban`, {
                method: "PATCH",
                body: JSON.stringify({ reason: reason || "انتهاك شروط الخدمة" }),
            });
            if (response.ok) loadUsers(pagination.currentPage, "");
        } catch (err) {
            console.error(err);
        } finally {
            setBanning(false);
        }
    };

    // API Action: Unban User
    const unbanUser = async (userId) => {
        setBanning(true);
        try {
            const response = await fetchViaAxios(`/admin/users/${userId}/unban`, {
                method: "PATCH",
            });
            if (response.ok) loadUsers(pagination.currentPage, "");
        } catch (err) {
            console.error(err);
        } finally {
            setBanning(false);
        }
    };

    // API Action: Toggle Admin Role
    const toggleAdmin = async (user) => {
        try {
            const newRole = user.role === "admin" ? "user" : "admin";
            const response = await fetchViaAxios(`/admin/users/${user._id}`, {
                method: "PUT",
                body: JSON.stringify({ role: newRole }),
            });
            if (response.ok) {
                loadUsers(pagination.currentPage, "");
                return { success: true };
            } else {
                const data = await response.json();
                return { success: false, error: data.error };
            }
        } catch (err) {
            console.error("Error updating user role:", err);
            return { success: false, error: "حدث خطأ أثناء تحديث الصلاحية" };
        }
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
        toggleAdmin
    };
};

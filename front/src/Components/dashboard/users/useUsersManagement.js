import { useState, useCallback, useEffect } from "react";
import { axiosInstance } from "../../../api";
import { toast } from "react-toastify";

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
    const loadUsers = useCallback(async (page = 1, search = "", limit = 10, role = "") => {
        setLoading(true);
        setError("");
        try {
            const params = { page, limit, search };
            if (role && role !== "all") {
                params.role = role;
            }
            
            const response = await axiosInstance.get("/admin/users", {
                params
            });
            if (response.status === 200) {
                const resData = response.data;
                setUsers(resData.data || []);
                setPagination({
                    totalItems: resData.total || resData.data.length,
                    totalPages: resData.total_pages || 1,
                    currentPage: resData.page || 1,
                    limit: resData.limit || 10
                });
            }
        } catch (loadError) {
            setError(loadError.response?.data?.error || loadError.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // API Action: Create or Update User
    const saveUser = async (userId, payload, isEditing) => {
        setSaving(true);
        try {
            const response = isEditing
                ? await axiosInstance.put(`/admin/users/${userId}`, payload)
                : await axiosInstance.post("/admin/users", payload);

            if (response.status === 200 || response.status === 201) {
                toast.success(isEditing ? "تم تحديث المستخدم بنجاح" : "تم إنشاء المستخدم بنجاح");
                loadUsers(pagination.currentPage, "");
                return { success: true };
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message;
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setSaving(false);
        }
    };

    // API Action: Delete User
    const deleteUser = async (userId) => {
        setDeleting(true);
        try {
            const response = await axiosInstance.delete(`/admin/users/${userId}`);
            if (response.status === 200) {
                toast.success("تم حذف المستخدم بنجاح");
                loadUsers(Math.max(1, pagination.currentPage), "");
            }
        } catch (err) {
            console.error(err);
            toast.error("فشل حذف المستخدم");
        } finally {
            setDeleting(false);
        }
    };

    // API Action: Ban User
    const banUser = async (userId, reason) => {
        setBanning(true);
        try {
            const response = await axiosInstance.post(`/admin/users/${userId}/ban`, {
                isBanned: true,
                banReason: reason || "انتهاك شروط الخدمة"
            });
            if (response.status === 200) {
                toast.success("تم حظر المستخدم");
                loadUsers(pagination.currentPage, "");
            }
        } catch (err) {
            console.error(err);
            toast.error("فشل حظر المستخدم");
        } finally {
            setBanning(false);
        }
    };

    // API Action: Unban User
    const unbanUser = async (userId) => {
        setBanning(true);
        try {
            const response = await axiosInstance.post(`/admin/users/${userId}/ban`, {
                isBanned: false,
                banReason: ""
            });
            if (response.status === 200) {
                toast.success("تم إلغاء حظر المستخدم");
                loadUsers(pagination.currentPage, "");
            }
        } catch (err) {
            console.error(err);
            toast.error("فشل إلغاء حظر المستخدم");
        } finally {
            setBanning(false);
        }
    };

    // API Action: Toggle Admin Role
    const toggleAdmin = async (user) => {
        try {
            const newRole = user.role === "admin" ? "user" : "admin";
            const response = await axiosInstance.put(`/admin/users/${user._id}`, {
                role: newRole
            });
            if (response.status === 200) {
                toast.success(newRole === "admin" ? "تمت الترقية لمدير" : "تمت الإزالة من المدراء");
                loadUsers(pagination.currentPage, "");
                return { success: true };
            }
        } catch (err) {
            console.error("Error updating user role:", err);
            const errorMsg = err.response?.data?.error || "حدث خطأ أثناء تحديث الصلاحية";
            toast.error(errorMsg);
            return { success: false, error: errorMsg };
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

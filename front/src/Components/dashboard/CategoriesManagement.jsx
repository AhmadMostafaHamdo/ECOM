import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../api";
import DynamicTable from "./DynamicTable";
import { Pencil, Trash2, Plus, Layers, Package, Activity } from "lucide-react";
import CategoryForm from "./categories/CategoryForm";
import "./admin-dashboard.css";
import "./CategoriesManagement.css";
import ConfirmDialog from "../common/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import { toast } from "react-toastify";

const CategoriesManagement = ({ onCategoriesChanged = () => {} }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [categoryFile, setCategoryFile] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = useCallback(
    async (search = "", page = 1, limit = 10) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page,
          limit,
          ...(search && { search }),
        });
        const response = await axiosInstance.get(
          `/admin/categories?${queryParams.toString()}`,
        );
        if (response.status === 200) {
          const payload = response.data;
          setCategories(payload.data || []);
          setPagination({
            totalItems: payload.total || 0,
            totalPages: payload.total_pages || 1,
            currentPage: payload.page || 1,
            limit: payload.limit || 10,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSearch = useCallback(
    (term) => loadCategories(term, 1, pagination.limit),
    [loadCategories, pagination.limit],
  );

  const handlePageChange = useCallback(
    (newPage) => loadCategories("", newPage, pagination.limit),
    [loadCategories, pagination.limit],
  );

  const handlePageSizeChange = useCallback(
    (newSize) => loadCategories("", 1, newSize),
    [loadCategories],
  );

  const addCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", categoryName.trim());
      if (categoryFile) {
        formData.append("imageFile", categoryFile);
      } else if (categoryImage) {
        formData.append("image", categoryImage.trim());
      }

      const response = await axiosInstance.post("/admin/categories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(
          t("admin.categoryAddedSuccess") || "Category added successfully!",
        );
        setCategoryName("");
        setCategoryImage("");
        setCategoryFile(null);
        setShowForm(false);
        loadCategories();
        onCategoriesChanged();
      }
    } catch (err) {
      console.error(err);
      toast.error(t("admin.categoryAddError") || "Failed to add category");
    } finally {
      setSaving(false);
    }
  };

  const updateCategory = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", editName.trim());
      if (editFile) {
        formData.append("imageFile", editFile);
      } else if (editImage) {
        formData.append("image", editImage.trim());
      }

      const response = await axiosInstance.put(
        `/admin/categories/${editingId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (response.status === 200) {
        toast.success(
          t("admin.categoryUpdatedSuccess") || "Category updated successfully!",
        );
        setShowForm(false);
        setEditingId("");
        setEditName("");
        setEditImage("");
        setEditFile(null);
        loadCategories();
        onCategoriesChanged();
      }
    } catch (err) {
      console.error(err);
      toast.error(
        t("admin.categoryUpdateError") || "Failed to update category",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = (category) => {
    setCategoryToDelete(category);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete(
        `/admin/categories/${categoryToDelete._id}`,
      );
      if (response.status === 200) {
        toast.success(
          t("admin.categoryDeletedSuccess") || "Category deleted successfully!",
        );
        loadCategories();
        onCategoriesChanged();
        setIsConfirmOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(
        t("admin.categoryDeleteError") || "Failed to delete category",
      );
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
    }
  };

  const totalProducts = categories.reduce(
    (sum, cat) => sum + (cat.productCount || 0),
    0,
  );

  return (
    <div className="admin_page categories-container">
      {/* Stats Summary */}
      <div className="categories-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Layers size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{pagination.totalItems}</div>
            <div className="stat-label">{t("admin.segments")}</div>
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(255, 149, 0, 0.1)", color: "#FF9500" }}
          >
            <Package size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalProducts}</div>
            <div className="stat-label">{t("admin.products")}</div>
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}
          >
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">Active</div>
            <div className="stat-label">{t("common.status")}</div>
          </div>
        </div>
      </div>

      <div className="categories-main-grid">
        <section className="dashboard-section">
          <div
            className="dashboard-header"
            style={{ border: "none", paddingBottom: 0 }}
          >
            <div className="dashboard-title">
              <span style={{ fontSize: "20px", fontWeight: "900" }}>
                {t("admin.segments")}
              </span>
              <span
                className="user-id"
                style={{
                  marginLeft: "12px",
                  background: "var(--brand-light)",
                  color: "var(--brand)",
                  border: "none",
                }}
              >
                {pagination.totalItems} {t("admin.total")}
              </span>
            </div>
            <button
              className="submit-btn-premium"
              style={{ width: "auto", padding: "10px 20px", fontSize: "13px" }}
              onClick={() => {
                setShowForm(true);
                setEditingId("");
                setCategoryName("");
                setCategoryImage("");
                setCategoryFile(null);
                setEditFile(null);
              }}
            >
              <Plus size={18} />
              {t("admin.createCategory")}
            </button>
          </div>

          <DynamicTable
            data={categories}
            loading={loading}
            emptyMessage={t("admin.noSegmentsFound")}
            loadingMessage={t("admin.mappingSectors")}
            cacheKey="categories-management"
            cacheTTL={30000}
            title=""
            subtitle=""
            searchable={true}
            searchPlaceholder={t("admin.searchSegments")}
            searchMode="server"
            onSearch={handleSearch}
            searchDebounceMs={400}
            searchKeys={["name"]}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRefresh={() =>
              loadCategories("", pagination.currentPage, pagination.limit)
            }
            columns={[
              {
                key: "name",
                title: t("admin.segmentName"),
                type: "avatar",
                getAvatarText: (cat) => cat.name?.[0]?.toUpperCase() || "?",
                getAvatarImage: (cat) => cat.image,
                getName: (cat) => cat.name || "—",
                getSubtitle: (cat) =>
                  cat._id ? `ID: ${cat._id.slice(-8)}` : "",
                sortable: true,
              },
              {
                key: "productCount",
                title: t("admin.products"),
                type: "progress",
                sortable: true,
              },
              {
                key: "_id",
                title: t("common.status"),
                type: "status",
                getStatusClass: () => "active",
                getStatusText: () => t("common.active"),
                align: "center",
              },
              {
                key: "actions",
                title: t("common.actions"),
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
                onClick: (cat) => {
                  setEditingId(cat._id);
                  setEditName(cat.name);
                  setEditImage(cat.image || "");
                  setEditFile(null);
                  setShowForm(true);
                },
              },
              {
                icon: Trash2,
                label: t("common.delete"),
                tooltipKey: "common.delete",
                variant: "delete",
                onClick: (cat) => deleteCategory(cat),
                isVisible: (cat) => cat.name !== t("admin.uncategorized"),
              },
            ]}
          />
        </section>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="admin_dialog_content admin_dialog_large">
            <DialogHeader>
              <DialogTitle>
                {editingId
                  ? t("admin.editCategory")
                  : t("admin.createCategory")}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              editingId={editingId}
              editName={editName}
              categoryName={categoryName}
              editImage={editImage}
              categoryImage={categoryImage}
              categoryFile={categoryFile}
              editFile={editFile}
              setEditName={setEditName}
              setCategoryName={setCategoryName}
              setEditImage={setEditImage}
              setCategoryImage={setCategoryImage}
              setCategoryFile={setCategoryFile}
              setEditFile={setEditFile}
              updateCategory={updateCategory}
              addCategory={addCategory}
              setShowForm={setShowForm}
              setEditingId={setEditingId}
              saving={saving}
              t={t}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title={t("admin.deleteCategoryTitle") || "Delete Category"}
        message={
          t("admin.deleteCategoryConfirm") ||
          "This will permanently delete the category. You cannot undo this action."
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setIsConfirmOpen(false);
            setCategoryToDelete(null);
          }
        }}
        loading={isDeleting}
        type="danger"
      />
    </div>
  );
};

export default CategoriesManagement;

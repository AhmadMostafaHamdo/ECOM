import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../api";
import DynamicTable from "./DynamicTable";
import { Pencil, Trash2 } from "lucide-react";
import CategoryForm from "./categories/CategoryForm";
import "./admin-dashboard.css";
import ConfirmDialog from "../common/ConfirmDialog";

const UNCATEGORIZED = "uncategorized";

const CategoriesManagement = ({ onCategoriesChanged = () => { } }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
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
        const response = await axiosInstance.get(`/admin/categories?${queryParams.toString()}`);
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

  // Server-side search handler passed to DynamicTable
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
      const response = await axiosInstance.post("/admin/categories", {
        name: categoryName.trim(),
        image: categoryImage.trim()
      });
      if (response.status === 200 || response.status === 201) {
        setCategoryName("");
        setCategoryImage("");
        setShowForm(false);
        loadCategories();
        onCategoriesChanged();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateCategory = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const response = await axiosInstance.put(`/admin/categories/${editingId}`, {
        name: editName.trim(),
        image: editImage.trim()
      });
      if (response.status === 200) {
        setShowForm(false);
        setEditingId("");
        setEditName("");
        setEditImage("");
        loadCategories();
        onCategoriesChanged();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = (category) => {
    setCategoryToDelete(category);
    setIsConfirmOpen(false);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete(`/admin/categories/${categoryToDelete._id}`);
      if (response.status === 200) {
        loadCategories();
        onCategoriesChanged();
        setIsConfirmOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="admin_page" style={{ background: "transparent" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: showForm ? "1fr 400px" : "1fr",
          gap: "32px",
          alignItems: "start",
        }}
      >
        <section className="dashboard-section">
          <div className="dashboard-header">
            <div className="dashboard-title">
              {t("admin.segments")}{" "}
              <span className="user-id">
                {categories.length} {t("admin.total")}
              </span>
            </div>
            <button
              className="btn_primary"
              style={{ fontSize: 13 }}
              onClick={() => {
                setShowForm(true);
                setEditingId("");
                setCategoryName("");
                setCategoryImage("");
              }}
            >
              + {t("admin.createCategory")}
            </button>
          </div>

          <DynamicTable
            data={categories}
            loading={loading}
            emptyMessage={t("admin.noSegmentsFound")}
            loadingMessage={t("admin.mappingSectors")}
            cacheKey="categories-management"
            cacheTTL={30000}
            title={t("admin.segments")}
            subtitle={`${categories.length} ${t("admin.totalSegments")}`}
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
                // FIX: key="name" so sorting works AND avatar callbacks get the item
                key: "name",
                title: t("admin.segmentName"),
                type: "avatar",
                getAvatarText: (cat) => cat.name?.[0]?.toUpperCase() || "?",
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
                // FIX: key="name" reused — getStatusClass/Text ignore the value
                // and always return "active"/"Active", so any key is fine here.
                // Using a dedicated key avoids collision with sorting.
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
                  setShowForm(true);
                },
              },
              {
                icon: Trash2,
                label: t("common.delete"),
                tooltipKey: "common.delete",
                variant: "delete",
                onClick: (cat) => deleteCategory(cat),
                // FIX: "Uncategorized" row should NOT show delete button
                isVisible: (cat) => cat.name !== t("admin.uncategorized"),
              },
            ]}
          />
        </section>

        {showForm && (
          <CategoryForm
            editingId={editingId}
            editName={editName}
            categoryName={categoryName}
            editImage={editImage}
            categoryImage={categoryImage}
            setEditName={setEditName}
            setCategoryName={setCategoryName}
            setEditImage={setEditImage}
            setCategoryImage={setCategoryImage}
            updateCategory={updateCategory}
            addCategory={addCategory}
            setShowForm={setShowForm}
            setEditingId={setEditingId}
            saving={saving}
            t={t}
          />
        )}
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title={t("admin.deleteCategoryTitle") || "Delete Category"}
        message={`${t("admin.deleteCategoryConfirm")} "${categoryToDelete?.name}"? ${t("admin.thisActionCannotBeUndone") || "This action cannot be undone."}`}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setCategoryToDelete(null);
        }}
        loading={isDeleting}
        type="danger"
      />
    </div>
  );
};

export default CategoriesManagement;

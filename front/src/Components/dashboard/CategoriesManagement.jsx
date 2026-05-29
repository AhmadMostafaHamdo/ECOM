import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../api";
import DynamicTable from "./DynamicTable";
import { Pencil, Trash2, Plus, Layers, Package, Activity, X } from "lucide-react";
import CategoryForm from "./categories/CategoryForm";
import "./admin-dashboard.css";
import "./CategoriesManagement.css";
import ConfirmDialog from "../common/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "react-toastify";
import { getActiveLanguage, getCategoryValue, getLocalizedName, isDefaultUncategorizedCategory } from "../../utils/categoryUtils";

const emptyDraft = {
  nameEn: "",
  nameAr: "",
  image: "",
  file: null,
  subCategories: [],
};

const toDraft = (category = {}) => ({
  nameEn: getLocalizedName(category.name, "en"),
  nameAr: getLocalizedName(category.name, "ar") !== getLocalizedName(category.name, "en") ? getLocalizedName(category.name, "ar") : "",
  image: category.image || "",
  file: null,
  subCategories: Array.isArray(category.subCategories)
    ? category.subCategories.map((subCategory) => ({
      _id: subCategory._id,
      nameEn: getLocalizedName(subCategory.name, "en"),
      nameAr: getLocalizedName(subCategory.name, "ar") !== getLocalizedName(subCategory.name, "en") ? getLocalizedName(subCategory.name, "ar") : "",
      image: subCategory.image || "",
      value: subCategory.value || "",
      slug: subCategory.slug || "",
      active: subCategory.active !== false,
      file: null,
    }))
    : [],
});

const uploadSubCategoryImages = async (draft) => {
  const uploadedByIndex = {};

  for (let index = 0; index < draft.subCategories.length; index += 1) {
    const subCategory = draft.subCategories[index];
    if (!subCategory.file) continue;

    const uploadData = new FormData();
    uploadData.append("images", subCategory.file);
    const response = await axiosInstance.post("/upload/images", uploadData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    uploadedByIndex[index] = response.data?.images?.[0] || "";
  }

  return uploadedByIndex;
};

const appendDraftToFormData = (formData, draft, uploadedSubCategoryImages = {}) => {
  formData.append("nameEn", draft.nameEn.trim());
  formData.append("nameAr", draft.nameAr.trim());
  formData.append("name", JSON.stringify({ en: draft.nameEn.trim(), ar: draft.nameAr.trim() }));

  if (draft.file) formData.append("imageFile", draft.file);
  else if (draft.image) formData.append("image", draft.image.trim());

  const subCategories = draft.subCategories.map((subCategory, index) => ({
    _id: subCategory._id,
    name: { en: subCategory.nameEn.trim(), ar: subCategory.nameAr.trim() },
    image: uploadedSubCategoryImages[index] || (subCategory.image || "").trim(),
    value: subCategory.value || subCategory.nameEn.trim(),
    slug: subCategory.slug || subCategory.value || subCategory.nameEn.trim(),
    active: subCategory.active !== false,
  }));

  formData.append("subCategories", JSON.stringify(subCategories));
};

const CategoriesManagement = ({ onCategoriesChanged = () => { } }) => {
  const { t, i18n } = useTranslation();
  const language = getActiveLanguage(i18n);
  const [categories, setCategories] = useState([]);
  const [categoryDraft, setCategoryDraft] = useState(emptyDraft);
  const [editDraft, setEditDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState("");
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
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategorySubcategories, setSelectedCategorySubcategories] = useState([]);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);

  const loadCategories = useCallback(async (search = "", page = 1, limit = 10) => {
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
  }, []);

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

  const fetchSubcategoriesByCategory = async (categoryId, categoryObj) => {
    if (process.env.NODE_ENV === "development") {
      console.log("selectedCategory._id:", categoryId);
    }
    
    setIsLoadingSubcategories(true);
    try {
      let fetchedSubcategories = [];
      
      if (categoryObj && Array.isArray(categoryObj.subCategories) && categoryObj.subCategories.length > 0) {
        fetchedSubcategories = categoryObj.subCategories;
      } else {
        const response = await axiosInstance.get(`/admin/categories/${categoryId}`);
        if (response.status === 200 && response.data?.subCategories) {
          fetchedSubcategories = response.data.subCategories;
        }
      }
      
      if (process.env.NODE_ENV === "development") {
        console.log("fetched subcategories response:", fetchedSubcategories);
      }
      
      const filtered = fetchedSubcategories.filter((sub) => {
        if (!sub.category) return true;
        return sub.category === categoryId || sub.category._id === categoryId;
      });
      
      setSelectedCategorySubcategories(filtered);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      setSelectedCategorySubcategories([]);
    } finally {
      setIsLoadingSubcategories(false);
    }
  };

  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category);
    fetchSubcategoriesByCategory(category._id, category);
  }, []);

  const closeForm = () => {
    setShowForm(false);
    setEditingId("");
    setCategoryDraft(emptyDraft);
    setEditDraft(emptyDraft);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    const draft = editingId ? editDraft : categoryDraft;
    if (!(draft.nameEn || draft.nameAr).trim()) return;

    setSaving(true);
    try {
      const uploadedSubCategoryImages = await uploadSubCategoryImages(draft);
      const formData = new FormData();
      appendDraftToFormData(formData, draft, uploadedSubCategoryImages);

      const endpoint = editingId ? `/admin/categories/${editingId}` : "/admin/categories";
      const response = await (editingId
        ? axiosInstance.put(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } })
        : axiosInstance.post(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } }));

      if (response.status === 200 || response.status === 201) {
        toast.success(
          editingId
            ? t("admin.categoryUpdatedSuccess") || "Category updated successfully!"
            : t("admin.categoryAddedSuccess") || "Category added successfully!",
        );
        closeForm();
        loadCategories("", pagination.currentPage, pagination.limit);
        onCategoriesChanged();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || t("admin.categorySaveError") || "Failed to save category");
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
      const response = await axiosInstance.delete(`/admin/categories/${categoryToDelete._id}`);
      if (response.status === 200) {
        toast.success(t("admin.categoryDeletedSuccess") || "Category deleted successfully!");
        loadCategories("", pagination.currentPage, pagination.limit);
        onCategoriesChanged();
        setIsConfirmOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(t("admin.categoryDeleteError") || "Failed to delete category");
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
    }
  };

  const totalProducts = categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0);

  return (
    <div className="admin_page categories-container">
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
          <div className="stat-icon" style={{ background: "rgba(255, 149, 0, 0.1)", color: "#FF9500" }}>
            <Package size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalProducts}</div>
            <div className="stat-label">{t("admin.products")}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
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
          <div className="dashboard-header" style={{ border: "none", paddingBottom: 0 }}>
            <div className="dashboard-title">
              <span style={{ fontSize: "20px", fontWeight: "900" }}>{t("admin.segments")}</span>
              <span className="user-id" style={{ marginLeft: "12px", background: "var(--brand-light)", color: "var(--brand)", border: "none" }}>
                {pagination.totalItems} {t("admin.total")}
              </span>
            </div>
            <button
              className="submit-btn-premium"
              style={{ width: "auto", padding: "10px 20px", fontSize: "13px" }}
              onClick={() => {
                setEditingId("");
                setCategoryDraft(emptyDraft);
                setShowForm(true);
              }}
            >
              <Plus size={18} />
              {t("admin.createCategory")}
            </button>
          </div>

          <DynamicTable
            data={categories.filter(cat => !isDefaultUncategorizedCategory(cat))}
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
            searchKeys={["name.en", "name.ar"]}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onRefresh={() => loadCategories("", pagination.currentPage, pagination.limit)}
            columns={[
              {
                key: "name",
                title: t("admin.segmentName"),
                type: "avatar",
                getAvatarText: (cat) => getLocalizedName(cat.name, language)?.[0]?.toUpperCase() || "?",
                getAvatarImage: (cat) => cat.image,
                getName: (cat) => getLocalizedName(cat.name, language) || "-",
                getSubtitle: (cat) => `${(cat.subCategories || []).length} ${t("admin.subCategories", "SubCategories")}`,
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
                  setEditDraft(toDraft(cat));
                  setShowForm(true);
                },
              },
              {
                icon: Trash2,
                label: t("common.delete"),
                tooltipKey: "common.delete",
                variant: "delete",
                onClick: (cat) => deleteCategory(cat),
                isVisible: (cat) => getCategoryValue(cat) !== "Uncategorized",
              },
            ]}
            onRowClick={handleCategoryClick}
          />
        </section>

        {selectedCategory && (
          <section className="dashboard-section" style={{ marginTop: "24px" }}>
            <div className="dashboard-header" style={{ border: "none", paddingBottom: "16px" }}>
              <div className="dashboard-title">
                <span style={{ fontSize: "18px", fontWeight: "700" }}>
                  {t("admin.subCategories", "Subcategories")} - {getLocalizedName(selectedCategory.name, language)}
                </span>
                <span className="user-id" style={{ marginLeft: "12px", background: "var(--brand-light)", color: "var(--brand)", border: "none" }}>
                  {selectedCategorySubcategories.length} {t("admin.total")}
                </span>
              </div>
              <button
                className="admin-icon-button"
                onClick={() => setSelectedCategory(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            
            {isLoadingSubcategories ? (
              <div className="admin-table__loading">{t("common.loading", "Loading...")}</div>
            ) : selectedCategorySubcategories.length === 0 ? (
              <div className="admin-table__empty">No subcategories found for this category</div>
            ) : (
              <DynamicTable
                data={selectedCategorySubcategories}
                columns={[
                  {
                    key: "name",
                    title: t("admin.subCategoryName", "Subcategory Name"),
                    type: "avatar",
                    getAvatarText: (sub) => getLocalizedName(sub.name, language)?.[0]?.toUpperCase() || "?",
                    getAvatarImage: (sub) => sub.image,
                    getName: (sub) => getLocalizedName(sub.name, language) || "-",
                    sortable: true,
                  },
                  {
                    key: "active",
                    title: t("common.status"),
                    type: "status",
                    getStatusClass: (val) => (val !== false ? "active" : "inactive"),
                    getStatusText: (val) => (val !== false ? t("common.active", "Active") : t("common.inactive", "Inactive")),
                    align: "center",
                  }
                ]}
                searchable={true}
                searchMode="client"
                searchKeys={["name.en", "name.ar"]}
                emptyMessage="No subcategories found for this category"
              />
            )}
          </section>
        )}

        <Dialog open={showForm} onOpenChange={(open) => (open ? setShowForm(true) : closeForm())}>
          <DialogContent className="admin_dialog_content admin_dialog_large">
            <DialogHeader>
              <DialogTitle>
                {editingId ? t("admin.editCategory") : t("admin.createCategory")}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              editingId={editingId}
              draft={editingId ? editDraft : categoryDraft}
              setDraft={editingId ? setEditDraft : setCategoryDraft}
              onSubmit={saveCategory}
              onCancel={closeForm}
              saving={saving}
              t={t}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title={t("admin.deleteCategoryTitle") || "Delete Category"}
        message={t("admin.deleteCategoryConfirm") || "This will permanently delete the category. You cannot undo this action."}
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

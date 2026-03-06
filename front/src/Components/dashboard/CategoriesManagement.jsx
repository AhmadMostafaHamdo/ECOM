import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiUrl } from "../../api";
import DynamicTable from "./DynamicTable";
import { Pencil, Trash2 } from "lucide-react";
import CategoryForm from "./categories/CategoryForm";

const UNCATEGORIZED = "uncategorized";

const CategoriesManagement = ({ onCategoriesChanged = () => { } }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadCategories = useCallback(
    async (search = "", page = 1, limit = 10) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page,
          limit,
          ...(search && { search }),
        });
        const response = await fetch(
          apiUrl(`/admin/categories?${queryParams.toString()}`),
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          },
        );
        if (response.ok) {
          const payload = await response.json();
          setCategories(payload.data || []);
          setPagination(
            payload.pagination || {
              totalItems: 0,
              totalPages: 0,
              currentPage: 1,
              limit: 10,
            },
          );
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
      const response = await fetch(apiUrl("/admin/categories"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: categoryName.trim() }),
      });
      if (response.ok) {
        setCategoryName("");
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
      const response = await fetch(apiUrl(`/admin/categories/${editingId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (response.ok) {
        setShowForm(false);
        setEditingId("");
        setEditName("");
        loadCategories();
        onCategoriesChanged();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (category) => {
    if (
      !window.confirm(`${t("admin.deleteCategoryConfirm")} "${category.name}"?`)
    )
      return;
    setSaving(true);
    try {
      const response = await fetch(
        apiUrl(`/admin/categories/${category._id}`),
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );
      if (response.ok) {
        loadCategories();
        onCategoriesChanged();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
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
            setEditName={setEditName}
            setCategoryName={setCategoryName}
            updateCategory={updateCategory}
            addCategory={addCategory}
            setShowForm={setShowForm}
            setEditingId={setEditingId}
            saving={saving}
            t={t}
          />
        )}
      </div>
    </div>
  );
};

export default CategoriesManagement;

import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiUrl } from "../../api";
import DynamicTable from "./DynamicTable";
import DialogComponent from "./DialogComponent";
import { Button } from "./Button";
import { Pencil, Trash2 } from "lucide-react";

const CATEGORY_ALL = "All Categories";

const emptyForm = {
  shortTitle: "",
  longTitle: "",
  description: "",
  mrp: "",
  cost: "",
  priceDiscount: "",
  offerText: "",
  tagline: "",
  url: "",
  detailUrl: "",
  category: "",
};

const ProductsManagement = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isEditing = Boolean(editingId);

  const loadProducts = useCallback(
    async (page = 1, search = searchTerm, limit = pagination.limit) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page,
          limit,
          search,
        });
        if (selectedCategory !== CATEGORY_ALL) {
          queryParams.set("category", selectedCategory);
        }
        const response = await fetch(
          apiUrl(`/admin/products?${queryParams.toString()}`),
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          },
        );
        if (response.ok) {
          const payload = await response.json();
          setProducts(payload.data || []);
          setPagination(
            payload.pagination || {
              totalItems: 0,
              totalPages: 0,
              currentPage: 1,
              limit: 10,
            },
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory, searchTerm, pagination.limit],
  );

  // Enhanced search handler for server-side search
  const handleSearch = useCallback(
    (term) => {
      setSearchTerm(term);
      loadProducts(1, term);
    },
    [loadProducts],
  );

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch(apiUrl("/admin/categories"), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (response.ok) {
        const payload = await response.json();
        const list = Array.isArray(payload)
          ? payload.map((item) => item.name)
          : [];
        setCategories(list);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  const handlePageChange = (newPage) =>
    loadProducts(newPage, searchTerm, pagination.limit);
  const handlePageSizeChange = (newSize) =>
    loadProducts(1, searchTerm, newSize);

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      shortTitle: product?.title?.shortTitle || "",
      longTitle: product?.title?.longTitle || "",
      description: product?.description || "",
      mrp: product?.price?.mrp ?? "",
      cost: product?.price?.cost ?? "",
      priceDiscount: product?.price?.discount || "",
      offerText: product?.discount || "",
      tagline: product?.tagline || "",
      url: product?.url || "",
      detailUrl: product?.detailUrl || "",
      category: product?.category || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
    setShowForm(false);
  };

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        mrp: Number(form.mrp),
        cost: Number(form.cost),
      };
      const response = await fetch(
        isEditing
          ? apiUrl(`/admin/products/${editingId}`)
          : apiUrl("/admin/products"),
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );
      if (response.ok) {
        resetForm();
        loadProducts(pagination.currentPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (product) => {
    setDeleteTarget(product);
    setConfirmOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(
        apiUrl(`/admin/products/${deleteTarget._id}`),
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );
      if (response.ok) {
        const nextPage = Math.max(1, pagination.currentPage);
        await loadProducts(nextPage);
      }
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
              color: "#1e293b",
              margin: 0,
            }}
          >
            {t("admin.manageProducts")}
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
            {t("admin.welcomeMessage")}
          </p>
        </div>
        {!showForm && (
          <button className="btn_primary" onClick={() => setShowForm(true)}>
            {t("admin.createProduct")}
          </button>
        )}
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: showForm ? "1fr 420px" : "1fr",
          gap: "32px",
          alignItems: "start",
        }}
      >
        <section className="dashboard-section">
          <div className="dashboard-header">
            <div className="dashboard-controls">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-btn"
              >
                <option value={CATEGORY_ALL}>
                  {t("navigation.allCategories")}
                </option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="search-container">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  style={{ paddingLeft: "40px", width: "256px" }}
                />
              </div>
            </div>
          </div>

          <DynamicTable
            data={products}
            loading={loading}
            emptyMessage={t("admin.noProductsFound")}
            loadingMessage={t("admin.auditingInventory")}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            cacheKey="products-management"
            cacheTTL={30000}
            title={t("admin.products")}
            subtitle={`${products.length} ${t("admin.productsTotal")}`}
            searchable={true}
            searchPlaceholder={t("admin.searchProductsById")}
            searchMode="server"
            onSearch={handleSearch}
            searchDebounceMs={500}
            searchKeys={["title.shortTitle", "title.longTitle", "id"]}
            onRefresh={() =>
              loadProducts(pagination.currentPage, searchTerm, pagination.limit)
            }
            filters={[
              {
                key: "category",
                label: "Category",
                options: [
                  { value: "All Categories", label: "All Categories" },
                  ...categories.map((cat) => ({ value: cat, label: cat })),
                ],
              },
            ]}
            columns={[
              {
                key: "title",
                title: t("productCreator.productName"),
                type: "avatar",
                getAvatarText: (product) =>
                  product?.title?.shortTitle?.[0]?.toUpperCase() || "?",
                getName: (product) => product?.title?.shortTitle,
                getSubtitle: (product) =>
                  `ID: ${product._id.substring(product._id.length - 8)}`,
                sortable: true,
              },
              {
                key: "category",
                title: t("navigation.categories"),
                type: "role",
                sortable: true,
              },
              {
                key: "price",
                title: t("product.price"),
                type: "custom",
                render: (product) => (
                  <div>
                    <div className="product-price">${product?.price?.cost}</div>
                    <div className="product-category line-through">
                      ${product?.price?.mrp}
                    </div>
                  </div>
                ),
                sortable: true,
              },
              {
                key: "status",
                title: t("common.status"),
                type: "status",
                getStatusClass: () => "active",
                sortable: true,
              },
              {
                key: "actions",
                title: t("common.actions") || t("common.results"),
                type: "actions",
              },
            ]}
            actions={[
              {
                icon: Pencil,
                label: t("common.edit"),
                onClick: (product) => handleEdit(product),
                variant: "edit",
              },
              {
                icon: Trash2,
                label: t("common.delete"),
                onClick: (product) => requestDelete(product),
                variant: "delete",
              },
            ]}
          />
        </section>

        {showForm && (
          <section
            className="admin_card"
            style={{
              position: "sticky",
              top: "104px",
              maxHeight: "calc(100vh - 140px)",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                {isEditing ? t("admin.editProduct") : t("admin.createProduct")}
              </h2>
              <button
                onClick={resetForm}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                x
              </button>
            </div>
            <form className="admin_form" onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label>Mark Name</label>
                  <input
                    type="text"
                    name="shortTitle"
                    value={form.shortTitle}
                    onChange={updateField}
                    required
                  />
                </div>
                <div>
                  <label>Sector</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={updateField}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label>Legal Designation</label>
                <input
                  type="text"
                  name="longTitle"
                  value={form.longTitle}
                  onChange={updateField}
                  required
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label>Market Price ($)</label>
                  <input
                    type="number"
                    name="cost"
                    value={form.cost}
                    onChange={updateField}
                    required
                  />
                </div>
                <div>
                  <label>Base MSRP ($)</label>
                  <input
                    type="number"
                    name="mrp"
                    value={form.mrp}
                    onChange={updateField}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Product Resource URL</label>
                <input
                  type="text"
                  name="url"
                  value={form.url}
                  onChange={updateField}
                  required
                />
              </div>
              <div>
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  rows="3"
                  style={{ resize: "none" }}
                />
              </div>
              <div style={{ marginTop: "16px" }}>
                <button
                  type="submit"
                  className="btn_primary"
                  style={{ width: "100%" }}
                  disabled={saving}
                >
                  {saving
                    ? t("common.loading")
                    : isEditing
                      ? t("common.save")
                      : t("admin.createProduct")}
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
            ? `Delete ${deleteTarget?.title?.shortTitle || "this product"}?`
            : "Delete product?"
        }
        description="Deleting this product will remove it from listings and purchase flows. Continue?"
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        tone="danger"
        placement="center"
        onConfirm={handleDeleteProduct}
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

export default ProductsManagement;

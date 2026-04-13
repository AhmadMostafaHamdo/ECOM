import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../api";
import DynamicTable from "./DynamicTable";
import ConfirmDialog from "../common/ConfirmDialog";
import { Button } from "./Button";
import { Pencil, Trash2, Plus, Layers, Package, Activity } from "lucide-react";
import "./CategoriesManagement.css";
import ProductForm from "./products/ProductForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "react-toastify";

const CATEGORY_ALL = "All Categories"; // internal value, label will be translated

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
  currency: "SYP",
  country: "",
  province: "",
  city: "",
  mobile: "",
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

        const response = await axiosInstance.get(`/admin/products?${queryParams.toString()}`);

        if (response.status === 200) {
          const payload = response.data;
          setProducts(payload.data || []);
          setPagination({
            totalItems: payload.total || 0,
            totalPages: payload.total_pages || 1,
            currentPage: payload.page || 1,
            limit: payload.limit || 10,
          });
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
      const response = await axiosInstance.get("/admin/categories");
      if (response.status === 200) {
        const payload = response.data;
        const categoriesArray = payload.data || payload;
        const list = Array.isArray(categoriesArray)
          ? categoriesArray.map((item) => (typeof item === 'string' ? item : item.name))
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

  const handlePageChange = useCallback((newPage) => {
    loadProducts(newPage, searchTerm, pagination.limit);
  }, [loadProducts, searchTerm, pagination.limit]);

  const handlePageSizeChange = useCallback((newSize) => {
    loadProducts(1, searchTerm, newSize);
  }, [loadProducts, searchTerm]);

  const handleEdit = useCallback((product) => {
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
      currency: product?.price?.currency || "SYP",
      country: product?.locationDetail?.country || "",
      province: product?.locationDetail?.province || "",
      city: product?.locationDetail?.city || "",
      mobile: product?.mobile || "",
    });
    setShowForm(true);
  }, []);

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

      const endpoint = isEditing ? `/admin/products/${editingId}` : "/admin/products";
      const response = await (isEditing ? axiosInstance.put(endpoint, payload) : axiosInstance.post(endpoint, payload));

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? t("admin.productUpdatedSuccess") || "Product updated successfully!" : t("admin.productCreatedSuccess") || "Product created successfully!");
        resetForm();
        loadProducts(pagination.currentPage);
      }
    } catch (err) {
      console.error(err);
      toast.error(t("admin.productSaveError") || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = useCallback((product) => {
    setDeleteTarget(product);
    setConfirmOpen(true);
  }, []);

  const handleDeleteProduct = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await axiosInstance.delete(`/admin/products/${deleteTarget._id}`);
      if (response.status === 200) {
        toast.success(t("admin.productDeletedSuccess") || "Product deleted successfully!");
        const nextPage = Math.max(1, pagination.currentPage);
        await loadProducts(nextPage);
      }
    } catch (err) {
      console.error(err);
      toast.error(t("admin.productDeleteError") || "Failed to delete product");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, loadProducts, pagination.currentPage]);

  const tableFilters = React.useMemo(() => [
    {
      key: "category",
      label: t("navigation.categories"),
      options: [
        { value: CATEGORY_ALL, label: t("home.showingAll") },
        ...categories.map((cat) => ({ value: cat, label: cat })),
      ],
    },
  ], [categories, t]);

  const tableColumns = React.useMemo(() => [
    {
      key: "title",
      title: t("productCreator.productName"),
      type: "avatar",
      getAvatarText: (product) =>
        product?.title?.shortTitle?.[0]?.toUpperCase() || "?",
      getName: (product) => product?.title?.shortTitle,
      getSubtitle: (product) =>
        `ID: ${product._id?.substring(product._id.length - 8)}`,
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
          <div className="product-price">
            {product?.price?.currency || "$"} {product?.price?.cost}
          </div>
          <div className="product-category line-through" style={{ fontSize: '12px' }}>
            {product?.price?.currency || "$"} {product?.price?.mrp}
          </div>
          {product?.locationDetail?.province && (
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              {product.locationDetail.province}, {product.locationDetail.country}
            </div>
          )}
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
  ], [t]);

  const tableActions = React.useMemo(() => [
    {
      icon: Pencil,
      label: t("common.edit"),
      onClick: handleEdit,
      variant: "edit",
    },
    {
      icon: Trash2,
      label: t("common.delete"),
      onClick: requestDelete,
      variant: "delete",
    },
  ], [t, handleEdit, requestDelete]);

  const totalProducts = pagination.totalItems;
  const categoriesCount = categories.length;

  return (
    <div className="admin_page categories-container">
      {/* Stats Summary */}
      <div className="categories-stats" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
            <Package size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalProducts}</div>
            <div className="stat-label">{t("admin.products")}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Layers size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{categoriesCount}</div>
            <div className="stat-label">{t("admin.segments")}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">Live</div>
            <div className="stat-label">Inventory Status</div>
          </div>
        </div>
      </div>

      <header
        className="admin_page_header"
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "900",
              color: "#1e293b",
              margin: 0,
              letterSpacing: '-0.02em'
            }}
          >
            {t("admin.manageProducts")}
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
            {t("admin.productsTotal")}: {totalProducts}
          </p>
        </div>
        <button className="submit-btn-premium" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => setShowForm(true)}>
          <Plus size={18} />
          {t("admin.createProduct")}
        </button>
      </header>


      <div className="admin_page_body">
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
            filters={tableFilters}
            columns={tableColumns}
            actions={tableActions}
          />
        </section>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="admin_dialog_content admin_dialog_large">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? t("admin.editProduct") : t("admin.createProduct")}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              isEditing={isEditing}
              form={form}
              categories={categories}
              updateField={updateField}
              handleSubmit={handleSubmit}
              resetForm={resetForm}
              saving={saving}
              t={t}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={
          deleteTarget
            ? `Delete ${deleteTarget?.title?.shortTitle || "this product"}?`
            : "Delete product?"
        }
        message="Deleting this product will remove it from listings and purchase flows. This action cannot be undone. Continue?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteProduct}
        onCancel={() => {
          if (!deleting) {
            setConfirmOpen(false);
            setDeleteTarget(null);
          }
        }}
        loading={deleting}
        type="danger"
      />
    </div>
  );
};

export default ProductsManagement;

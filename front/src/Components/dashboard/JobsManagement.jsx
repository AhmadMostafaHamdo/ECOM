import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../api";
import DynamicTable from "./DynamicTable";
import ConfirmDialog from "../common/ConfirmDialog";
import { Button } from "./Button";
import { Pencil, Trash2, Plus, Briefcase, MapPin } from "lucide-react";
import "./CategoriesManagement.css";
import JobForm from "./jobs/JobForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "react-toastify";

const emptyForm = {
  title: "",
  company_name: "",
  location: "",
  job_type: "",
  salary_min: "",
  salary_max: "",
  currency: "USD",
  description: "",
  contact_email: "",
  contact_phone: "",
  category: "",
  status: "draft",
};

const JobsManagement = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 0, currentPage: 1, limit: 10 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isEditing = Boolean(editingId);

  const loadJobs = useCallback(
    async (page = 1, search = searchTerm, limit = pagination.limit) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({ page, limit, search });
        const resp = await axiosInstance.get(`/admin/jobs?${qs.toString()}`);
        if (resp.status === 200) {
          const payload = resp.data;
          setJobs(payload.data || []);
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
    [searchTerm, pagination.limit],
  );

  const loadCategories = useCallback(async () => {
    try {
      const resp = await axiosInstance.get("/admin/job-categories");
      if (resp.status === 200) {
        const payload = resp.data;
        const list = Array.isArray(payload.data || payload) ? (payload.data || payload) : [];
        setCategories(list);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadJobs(1); }, [loadJobs]);

  const handlePageChange = useCallback((newPage) => {
    loadJobs(newPage, searchTerm, pagination.limit);
  }, [loadJobs, searchTerm, pagination.limit]);

  const handlePageSizeChange = useCallback((newSize) => {
    loadJobs(1, searchTerm, newSize);
  }, [loadJobs, searchTerm]);

  const handleEdit = useCallback((job) => {
    setEditingId(job._id);
    setForm({
      title: job.title || "",
      company_name: job.company_name || "",
      location: job.location || "",
      job_type: job.job_type || "",
      salary_min: job.salary_min ?? "",
      salary_max: job.salary_max ?? "",
      currency: job.currency || "USD",
      description: job.description || "",
      contact_email: job.contact_email || "",
      contact_phone: job.contact_phone || "",
      category: job.category || "",
      status: job.status || "draft",
    });
    setShowForm(true);
  }, []);

  const resetForm = () => { setForm(emptyForm); setEditingId(""); setShowForm(false); };

  const updateField = (e) => { const { name, value } = e.target; setForm((p) => ({ ...p, [name]: value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, salary_min: Number(form.salary_min || 0), salary_max: Number(form.salary_max || 0) };
      const endpoint = isEditing ? `/admin/jobs/${editingId}` : "/admin/jobs";
      const response = await (isEditing ? axiosInstance.patch(endpoint, payload) : axiosInstance.post(endpoint, payload));
      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? t("admin.jobUpdated") || "Job updated" : t("admin.jobCreated") || "Job created");
        resetForm();
        loadJobs(pagination.currentPage);
      }
    } catch (err) {
      console.error(err);
      toast.error(t("admin.jobSaveError") || "Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = useCallback((job) => { setDeleteTarget(job); setConfirmOpen(true); }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const resp = await axiosInstance.delete(`/admin/jobs/${deleteTarget._id}`);
      if (resp.status === 200) {
        toast.success(t("admin.jobDeleted") || "Job deleted");
        await loadJobs(pagination.currentPage);
      }
    } catch (err) {
      console.error(err);
      toast.error(t("admin.jobDeleteError") || "Failed to delete job");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, loadJobs, pagination.currentPage, t]);

  const handleSearch = useCallback((term) => { setSearchTerm(term); loadJobs(1, term); }, [loadJobs]);

  const tableColumns = React.useMemo(() => [
    { key: "title", title: t("jobs.title") || "Title", type: "text", render: (j) => j.title },
    { key: "company", title: t("jobs.company") || "Company", type: "text", render: (j) => j.company_name },
    { key: "location", title: t("jobs.location") || "Location", type: "text", render: (j) => j.location || "-" },
    { key: "type", title: t("jobs.type") || "Type", type: "text", render: (j) => j.job_type || "-" },
    { key: "salary", title: t("jobs.salary") || "Salary", type: "text", render: (j) => `${j.currency || "USD"} ${j.salary_min || ""} - ${j.salary_max || ""}` },
    { key: "actions", title: t("common.actions") || "Actions", type: "actions" },
  ], [t]);

  const tableActions = React.useMemo(() => [
    { icon: Pencil, label: t("common.edit") || "Edit", onClick: handleEdit, variant: "edit" },
    { icon: Trash2, label: t("common.delete") || "Delete", onClick: requestDelete, variant: "delete" },
  ], [handleEdit, requestDelete, t]);

  return (
    <div className="admin_page categories-container">
      <header className="admin_page_header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#1e293b", margin: 0 }}>{t("admin.manageJobs") || "Manage Jobs"}</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>{t("admin.jobsTotal")}: {pagination.totalItems}</p>
        </div>
        <button className="submit-btn-premium" style={{ width: "auto", padding: "10px 24px" }} onClick={() => setShowForm(true)}>
          <Plus size={18} />
          {t("admin.createJob") || "Create Job"}
        </button>
      </header>

      <div className="admin_page_body">
        <section className="dashboard-section">
          <div className="dashboard-header">
            <div className="dashboard-controls" />
            <div className="search-container">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input type="text" placeholder={t("admin.searchJobs") || "Search jobs"} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" style={{ paddingLeft: "40px", width: "256px" }} />
              </div>
            </div>
          </div>

          <DynamicTable
            data={jobs}
            loading={loading}
            emptyMessage={t("admin.noJobsFound") || "No jobs found"}
            loadingMessage={t("admin.loadingJobs") || "Loading jobs..."}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            cacheKey="jobs-management"
            cacheTTL={30000}
            title={t("admin.jobs")}
            subtitle={`${jobs.length} ${t("admin.jobsTotal")}`}
            searchable={true}
            searchPlaceholder={t("admin.searchJobsById")}
            searchMode="server"
            onSearch={handleSearch}
            searchDebounceMs={500}
            onRefresh={() => loadJobs(pagination.currentPage, searchTerm, pagination.limit)}
            columns={tableColumns}
            actions={tableActions}
          />
        </section>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="admin_dialog_content admin_dialog_large">
            <DialogHeader>
              <DialogTitle>{isEditing ? t("admin.editJob") : t("admin.createJob")}</DialogTitle>
            </DialogHeader>
            <JobForm isEditing={isEditing} form={form} categories={categories} updateField={updateField} handleSubmit={handleSubmit} resetForm={resetForm} saving={saving} t={t} />
          </DialogContent>
        </Dialog>
      </div>

      <ConfirmDialog open={confirmOpen} title={deleteTarget ? `${t("admin.deleteJobTitle")} ${deleteTarget?.title || ""}?` : t("admin.deleteJobTitle")} message={t("admin.deleteJobConfirm")} confirmText={deleting ? t("admin.deleting") : t("dialog.delete")} cancelText={t("dialog.cancel")} onConfirm={handleDelete} onCancel={() => { if (!deleting) { setConfirmOpen(false); setDeleteTarget(null); } }} loading={deleting} type="danger" />
    </div>
  );
};

export default JobsManagement;

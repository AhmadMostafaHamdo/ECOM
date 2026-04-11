import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../api";
import DialogComponent from "./DialogComponent";
import { 
    Flag, 
    RefreshCw, 
    Eye, 
    Trash2, 
    Package, 
    User,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import ReportsStats from "./reports/ReportsStats";
import ReportsDetailModal from "./reports/ReportsDetailModal";
import "./ReportsManagement.css";
import { toast } from "react-toastify";

const STATUS_COLORS = {
    pending: { bg: "#fff7ed", text: "#c2410c", dot: "#f97316" },
    reviewed: { bg: "#f0f9ff", text: "#0369a1", dot: "#0ea5e9" },
    resolved: { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e" },
    dismissed: { bg: "#f8fafc", text: "#475569", dot: "#94a3b8" },
};

const ReportsManagement = () => {
    const { t, i18n } = useTranslation();

    const isRtl = i18n.dir() === "rtl";
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
    const [filterStatus, setFilterStatus] = useState("");
    const [filterType, setFilterType] = useState("");
    const [selectedReport, setSelectedReport] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [adminNote, setAdminNote] = useState("");
    const [updating, setUpdating] = useState(false);

    const loadReports = useCallback(async (page = 1, status = "", type = "") => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (status) params.status = status;
            if (type) params.targetType = type;
            const res = await axiosInstance.get("/admin/reports", { params });
            if (res.status === 200) {
                const data = res.data;
                setReports(data.data || []);
                setPagination({
                    totalItems: data.total || 0,
                    totalPages: data.total_pages || 1,
                    currentPage: data.page || 1,
                    limit: data.limit || 10
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadStats = useCallback(async () => {
        try {
            const res = await axiosInstance.get("/admin/reports/stats");
            if (res.status === 200) setStats(res.data);
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        loadReports(1, filterStatus, filterType);
        loadStats();
    }, [loadReports, loadStats, filterStatus, filterType]);

    const handleUpdateStatus = async (reportId, newStatus) => {
        setUpdating(true);
        try {
            const res = await axiosInstance.patch(`/admin/reports/${reportId}`, {
                status: newStatus,
                adminNote
            });
            if (res.status === 200) {
                toast.success(t("admin.reports.statusUpdateSuccess") || "تم تحديث الحالة بنجاح");
                loadReports(pagination.currentPage, filterStatus, filterType);
                loadStats();
                setDetailOpen(false);
                setSelectedReport(null);
            }
        } catch (e) {
            console.error(e);
            toast.error(t("admin.reports.statusUpdateError") || "فشل تحديث الحالة");
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await axiosInstance.delete(`/admin/reports/${deleteTarget._id}`);
            if (res.status === 200) {
                toast.success(t("admin.reports.deleteSuccess") || "تم حذف البلاغ بنجاح");
                loadReports(pagination.currentPage, filterStatus, filterType);
                loadStats();
            }
        } catch (e) {
            console.error(e);
            toast.error(t("admin.reports.deleteError") || "فشل حذف البلاغ");
        } finally {
            setConfirmDeleteOpen(false);
            setDeleteTarget(null);
        }
    };

    const openDetail = (report) => {
        setSelectedReport(report);
        setAdminNote(report.adminNote || "");
        setDetailOpen(true);
    };

    return (
        <div className="reports-container" style={{ direction: isRtl ? "rtl" : "ltr" }}>
            {/* Header */}
            <header className="admin_page_header" style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="messages-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
                        <Flag size={32} color="#ff9d00" />
                        {t("admin.reports.title")}
                    </h1>
                    <p className="messages-subtitle" style={{ margin: "4px 0 0" }}>
                        {t("admin.reports.subtitle")}
                    </p>
                </div>
                <button
                    className="submit-btn-premium"
                    style={{ width: "auto", padding: "10px 24px" }}
                    onClick={() => { loadReports(1, filterStatus, filterType); loadStats(); }}
                >
                    <RefreshCw size={18} />
                    {t("admin.reports.refresh")}
                </button>
            </header>

            {/* Stats */}
            <ReportsStats stats={stats} />

            {/* Filters */}
            <div className="messages-controls" style={{ background: "#fff", borderRadius: "16px", padding: "1.25rem", border: "1px solid #e2e8f0" }}>
                <div className="search-filter-group">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                        style={{ minWidth: "200px" }}
                    >
                        <option value="">{t("admin.reports.allStatus")}</option>
                        <option value="pending">{t("admin.reports.status.pending")}</option>
                        <option value="reviewed">{t("admin.reports.status.reviewed")}</option>
                        <option value="resolved">{t("admin.reports.status.resolved")}</option>
                        <option value="dismissed">{t("admin.reports.status.dismissed")}</option>
                    </select>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="filter-select"
                        style={{ minWidth: "200px" }}
                    >
                        <option value="">{t("admin.reports.allTypes")}</option>
                        <option value="product">{t("admin.reports.productReports")}</option>
                        <option value="user">{t("admin.reports.userReports")}</option>
                    </select>
                </div>

                <div className="stat-item">
                    <AlertCircle size={18} />
                    <span>{pagination.totalItems} {t("admin.reports.total")}</span>
                </div>
            </div>

            {/* Table */}
            <div className="reports-table-wrapper">
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>{t("admin.reports.loading")}</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="empty-state">
                        <Flag size={64} color="#e2e8f0" style={{ marginBottom: "1rem" }} />
                        <h3 style={{ color: "#64748b" }}>{t("admin.reports.noReports")}</h3>
                    </div>
                ) : (
                    <table className="reports-table">
                        <thead>
                            <tr>
                                {["type", "reported", "reporter", "reason", "status", "date", "actions"].map((h) => (
                                    <th key={h}>{t(`admin.reports.${h}`)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => {
                                const sc = STATUS_COLORS[report.status] || STATUS_COLORS.pending;
                                return (
                                    <tr key={report._id}>
                                        <td>
                                            <span className="status-badge" style={{
                                                background: report.targetType === "product" ? "#f5f3ff" : "#fdf2f8",
                                                color: report.targetType === "product" ? "#7c3aed" : "#db2777",
                                                display: "inline-flex", alignItems: "center", gap: "6px"
                                            }}>
                                                {report.targetType === "product" ? <Package size={14} /> : <User size={14} />}
                                                {report.targetType === "product" ? t("report.product") : t("report.user")}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: "700", color: "#1e293b" }}>
                                            {report.targetInfo?.name && report.targetInfo.name !== "منتج محذوف" && report.targetInfo.name !== "مستخدم محذوف"
                                                ? report.targetInfo.name
                                                : (report.targetType === "product" ? t("admin.reports.deletedProduct") : t("admin.reports.deletedUser"))}
                                            {report.targetInfo?.email && (
                                                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "400", marginTop: "2px" }}>{report.targetInfo.email}</div>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: "600" }}>{report.reporter?.fname || t("admin.reports.unknown")}</div>
                                            {report.reporter?.email && (
                                                <div style={{ fontSize: "11px", color: "#64748b" }}>{report.reporter.email}</div>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{ color: "#ef4444", fontWeight: "700", fontSize: "0.85rem" }}>
                                                {t(`report.reasons.${report.reason}`) || report.reason}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="status-badge" style={{ background: sc.bg, color: sc.text, display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: sc.dot }} />
                                                {t(`admin.reports.status.${report.status}`)}
                                            </span>
                                        </td>
                                        <td style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "600" }}>
                                            {new Date(report.createdAt).toLocaleDateString(i18n.language === "ar" ? "ar-SA" : "en-US")}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <button
                                                    className="pagination-btn"
                                                    style={{ padding: "8px" }}
                                                    onClick={() => openDetail(report)}
                                                    title={t("admin.reports.details")}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    style={{ padding: "8px" }}
                                                    onClick={() => { setDeleteTarget(report); setConfirmDeleteOpen(true); }}
                                                    title={t("common.delete")}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        disabled={pagination.currentPage === 1}
                        onClick={() => loadReports(pagination.currentPage - 1, filterStatus, filterType)}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="pagination-info">{pagination.currentPage} / {pagination.totalPages}</span>
                    <button
                        className="pagination-btn"
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => loadReports(pagination.currentPage + 1, filterStatus, filterType)}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}


            {/* Detail Modal */}
            <ReportsDetailModal
                detailOpen={detailOpen}
                setDetailOpen={setDetailOpen}
                selectedReport={selectedReport}
                adminNote={adminNote}
                setAdminNote={setAdminNote}
                updating={updating}
                handleUpdateStatus={handleUpdateStatus}
                STATUS_COLORS={STATUS_COLORS}
            />

            {/* Delete Confirm */}
            <DialogComponent
                open={confirmDeleteOpen}
                title={t("admin.reports.deleteTitle")}
                description={t("admin.reports.deleteConfirm")}
                confirmLabel={t("common.delete")}
                cancelLabel={t("common.cancel")}
                tone="danger"
                placement="center"
                onConfirm={handleDelete}
                onClose={() => { setConfirmDeleteOpen(false); setDeleteTarget(null); }}
            />
        </div>
    );
};

export default ReportsManagement;

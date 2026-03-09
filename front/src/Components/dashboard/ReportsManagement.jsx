import React, { useCallback, useEffect, useState } from "react";
import { axiosInstance } from "../../api";
import DialogComponent from "./DialogComponent";

const STATUS_COLORS = {
    pending: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
    reviewed: { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
    resolved: { bg: "#dcfce7", text: "#166534", dot: "#22c55e" },
    dismissed: { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
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
                loadReports(pagination.currentPage, filterStatus, filterType);
                loadStats();
                setDetailOpen(false);
                setSelectedReport(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await axiosInstance.delete(`/admin/reports/${deleteTarget._id}`);
            if (res.status === 200) {
                loadReports(pagination.currentPage, filterStatus, filterType);
                loadStats();
            }
        } catch (e) {
            console.error(e);
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
        <div className="admin_page" style={{ background: "transparent", direction: isRtl ? "rtl" : "ltr" }}>
            {/* Header */}
            <header style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f1729", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                        <Flag size={24} color="#ef4444" />
                        {t("admin.reports.title")}
                    </h1>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                        {t("admin.reports.subtitle")}
                    </p>
                </div>
                <button
                    onClick={() => { loadReports(1, filterStatus, filterType); loadStats(); }}
                    style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "10px 20px", borderRadius: "10px",
                        border: "1px solid #e2e8f0", background: "#fff",
                        color: "#475569", cursor: "pointer", fontWeight: "600", fontSize: "14px"
                    }}
                >
                    <RefreshCw size={16} />
                    {t("admin.reports.refresh")}
                </button>
            </header>

            {/* Stats */}
            <ReportsStats stats={stats} />

            {/* Filters */}
            <div style={{ background: "#fff", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px", display: "flex", gap: "16px", alignItems: "center", border: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", color: "#374151", background: "#f8fafc", cursor: "pointer" }}
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
                    style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", color: "#374151", background: "#f8fafc", cursor: "pointer" }}
                >
                    <option value="">{t("admin.reports.allTypes")}</option>
                    <option value="product">{t("admin.reports.productReports")}</option>
                    <option value="user">{t("admin.reports.userReports")}</option>
                </select>

                <span style={{ fontSize: "13px", color: "#94a3b8", [isRtl ? "marginRight" : "marginLeft"]: "auto" }}>
                    {pagination.totalItems} {t("admin.reports.total")}
                </span>
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                {loading ? (
                    <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
                        <div style={{ fontSize: "16px" }}>{t("admin.reports.loading")}</div>
                    </div>
                ) : reports.length === 0 ? (
                    <div style={{ padding: "60px", textAlign: "center" }}>
                        <Flag size={48} color="#e2e8f0" style={{ marginBottom: "12px" }} />
                        <p style={{ color: "#94a3b8", fontSize: "16px" }}>{t("admin.reports.noReports")}</p>
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                {["type", "reported", "reporter", "reason", "status", "date", "actions"].map((h) => (
                                    <th key={h} style={{ padding: "14px 16px", textAlign: isRtl ? "right" : "left", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        {t(`admin.reports.${h}`)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, i) => {
                                const sc = STATUS_COLORS[report.status] || STATUS_COLORS.pending;
                                return (
                                    <tr
                                        key={report._id}
                                        style={{ borderBottom: i < reports.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 0.15s" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: "6px",
                                                padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700",
                                                background: report.targetType === "product" ? "#ede9fe" : "#fce7f3",
                                                color: report.targetType === "product" ? "#7c3aed" : "#be185d",
                                            }}>
                                                {report.targetType === "product" ? <Package size={12} /> : <User size={12} />}
                                                {report.targetType === "product" ? t("report.product") : t("report.user")}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151", fontWeight: "600" }}>
                                            {report.targetInfo?.name && report.targetInfo.name !== "منتج محذوف" && report.targetInfo.name !== "مستخدم محذوف"
                                                ? report.targetInfo.name
                                                : (report.targetType === "product" ? t("admin.reports.deletedProduct") : t("admin.reports.deletedUser"))}
                                            {report.targetInfo?.email && (
                                                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{report.targetInfo.email}</div>
                                            )}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151" }}>
                                            {report.reporter?.fname || t("admin.reports.unknown")}
                                            {report.reporter?.email && (
                                                <div style={{ fontSize: "11px", color: "#94a3b8" }}>{report.reporter.email}</div>
                                            )}
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{ fontSize: "13px", color: "#ef4444", fontWeight: "600" }}>
                                                {t(`report.reasons.${report.reason}`) || report.reason}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: "6px",
                                                padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700",
                                                background: sc.bg, color: sc.text,
                                            }}>
                                                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc.dot }} />
                                                {t(`admin.reports.status.${report.status}`)}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "12px", color: "#94a3b8" }}>
                                            {new Date(report.createdAt).toLocaleDateString(i18n.language === "ar" ? "ar-SA" : "en-US")}
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button
                                                    onClick={() => openDetail(report)}
                                                    title={t("admin.reports.details")}
                                                    style={{ padding: "6px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#3b82f6", display: "flex", alignItems: "center" }}
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button
                                                    onClick={() => { setDeleteTarget(report); setConfirmDeleteOpen(true); }}
                                                    title={t("common.delete")}
                                                    style={{ padding: "6px", borderRadius: "8px", border: "1px solid #fee2e2", background: "#fff", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center" }}
                                                >
                                                    <Trash2 size={15} />
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
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => loadReports(p, filterStatus, filterType)}
                            style={{
                                width: "36px", height: "36px", borderRadius: "8px",
                                border: p === pagination.currentPage ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                                background: p === pagination.currentPage ? "#eff6ff" : "#fff",
                                color: p === pagination.currentPage ? "#3b82f6" : "#374151",
                                fontWeight: "700", cursor: "pointer", fontSize: "14px"
                            }}
                        >
                            {p}
                        </button>
                    ))}
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

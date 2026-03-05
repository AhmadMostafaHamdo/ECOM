import React, { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../../api";
import DialogComponent from "./DialogComponent";
import {
    Flag,
    User,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Trash2,
    AlertTriangle,
    RefreshCw,
} from "lucide-react";

const STATUS_COLORS = {
    pending: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
    reviewed: { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
    resolved: { bg: "#dcfce7", text: "#166534", dot: "#22c55e" },
    dismissed: { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
};

const STATUS_LABELS = {
    pending: "قيد الانتظار",
    reviewed: "تمت المراجعة",
    resolved: "تم الحل",
    dismissed: "مرفوض",
};

const REASON_LABELS = {
    spam: "بريد مزعج",
    fake: "محتوى مزيف",
    inappropriate: "محتوى غير لائق",
    fraud: "احتيال",
    violence: "عنف",
    harassment: "تحرش أو مضايقة",
    misleading: "مضلل",
    other: "أخرى",
};

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div
        style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
        }}
    >
        <div
            style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: color + "20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
                flexShrink: 0,
            }}
        >
            <Icon size={22} />
        </div>
        <div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", lineHeight: 1 }}>
                {value}
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>{label}</div>
        </div>
    </div>
);

const ReportsManagement = () => {
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
            const params = new URLSearchParams({ page, limit: 10 });
            if (status) params.set("status", status);
            if (type) params.set("targetType", type);
            const res = await fetch(apiUrl(`/admin/reports?${params}`), {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to load reports");
            const data = await res.json();
            setReports(data.data || []);
            setPagination(data.pagination);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadStats = useCallback(async () => {
        try {
            const res = await fetch(apiUrl("/admin/reports/stats"), { credentials: "include" });
            if (res.ok) setStats(await res.json());
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
            const res = await fetch(apiUrl(`/admin/reports/${reportId}`), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: newStatus, adminNote }),
            });
            if (res.ok) {
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
            await fetch(apiUrl(`/admin/reports/${deleteTarget._id}`), {
                method: "DELETE",
                credentials: "include",
            });
            loadReports(pagination.currentPage, filterStatus, filterType);
            loadStats();
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
        <div className="admin_page" style={{ background: "transparent", direction: "rtl" }}>
            {/* Header */}
            <header style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f1729", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                        <Flag size={24} color="#ef4444" />
                        إدارة البلاغات
                    </h1>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                        مراجعة ومعالجة البلاغات المقدمة من المستخدمين
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
                    تحديث
                </button>
            </header>

            {/* Stats */}
            {stats && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "16px", marginBottom: "28px" }}>
                    <StatCard icon={Flag} label="إجمالي البلاغات" value={stats.total} color="#6366f1" />
                    <StatCard icon={Clock} label="قيد الانتظار" value={stats.pending} color="#f59e0b" />
                    <StatCard icon={Eye} label="تمت المراجعة" value={stats.reviewed} color="#3b82f6" />
                    <StatCard icon={CheckCircle} label="تم الحل" value={stats.resolved} color="#22c55e" />
                    <StatCard icon={Package} label="بلاغات المنتجات" value={stats.productReports} color="#8b5cf6" />
                    <StatCard icon={User} label="بلاغات المستخدمين" value={stats.userReports} color="#ec4899" />
                </div>
            )}

            {/* Filters */}
            <div style={{ background: "#fff", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px", display: "flex", gap: "16px", alignItems: "center", border: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", color: "#374151", background: "#f8fafc", cursor: "pointer" }}
                >
                    <option value="">كل الحالات</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="reviewed">تمت المراجعة</option>
                    <option value="resolved">تم الحل</option>
                    <option value="dismissed">مرفوض</option>
                </select>

                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", color: "#374151", background: "#f8fafc", cursor: "pointer" }}
                >
                    <option value="">كل أنواع البلاغات</option>
                    <option value="product">بلاغات المنتجات</option>
                    <option value="user">بلاغات المستخدمين</option>
                </select>

                <span style={{ fontSize: "13px", color: "#94a3b8", marginRight: "auto" }}>
                    {pagination.totalItems} بلاغ
                </span>
            </div>

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                {loading ? (
                    <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
                        <div style={{ fontSize: "16px" }}>جاري تحميل البلاغات...</div>
                    </div>
                ) : reports.length === 0 ? (
                    <div style={{ padding: "60px", textAlign: "center" }}>
                        <Flag size={48} color="#e2e8f0" style={{ marginBottom: "12px" }} />
                        <p style={{ color: "#94a3b8", fontSize: "16px" }}>لا توجد بلاغات</p>
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                {["النوع", "المُبلَّغ عنه", "المُبلِّغ", "السبب", "الحالة", "التاريخ", "الإجراءات"].map((h) => (
                                    <th key={h} style={{ padding: "14px 16px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        {h}
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
                                                {report.targetType === "product" ? "منتج" : "مستخدم"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151", fontWeight: "600" }}>
                                            {report.targetInfo?.name || "—"}
                                            {report.targetInfo?.email && (
                                                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{report.targetInfo.email}</div>
                                            )}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151" }}>
                                            {report.reporter?.fname || "مجهول"}
                                            {report.reporter?.email && (
                                                <div style={{ fontSize: "11px", color: "#94a3b8" }}>{report.reporter.email}</div>
                                            )}
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{ fontSize: "13px", color: "#ef4444", fontWeight: "600" }}>
                                                {REASON_LABELS[report.reason] || report.reason}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: "6px",
                                                padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700",
                                                background: sc.bg, color: sc.text,
                                            }}>
                                                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc.dot }} />
                                                {STATUS_LABELS[report.status]}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "12px", color: "#94a3b8" }}>
                                            {new Date(report.createdAt).toLocaleDateString("ar-SA")}
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button
                                                    onClick={() => openDetail(report)}
                                                    title="عرض التفاصيل"
                                                    style={{ padding: "6px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", color: "#3b82f6", display: "flex", alignItems: "center" }}
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button
                                                    onClick={() => { setDeleteTarget(report); setConfirmDeleteOpen(true); }}
                                                    title="حذف البلاغ"
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
            {detailOpen && selectedReport && (
                <div
                    onClick={() => setDetailOpen(false)}
                    style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 9999, padding: "20px"
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff", borderRadius: "20px",
                            width: "100%", maxWidth: "560px",
                            maxHeight: "90vh", overflowY: "auto",
                            padding: "28px", direction: "rtl"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>تفاصيل البلاغ</h2>
                            <button onClick={() => setDetailOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#94a3b8" }}>✕</button>
                        </div>

                        <div style={{ display: "grid", gap: "16px" }}>
                            <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px" }}>
                                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", fontWeight: "700" }}>معلومات البلاغ</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div>
                                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>النوع</span>
                                        <p style={{ margin: "2px 0 0", fontWeight: "700", color: "#374151", fontSize: "14px" }}>
                                            {selectedReport.targetType === "product" ? "🛍️ منتج" : "👤 مستخدم"}
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>السبب</span>
                                        <p style={{ margin: "2px 0 0", fontWeight: "700", color: "#ef4444", fontSize: "14px" }}>
                                            {REASON_LABELS[selectedReport.reason] || selectedReport.reason}
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>المُبلَّغ عنه</span>
                                        <p style={{ margin: "2px 0 0", fontWeight: "700", color: "#374151", fontSize: "14px" }}>
                                            {selectedReport.targetInfo?.name || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>المُبلِّغ</span>
                                        <p style={{ margin: "2px 0 0", fontWeight: "700", color: "#374151", fontSize: "14px" }}>
                                            {selectedReport.reporter?.fname || "مجهول"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {selectedReport.description && (
                                <div style={{ background: "#fef9c3", borderRadius: "12px", padding: "16px", border: "1px solid #fde68a" }}>
                                    <div style={{ fontSize: "12px", color: "#92400e", marginBottom: "6px", fontWeight: "700" }}>تفاصيل البلاغ</div>
                                    <p style={{ margin: 0, fontSize: "14px", color: "#78350f", lineHeight: 1.6 }}>{selectedReport.description}</p>
                                </div>
                            )}

                            <div>
                                <label style={{ fontSize: "13px", fontWeight: "700", color: "#374151", display: "block", marginBottom: "8px" }}>
                                    ملاحظة الإدارة
                                </label>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    rows={3}
                                    placeholder="اكتب ملاحظة..."
                                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                                />
                            </div>

                            <div style={{ fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>تغيير الحالة</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                {["reviewed", "resolved", "dismissed", "pending"].map((s) => {
                                    const sc = STATUS_COLORS[s];
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => handleUpdateStatus(selectedReport._id, s)}
                                            disabled={updating || selectedReport.status === s}
                                            style={{
                                                padding: "10px 16px", borderRadius: "10px",
                                                border: `2px solid ${selectedReport.status === s ? sc.dot : "#e2e8f0"}`,
                                                background: selectedReport.status === s ? sc.bg : "#f8fafc",
                                                color: selectedReport.status === s ? sc.text : "#64748b",
                                                fontWeight: "700", cursor: selectedReport.status === s ? "default" : "pointer",
                                                fontSize: "13px", transition: "all 0.2s"
                                            }}
                                        >
                                            {STATUS_LABELS[s]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            <DialogComponent
                open={confirmDeleteOpen}
                title="حذف البلاغ"
                description="هل أنت متأكد من حذف هذا البلاغ؟ لا يمكن التراجع عن هذا الإجراء."
                confirmLabel="حذف"
                cancelLabel="إلغاء"
                tone="danger"
                placement="center"
                onConfirm={handleDelete}
                onClose={() => { setConfirmDeleteOpen(false); setDeleteTarget(null); }}
            />
        </div>
    );
};

export default ReportsManagement;

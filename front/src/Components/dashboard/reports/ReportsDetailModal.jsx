import React from 'react';
import { useTranslation } from "react-i18next";
import { X, ClipboardList, AlertTriangle, User, ExternalLink, MessageSquare } from "lucide-react";

const ReportsDetailModal = ({
    detailOpen,
    setDetailOpen,
    selectedReport,
    adminNote,
    setAdminNote,
    updating,
    handleUpdateStatus,
    STATUS_COLORS,
}) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === "rtl";

    if (!detailOpen || !selectedReport) return null;

    return (
        <div className="report-details-overlay" onClick={() => setDetailOpen(false)}>
            <div className="report-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-head">
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                        <ClipboardList size={22} color="#ff9d00" />
                        {t("admin.reports.reportDetails")}
                    </h2>
                    <button className="modal-close" onClick={() => setDetailOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-content">
                    <div className="report-meta-box">
                        <div className="meta-item">
                            <label>{t("admin.reports.type")}</label>
                            <span style={{color: selectedReport.targetType === 'product' ? '#7c3aed' : '#db2777'}}>
                                {selectedReport.targetType === "product" ? t("report.product") : t("report.user")}
                            </span>
                        </div>
                        <div className="meta-item">
                            <label>{t("admin.reports.reason")}</label>
                            <span style={{ color: "#ef4444" }}>
                                {t(`report.reasons.${selectedReport.reason}`) || selectedReport.reason}
                            </span>
                        </div>
                        <div className="meta-item">
                            <label>{t("admin.reports.reported")}</label>
                            <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                <span style={{fontWeight: '800'}}>
                                    {selectedReport.targetInfo?.name && selectedReport.targetInfo.name !== "منتج محذوف" && selectedReport.targetInfo.name !== "مستخدم محذوف"
                                        ? selectedReport.targetInfo.name
                                        : (selectedReport.targetType === "product" ? t("admin.reports.deletedProduct") : t("admin.reports.deletedUser"))}
                                </span>
                            </div>
                        </div>
                        <div className="meta-item">
                            <label>{t("admin.reports.reporter")}</label>
                            <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                <span style={{fontWeight: '800'}}>
                                    {selectedReport.reporter?.fname || t("admin.reports.unknown")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {selectedReport.description && (
                        <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "16px", padding: "1.25rem", marginBottom: "2rem" }}>
                            <div style={{ fontSize: "0.75rem", color: "#b45309", marginBottom: "0.75rem", fontWeight: "800", textTransform: "uppercase", display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MessageSquare size={14} />
                                {t("admin.reports.reportDescription")}
                            </div>
                            <p style={{ margin: 0, fontSize: "1rem", color: "#78350f", lineHeight: 1.6, fontWeight: '500' }}>{selectedReport.description}</p>
                        </div>
                    )}

                    <div style={{ marginBottom: "2rem" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: "800", color: "#475569", display: "block", marginBottom: "0.75rem", textTransform: 'uppercase' }}>
                            {t("admin.reports.adminNote")}
                        </label>
                        <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={3}
                            placeholder={t("admin.reports.writeNote")}
                            className="search-input"
                            style={{ padding: '1rem', height: 'auto', minHeight: '100px', resize: 'vertical' }}
                        />
                    </div>

                    <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#475569", marginBottom: "1rem", textTransform: 'uppercase' }}>
                            {t("admin.reports.changeStatus")}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            {["reviewed", "resolved", "dismissed", "pending"].map((s) => {
                                const sc = STATUS_COLORS[s];
                                return (
                                    <button
                                        key={s}
                                        onClick={() => handleUpdateStatus(selectedReport._id, s)}
                                        disabled={updating || selectedReport.status === s}
                                        className="filter-select"
                                        style={{
                                            padding: "12px",
                                            background: selectedReport.status === s ? sc.bg : "#fff",
                                            borderColor: selectedReport.status === s ? sc.dot : "#e2e8f0",
                                            color: selectedReport.status === s ? sc.text : "#64748b",
                                            fontSize: "0.85rem",
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: sc.dot }} />
                                        {t(`admin.reports.status.${s}`)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsDetailModal;


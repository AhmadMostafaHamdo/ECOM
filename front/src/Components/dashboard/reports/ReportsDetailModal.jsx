import React from 'react';
import { useTranslation } from "react-i18next";

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
                    padding: "28px", direction: isRtl ? "rtl" : "ltr"
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>{t("admin.reports.reportDetails")}</h2>
                    <button onClick={() => setDetailOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#94a3b8" }}>✕</button>
                </div>

                <div style={{ display: "grid", gap: "16px" }}>
                    <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px" }}>
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", fontWeight: "700" }}>{t("admin.reports.reportInfo")}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                                <span style={{ fontSize: "12px", color: "#94a3b8" }}>{t("admin.reports.type")}</span>
                                <p style={{ margin: "2px 0 0", fontWeight: "700", color: "#374151", fontSize: "14px" }}>
                                    {selectedReport.targetType === "product" ? `🛍️ ${t("report.product")}` : `👤 ${t("report.user")}`}
                                </p>
                            </div>
                            <div>
                                <span style={{ fontSize: "12px", color: "#94a3b8" }}>{t("admin.reports.reason")}</span>
                                <p style={{ margin: "2px 0 0", fontWeight: "700", color: "#ef4444", fontSize: "14px" }}>
                                    {t(`report.reasons.${selectedReport.reason}`) || selectedReport.reason}
                                </p>
                            </div>
                            <div>
                                <span style={{ fontSize: "12px", color: "#94a3b8" }}>{t("admin.reports.reported")}</span>
                                <p style={{ margin: "2px 0 0", fontWeight: "700", color: "#374151", fontSize: "14px" }}>
                                    {selectedReport.targetInfo?.name && selectedReport.targetInfo.name !== "منتج محذوف" && selectedReport.targetInfo.name !== "مستخدم محذوف"
                                        ? selectedReport.targetInfo.name
                                        : (selectedReport.targetType === "product" ? t("admin.reports.deletedProduct") : t("admin.reports.deletedUser"))}
                                </p>
                            </div>
                            <div>
                                <span style={{ fontSize: "12px", color: "#94a3b8" }}>{t("admin.reports.reporter")}</span>
                                <p style={{ margin: "2px 0 0", fontWeight: "700", color: "#374151", fontSize: "14px" }}>
                                    {selectedReport.reporter?.fname || t("admin.reports.unknown")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {selectedReport.description && (
                        <div style={{ background: "#fef9c3", borderRadius: "12px", padding: "16px", border: "1px solid #fde68a" }}>
                            <div style={{ fontSize: "12px", color: "#92400e", marginBottom: "6px", fontWeight: "700" }}>{t("admin.reports.reportDetails")}</div>
                            <p style={{ margin: 0, fontSize: "14px", color: "#78350f", lineHeight: 1.6 }}>{selectedReport.description}</p>
                        </div>
                    )}

                    <div>
                        <label style={{ fontSize: "13px", fontWeight: "700", color: "#374151", display: "block", marginBottom: "8px" }}>
                            {t("admin.reports.adminNote")}
                        </label>
                        <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={3}
                            placeholder={t("admin.reports.writeNote")}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", textAlign: isRtl ? "right" : "left" }}
                        />
                    </div>

                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>{t("admin.reports.changeStatus")}</div>
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
                                    {t(`admin.reports.status.${s}`)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsDetailModal;

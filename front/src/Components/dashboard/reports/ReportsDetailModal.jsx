import React from 'react';

const ReportsDetailModal = ({
    detailOpen,
    setDetailOpen,
    selectedReport,
    adminNote,
    setAdminNote,
    updating,
    handleUpdateStatus,
    REASON_LABELS,
    STATUS_LABELS,
    STATUS_COLORS,
}) => {
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
    );
};

export default ReportsDetailModal;

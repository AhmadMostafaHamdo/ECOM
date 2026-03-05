import React from "react";
import DialogComponent from "../DialogComponent";

const UserBanDialog = ({
    banDialogOpen, setBanDialogOpen,
    banTarget,
    banReason, setBanReason,
    handleBanUser, banning
}) => {
    if (!banDialogOpen) return null;

    return (
        <div
            onClick={() => setBanDialogOpen(false)}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "20px",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff",
                    borderRadius: "20px",
                    padding: "28px",
                    width: "100%",
                    maxWidth: "440px",
                    direction: "rtl",
                }}
            >
                <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px" }}>
                    حظر المستخدم
                </h2>
                <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px" }}>
                    هل تريد حظر <strong>{banTarget?.fname}</strong>؟ لن يتمكن من تسجيل الدخول.
                </p>
                <div style={{ marginBottom: "20px" }}>
                    <label
                        style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#374151",
                            display: "block",
                            marginBottom: "8px",
                        }}
                    >
                        سبب الحظر
                    </label>
                    <input
                        type="text"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="انتهاك شروط الخدمة..."
                        style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            boxSizing: "border-box",
                        }}
                    />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={() => setBanDialogOpen(false)}
                        style={{
                            flex: 1,
                            padding: "11px",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                            color: "#64748b",
                            cursor: "pointer",
                            fontWeight: "700",
                            fontSize: "14px",
                        }}
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleBanUser}
                        disabled={banning}
                        style={{
                            flex: 1,
                            padding: "11px",
                            borderRadius: "10px",
                            border: "none",
                            background: "linear-gradient(135deg, #ef4444, #dc2626)",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: "700",
                            fontSize: "14px",
                        }}
                    >
                        {banning ? "جاري الحظر..." : "تأكيد الحظر"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(UserBanDialog);

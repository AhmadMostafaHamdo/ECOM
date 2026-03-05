import React, { useState } from "react";
import { apiUrl } from "../../api";
import { Flag, X, AlertTriangle, CheckCircle } from "lucide-react";
import "./ReportModal.css";

const REASONS = [
    { value: "spam", label: "بريد مزعج أو إعلانات" },
    { value: "fake", label: "محتوى مزيف أو مضلل" },
    { value: "inappropriate", label: "محتوى غير لائق" },
    { value: "fraud", label: "احتيال أو نصب" },
    { value: "violence", label: "عنف أو تهديد" },
    { value: "harassment", label: "تحرش أو مضايقة" },
    { value: "misleading", label: "معلومات مضللة" },
    { value: "other", label: "أخرى" },
];

/**
 * ReportModal - يمكن استخدامه للإبلاغ عن منتج أو مستخدم
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   targetType: 'product' | 'user'
 *   targetId: string
 *   targetName: string (اسم المنتج أو المستخدم)
 */
const ReportModal = ({ open, onClose, targetType, targetId, targetName }) => {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) {
            setError("يرجى اختيار سبب البلاغ");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(apiUrl("/reports"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ targetType, targetId, reason, description }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "حدث خطأ");
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setReason("");
        setDescription("");
        setError("");
        setSuccess(false);
        onClose();
    };

    return (
        <div className="report-modal-overlay" onClick={handleClose}>
            <div className="report-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="report-modal-header">
                    <div className="report-modal-title">
                        <span className="report-modal-icon">
                            <Flag size={18} />
                        </span>
                        <span>الإبلاغ عن {targetType === "product" ? "منتج" : "مستخدم"}</span>
                    </div>
                    <button className="report-modal-close" onClick={handleClose}>
                        <X size={18} />
                    </button>
                </div>

                {success ? (
                    <div className="report-modal-success">
                        <CheckCircle size={48} color="#22c55e" />
                        <h3>تم إرسال البلاغ بنجاح</h3>
                        <p>شكراً لك! سيقوم فريقنا بمراجعة البلاغ في أقرب وقت.</p>
                        <button className="report-btn-primary" onClick={handleClose}>
                            إغلاق
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="report-modal-body">
                        <div className="report-target-badge">
                            <span>{targetType === "product" ? "🛍️ منتج:" : "👤 مستخدم:"}</span>
                            <strong>{targetName}</strong>
                        </div>

                        <div className="report-form-group">
                            <label className="report-form-label">سبب البلاغ *</label>
                            <div className="report-reasons-grid">
                                {REASONS.map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        className={`report-reason-btn ${reason === r.value ? "active" : ""}`}
                                        onClick={() => setReason(r.value)}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="report-form-group">
                            <label className="report-form-label">تفاصيل إضافية (اختياري)</label>
                            <textarea
                                className="report-textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="اشرح المشكلة بمزيد من التفصيل..."
                                rows={3}
                                maxLength={1000}
                            />
                            <span className="report-char-count">{description.length}/1000</span>
                        </div>

                        {error && (
                            <div className="report-error">
                                <AlertTriangle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="report-modal-footer">
                            <button type="button" className="report-btn-secondary" onClick={handleClose}>
                                إلغاء
                            </button>
                            <button type="submit" className="report-btn-primary" disabled={loading || !reason}>
                                {loading ? "جاري الإرسال..." : "إرسال البلاغ"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ReportModal;

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../api";
import { Flag, X, AlertTriangle, CheckCircle } from "lucide-react";
import "./ReportModal.css";

const ReportModal = ({ open, onClose, targetType, targetId, targetName }) => {
    const { t } = useTranslation();
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const reasons = [
        { value: "spam", label: t('report.reasons.spam') },
        { value: "fake", label: t('report.reasons.fake') },
        { value: "inappropriate", label: t('report.reasons.inappropriate') },
        { value: "fraud", label: t('report.reasons.fraud') },
        { value: "violence", label: t('report.reasons.violence') },
        { value: "harassment", label: t('report.reasons.harassment') },
        { value: "misleading", label: t('report.reasons.misleading') },
        { value: "other", label: t('report.reasons.other') },
    ];

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) {
            setError(t('report.selectReason'));
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await axiosInstance.post("/reports", {
                targetType,
                targetId,
                reason,
                description
            });

            if (res.status === 200 || res.status === 201) {
                setSuccess(true);
            }
        } catch (err) {
            setError(err.response?.data?.error || t('errors.somethingWentWrong'));
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
                        <span>{t('report.reportOn')} {t(`report.${targetType}`)}</span>
                    </div>
                    <button className="report-modal-close" onClick={handleClose}>
                        <X size={18} />
                    </button>
                </div>

                {success ? (
                    <div className="report-modal-success">
                        <CheckCircle size={48} color="#22c55e" />
                        <h3>{t('report.successTitle')}</h3>
                        <p>{t('report.successDesc')}</p>
                        <button className="report-btn-primary" onClick={handleClose}>
                            {t('common.close')}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="report-modal-body">
                        <div className="report-target-badge">
                            <span>{targetType === "product" ? t('report.targetProduct') : t('report.targetUser')}</span>
                            <strong>{targetName}</strong>
                        </div>

                        <div className="report-form-group">
                            <label className="report-form-label">{t('report.reasonLabel')}</label>
                            <div className="report-reasons-grid">
                                {reasons.map((r) => (
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
                            <label className="report-form-label">{t('report.additionalDetails')}</label>
                            <textarea
                                className="report-textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('report.placeholder')}
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
                                {t('common.cancel')}
                            </button>
                            <button type="submit" className="report-btn-primary" disabled={loading || !reason}>
                                {loading ? t('report.submitting') : t('report.submit')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ReportModal;

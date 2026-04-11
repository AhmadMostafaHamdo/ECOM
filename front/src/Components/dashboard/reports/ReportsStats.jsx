import React from 'react';
import { Flag, Clock, Eye, CheckCircle, Package, User } from "lucide-react";
import { useTranslation } from "react-i18next";

export const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="report-stat-card">
        <div className="report-stat-icon" style={{ background: color + "15", color }}>
            <Icon size={24} />
        </div>
        <div className="report-stat-info">
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
        </div>
    </div>
);

const ReportsStats = ({ stats }) => {
    const { t } = useTranslation();
    if (!stats) return null;

    return (
        <div className="reports-stats-grid">
            <StatCard icon={Flag} label={t("admin.reports.allTypes")} value={stats.total} color="#6366f1" />
            <StatCard icon={Clock} label={t("admin.reports.status.pending")} value={stats.pending} color="#f59e0b" />
            <StatCard icon={Eye} label={t("admin.reports.status.reviewed")} value={stats.reviewed} color="#3b82f6" />
            <StatCard icon={CheckCircle} label={t("admin.reports.status.resolved")} value={stats.resolved} color="#22c55e" />
            <StatCard icon={Package} label={t("admin.reports.productReports")} value={stats.productReports} color="#8b5cf6" />
            <StatCard icon={User} label={t("admin.reports.userReports")} value={stats.userReports} color="#ec4899" />
        </div>
    );
};

export default ReportsStats;


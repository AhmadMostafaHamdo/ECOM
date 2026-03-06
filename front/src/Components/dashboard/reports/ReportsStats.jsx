import React from 'react';
import { Flag, Clock, Eye, CheckCircle, Package, User } from "lucide-react";

export const StatCard = ({ icon: Icon, label, value, color }) => (
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

const ReportsStats = ({ stats }) => {
    if (!stats) return null;

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "16px", marginBottom: "28px" }}>
            <StatCard icon={Flag} label="إجمالي البلاغات" value={stats.total} color="#6366f1" />
            <StatCard icon={Clock} label="قيد الانتظار" value={stats.pending} color="#f59e0b" />
            <StatCard icon={Eye} label="تمت المراجعة" value={stats.reviewed} color="#3b82f6" />
            <StatCard icon={CheckCircle} label="تم الحل" value={stats.resolved} color="#22c55e" />
            <StatCard icon={Package} label="بلاغات المنتجات" value={stats.productReports} color="#8b5cf6" />
            <StatCard icon={User} label="بلاغات المستخدمين" value={stats.userReports} color="#ec4899" />
        </div>
    );
};

export default ReportsStats;

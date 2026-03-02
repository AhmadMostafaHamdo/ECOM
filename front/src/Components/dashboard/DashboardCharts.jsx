import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useTranslation } from "react-i18next";

const DashboardCharts = ({ stats }) => {
  const { t } = useTranslation();

  // Sample data for charts - in real app, this would come from API
  const monthlyData = [
    { month: "Jan", users: 120, products: 80, orders: 65 },
    { month: "Feb", users: 150, products: 95, orders: 78 },
    { month: "Mar", users: 180, products: 110, orders: 92 },
    { month: "Apr", users: 220, products: 125, orders: 108 },
    { month: "May", users: 260, products: 140, orders: 125 },
    { month: "Jun", users: 300, products: 160, orders: 145 }
  ];

  const categoryData = [
    { name: "Electronics", value: 35, color: "#3b82f6" },
    { name: "Clothing", value: 25, color: "#10b981" },
    { name: "Food", value: 20, color: "#f59e0b" },
    { name: "Books", value: 12, color: "#8b5cf6" },
    { name: "Other", value: 8, color: "#ef4444" }
  ];

  const userActivityData = [
    { day: "Mon", active: 45, new: 12 },
    { day: "Tue", active: 52, new: 18 },
    { day: "Wed", active: 48, new: 15 },
    { day: "Thu", active: 58, new: 22 },
    { day: "Fri", active: 65, new: 28 },
    { day: "Sat", active: 42, new: 8 },
    { day: "Sun", active: 38, new: 6 }
  ];

  const revenueData = [
    { month: "Jan", revenue: 45000 },
    { month: "Feb", revenue: 52000 },
    { month: "Mar", revenue: 48000 },
    { month: "Apr", revenue: 61000 },
    { month: "May", revenue: 58000 },
    { month: "Jun", revenue: 67000 }
  ];

  return (
    <div className="dashboard-charts">
      <div className="charts-grid">
        {/* Users & Products Growth Chart */}
        <div className="chart-card">
          <h3 className="chart-title">{t("admin.growthOverview")}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#ffffff", 
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px"
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                name={t("admin.totalUsers")}
              />
              <Line 
                type="monotone" 
                dataKey="products" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                name={t("admin.totalProducts")}
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: "#f59e0b", r: 4 }}
                name={t("admin.totalOrders")}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Categories Distribution */}
        <div className="chart-card">
          <h3 className="chart-title">{t("admin.categoriesDistribution")}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* User Activity */}
        <div className="chart-card">
          <h3 className="chart-title">{t("admin.userActivity")}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#ffffff", 
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px"
                }} 
              />
              <Legend />
              <Bar dataKey="active" fill="#3b82f6" name={t("admin.activeUsers")} />
              <Bar dataKey="new" fill="#10b981" name={t("admin.newUsers")} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="chart-card">
          <h3 className="chart-title">{t("admin.revenueTrend")}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#ffffff", 
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px"
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.3}
                name={t("admin.revenue")}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../api";
import { 
  Mail, 
  Trash2, 
  Eye, 
  Clock, 
  Reply, 
  AlertCircle,
  X,
  Info
} from "lucide-react";
import "./Messages.css";
import { toast } from "react-toastify";
import DynamicTable from "./DynamicTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import ConfirmDialog from "../common/ConfirmDialog";

const Messages = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchMessages = useCallback(async (page = 1, status = statusFilter, search = searchTerm) => {
    try {
      setLoading(true);
      const params = {
        page: page.toString(),
        limit: "10",
        status: status === "all" ? "" : status,
        search: search,
      };

      const response = await axiosInstance.get("/admin/contact/messages", { params });

      if (response.status === 200) {
        const data = response.data;
        setMessages(data.data || []);
        setPagination({
          totalItems: data.pagination?.totalItems || 0,
          totalPages: data.pagination?.totalPages || 1,
          currentPage: data.pagination?.currentPage || 1,
          limit: 10,
        });
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchMessages(1);
  }, [fetchMessages]);

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      setIsUpdating(true);
      const response = await axiosInstance.put(`/admin/contact/messages/${messageId}`, {
        status: newStatus
      });

      if (response.status === 200) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, status: newStatus } : msg,
          ),
        );

        if (selectedMessage && selectedMessage._id === messageId) {
          setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
        }
        toast.success(t("admin.messages.statusUpdated") || "Status updated successfully");
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      const response = await axiosInstance.delete(`/admin/contact/messages/${messageToDelete}`);

      if (response.status === 200) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageToDelete));
        setShowDeleteModal(false);
        setMessageToDelete(null);
        if (selectedMessage && selectedMessage._id === messageToDelete) {
          setSelectedMessage(null);
          setShowDetailDialog(false);
        }
        toast.success(t("admin.messages.deleted") || "Message deleted successfully");
        fetchMessages(pagination.currentPage);
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message);
      toast.error("Failed to delete message");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tableColumns = useMemo(() => [
    {
      key: "name",
      title: t("contact.nameLabel") || "Sender",
      type: "avatar",
      getAvatarText: (msg) => msg.name?.[0]?.toUpperCase() || "?",
      getName: (msg) => msg.name || "—",
      getSubtitle: (msg) => msg.email,
      sortable: true,
    },
    {
      key: "subject",
      title: t("contact.subjectLabel") || "Subject",
      sortable: true,
    },
    {
      key: "status",
      title: t("common.status") || "Status",
      type: "status",
      getStatusClass: (val) => val || "pending",
      getStatusText: (val) => t(`admin.messages.status.${val}`) || val,
      sortable: true,
    },
    {
      key: "createdAt",
      title: t("common.date") || "Date",
      type: "custom",
      render: (msg) => formatDate(msg.createdAt),
      sortable: true,
    },
    {
      key: "actions",
      title: t("common.actions") || "Actions",
      type: "actions",
    },
  ], [t, i18n.language]);

  const tableActions = useMemo(() => [
    {
      icon: Eye,
      label: t("common.view") || "View",
      onClick: (msg) => {
        setSelectedMessage(msg);
        setShowDetailDialog(true);
        if (msg.status === "pending") {
          handleStatusChange(msg._id, "read");
        }
      },
      variant: "edit",
    },
    {
      icon: Trash2,
      label: t("common.delete") || "Delete",
      onClick: (msg) => {
        setMessageToDelete(msg._id);
        setShowDeleteModal(true);
      },
      variant: "delete",
    },
  ], [t]);

  const tableFilters = useMemo(() => [
    {
      key: "status",
      label: t("common.status"),
      options: [
        { value: "all", label: t("admin.messages.allStatus") || "All Status" },
        { value: "pending", label: t("admin.messages.status.pending") || "Pending" },
        { value: "read", label: t("admin.messages.status.read") || "Read" },
        { value: "replied", label: t("admin.messages.status.replied") || "Replied" },
      ],
    },
  ], [t]);

  const handleFilterChange = (key, value) => {
    if (key === "status") {
      setStatusFilter(value);
      fetchMessages(1, value, searchTerm);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    fetchMessages(1, statusFilter, term);
  };

  return (
    <div className="messages-container" style={{ direction: i18n.dir() }}>
      <div className="messages-header">
        <h1 className="messages-title">{t("admin.messages.title")}</h1>
        <p className="messages-subtitle">
          {t("admin.messages.subtitle")}
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="admin_page_body">
        <section className="dashboard-section">
          <DynamicTable
            columns={tableColumns}
            actions={tableActions}
            data={messages}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => fetchMessages(page, statusFilter, searchTerm)}
            searchable={true}
            searchPlaceholder={t("admin.messages.search")}
            onSearch={handleSearch}
            searchMode="server"
            filters={tableFilters}
            onFilterChange={handleFilterChange}
            title={t("admin.messages.title")}
            subtitle={`${pagination.totalItems} ${t("admin.total")}`}
            onRefresh={() => fetchMessages(pagination.currentPage)}
            emptyMessage={t("admin.messages.noMessages") || "No messages found"}
          />
        </section>
      </div>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="admin_dialog_content admin_dialog_large">
          <DialogHeader>
            <DialogTitle>
              {t("admin.messages.details") || "Message Details"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="message-detail-content" style={{ padding: '20px 0' }}>
               <div className="sender-info" style={{ marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="info-row">
                  <span className="info-label" style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{t("contact.nameLabel")}</span>
                  <div className="info-value" style={{ fontWeight: '600', color: '#1e293b' }}>{selectedMessage.name}</div>
                </div>
                <div className="info-row">
                  <span className="info-label" style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{t("contact.emailLabel")}</span>
                  <div className="info-value" style={{ fontWeight: '600', color: '#1e293b' }}>{selectedMessage.email}</div>
                </div>
                <div className="info-row">
                  <span className="info-label" style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{t("common.date")}</span>
                  <div className="info-value" style={{ fontWeight: '600', color: '#1e293b' }}>{formatDate(selectedMessage.createdAt)}</div>
                </div>
                <div className="info-row">
                  <span className="info-label" style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{t("common.status")}</span>
                  <div style={{ marginTop: '4px' }}>
                    <select
                      value={selectedMessage.status}
                      onChange={(e) => handleStatusChange(selectedMessage._id, e.target.value)}
                      disabled={isUpdating}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '600' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="content-section" style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} /> {t("contact.subjectLabel")}
                </h4>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{selectedMessage.subject}</p>
              </div>

              <div className="content-section">
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} /> {t("contact.messageLabel")}
                </h4>
                <div style={{ 
                  background: '#fff', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0', 
                  lineHeight: '1.6',
                  color: '#334155',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteModal}
        title={t("admin.messages.deleteTitle") || "Delete Message"}
        message={t("admin.messages.deleteConfirm") || "Are you sure you want to delete this message? This action cannot be undone."}
        confirmText={t("common.delete")}
        onConfirm={handleDeleteMessage}
        onCancel={() => {
          setShowDeleteModal(false);
          setMessageToDelete(null);
        }}
        type="danger"
      />
    </div>
  );
};

export default Messages;


import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../api";
import {
  Mail,
  Trash2,
  Eye,
  AlertCircle,
  Info,
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

  // ─── FIX: Use refs so fetchMessages never changes identity ─────────────────
  // Storing latest values in refs avoids stale closures without adding them
  // to the useCallback dependency array (which would recreate the function and
  // re-trigger the useEffect → infinite loop).
  const statusFilterRef = useRef(statusFilter);
  const searchTermRef = useRef(searchTerm);
  useEffect(() => { statusFilterRef.current = statusFilter; }, [statusFilter]);
  useEffect(() => { searchTermRef.current = searchTerm; }, [searchTerm]);

  const fetchMessages = useCallback(async (
    page = 1,
    status = statusFilterRef.current,
    search = searchTermRef.current,
  ) => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page: page.toString(),
        limit: "10",
        status: status === "all" ? "" : status,
        search,
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
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []); // ← stable: no deps that change

  // Initial load — runs once
  useEffect(() => {
    fetchMessages(1);
  }, [fetchMessages]);

  // ─── Status change ──────────────────────────────────────────────────────────
  const handleStatusChange = useCallback(async (messageId, newStatus) => {
    try {
      setIsUpdating(true);
      const response = await axiosInstance.put(
        `/admin/contact/messages/${messageId}`,
        { status: newStatus },
      );
      if (response.status === 200) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, status: newStatus } : msg,
          ),
        );
        setSelectedMessage((prev) =>
          prev?._id === messageId ? { ...prev, status: newStatus } : prev,
        );
        toast.success(t("admin.messages.statusUpdated", "Status updated successfully"));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  }, [t]);

  // ─── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteMessage = useCallback(async () => {
    if (!messageToDelete) return;
    try {
      await axiosInstance.delete(`/admin/contact/messages/${messageToDelete}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageToDelete));
      setShowDeleteModal(false);
      setMessageToDelete(null);
      if (selectedMessage?._id === messageToDelete) {
        setSelectedMessage(null);
        setShowDetailDialog(false);
      }
      toast.success(t("admin.messages.deleted", "Message deleted successfully"));
      fetchMessages(pagination.currentPage);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete message");
    }
  }, [messageToDelete, selectedMessage, fetchMessages, pagination.currentPage, t]);

  // ─── Search & filter ────────────────────────────────────────────────────────
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    fetchMessages(1, statusFilterRef.current, term);
  }, [fetchMessages]);

  const handleFilterChange = useCallback((key, value) => {
    if (key === "status") {
      setStatusFilter(value);
      fetchMessages(1, value, searchTermRef.current);
    }
  }, [fetchMessages]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(
      i18n.language === "ar" ? "ar-SA" : "en-US",
      { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
    );
  }, [i18n.language]);

  // ─── Table config ────────────────────────────────────────────────────────────
  const tableColumns = useMemo(() => [
    {
      key: "name",
      title: t("contact.nameLabel", "Sender"),
      type: "avatar",
      getAvatarText: (msg) => msg.name?.[0]?.toUpperCase() || "?",
      getName: (msg) => msg.name || "—",
      getSubtitle: (msg) => msg.email,
      sortable: true,
    },
    {
      key: "subject",
      title: t("contact.subjectLabel", "Subject"),
      sortable: true,
    },
    {
      key: "status",
      title: t("common.status", "Status"),
      type: "status",
      getStatusClass: (val) => val || "pending",
      getStatusText: (val) => t(`admin.messages.status.${val}`, val),
      align: "center",
      sortable: true,
    },
    {
      key: "createdAt",
      title: t("common.date", "Date"),
      type: "custom",
      render: (msg) => formatDate(msg.createdAt),
      sortable: true,
    },
    {
      key: "actions",
      title: t("common.actions", "Actions"),
      type: "actions",
      align: "center",
    },
  ], [t, formatDate]);

  const tableActions = useMemo(() => [
    {
      icon: Eye,
      label: t("common.view", "View"),
      variant: "edit",
      onClick: (msg) => {
        setSelectedMessage(msg);
        setShowDetailDialog(true);
        if (msg.status === "pending") {
          handleStatusChange(msg._id, "read");
        }
      },
    },
    {
      icon: Trash2,
      label: t("common.delete", "Delete"),
      variant: "delete",
      onClick: (msg) => {
        setMessageToDelete(msg._id);
        setShowDeleteModal(true);
      },
    },
  ], [t, handleStatusChange]);

  const tableFilters = useMemo(() => [
    {
      key: "status",
      label: t("common.status"),
      options: [
        { value: "all", label: t("admin.messages.allStatus", "All Status") },
        { value: "pending", label: t("admin.messages.status.pending", "Pending") },
        { value: "read", label: t("admin.messages.status.read", "Read") },
        { value: "replied", label: t("admin.messages.status.replied", "Replied") },
      ],
    },
  ], [t]);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="admin_page">
      {error && (
        <div className="admin_error_alert" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
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
            onPageChange={(page) => fetchMessages(page, statusFilterRef.current, searchTermRef.current)}
            onPageSizeChange={(size) => fetchMessages(1, statusFilterRef.current, searchTermRef.current)}
            searchable
            searchPlaceholder={t("admin.messages.search", "Search messages…")}
            onSearch={handleSearch}
            searchMode="server"
            filters={tableFilters}
            onFilterChange={handleFilterChange}
            title={t("admin.messages.title", "Messages")}
            subtitle={t("admin.messages.subtitle", "Customer contact messages")}
            onRefresh={() => fetchMessages(pagination.currentPage)}
            emptyMessage={t("admin.messages.noMessages", "No messages found")}
          />
        </section>
      </div>

      {/* ── Message detail dialog ──────────────────────────────── */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="admin_dialog_content admin_dialog_large">
          <DialogHeader>
            <DialogTitle>{t("admin.messages.details", "Message Details")}</DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="msg-detail">
              {/* Meta grid */}
              <div className="msg-detail__grid">
                <div className="msg-detail__cell">
                  <span className="msg-detail__label">{t("contact.nameLabel", "Name")}</span>
                  <strong className="msg-detail__value">{selectedMessage.name}</strong>
                </div>
                <div className="msg-detail__cell">
                  <span className="msg-detail__label">{t("contact.emailLabel", "Email")}</span>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="msg-detail__value msg-detail__link"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
                <div className="msg-detail__cell">
                  <span className="msg-detail__label">{t("common.date", "Date")}</span>
                  <strong className="msg-detail__value">{formatDate(selectedMessage.createdAt)}</strong>
                </div>
                <div className="msg-detail__cell">
                  <span className="msg-detail__label">{t("common.status", "Status")}</span>
                  <select
                    value={selectedMessage.status}
                    onChange={(e) => handleStatusChange(selectedMessage._id, e.target.value)}
                    disabled={isUpdating}
                    className="msg-detail__status-select admin_select"
                  >
                    <option value="pending">{t("admin.messages.status.pending", "Pending")}</option>
                    <option value="read">{t("admin.messages.status.read", "Read")}</option>
                    <option value="replied">{t("admin.messages.status.replied", "Replied")}</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div className="msg-detail__block">
                <h4 className="msg-detail__block-heading">
                  <Info size={15} />
                  {t("contact.subjectLabel", "Subject")}
                </h4>
                <p className="msg-detail__block-body msg-detail__subject">
                  {selectedMessage.subject}
                </p>
              </div>

              {/* Message body */}
              <div className="msg-detail__block">
                <h4 className="msg-detail__block-heading">
                  <Mail size={15} />
                  {t("contact.messageLabel", "Message")}
                </h4>
                <div className="msg-detail__block-body msg-detail__message">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Quick reply link */}
              <div className="msg-detail__footer">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || "")}`}
                  className="msg-detail__reply-btn"
                >
                  <Mail size={15} />
                  {t("admin.messages.replyByEmail", "Reply via Email")}
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ─────────────────────────────────────── */}
      <ConfirmDialog
        open={showDeleteModal}
        title={t("admin.messages.deleteTitle", "Delete Message")}
        message={t(
          "admin.messages.deleteConfirm",
          "Are you sure you want to delete this message? This action cannot be undone.",
        )}
        confirmText={t("common.delete", "Delete")}
        cancelText={t("dialog.cancel", "Cancel")}
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

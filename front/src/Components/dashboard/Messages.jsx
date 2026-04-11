import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../api";
import { 
  Mail, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  CheckCircle, 
  Clock, 
  Reply, 
  AlertCircle,
  X,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react";
import "./Messages.css";
import { toast } from "react-toastify";

const Messages = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchMessages = async (page = 1, status = "all", search = "") => {
    try {
      setLoading(true);
      const params = {
        page: page.toString(),
        limit: "10",
        status: status,
        search: search,
      };

      const response = await axiosInstance.get("/admin/contact/messages", { params });

      if (response.status === 200) {
        const data = response.data;
        setMessages(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(data.pagination?.currentPage || 1);
        
        // Auto-select first message on desktop if none selected
        if (!selectedMessage && data.data?.length > 0 && window.innerWidth > 1024) {
          setSelectedMessage(data.data[0]);
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(currentPage, statusFilter, searchTerm);
  }, [currentPage, statusFilter, searchTerm]);

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
        }
        toast.success(t("admin.messages.deleted") || "Message deleted successfully");
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message);
      toast.error("Failed to delete message");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "status-pending";
      case "read": return "status-read";
      case "replied": return "status-replied";
      default: return "status-pending";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock size={14} />;
      case "read": return <Eye size={14} />;
      case "replied": return <Reply size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const openDeleteModal = (messageId) => {
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  if (loading && messages.length === 0) {
    return (
      <div className="messages-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t("admin.messages.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container" style={{ direction: i18n.dir() }}>
      <div className="messages-header">
        <h1 className="messages-title">{t("admin.messages.title")}</h1>
        <p className="messages-subtitle">
          {t("admin.messages.subtitle")}
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle className="alert-icon" />
          {error}
        </div>
      )}

      <div className="messages-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder={t("admin.messages.search")}
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="status-filter">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="filter-select"
            >
              <option value="all">{t("admin.messages.allStatus")}</option>
              <option value="pending">Pending</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>
        </div>

        <div className="messages-stats">
          <div className="stat-item">
            <Mail size={18} />
            <span>Total: <strong>{messages.length}</strong></span>
          </div>
          <div className="stat-item pending">
            <Clock size={18} />
            <span>Pending: <strong>{messages.filter(m => m.status === 'pending').length}</strong></span>
          </div>
        </div>
      </div>

      <div className="messages-content">
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="empty-state">
              <Mail className="empty-icon" />
              <h3>No messages found</h3>
              <p>No contact messages match your current filters.</p>
            </div>
          ) : (
            <div className="message-items">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`message-item ${selectedMessage?._id === message._id ? "selected" : ""}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="message-header">
                    <h4 className="sender-name">{message.name}</h4>
                    <span className="sender-email">{message.email}</span>
                  </div>
                  
                  <h5 className="message-subject">{message.subject}</h5>
                  <p className="message-excerpt">
                    {message.message.substring(0, 80)}
                    {message.message.length > 80 ? "..." : ""}
                  </p>

                  <div className="message-meta">
                    <span className={`status-badge ${getStatusColor(message.status)}`}>
                        {getStatusIcon(message.status)}
                        <span style={{marginLeft: '6px'}}>{t(`admin.messages.status.${message.status}`)}</span>
                    </span>
                    <span className="message-date">{formatDate(message.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="pagination-info">
                {currentPage} / {totalPages}
              </span>
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {selectedMessage && (
          <div className="message-detail">
            <div className="detail-header">
              <h3>Message Details</h3>
              <div className="detail-actions">
                <select
                  value={selectedMessage.status}
                  onChange={(e) =>
                    handleStatusChange(selectedMessage._id, e.target.value)
                  }
                  disabled={isUpdating}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
                <button
                  className="delete-btn"
                  onClick={() => openDeleteModal(selectedMessage._id)}
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>

            <div className="detail-content">
              <div className="sender-info">
                <div className="info-row">
                  <span className="info-label">Name</span>
                  <span className="info-value">{selectedMessage.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{selectedMessage.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Date</span>
                  <span className="info-value">
                    {formatDate(selectedMessage.createdAt)}
                  </span>
                </div>
              </div>

              <div className="message-content">
                <div className="subject-section">
                  <h4><Info size={16} /> Subject</h4>
                  <p>{selectedMessage.subject}</p>
                </div>

                <div className="message-section">
                  <h4><Mail size={16} /> Message Body</h4>
                  <div className="message-text">{selectedMessage.message}</div>
                </div>

                {selectedMessage.adminNotes && (
                  <div className="admin-notes">
                    <h4><CheckCircle size={16} /> Admin Notes</h4>
                    <p>{selectedMessage.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Delete Message</h3>
              <button className="modal-close" onClick={closeDeleteModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{fontSize: '1.1rem', fontWeight: '500', color: '#475569'}}>
                Are you sure you want to delete this message? This action cannot
                be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button className="btn-delete" onClick={handleDeleteMessage}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;


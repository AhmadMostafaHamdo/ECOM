import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../api";
import "./Messages.css";

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
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message);
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
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "read":
        return "status-read";
      case "replied":
        return "status-replied";
      default:
        return "status-pending";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return t("admin.messages.status.pending");
      case "read":
        return t("admin.messages.status.read");
      case "replied":
        return t("admin.messages.status.replied");
      default:
        return t("admin.messages.status.pending");
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
          <svg className="alert-icon" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      <div className="messages-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <svg
              className="search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
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
          <span className="stat-item">
            Total: <strong>{messages.length}</strong>
          </span>
          <span className="stat-item pending">
            Pending:{" "}
            <strong>
              {messages.filter((m) => m.status === "pending").length}
            </strong>
          </span>
        </div>
      </div>

      <div className="messages-content">
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="empty-state">
              <svg
                className="empty-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
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
                    <div className="message-sender">
                      <h4 className="sender-name">{message.name}</h4>
                      <span className="sender-email">{message.email}</span>
                    </div>
                    <div className="message-meta">
                      <span
                        className={`status-badge ${getStatusColor(message.status)}`}
                      >
                        {getStatusText(message.status)}
                      </span>
                      <span className="message-date">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="message-preview">
                    <h5 className="message-subject">{message.subject}</h5>
                    <p className="message-excerpt">
                      {message.message.substring(0, 100)}
                      {message.message.length > 100 ? "..." : ""}
                    </p>
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
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                Next
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
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </div>

            <div className="detail-content">
              <div className="sender-info">
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{selectedMessage.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{selectedMessage.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Date:</span>
                  <span className="info-value">
                    {formatDate(selectedMessage.createdAt)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span
                    className={`status-badge ${getStatusColor(selectedMessage.status)}`}
                  >
                    {getStatusText(selectedMessage.status)}
                  </span>
                </div>
              </div>

              <div className="message-content">
                <div className="subject-section">
                  <h4>Subject</h4>
                  <p>{selectedMessage.subject}</p>
                </div>

                <div className="message-section">
                  <h4>Message</h4>
                  <div className="message-text">{selectedMessage.message}</div>
                </div>

                {selectedMessage.adminNotes && (
                  <div className="admin-notes">
                    <h4>Admin Notes</h4>
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
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete this message? This action cannot
                be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button className="btn-delete" onClick={handleDeleteMessage}>
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;

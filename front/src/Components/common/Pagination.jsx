import React from "react";
import { useTranslation } from "react-i18next";
import "./Pagination.css";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  limit = 10,
  onPageChange,
  showItemsInfo = true,
  showPageSizeSelector = true,
  pageSizeOptions = [5, 10, 25, 50],
  onPageSizeChange,
  className = "",
}) => {
  const { t } = useTranslation();

  if (totalPages <= 1 && !showPageSizeSelector) return null;

  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePageSizeChange = (newSize) => {
    if (onPageSizeChange) {
      onPageSizeChange(parseInt(newSize));
    }
  };

  const startItem = totalItems > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div className={`pagination_wrapper ${className}`}>
      {/* Items Information */}
      {showItemsInfo && totalItems > 0 && (
        <div className="pagination_info">
          <span className="pagination_text">
            {t("pagination.showing", "Showing")} {startItem}{" "}
            {t("pagination.to", "to")} {endItem} {t("pagination.of", "of")}{" "}
            {totalItems} {t("pagination.items", "items")}
          </span>
        </div>
      )}

      {/* Page Size Selector */}
      {showPageSizeSelector && onPageSizeChange && (
        <div className="pagination_page_size">
          <span className="pagination_text">
            {t("pagination.itemsPerPage", "Items per page")}:
          </span>
          <select
            className="pagination_select"
            value={limit}
            onChange={(e) => handlePageSizeChange(e.target.value)}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="pagination_container">
        <button
          className="pagination_btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label={t("pagination.previous", "Previous")}
        >
          &laquo; {t("pagination.prev", "Prev")}
        </button>

        {startPage > 1 && (
          <>
            <button
              className="pagination_btn"
              onClick={() => onPageChange(1)}
              aria-label="Page 1"
            >
              1
            </button>
            {startPage > 2 && <span className="pagination_dots">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            className={`pagination_btn ${currentPage === page ? "active" : ""}`}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="pagination_dots">...</span>
            )}
            <button
              className="pagination_btn"
              onClick={() => onPageChange(totalPages)}
              aria-label={`Page ${totalPages}`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className="pagination_btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label={t("pagination.next", "Next")}
        >
          {t("pagination.next", "Next")} &raquo;
        </button>
      </div>
    </div>
  );
};

export default Pagination;

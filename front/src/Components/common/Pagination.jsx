import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

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

    return (
        <div className="pagination_container">
            <button
                className="pagination_btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                &laquo; Prev
            </button>

            {startPage > 1 && (
                <>
                    <button className="pagination_btn" onClick={() => onPageChange(1)}>1</button>
                    {startPage > 2 && <span className="pagination_dots">...</span>}
                </>
            )}

            {pages.map(page => (
                <button
                    key={page}
                    className={`pagination_btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}

            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span className="pagination_dots">...</span>}
                    <button className="pagination_btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
                </>
            )}

            <button
                className="pagination_btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next &raquo;
            </button>
        </div>
    );
};

export default Pagination;

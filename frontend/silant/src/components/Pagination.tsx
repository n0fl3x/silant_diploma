import React from 'react';


interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const shouldShowFirstEllipsis = startPage > 1;
  const shouldShowLastEllipsis = endPage < totalPages;

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="pagination-btn"
        aria-label="Первая страница"
      >
        « Первая
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
        aria-label="Предыдущая страница"
      >
        ‹ Назад
      </button>

      {shouldShowFirstEllipsis && (
        <span className="pagination-ellipsis" aria-hidden="true">
          …
        </span>
      )}

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
          aria-current={page === currentPage ? 'page' : undefined}
          aria-label={`Страница ${page}`}
        >
          {page}
        </button>
      ))}

      {shouldShowLastEllipsis && (
        <span className="pagination-ellipsis" aria-hidden="true">
          …
        </span>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
        aria-label="Следующая страница"
      >
        Вперёд ›
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
        aria-label="Последняя страница"
      >
        Последняя »
      </button>
    </div>
  );
};

export default Pagination;

import '../../styles/main.css';

/**
 * Pagination Component
 * 
 * A beautiful pagination component that displays page numbers and navigation controls
 * 
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback function when page changes
 * @param {number} itemsPerPage - Number of items per page
 * @param {number} totalItems - Total number of items
 */
export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage = 15,
  totalItems = 0 
}) {
  // Don't render if there's only one page or no items
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum number of page buttons to show
    
    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Showing {startItem} - {endItem} of {totalItems} items
        </span>
      </div>
      
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          title="Previous page"
        >
          <span>‹</span>
        </button>
        
        <div className="pagination-pages">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              );
            }
            
            return (
              <button
                key={page}
                className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>
        
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          title="Next page"
        >
          <span>›</span>
        </button>
      </div>
    </div>
  );
}


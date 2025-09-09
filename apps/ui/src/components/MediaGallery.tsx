import React from "react";
import { FileMetadata } from "../services/media";
import { MediaCard } from "./MediaCard";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

interface Props {
  items: FileMetadata[];
  loading?: boolean;
  pagination?: PaginationProps;
  onDelete?: (id: string) => void;
}

export const MediaGallery: React.FC<Props> = ({
  items,
  loading = false,
  pagination,
  onDelete,
}) => {
  if (loading && !items.length) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 sm:py-16"
        role="status"
        aria-live="polite"
      >
        <div className="loading-spinner h-8 w-8 mb-4" aria-hidden="true" />
        <p className="text-muted">Loading your files...</p>
        <span className="sr-only">
          Please wait while your files are being loaded
        </span>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 sm:py-16 text-center"
        role="status"
      >
        <div className="mb-4 p-3 rounded-full bg-gray-100" aria-hidden="true">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
        <p className="text-muted max-w-sm">
          Upload your first file using the form above to get started with
          sharing.
        </p>
      </div>
    );
  }

  const renderPagination = () => {
    if (!pagination) return null;

    const { currentPage, totalPages, onPageChange, totalItems, itemsPerPage } =
      pagination;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push("...");
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <nav className="mt-8 space-y-4" aria-label="File pagination">
        {/* Results info */}
        <div
          className="text-center sm:text-left"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-gray-700">
            Showing {startItem} to {endItem} of {totalItems} results
          </p>
        </div>

        {/* Pagination controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-secondary w-full sm:w-auto order-2 sm:order-1 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Go to previous page"
            type="button"
          >
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Previous</span>
          </button>

          {/* Page numbers - responsive */}
          <div
            className="flex items-center gap-1 order-1 sm:order-2"
            role="group"
            aria-label="Page navigation"
          >
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() =>
                  typeof page === "number" ? onPageChange(page) : undefined
                }
                disabled={page === "..."}
                className={`min-w-[44px] h-11 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  page === currentPage
                    ? "bg-brand-600 text-white shadow-button"
                    : page === "..."
                    ? "text-gray-400 cursor-default"
                    : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
                aria-label={
                  page === "..."
                    ? "More pages"
                    : page === currentPage
                    ? `Current page, page ${page}`
                    : `Go to page ${page}`
                }
                aria-current={page === currentPage ? "page" : undefined}
                type="button"
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-secondary w-full sm:w-auto order-3 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Go to next page"
            type="button"
          >
            <span>Next</span>
            <svg
              className="h-4 w-4 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </nav>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Grid with responsive layout */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          role="grid"
          aria-label={`File gallery showing ${items.length} files`}
        >
          {items.map((m) => (
            <MediaCard key={m.id} media={m} onDelete={onDelete} />
          ))}
        </div>

        {renderPagination()}
      </div>

      {/* Full-screen loading overlay */}
      {loading && items.length > 0 && (
        <div
          className="fixed inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="loading-title"
        >
          <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-2xl shadow-card-lg border border-gray-100">
            <div className="loading-spinner h-8 w-8" aria-hidden="true" />
            <div className="text-center">
              <p
                id="loading-title"
                className="text-lg font-medium text-gray-900 mb-1"
              >
                Refreshing...
              </p>
              <p className="text-sm text-gray-600">Loading your latest files</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

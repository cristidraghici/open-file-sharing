import React, { useEffect, useState } from "react";
import { AccessibilityPreferences } from "../components/AccessibilityPreferences";
import { MediaGallery } from "../components/MediaGallery";
import { SkipNavigation } from "../components/SkipNavigation";
import { UploadForm } from "../components/UploadForm";
import { useAuth } from "../context/AuthContext";
import type {
  ListMediaParams,
  MediaListResponseWithMeta,
} from "../services/media";
import { listMedia } from "../services/media";

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [mediaData, setMediaData] = useState<MediaListResponseWithMeta | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(12);
  const [filterType, setFilterType] = useState<string>("");
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [showAccessibilityPrefs, setShowAccessibilityPrefs] =
    useState<boolean>(false);

  const loadMedia = async (page: number = currentPage, type?: string) => {
    try {
      setLoading(true);
      setError("");
      const params: ListMediaParams = {
        page,
        per_page: perPage,
        ...(type && { type: type as "image" | "video" | "document" | "other" }),
      };
      const data = await listMedia(params);
      setMediaData(data);
      setCurrentPage(page);
    } catch (e: any) {
      setError(
        e?.response?.data?.error?.message ||
          e?.message ||
          "Failed to load uploads"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMedia(1, filterType);
  }, [filterType, perPage]);

  const handleUploaded = () => {
    // Refresh the current page to show the new upload
    void loadMedia(currentPage, filterType);
  };

  const handlePageChange = (page: number) => {
    void loadMedia(page, filterType);
  };

  const handleTypeFilter = (type: string) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleDelete = (deletedId: string) => {
    // Remove the deleted item from the current data to provide immediate feedback
    if (mediaData) {
      const updatedItems =
        mediaData.data?.filter((item) => item.id !== deletedId) ?? [];
      setMediaData({
        ...mediaData,
        data: updatedItems,
        meta: {
          ...mediaData.meta,
          total: (mediaData.meta?.total ?? 1) - 1,
        },
      });
    }
    // Refresh the data to ensure consistency
    void loadMedia(currentPage, filterType);
  };

  return (
    <div className="min-h-screen flex flex-col safe-area-padding">
      {/* Skip navigation for accessibility */}
      <SkipNavigation />
      
      <header
        className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm"
        role="banner"
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 shadow-sm flex items-center justify-center"
                role="img"
                aria-label="Open File Sharing logo"
              >
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
              </div>
              <h1 className="font-semibold text-gray-900 text-lg sm:text-xl">
                Open File Sharing
              </h1>
            </div>
            <nav
              id="navigation"
              className="flex items-center gap-2 sm:gap-4"
              role="navigation"
              aria-label="User menu"
            >
              <span
                className="hidden sm:block text-sm text-gray-600 font-medium"
                aria-label={`Logged in as ${user?.username}`}
              >
                {`Welcome, ${user?.username ? user.username : "User"}!`}
              </span>
              <span
                className="sm:hidden text-xs text-gray-600 max-w-[80px] truncate"
                aria-label={`Logged in as ${user?.username}`}
              >
                {user?.username}
              </span>

              <button
                className="btn btn-ghost text-sm p-2"
                onClick={() => setShowAccessibilityPrefs(true)}
                aria-label="Open accessibility preferences"
                title="Accessibility preferences"
                type="button"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 4a2 2 0 0 1 2 2c0 .386-.079.755-.221 1.09l.221-.09a8 8 0 1 1-11.95 0C7.287 6.755 7.208 6.386 7.208 6a2 2 0 0 1 2-2z"
                  />
                </svg>
                <span className="sr-only">Universal access symbol</span>
              </button>

              <button
                className="btn btn-primary text-sm sm:text-base"
                onClick={logout}
                aria-label="Sign out of your account"
                type="button"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6"
        role="main"
      >
        {showUploadForm && (
          <section
            className={`card transition-all duration-300 ease-in-out ${
              showUploadForm
                ? "animate-slide-up opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4"
            }`}
            aria-labelledby="upload-heading"
          >
            <header className="mb-4 sm:mb-6">
              <h2 id="upload-heading" className="heading-2">
                Upload Files
              </h2>
              <p className="mt-2 text-muted text-sm sm:text-base">
                Drag and drop files or click to browse. Get instant sharing
                links.
              </p>
            </header>
            <UploadForm onUploaded={handleUploaded} />
          </section>
        )}

        <section
          className="card animate-slide-up"
          aria-labelledby="gallery-heading"
        >
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h2 id="gallery-heading" className="heading-2">
              Recent Uploads
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                className="btn btn-secondary text-sm sm:text-base"
                onClick={() => setShowUploadForm(!showUploadForm)}
                aria-expanded={showUploadForm}
                aria-controls="upload-form"
                aria-label={
                  showUploadForm ? "Hide upload form" : "Show upload form"
                }
                type="button"
              >
                Upload
              </button>
              <button
                className="btn btn-secondary w-full sm:w-auto"
                onClick={() => loadMedia(currentPage, filterType)}
                disabled={loading}
                aria-label="Refresh file list"
                type="button"
              >
                {loading ? (
                  <>
                    <div
                      className="loading-spinner h-4 w-4 mr-2"
                      aria-hidden="true"
                    />
                    <span>Loading...</span>
                    <span className="sr-only">Refreshing file list</span>
                  </>
                ) : (
                  "Refresh"
                )}
              </button>
            </div>
          </header>

          {/* Filter and pagination controls */}
          <div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6"
            role="group"
            aria-label="File filtering and display options"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label
                htmlFor="type-filter"
                className="text-sm font-medium text-gray-700 whitespace-nowrap"
              >
                Filter by type:
              </label>
              <select
                id="type-filter"
                value={filterType}
                onChange={(e) => handleTypeFilter(e.target.value)}
                className="input text-sm sm:w-auto min-w-[140px]"
                aria-describedby="type-filter-help"
              >
                <option value="">All types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
                <option value="other">Other</option>
              </select>
              <div id="type-filter-help" className="sr-only">
                Filter files by their type to narrow down the display
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label
                htmlFor="per-page"
                className="text-sm font-medium text-gray-700 whitespace-nowrap"
              >
                Per page:
              </label>
              <select
                id="per-page"
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                className="input text-sm sm:w-auto min-w-[80px]"
                aria-describedby="per-page-help"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
              <div id="per-page-help" className="sr-only">
                Choose how many files to display per page
              </div>
            </div>
          </div>

          {error && (
            <div
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 sr-only">
                    Error
                  </h3>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <MediaGallery
            items={mediaData?.data ?? []}
            loading={loading}
            onDelete={handleDelete}
            pagination={
              mediaData
                ? {
                    currentPage,
                    totalPages: Math.ceil(
                      (mediaData.meta?.total ?? 0) / perPage
                    ),
                    onPageChange: handlePageChange,
                    totalItems: mediaData.meta?.total ?? 0,
                    itemsPerPage: perPage,
                  }
                : undefined
            }
          />
        </section>
      </main>

      {/* Footer */}
      <footer
        className="mt-auto py-4 text-center text-xs text-gray-500 border-t bg-white/50"
        role="contentinfo"
      >
        <p>Secure file sharing platform</p>
      </footer>

      {/* Accessibility Preferences Modal */}
      <AccessibilityPreferences
        isOpen={showAccessibilityPrefs}
        onClose={() => setShowAccessibilityPrefs(false)}
      />
    </div>
  );
};

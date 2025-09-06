import React, { useEffect, useState } from "react";
import { MediaGallery } from "../components/MediaGallery";
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

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-brand-600" />
            <span className="font-semibold">Open File Sharing</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.username}</span>
            <button className="btn btn-primary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold">Upload a file</h2>
          <p className="mt-2 text-gray-600">
            Choose a file to upload. You will receive an id and a direct URL.
          </p>
          <div className="mt-4">
            <UploadForm onUploaded={handleUploaded} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent uploads</h2>
            <button
              className="btn btn-secondary"
              onClick={() => loadMedia(currentPage, filterType)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* Filter and pagination controls */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="type-filter"
                className="text-sm font-medium text-gray-700"
              >
                Filter by type:
              </label>
              <select
                id="type-filter"
                value={filterType}
                onChange={(e) => handleTypeFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="per-page"
                className="text-sm font-medium text-gray-700"
              >
                Per page:
              </label>
              <select
                id="per-page"
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>

          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
          <div className="mt-4">
            <MediaGallery
              items={mediaData?.data ?? []}
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
          </div>
        </div>
      </main>
    </div>
  );
};

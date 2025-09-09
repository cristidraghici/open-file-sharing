import React, { useId, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { deleteMediaById, FileMetadata, mediaUrl } from "../services/media";
import { toastService } from "../services/toast";
import {
  announceToScreenReader,
  getAccessibleFileSize,
  getAccessibleFileType,
} from "../utils/accessibility";

interface Props {
  media: FileMetadata;
  onDelete?: (id: string) => void;
}

export const MediaCard: React.FC<Props> = ({ media, onDelete }) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Generate unique IDs for accessibility
  const cardId = useId();
  const deleteConfirmId = useId();

  const {
    id = "",
    fileType = "other",
    size = 0,
    fileName: name = "(untitled)",
    uploadedAt: uploadedAtStr,
    isPublic = false,
  } = media;

  const isAdmin = user?.role === "admin";

  const href = useMemo(() => (id ? mediaUrl(id) : undefined), [id]);
  const uploadedAt = useMemo(
    () => (uploadedAtStr ? new Date(uploadedAtStr) : undefined),
    [uploadedAtStr]
  );
  const isImage = fileType === "image";

  const handleDelete = async () => {
    if (!id || isDeleting) return;

    setIsDeleting(true);
    announceToScreenReader(`Deleting ${name}`, "assertive");

    try {
      await deleteMediaById(id);
      onDelete?.(id);
      setShowConfirmDelete(false);
      const successMessage = `Successfully deleted ${name}`;
      toastService.success(successMessage);
      announceToScreenReader(successMessage, "assertive");
    } catch (error) {
      console.error("Failed to delete file:", error);
      announceToScreenReader(`Failed to delete ${name}`, "assertive");
      // Error toast is handled by API interceptor
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return (
          <svg
            className="h-5 w-5 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "video":
        return (
          <svg
            className="h-5 w-5 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        );
      case "document":
        return (
          <svg
            className="h-5 w-5 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
    }
  };

  return (
    <article
      className="card group hover:shadow-card-hover transition-all duration-200 animate-fade-in"
      aria-labelledby={`${cardId}-title`}
    >
      {/* Image preview for images */}
      {isImage && href && (
        <div className="relative mb-4 -mt-2 -mx-2">
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="block"
            aria-label={`Open ${name} image in new tab`}
          >
            <img
              src={href}
              alt={`Preview of ${name} - ${getAccessibleFileType(
                fileType
              )}, ${getAccessibleFileSize(size)}`}
              className="w-full h-48 sm:h-52 object-cover rounded-t-xl transition-transform duration-200 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div
              className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-t-xl"
              aria-hidden="true"
            />
          </a>
          {isPublic && (
            <div
              className="absolute top-3 left-3 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-emerald-700 border border-white/20 shadow-sm"
              aria-label="This file is publicly accessible"
            >
              <svg
                className="h-3 w-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Public</span>
            </div>
          )}
        </div>
      )}

      {/* File info */}
      <div className="space-y-3">
        {/* Header with icon and name */}
        <header className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
            {getFileTypeIcon(fileType)}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id={`${cardId}-title`}
              className="font-medium text-gray-900 truncate group-hover:text-brand-700 transition-colors"
            >
              {name}
            </h3>
            <div
              className="flex items-center gap-2 mt-1 text-xs text-gray-500"
              aria-label={`${getAccessibleFileType(
                fileType
              )}, ${getAccessibleFileSize(size)}`}
            >
              <span className="capitalize">{fileType}</span>
              <span aria-hidden="true">·</span>
              <span>{formatFileSize(size)}</span>
            </div>
          </div>
        </header>

        {/* Metadata */}
        <div className="space-y-2">
          {id && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span
                className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-600"
                aria-label={`File ID: ${id}`}
              >
                {id}
              </span>
            </div>
          )}

          {uploadedAt && (
            <div
              className="text-xs text-gray-500"
              aria-label={`Uploaded on ${uploadedAt.toLocaleString()}`}
            >
              {uploadedAt.toLocaleString()}
            </div>
          )}

          {!isImage && isPublic && (
            <div
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
              aria-label="This file is publicly accessible"
            >
              <svg
                className="h-3 w-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Public</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <footer className="pt-2 border-t border-gray-100">
          {/* Open file button */}
          {href && (
            <a
              className={`btn btn-primary text-sm touch-target group/btn w-full ${
                isAdmin ? "mb-2" : "w-full"
              }`}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${name} in new tab`}
            >
              <svg
                className="h-4 w-4 mr-2 transition-transform group-hover/btn:scale-110"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span>Open File</span>
            </a>
          )}

          {/* Admin delete button */}
          {isAdmin && id && (
            <div className="space-y-2">
              {!showConfirmDelete ? (
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={isDeleting}
                  className="btn bg-red-600 hover:bg-red-700 text-white text-sm touch-target group/btn w-full"
                  aria-label={`Delete ${name}`}
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Delete File</span>
                </button>
              ) : (
                <div
                  className="space-y-2"
                  role="dialog"
                  aria-labelledby={deleteConfirmId}
                  aria-describedby={`${deleteConfirmId}-desc`}
                >
                  <p
                    id={deleteConfirmId}
                    className="text-xs text-red-600 text-center font-medium"
                  >
                    Delete {name}?
                  </p>
                  <p
                    id={`${deleteConfirmId}-desc`}
                    className="text-xs text-red-600 text-center"
                  >
                    This action cannot be undone.
                  </p>
                  <div
                    className="flex gap-2"
                    role="group"
                    aria-label="Confirm deletion"
                  >
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="btn bg-red-600 hover:bg-red-700 text-white text-xs touch-target flex-1"
                      aria-label={`Confirm delete ${name}`}
                      type="button"
                    >
                      {isDeleting ? (
                        <>
                          <span>Deleting...</span>
                          <span className="sr-only">
                            Please wait while the file is being deleted
                          </span>
                        </>
                      ) : (
                        "Yes, Delete"
                      )}
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      disabled={isDeleting}
                      className="btn bg-gray-500 hover:bg-gray-600 text-white text-xs touch-target flex-1"
                      aria-label="Cancel deletion"
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </footer>
      </div>
    </article>
  );
};

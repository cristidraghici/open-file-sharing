import React, { useMemo } from "react";
import { FileMetadata, mediaUrl } from "../services/media";

interface Props {
  media: FileMetadata;
}

export const MediaCard: React.FC<Props> = ({ media }) => {
  const {
    id = "",
    fileType = "other",
    size = 0,
    fileName: name = "(untitled)",
    uploadedAt: uploadedAtStr,
    isPublic = false,
  } = media;

  const href = useMemo(() => (id ? mediaUrl(id) : undefined), [id]);
  const uploadedAt = useMemo(
    () => (uploadedAtStr ? new Date(uploadedAtStr) : undefined),
    [uploadedAtStr]
  );
  const isImage = fileType === "image";

  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">
            {fileType} · {(size / 1024).toFixed(1)} KB
          </div>
          {id && <div className="text-xs text-gray-500">id: {id}</div>}
          {uploadedAt && (
            <div className="text-xs text-gray-500">
              uploaded {uploadedAt.toLocaleString()}
            </div>
          )}
          {isPublic && (
            <div className="mt-1 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Public
            </div>
          )}
        </div>
        {href && (
          <a
            className="btn btn-secondary"
            href={href}
            target="_blank"
            rel="noreferrer"
          >
            Open
          </a>
        )}
      </div>
      {isImage && href && (
        <a href={href} target="_blank" rel="noreferrer">
          <img
            src={href}
            alt={name}
            className="mt-3 max-h-56 rounded object-contain w-full bg-gray-50"
            loading="lazy"
          />
        </a>
      )}
    </div>
  );
};

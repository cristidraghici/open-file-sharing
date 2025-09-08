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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'document':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="card group hover:shadow-card-hover transition-all duration-200 animate-fade-in">
      {/* Image preview for images */}
      {isImage && href && (
        <div className="relative mb-4 -mt-2 -mx-2">
          <a href={href} target="_blank" rel="noreferrer" className="block">
            <img
              src={href}
              alt={name}
              className="w-full h-48 sm:h-52 object-cover rounded-t-xl transition-transform duration-200 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-t-xl" />
          </a>
          {isPublic && (
            <div className="absolute top-3 left-3 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-emerald-700 border border-white/20 shadow-sm">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
              </svg>
              Public
            </div>
          )}
        </div>
      )}

      {/* File info */}
      <div className="space-y-3">
        {/* Header with icon and name */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getFileTypeIcon(fileType)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate group-hover:text-brand-700 transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <span className="capitalize">{fileType}</span>
              <span>·</span>
              <span>{formatFileSize(size)}</span>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          {id && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                {id}
              </span>
            </div>
          )}
          
          {uploadedAt && (
            <div className="text-xs text-gray-500">
              {uploadedAt.toLocaleString()}
            </div>
          )}

          {!isImage && isPublic && (
            <div className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
              </svg>
              Public
            </div>
          )}
        </div>

        {/* Action button */}
        {href && (
          <div className="pt-2 border-t border-gray-100">
            <a
              className="btn btn-primary w-full text-sm touch-target group/btn"
              href={href}
              target="_blank"
              rel="noreferrer"
            >
              <svg className="h-4 w-4 mr-2 transition-transform group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open File
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

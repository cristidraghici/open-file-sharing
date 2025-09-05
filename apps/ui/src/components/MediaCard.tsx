import React from "react";
import { MediaMeta, mediaUrl } from "../services/media";

interface Props {
  media: MediaMeta;
}

export const MediaCard: React.FC<Props> = ({ media }) => {
  const href = mediaUrl(media.id);
  const isImage = media.mime.startsWith("image/");

  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{media.filename}</div>
          <div className="text-xs text-gray-500">
            {media.mime} · {(media.size / 1024).toFixed(1)} KB
          </div>
          <div className="text-xs text-gray-500">id: {media.id}</div>
        </div>
        <a className="btn btn-secondary" href={href} target="_blank" rel="noreferrer">
          Open
        </a>
      </div>
      {isImage && (
        <a href={href} target="_blank" rel="noreferrer">
          <img
            src={href}
            alt={media.filename}
            className="mt-3 max-h-56 rounded object-contain w-full bg-gray-50"
            loading="lazy"
          />
        </a>
      )}
    </div>
  );
};

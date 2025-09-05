import React from "react";
import { MediaMeta } from "../services/media";
import { MediaCard } from "./MediaCard";

interface Props {
  items: MediaMeta[];
}

export const MediaGallery: React.FC<Props> = ({ items }) => {
  if (!items.length) {
    return (
      <div className="text-sm text-gray-500">No media uploaded yet. Use the form above to upload a file.</div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((m) => (
        <MediaCard key={m.id} media={m} />
      ))}
    </div>
  );
};

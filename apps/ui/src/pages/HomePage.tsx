import React, { useEffect, useState } from "react";
import { MediaGallery } from "../components/MediaGallery";
import { UploadForm } from "../components/UploadForm";
import { useAuth } from "../context/AuthContext";
import type { MediaMeta } from "../services/media";
import { listMedia } from "../services/media";

export const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [uploads, setUploads] = useState<MediaMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await listMedia();
      setUploads(data);
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
    void loadMedia();
  }, []);

  const handleUploaded = (meta: MediaMeta) => {
    setUploads((prev) => [meta, ...prev].slice(0, 12));
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
              onClick={loadMedia}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
          <div className="mt-4">
            <MediaGallery items={uploads} />
          </div>
        </div>
      </main>
    </div>
  );
};

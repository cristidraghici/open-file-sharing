import { api, API_BASE_URL, endpoints } from "./api";

export type MediaMeta = {
  id: string;
  filename: string;
  size: number;
  mime: string;
  uploadedAt?: string | null;
};

export async function uploadMedia(file: File, onUploadProgress?: (pct: number) => void): Promise<MediaMeta> {
  const form = new FormData();
  form.append("file", file);

  const { data } = await api.post<{ data: MediaMeta }>(endpoints.mediaUpload, form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (!evt.total) return;
      const pct = Math.round((evt.loaded * 100) / evt.total);
      onUploadProgress?.(pct);
    },
  });

  return (data as any)?.data as MediaMeta;
}

export function mediaUrl(id: string) {
  return `${API_BASE_URL}${endpoints.mediaById(id)}`;
}

export async function listMedia(): Promise<MediaMeta[]> {
  const { data } = await api.get<{ data: MediaMeta[] }>(endpoints.mediaList);
  return (data as any)?.data ?? [];
}

import type { components } from "@open-file-sharing/shared-types";
import { api, API_BASE_URL, endpoints } from "./api";

// Shared type aliases
export type FileMetadata = components["schemas"]["FileMetadata"];
export type MediaListResponse = components["schemas"]["FileMetadata"][];
export type MediaListResponseWithMeta = {
  data: components["schemas"]["FileMetadata"][];
  meta: components["schemas"]["PaginationMeta"];
  links: components["schemas"]["Links"];
};


export async function uploadMediaMultiple(
  files: File[],
  onUploadProgress?: (pct: number) => void
): Promise<FileMetadata[]> {
  const form = new FormData();
  for (const f of files) {
    form.append("files[]", f);
  }

  const { data } = await api.post<{ data: FileMetadata[] }>(
    endpoints.mediaUploadMultiple,
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (!evt.total) return;
        const pct = Math.round((evt.loaded * 100) / evt.total);
        onUploadProgress?.(pct);
      },
    }
  );

  return (data?.data as FileMetadata[]) ?? [];
}

export function mediaUrl(id: string) {
  return `${API_BASE_URL}${endpoints.mediaContentById(id)}`;
}

export interface ListMediaParams {
  page?: number;
  per_page?: number;
  type?: "image" | "video" | "document" | "other";
}

export async function listMedia(
  params: ListMediaParams = {}
): Promise<MediaListResponseWithMeta> {
  const { data } = await api.get<MediaListResponseWithMeta>(
    endpoints.mediaList,
    { params }
  );
  return data as MediaListResponseWithMeta;
}

export async function getMediaById(id: string): Promise<FileMetadata> {
  const { data } = await api.get<{ data: FileMetadata }>(
    endpoints.mediaById(id)
  );
  return data?.data as FileMetadata;
}

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MediaMeta, uploadMedia } from "../services/media";

interface Props {
  onUploaded?: (meta: MediaMeta) => void;
}

export const UploadForm: React.FC<Props> = ({ onUploaded }) => {
  const [progress, setProgress] = useState<number>(0);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (file: File) => uploadMedia(file, setProgress),
  });

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProgress(0);
    try {
      const meta = await mutateAsync(file);
      onUploaded?.(meta);
    } catch (err: any) {
      // eslint-disable-next-line no-alert
      alert(err?.response?.data?.error?.message || "Upload failed");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="sr-only">Choose file</span>
        <input
          type="file"
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
          disabled={isPending}
          onChange={onChange}
        />
      </label>
      {isPending && (
        <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
          <div
            className="h-2 bg-brand-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

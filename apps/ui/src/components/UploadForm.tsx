import React, { useCallback, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { FileMetadata, uploadMediaMultiple } from "../services/media";

interface Props {
  onUploaded?: (meta: FileMetadata) => void;
}

export const UploadForm: React.FC<Props> = ({ onUploaded }) => {
  const [progress, setProgress] = useState<number>(0);
  const [dirMode, setDirMode] = useState<boolean>(false);
  const [uploadingCount, setUploadingCount] = useState<{ total: number; done: number }>({ total: 0, done: 0 });

  const batchUpload = useMutation({
    mutationFn: async (files: File[]) => uploadMediaMultiple(files, setProgress),
  });

  const isPending = batchUpload.isPending;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles?.length) return;

      setProgress(0);
      setUploadingCount({ total: acceptedFiles.length, done: 0 });
      try {
        const metas = await batchUpload.mutateAsync(acceptedFiles);
        for (const meta of metas) {
          onUploaded?.(meta);
        }
        setUploadingCount({ total: acceptedFiles.length, done: acceptedFiles.length });
      } catch (err: any) {
        // eslint-disable-next-line no-alert
        alert(err?.response?.data?.error?.message || "Upload failed");
      }
    },
    [batchUpload, onUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    // react-dropzone + file-selector flatten dropped directories automatically when possible
  });

  const inputDirectoryProps = useMemo(
    () =>
      dirMode
        ? ({
            // @ts-ignore - vendor-specific attribute for folder selection (Chromium)
            webkitdirectory: "",
          } as any)
        : {},
    [dirMode]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={dirMode}
            onChange={(e) => setDirMode(e.target.checked)}
          />
          Select a folder (click)
        </label>
      </div>

      <div
        {...getRootProps()}
        className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-md transition-colors cursor-pointer bg-white ${
          isDragActive ? "border-brand-600 bg-brand-50" : "border-gray-300 hover:border-gray-400"
        } ${isPending ? "opacity-60 cursor-not-allowed" : ""}`}
        aria-disabled={isPending}
      >
        <input {...getInputProps()} {...inputDirectoryProps} disabled={isPending} />
        <div className="text-center">
          <div className="text-sm font-medium">Drag and drop files or folders here</div>
          <div className="text-xs text-gray-500">or click to browse{dirMode ? " a folder" : " files"}</div>
        </div>
      </div>

      {isPending && (
        <div className="space-y-2">
          <div className="text-xs text-gray-600">
            Uploading {uploadingCount.done} / {uploadingCount.total}
          </div>
          <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
            <div
              className="h-2 bg-brand-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

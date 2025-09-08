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
    <div className="space-y-4 sm:space-y-6">
      {/* Folder selection toggle */}
      <div className="flex items-center justify-center sm:justify-start">
        <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer touch-target">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={dirMode}
              onChange={(e) => setDirMode(e.target.checked)}
            />
            <div className={`w-11 h-6 rounded-full border-2 transition-all duration-200 ${dirMode ? 'bg-brand-600 border-brand-600' : 'bg-gray-200 border-gray-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${dirMode ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
            </div>
          </div>
          <span>Select entire folders</span>
        </label>
      </div>

      {/* Upload area */}
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden ${
          isDragActive 
            ? "border-brand-500 bg-brand-50 scale-[1.02]" 
            : "border-gray-300 bg-gray-50/50 hover:border-brand-400 hover:bg-brand-50/50"
        } ${isPending ? "opacity-70 cursor-not-allowed" : ""} touch-manipulation`}
        aria-disabled={isPending}
      >
        <input {...getInputProps()} {...inputDirectoryProps} disabled={isPending} />
        
        {/* Upload icon */}
        <div className={`mb-4 p-3 rounded-full transition-all duration-200 ${
          isDragActive ? 'bg-brand-100' : 'bg-white shadow-sm'
        }`}>
          <svg className={`h-8 w-8 sm:h-10 sm:w-10 transition-colors duration-200 ${
            isDragActive ? 'text-brand-600' : 'text-gray-400'
          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        </div>

        {/* Upload text */}
        <div className="text-center space-y-2">
          <div className={`text-base sm:text-lg font-medium transition-colors duration-200 ${
            isDragActive ? 'text-brand-700' : 'text-gray-900'
          }`}>
            {isDragActive ? 'Drop your files here' : 'Drag and drop files here'}
          </div>
          <div className="text-sm text-gray-500 max-w-sm mx-auto">
            or <span className="text-brand-600 font-medium">click to browse</span>
            {dirMode ? ' for folders' : ' for files'}
          </div>
          <div className="text-xs text-gray-400 pt-2">
            Supports images, videos, documents and more
          </div>
        </div>

        {/* Animated background effect */}
        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-brand-600/5 animate-pulse" />
        )}
      </div>

      {/* Progress indicator */}
      {isPending && (
        <div className="space-y-4 animate-slide-up">
          {/* Upload status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="loading-spinner h-4 w-4" />
              <span className="font-medium text-gray-900">
                Uploading files...
              </span>
            </div>
            <span className="text-gray-600">
              {uploadingCount.done} / {uploadingCount.total}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent" />
          </div>
          
          {/* Progress percentage */}
          <div className="text-center">
            <span className="text-xs font-medium text-gray-600">
              {Math.round(progress)}% complete
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

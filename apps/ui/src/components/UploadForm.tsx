import { useMutation } from "@tanstack/react-query";
import React, { useCallback, useId, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileMetadata, uploadMediaMultiple } from "../services/media";
import { toastService } from "../services/toast";
import {
  announceToScreenReader,
  handleReactKeyboardActivation,
} from "../utils/accessibility";

interface Props {
  onUploaded?: (meta: FileMetadata) => void;
}

export const UploadForm: React.FC<Props> = ({ onUploaded }) => {
  const [progress, setProgress] = useState<number>(0);
  const [dirMode, setDirMode] = useState<boolean>(false);
  const [uploadingCount, setUploadingCount] = useState<{
    total: number;
    done: number;
  }>({ total: 0, done: 0 });

  // Generate unique IDs for accessibility
  const toggleId = useId();
  const dropzoneId = useId();
  const progressId = useId();

  const batchUpload = useMutation({
    mutationFn: async (files: File[]) =>
      uploadMediaMultiple(files, setProgress),
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
        setUploadingCount({
          total: acceptedFiles.length,
          done: acceptedFiles.length,
        });

        // Show success message and announce to screen readers
        const fileCount = acceptedFiles.length;
        const message =
          fileCount === 1
            ? `Successfully uploaded ${acceptedFiles[0].name}`
            : `Successfully uploaded ${fileCount} files`;
        toastService.success(message);
        announceToScreenReader(message, "assertive");
      } catch (err: any) {
        // Error toast is handled by API interceptor
        console.error("Upload error:", err);
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
        <div className="flex items-center gap-3">
          <div className="toggle-switch">
            <input
              id={toggleId}
              type="checkbox"
              role="switch"
              checked={dirMode}
              onChange={(e) => setDirMode(e.target.checked)}
              className="sr-only"
              aria-describedby={`${toggleId}-help`}
              aria-checked={dirMode}
            />
            <label htmlFor={toggleId} className="toggle-slider" />
          </div>
          <label
            htmlFor={toggleId}
            className="text-sm font-medium text-gray-700 cursor-pointer select-none touch-target"
          >
            Select entire folders
          </label>
        </div>
        <div id={`${toggleId}-help`} className="sr-only">
          Toggle switch for folder selection. 
          {dirMode
            ? "Currently enabled: will select entire folders when browsing"
            : "Currently disabled: will select individual files when browsing"}
        </div>
      </div>

      {/* Upload area */}
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden ${
          isDragActive
            ? "border-brand-500 bg-brand-50 scale-[1.02]"
            : "border-gray-300 bg-gray-50/50 hover:border-brand-400 hover:bg-brand-50/50"
        } ${
          isPending ? "opacity-70 cursor-not-allowed" : ""
        } touch-manipulation`}
        role="button"
        aria-disabled={isPending}
        aria-describedby={`${dropzoneId}-help`}
        aria-label={`Upload ${
          dirMode ? "folders" : "files"
        }. Drag and drop or click to select.`}
        tabIndex={isPending ? -1 : 0}
        onKeyDown={(e) => {
          if (!isPending) {
            handleReactKeyboardActivation(e, () => {
              // Trigger file input click
              const input = e.currentTarget.querySelector(
                'input[type="file"]'
              ) as HTMLInputElement;
              input?.click();
            });
          }
        }}
      >
        <input
          {...getInputProps()}
          {...inputDirectoryProps}
          disabled={isPending}
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Upload icon */}
        <div
          className={`mb-4 p-3 rounded-full transition-all duration-200 ${
            isDragActive ? "bg-brand-100" : "bg-white shadow-sm"
          }`}
          aria-hidden="true"
        >
          <svg
            className={`h-8 w-8 sm:h-10 sm:w-10 transition-colors duration-200 ${
              isDragActive ? "text-brand-600" : "text-gray-400"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
        </div>

        {/* Upload text */}
        <div className="text-center space-y-2">
          <div
            className={`text-base sm:text-lg font-medium transition-colors duration-200 ${
              isDragActive ? "text-brand-700" : "text-gray-900"
            }`}
          >
            {isDragActive
              ? `Drop your ${dirMode ? "folders" : "files"} here`
              : `Drag and drop ${dirMode ? "folders" : "files"} here`}
          </div>
          <div className="text-sm text-gray-500 max-w-sm mx-auto">
            or{" "}
            <span className="text-brand-600 font-medium">click to browse</span>
            {dirMode ? " for folders" : " for files"}
          </div>
          <div className="text-xs text-gray-400 pt-2">
            Supports images, videos, documents and more
          </div>
        </div>

        {/* Accessibility help text */}
        <div id={`${dropzoneId}-help`} className="sr-only">
          Upload area for {dirMode ? "folders" : "files"}.
          {isDragActive
            ? "Files are being dragged over the upload area. Release to upload."
            : "Press Enter or Space to open file browser, or drag and drop files here."}
          {isPending && " Upload in progress, please wait."}
        </div>

        {/* Animated background effect */}
        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-brand-600/5 animate-pulse" />
        )}
      </div>

      {/* Progress indicator */}
      {isPending && (
        <div
          className="space-y-4 animate-slide-up"
          role="region"
          aria-labelledby={`${progressId}-label`}
          aria-live="polite"
        >
          {/* Upload status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="loading-spinner h-4 w-4" aria-hidden="true" />
              <span
                id={`${progressId}-label`}
                className="font-medium text-gray-900"
              >
                Uploading files...
              </span>
            </div>
            <span
              className="text-gray-600"
              aria-label={`${uploadingCount.done} of ${uploadingCount.total} files uploaded`}
            >
              {uploadingCount.done} / {uploadingCount.total}
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div
              className="w-full bg-gray-200 rounded-full h-3 overflow-hidden"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-describedby={`${progressId}-description`}
            >
              <div
                className="h-3 bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent"
              aria-hidden="true"
            />
          </div>

          {/* Progress percentage */}
          <div className="text-center">
            <span
              id={`${progressId}-description`}
              className="text-xs font-medium text-gray-600"
            >
              {Math.round(progress)}% complete
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

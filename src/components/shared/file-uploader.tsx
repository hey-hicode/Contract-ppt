"use client";

import { File, FileText, UploadCloud, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Progress } from "~/components/ui/progress";
import toast from "react-hot-toast";
import { cn } from "~/lib/utils";

interface FileUploadProgress {
  progress: number;
  file: File;
  status: "uploading" | "processing" | "completed" | "error";
  message?: string;
}

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  setParsedText: (text: string) => void;
  maxSize: number;
  onUploadStart?: (file: File) => void;
  onProcessing?: (file: File) => void;
  onUploadComplete?: (file: File, parsedText: string) => void;
  onUploadError?: (file: File | null, message: string) => void;
  onFileRemoved?: (file: File) => void;
}

const statusCopy: Record<FileUploadProgress["status"], string> = {
  uploading: "Uploading to parser...",
  processing: "Extracting contract text...",
  completed: "Ready to review the extracted text.",
  error: "We could not process this file. Remove it and try again.",
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${value} ${sizes[i]}`;
};

export default function FileUpload({
  onFileUpload,
  setParsedText,
  maxSize,
  onUploadStart,
  onProcessing,
  onUploadComplete,
  onUploadError,
  onFileRemoved,
}: FileUploadProps) {
  const [filesToUpload, setFilesToUpload] = useState<FileUploadProgress[]>([]);

  const maxSizeInMb = useMemo(
    () => Math.round((maxSize / (1024 * 1024)) * 10) / 10,
    [maxSize]
  );

  const updateFileState = useCallback(
    (file: File, patch: Partial<FileUploadProgress>) => {
      setFilesToUpload((prev) =>
        prev.map((item) =>
          item.file === file
            ? {
                ...item,
                ...patch,
              }
            : item
        )
      );
    },
    []
  );

  const removeFile = useCallback(
    (file: File) => {
      setFilesToUpload((prevUploadProgress) =>
        prevUploadProgress.filter((item) => item.file !== file)
      );
      onFileRemoved?.(file);
    },
    [onFileRemoved]
  );

  const uploadFileToApi = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        // mark uploading
        updateFileState(file, { progress: 35, status: "uploading" });

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        // Try to parse JSON once (works for both OK and error bodies)
        let data: any = null;
        try {
          data = await response.json();
        } catch (parseErr) {
          // JSON parse failed — handle gracefully
          throw new Error("Invalid response from server.");
        }

        if (!response.ok) {
          // If the server sent an error message, surface it
          const serverMsg =
            (data && (data.error || data.message || data.details)) ||
            "Failed to upload file";
          throw new Error(serverMsg);
        }

        // At this point data should contain the parsed result from server
        const parsedText: string =
          typeof data === "object" ? data.text ?? "" : "";

        // mark processing
        updateFileState(file, { progress: 70, status: "processing" });
        onProcessing?.(file);

        // final update
        updateFileState(file, { progress: 100, status: "completed" });

        // Set parsed text correctly and call completion callback with the text
        setParsedText(parsedText);
        onUploadComplete?.(file, parsedText);

        toast.success(`${file.name} parsed successfully.`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong.";
        updateFileState(file, {
          progress: 0,
          status: "error",
          message,
        });
        toast.error(`Upload failed: ${message}`);
        onUploadError?.(file, message);
      }
    },
    [
      onProcessing,
      onUploadComplete,
      onUploadError,
      setParsedText,
      updateFileState,
    ]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }

      if (acceptedFiles.length > 1) {
        const message = "Please upload only one PDF file.";
        toast.error(message);
        onUploadError?.(null, message);
        return;
      }

      const file = acceptedFiles[0];

      setParsedText("");
      setFilesToUpload([{ file, progress: 15, status: "uploading" }]);
      onFileUpload(file);
      onUploadStart?.(file);
      await uploadFileToApi(file);
    },
    [onFileUpload, onUploadError, onUploadStart, setParsedText, uploadFileToApi]
  );

  const handleDropRejected = useCallback(
    (rejections: FileRejection[]) => {
      rejections.forEach((rejection) => {
        const isTooLarge = rejection.errors.some(
          (error) => error.code === "file-too-large"
        );
        const isInvalidType = rejection.errors.some(
          (error) => error.code === "file-invalid-type"
        );

        let message = "Unable to upload file.";

        if (isTooLarge) {
          message = `File exceeds the ${maxSizeInMb}MB limit.`;
        } else if (isInvalidType) {
          message = "Only PDF files are supported.";
        } else if (rejection.errors[0]) {
          message = rejection.errors[0].message;
        }

        toast.error(message);
        onUploadError?.(null, message);
      });
    },
    [maxSizeInMb, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: handleDropRejected,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize,
    multiple: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <label
          {...getRootProps()}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-0",
            isDragActive && "border-sky-400/60 bg-sky-500/10"
          )}
        >
          <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sky-200">
            <UploadCloud className="size-7 text-primary" />
          </div>
          <div className="text-center text-sm text-slate-200/80">
            <p className="text-primary underline underline-offset-4">
              {isDragActive ? "Drop to start parsing" : "Drag & drop your PDF"}
            </p>

            <p className="mt-2 text-xs text-slate-400/80">
              Files should be under {maxSizeInMb} MB.
            </p>
          </div>
        </label>
        <Input
          {...getInputProps()}
          id="dropzone-file"
          accept="application/pdf"
          type="file"
          className="hidden"
        />
      </div>

      {/* {filesToUpload.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-400">
            Upload progress
          </p>
          <ScrollArea className="h-44 pr-3">
            <div className="space-y-3">
              {filesToUpload.map((fileUploadProgress) => {
                const fileKey = `${fileUploadProgress.file.name}-${fileUploadProgress.file.lastModified}`;
                const disableRemoval =
                  fileUploadProgress.status === "uploading" ||
                  fileUploadProgress.status === "processing";

                return (
                  <div
                    key={fileKey}
                    className="flex items-start gap-4 rounded-2xl border dark:border-white/10 bg-white/5 p-4 shadow-sm shadow-sky-500/20 transition "
                  >
            <div className="flex size-10 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/10 text-sky-600 dark:text-sky-200">
                        <FileText className="size-5 text-primary" />
                      </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-slate-200/80">
                        <p className="text-sm font-medium text-gray-500">
                          {fileUploadProgress.file.name}
                        </p>
                        <span className="text-xs text-white/10">
                          {formatBytes(fileUploadProgress.file.size)}
                        </span>
                      </div>
                      <Progress
                        value={fileUploadProgress.progress}
                        className="bg-white/10 [&_[data-slot=progress-indicator]]:bg-primary"
                      />
                      <p className="text-xs text-slate-400/80">
                        {statusCopy[fileUploadProgress.status]}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(fileUploadProgress.file)}
                      className={cn(
                        "mt-1 inline-flex size-8 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-rose-400/50 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40",
                        disableRemoval && "cursor-not-allowed opacity-50"
                      )}
                      disabled={disableRemoval}
                      title="Remove file"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )} */}
    </div>
  );
}

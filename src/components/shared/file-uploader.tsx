"use client";

import { UploadCloud } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Input } from "~/components/ui/input";
import toast from "react-hot-toast";
import { cn } from "~/lib/utils";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  setParsedText: (text: string) => void;
  maxSize: number;
  onUploadStart?: (file: File) => void;
  onProcessing?: (file: File) => void;
  onUploadComplete?: (file: File, parsedText: string) => void;
  onUploadError?: (file: File | null, message: string) => void;
}

export default function FileUpload({
  onFileUpload,
  setParsedText,
  maxSize,
  onUploadStart,
  onProcessing,
  onUploadComplete,
  onUploadError,
}: FileUploadProps) {
  const maxSizeInMb = useMemo(
    () => Math.round((maxSize / (1024 * 1024)) * 10) / 10,
    [maxSize]
  );

  const uploadFileToApi = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const message =
            data?.error ||
            data?.message ||
            data?.details ||
            "Failed to upload file.";
          throw new Error(message);
        }

        const parsedText = data?.text ?? "";

        onProcessing?.(file);
        setParsedText(parsedText);
        onUploadComplete?.(file, parsedText);

        toast.success(`${file.name} parsed successfully.`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed.";
        toast.error(message);
        onUploadError?.(file, message);
      }
    },
    [onProcessing, onUploadComplete, onUploadError, setParsedText]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      if (acceptedFiles.length > 1) {
        const msg = "Please upload only one document at a time.";
        toast.error(msg);
        onUploadError?.(null, msg);
        return;
      }

      const file = acceptedFiles[0];

      setParsedText("");
      onFileUpload(file);
      onUploadStart?.(file);

      await uploadFileToApi(file);
    },
    [onFileUpload, onUploadError, onUploadStart, setParsedText, uploadFileToApi]
  );

  const handleDropRejected = useCallback(
    (rejections: FileRejection[]) => {
      rejections.forEach((rejection) => {
        let message = "Unable to upload file.";

        if (rejection.errors.some((e) => e.code === "file-too-large")) {
          message = `File exceeds the ${maxSizeInMb}MB limit.`;
        } else if (
          rejection.errors.some((e) => e.code === "file-invalid-type")
        ) {
          message = "Supported formats: PDF, DOCX, TXT, MD.";
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
    multiple: false,
    maxSize,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
  });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-10 transition",
          isDragActive && "border-sky-400/60 bg-sky-500/10"
        )}
      >
        <input {...getInputProps()} />

        <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
          <UploadCloud className="size-7 text-primary" />
        </div>

        <div className="text-center text-sm text-slate-200/80">
          <p className="text-primary underline underline-offset-4">
            {isDragActive
              ? "Drop to start parsing"
              : "Drag & drop your contract"}
          </p>

          <p className="mt-2 text-xs text-slate-400/80">
            PDF, Word, or Text • Max {maxSizeInMb}MB
          </p>
        </div>
      </div>
    </div>
  );
}

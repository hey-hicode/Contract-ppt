"use client";


import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardCopy,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import FileUpload from "~/components/shared/file-uploader";

import { cn } from "~/lib/utils";
import { Textarea } from "~/components/ui/textarea";
import { useRouter } from "next/navigation";

type UploadPhase = "idle" | "uploading" | "processing" | "completed" | "error";



type ContractAnalysis = {
  summary: string;
  keyClauses: string[];
  risks: string[];
  actionItems: string[];
  suggestedPrompts?: string[];
};

type AnalysisPhase = "idle" | "loading" | "ready" | "error";

type UploadedFileInfo = {
  name: string;
  size: number;
  lastModified: number;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${value} ${sizes[i]}`;
};

const statusConfig: Record<
  UploadPhase,
  { label: string; className: string; icon: typeof Clock; spin?: boolean }
> = {
  idle: {
    label: "Awaiting upload",
    className:
      "border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 text-gray-700 dark:text-slate-200",
    icon: Clock,
  },
  uploading: {
    label: "Uploading",
    className:
      "border-amber-400/40 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100",
    icon: Loader2,
    spin: true,
  },
  processing: {
    label: "Processing",
    className:
      "border-sky-400/40 bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-100",
    icon: Loader2,
    spin: true,
  },
  completed: {
    label: "Ready to review",
    className:
      "border-emerald-400/40 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100",
    icon: CheckCircle2,
  },
  error: {
    label: "Upload failed",
    className:
      "border-rose-400/40 bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-100",
    icon: XCircle,
  },
};

function formatModifiedDate(file: Pick<UploadedFileInfo, "lastModified">) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(file.lastModified);
}

const toUploadedFileInfo = (file: File): UploadedFileInfo => ({
  name: file.name,
  size: file.size,
  lastModified: file.lastModified,
});

export default function AnalyzePage() {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const router = useRouter();

  const [uploadedFileInfo, setUploadedFileInfo] =
    useState<UploadedFileInfo | null>(null);
  const [parsedText, setParsedText] = useState("");
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [statusMessage, setStatusMessage] = useState(
    "Upload a contract PDF to start parsing."
  );
  const [isCopying, setIsCopying] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState<AnalysisPhase>("idle");
  const [, setAnalysisError] = useState<string | null>(null);


  const [selectedModel, setSelectedModel] = useState(
    "anthropic/claude-3.5-sonnet:beta"
  );
  const [shouldAutoTriggerAnalysis, setShouldAutoTriggerAnalysis] =
    useState(false);
  const promptForSignIn = useCallback(() => {
    void openSignIn?.({
      afterSignInUrl: "/dashboard",
      afterSignUpUrl: "/dashboard",
    });
  }, [openSignIn]);

  const {
    label,
    icon: StatusIcon,
    className,
    spin,
  } = statusConfig[uploadPhase];

  const handleUploadStart = (file: File) => {
    setUploadedFileInfo(toUploadedFileInfo(file));
    setParsedText("");
    setUploadPhase("uploading");
    setStatusMessage(`Uploading ${file.name}...`);
    setAnalysisPhase("idle");
    setShouldAutoTriggerAnalysis(false);
  };

  const handleProcessing = (file: File) => {
    setUploadPhase("processing");
    setStatusMessage(
      `Processing ${file.name}. This usually takes less than a minute.`
    );
  };

  const handleUploadComplete = (file: File) => {
    const fileInfo = toUploadedFileInfo(file);
    setUploadedFileInfo(fileInfo);
    setUploadPhase("completed");
    setStatusMessage(
      isSignedIn
        ? `Finished parsing ${file.name}. Review the extracted text below.`
        : `Finished parsing ${file.name}. Sign in to run an AI analysis.`
    );
    setAnalysisPhase("idle");
    if (isSignedIn) {
      setShouldAutoTriggerAnalysis(false);
    } else {
      setShouldAutoTriggerAnalysis(true);
      promptForSignIn();
    }
  };

  const handleUploadError = (_file: File | null, message: string) => {
    setUploadedFileInfo(null);
    setUploadPhase("error");
    setStatusMessage(message);
    setAnalysisPhase("error");
    setShouldAutoTriggerAnalysis(false);
  };

  const handleFileSelected = (file: File) => {
    setUploadedFileInfo(toUploadedFileInfo(file));
  };

  const handleFileRemoved = () => {
    setUploadedFileInfo(null);
    setParsedText("");
    setUploadPhase("idle");
    setStatusMessage("Upload a contract PDF to start parsing.");
    setAnalysisPhase("idle");
    setShouldAutoTriggerAnalysis(false);
  };

  const handleReset = () => {
    handleFileRemoved();
  };

  const handleCopy = async () => {
    if (!parsedText) return;
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(parsedText);
      toast.success("Copied extracted text to your clipboard.");
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Unable to copy. Please copy the text manually instead.";
      toast.error(message);
    } finally {
      setIsCopying(false);
    }
  };

  // in AnalyzePage.tsx (or .tsx file where performAnalysis lives)
  const performAnalysis = useCallback(async () => {
    setShouldAutoTriggerAnalysis(false);
    setAnalysisPhase("loading");
    setAnalysisError(null);

    try {
      const response = await fetch("/api/analyze-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: parsedText,
          documentName: uploadedFileInfo?.name ?? "Contract",
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          errorBody?.error ?? "Unable to analyze this contract right now.";
        setAnalysisPhase("error");
        setAnalysisError(message);
        toast.error(message);
        return;
      }

      const data = (await response.json()) as {
        analysis: ContractAnalysis;
        model: string;
        title?: string;
      };


      setAnalysisPhase("ready");
      setSelectedModel(data.model);
      toast.success("Analysis complete.");

      // store analysis, contractText, and inferred title in sessionStorage
      try {
        sessionStorage.setItem(
          "contractAnalysis",
          JSON.stringify({
            analysis: data.analysis,
            contractText: parsedText,
            sourceTitle: data.title ?? "",
            model: data.model ?? selectedModel,
          })
        );
      } catch (e) {
        console.warn("Failed to write analysis to sessionStorage", e);
      }

      // navigate to results page
      router.push("/dashboard/analyze/result");
    } catch (err) {
      console.error("performAnalysis error:", err);
      setAnalysisPhase("error");
      toast.error("Unexpected issue contacting the analysis service.");
    }
  }, [parsedText, selectedModel, uploadedFileInfo, router]);

  const requestAnalysis = useCallback(() => {
    if (!parsedText.trim()) {
      toast.error("Upload and parse a contract before requesting analysis.");
      return;
    }

    if (!isSignedIn) {
      toast.error("Sign in to run the AI analysis.");
      setShouldAutoTriggerAnalysis(true);
      promptForSignIn();
      return;
    }

    if (analysisPhase === "loading") return;
    void performAnalysis();
  }, [analysisPhase, isSignedIn, parsedText, performAnalysis, promptForSignIn]);

  useEffect(() => {
    if (
      isSignedIn &&
      shouldAutoTriggerAnalysis &&
      parsedText.trim() &&
      uploadPhase === "completed" &&
      analysisPhase !== "loading"
    ) {
      void performAnalysis();
    }
  }, [
    analysisPhase,
    isSignedIn,
    parsedText,
    performAnalysis,
    shouldAutoTriggerAnalysis,
    uploadPhase,
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden  text-gray-900 dark:text-white">
      <header className="flex justify-between gap-6 bg-gray-light rounded-md p-5 flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">
              Review your contract
            </h1>
          </div>
        </div>
        <div
          className={cn(
            "inline-flex items-center w-fit gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide shadow-sm backdrop-blur",
            className
          )}
        >
          <StatusIcon className={cn("size-4", spin && "animate-spin")} />
          <span className="hidden md:flex">{label}</span>

        </div>
      </header>

      <div className="relative o flex r flex-col gap-10 py-12 md:gap-12 md:py-16">
        <main className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="space-y-6 rounded-3xl border h-fit border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6  backdrop-blur">
            <div className="space-y-3">
              <h2 className="text-2xl font-medium tracking-tight">
                Ready your contract for parsing
              </h2>
              <p className="mb-12 text-sm leading-relaxed! text-body-color dark:text-body-color-dark ">
                Upload the PDF you received from a label, brand, or platform.
                Keeping it in this format preserves clause references, payment
                tables, and signatures for downstream review.
              </p>
            </div>
            <FileUpload
              onFileUpload={handleFileSelected}
              setParsedText={setParsedText}
              maxSize={8 * 1024 * 1024}
              onUploadStart={handleUploadStart}
              onProcessing={handleProcessing}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              onFileRemoved={handleFileRemoved}

            />
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 ">
              <div className="flex items-center justify-between gap-4  border-gray-200 dark:border-white/10 pb-4">
                <div>
                  <h3 className="text-2xl font-medium tracking-tight">
                    Upload status
                  </h3>
                  <p className=" text-sm leading-relaxed! text-body-color dark:text-body-color-dark ">
                    {statusMessage}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/10 text-gray-700 dark:text-slate-100 transition hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/20"
                  onClick={handleReset}
                  disabled={uploadPhase === "idle"}
                >
                  <RefreshCw className="size-4" />
                  Reset
                </Button>
              </div>
              {uploadedFileInfo ? (
                <div className="mt-4 space-y-4 text-sm text-gray-700 dark:text-slate-200/80">
                  <div className="flex items-start justify-between gap-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/10 text-sky-600 dark:text-sky-200">
                        <FileText className="size-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {uploadedFileInfo.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400/80">
                          {formatBytes(uploadedFileInfo.size)} · Last updated{" "}
                          {formatModifiedDate(uploadedFileInfo)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-300/80">
                      {uploadPhase === "completed"
                        ? "Parsed"
                        : uploadPhase === "error"
                          ? "Issue detected"
                          : "Processing"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 p-6 text-sm text-gray-600 dark:text-slate-200/60">
                  <p>
                    Once you upload a contract, its metadata and parsing
                    progress will appear here.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 md:p-6 ">
              <div className=" flex-wrap space-y-2 items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-4">
                <div>
                  <h3 className="text-2xl font-medium tracking-tight">
                    Extracted text
                  </h3>
                  <p className=" text-sm leading-relaxed! text-body-color dark:text-body-color-dark ">
                    {parsedText
                      ? "Use this output in diligence checklists, summaries, and OpenRouter prompts."
                      : uploadPhase === "error"
                        ? "We were unable to parse the file. Upload a new PDF and try again."
                        : "The parsed result will be displayed here when ready."}
                  </p>
                </div>
                <div className="flex gap-2 md:justify-end items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/10 text-gray-700 dark:text-slate-100 transition hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/20"
                    onClick={handleCopy}
                    disabled={!parsedText || isCopying}
                  >
                    {isCopying ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ClipboardCopy className="size-4" />
                    )}
                    Copy text
                  </Button>



                  {/* ANALYZE BUTTON */}
                  <Button
                    variant="default"
                    size="lg"
                    onClick={requestAnalysis}
                    disabled={
                      !parsedText.trim() ||
                      uploadPhase === "processing" ||
                      analysisPhase === "loading"
                    }
                    className="ml-2 text-white rounded-full"
                  >
                    {analysisPhase === "loading" ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze "
                    )}
                  </Button>
                </div>
              </div>

              <Textarea
                placeholder="Paste your contract text here..."
                value={parsedText}
                onChange={(e) => {
                  setParsedText(e.target.value);
                }}
                className="h-[300px] font-mono text-sm border-2 border-gray-200 rounded-xl p-4 transition-all duration-300  dark:text-black bg-white/80 backdrop-blur-sm"
                onFocus={(e) => {
                  e.target.style.borderColor = "rgb(117, 62, 233)";
                  e.target.style.boxShadow =
                    "0 0 0 2px rgba(117, 62, 233, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

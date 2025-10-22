"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCopy,
  Clock,
  FileText,
  Lightbulb,
  ListChecks,
  Loader2,
  RefreshCw,
  Sparkles,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import FileUpload from "~/components/shared/file-uploader";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

type UploadPhase =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "error";

const detailBullets = [
  "Accepts PDF contracts up to 8 MB.",
  "Keeps sections, exhibits, and attachments intact for review.",
  "Outputs clean text for negotiation prep or legal briefs.",
] as const;

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
    className: "border-white/15 bg-white/5 text-slate-200",
    icon: Clock,
  },
  uploading: {
    label: "Uploading",
    className: "border-amber-400/40 bg-amber-500/20 text-amber-100",
    icon: Loader2,
    spin: true,
  },
  processing: {
    label: "Processing",
    className: "border-sky-400/40 bg-sky-500/20 text-sky-100",
    icon: Loader2,
    spin: true,
  },
  completed: {
    label: "Ready to review",
    className: "border-emerald-400/40 bg-emerald-500/20 text-emerald-100",
    icon: CheckCircle2,
  },
  error: {
    label: "Upload failed",
    className: "border-rose-400/40 bg-rose-500/20 text-rose-100",
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
  const [uploadedFileInfo, setUploadedFileInfo] = useState<UploadedFileInfo | null>(null);
  const [parsedText, setParsedText] = useState("");
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [statusMessage, setStatusMessage] = useState(
    "Upload a contract PDF to start parsing."
  );
  const [isCopying, setIsCopying] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState<AnalysisPhase>("idle");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [selectedModel, setSelectedModel] = useState(
    "anthropic/claude-3.5-sonnet:beta"
  );
  const [shouldAutoTriggerAnalysis, setShouldAutoTriggerAnalysis] = useState(false);
  const promptForSignIn = useCallback(() => {
    void openSignIn?.({
      afterSignInUrl: "/analyze",
      afterSignUpUrl: "/analyze",
    });
  }, [openSignIn]);

  const sections = useMemo(() => {
    if (!parsedText.trim()) {
      return [];
    }

    return parsedText
      .split(/\n{2,}/)
      .map((section) => section.trim())
      .filter(Boolean);
  }, [parsedText]);

  const { label, icon: StatusIcon, className, spin } = statusConfig[uploadPhase];

  const handleUploadStart = (file: File) => {
    setUploadedFileInfo(toUploadedFileInfo(file));
    setParsedText("");
    setUploadPhase("uploading");
    setStatusMessage(`Uploading ${file.name}...`);
    setAnalysisPhase("idle");
    setAnalysis(null);
    setAnalysisError(null);
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
    setAnalysis(null);
    setAnalysisError(null);
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
    setAnalysis(null);
    setAnalysisError(message);
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
    setAnalysis(null);
    setAnalysisError(null);
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

  const performAnalysis = useCallback(async () => {
    setShouldAutoTriggerAnalysis(false);
    setAnalysisPhase("loading");
    setAnalysisError(null);
    try {
      const response = await fetch("/api/analyze-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      };

      setAnalysis(data.analysis);
      setAnalysisPhase("ready");
      setSelectedModel(data.model);
      toast.success("OpenRouter analysis complete.");
    } catch {
      setAnalysisPhase("error");
      setAnalysisError("Unexpected issue contacting OpenRouter.");
      toast.error("Unexpected issue contacting OpenRouter.");
    }
  }, [parsedText, selectedModel, uploadedFileInfo]);

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
  }, [
    analysisPhase,
    isSignedIn,
    parsedText,
    performAnalysis,
    promptForSignIn,
  ]);

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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.3),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(244,114,182,0.25),_transparent_60%)]" />
        <div className="absolute inset-0 backdrop-blur-[120px]" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-5 py-12 md:gap-12 md:py-16">
            <header className="flex flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 px-6 py-6 shadow-xl shadow-sky-500/20 backdrop-blur md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-full border border-white/15 bg-white/10 text-slate-100 transition hover:border-white/30 hover:bg-white/20 hover:text-white"
                >
                  <Link href="/">
                    <ArrowLeft className="size-4" />
                    Back
                  </Link>
                </Button>
                <div>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-300/80">
                    Analyzer workspace
                  </span>
                  <h1 className="mt-1 text-3xl font-semibold text-white md:text-4xl">
                    Review your contract
                  </h1>
                </div>
              </div>
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide shadow-sm backdrop-blur",
                  className
                )}
              >
                <StatusIcon className={cn("size-4", spin && "animate-spin")} />
                {label}
              </div>
            </header>

            <main className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-sky-500/20 backdrop-blur">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-200/80">
                    <Sparkles className="size-4 text-sky-300" />
                    Step 1 - Upload a PDF export
                  </span>
                  <h2 className="text-2xl font-semibold text-white">
                    Ready your contract for parsing
                  </h2>
                  <p className="text-sm text-slate-200/80">
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
                <ul className="space-y-2 text-sm text-slate-200/80">
                  {detailBullets.map((detail) => (
                    <li key={detail} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 text-emerald-300" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-sky-500/20 backdrop-blur">
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Upload status
                      </h3>
                      <p className="text-xs text-slate-200/80">{statusMessage}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full border border-white/10 bg-white/10 text-slate-100 transition hover:border-white/20 hover:bg-white/20"
                      onClick={handleReset}
                      disabled={uploadPhase === "idle"}
                    >
                      <RefreshCw className="size-4" />
                      Reset
                    </Button>
                  </div>
                  {uploadedFileInfo ? (
                    <div className="mt-4 space-y-4 text-sm text-slate-200/80">
                      <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-sky-200">
                            <FileText className="size-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-white">
                              {uploadedFileInfo.name}
                            </p>
                            <p className="text-xs text-slate-400/80">
                              {formatBytes(uploadedFileInfo.size)} · Last updated{" "}
                              {formatModifiedDate(uploadedFileInfo)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs uppercase tracking-wider text-slate-300/80">
                          {uploadPhase === "completed"
                            ? "Parsed"
                            : uploadPhase === "error"
                              ? "Issue detected"
                              : "Processing"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-200/60">
                      <p>
                        Once you upload a contract, its metadata and parsing progress
                        will appear here.
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-sky-500/20 backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Extracted text
                      </h3>
                      <p className="text-xs text-slate-200/80">
                        {parsedText
                          ? "Use this output in diligence checklists, summaries, and OpenRouter prompts."
                          : uploadPhase === "error"
                            ? "We were unable to parse the file. Upload a new PDF and try again."
                            : "The parsed result will be displayed here when ready."}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full border border-white/10 bg-white/10 text-slate-100 transition hover:border-white/20 hover:bg-white/20"
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full border border-white/10 bg-white/10 text-slate-100 transition hover:border-white/20 hover:bg-white/20"
                        onClick={handleReset}
                        disabled={!parsedText && uploadPhase === "idle"}
                      >
                        <RefreshCw className="size-4" />
                        Clear
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="mt-4 h-[26rem] w-full rounded-2xl border border-white/10 bg-white/5 p-4">
                    {sections.length > 0 ? (
                      <div className="space-y-4">
                        {sections.map((section, index) => (
                          <div
                            key={`${index}-${section.slice(0, 12)}`}
                            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200/85 shadow-sm"
                          >
                            <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-sky-200">
                              <FileText className="size-3 text-sky-200" />
                              Section {index + 1}
                            </span>
                            <p className="whitespace-pre-wrap">{section}</p>
                          </div>
                        ))}
                      </div>
                    ) : uploadPhase === "uploading" || uploadPhase === "processing" ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="h-20 animate-pulse rounded-2xl bg-white/10" />
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400/70">
                        Upload a contract to see the parsed text preview.
                      </div>
                    )}
                  </ScrollArea>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-sky-500/20 backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        AI contract insights
                      </h3>
                      <p className="text-xs text-slate-200/80">
                        Send the parsed text to OpenRouter for clause summaries,
                        risks, and action items.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden text-right text-xs text-slate-300/80 sm:block">
                        <p className="font-medium text-slate-100">Model</p>
                        <p>{selectedModel}</p>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-full bg-gradient-to-r from-sky-400 via-purple-500 to-rose-500 text-white shadow-lg shadow-sky-500/30 transition hover:shadow-sky-500/45"
                        onClick={requestAnalysis}
                        disabled={
                          !parsedText ||
                          uploadPhase !== "completed" ||
                          analysisPhase === "loading"
                        }
                      >
                        {analysisPhase === "loading" ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Analyzing…
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-4" />
                            {isSignedIn ? "Analyze with OpenRouter" : "Sign in to analyze"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-4 text-sm text-slate-200/80">
                    {analysisPhase === "idle" && (
                      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4">
                        {!parsedText
                          ? "Upload and parse a contract to enable OpenRouter analysis. Results appear here once the AI review finishes."
                          : uploadPhase !== "completed"
                              ? "Processing your contract. We'll enable OpenRouter analysis as soon as parsing completes."
                              : isSignedIn
                                  ? "Your contract is ready. Click Analyze to send it to OpenRouter."
                                  : "Sign in to run the AI analysis. We'll start automatically as soon as you're authenticated."
                        }
                      </div>
                    )}
                    {analysisPhase === "loading" && (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-3">
                          <Loader2 className="size-4 animate-spin text-sky-300" />
                          <span>Generating legal overview…</span>
                        </div>
                      </div>
                    )}
                    {analysisPhase === "error" && analysisError && (
                      <div className="flex items-start gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/20 p-4 text-rose-100">
                        <TriangleAlert className="mt-0.5 size-4 text-rose-100" />
                        <div>
                          <p className="font-medium">Analysis failed</p>
                          <p className="text-xs">{analysisError}</p>
                        </div>
                      </div>
                    )}
                    {analysisPhase === "ready" && analysis && (
                      <div className="space-y-5">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="mt-0.5 size-5 text-sky-200" />
                            <div>
                              <p className="text-sm font-semibold text-white">
                                Summary
                              </p>
                              <p className="mt-1 text-sm leading-6 text-slate-200/80">
                                {analysis.summary}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center gap-2 text-white">
                              <ListChecks className="size-4 text-sky-200" />
                              <p className="text-sm font-semibold text-white">
                                Key clauses
                              </p>
                            </div>
                            <ul className="mt-3 space-y-2 text-sm text-slate-200/80">
                              {analysis.keyClauses.length > 0 ? (
                                analysis.keyClauses.map((clause, index) => (
                                  <li key={`${index}-${clause.slice(0, 16)}`}>
                                    • {clause}
                                  </li>
                                ))
                              ) : (
                                <li className="text-slate-400/80">
                                  No clause highlights detected.
                                </li>
                              )}
                            </ul>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center gap-2 text-white">
                              <TriangleAlert className="size-4 text-rose-200" />
                              <p className="text-sm font-semibold text-white">
                                Risks
                              </p>
                            </div>
                            <ul className="mt-3 space-y-2 text-sm text-slate-200/80">
                              {analysis.risks.length > 0 ? (
                                analysis.risks.map((risk, index) => (
                                  <li key={`${index}-${risk.slice(0, 16)}`}>
                                    • {risk}
                                  </li>
                                ))
                              ) : (
                                <li className="text-slate-400/80">
                                  No immediate risks flagged.
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center gap-2 text-white">
                            <CheckCircle2 className="size-4 text-emerald-300" />
                            <p className="text-sm font-semibold text-white">
                              Action items
                            </p>
                          </div>
                          <ul className="mt-3 space-y-2 text-sm text-slate-200/80">
                            {analysis.actionItems.length > 0 ? (
                              analysis.actionItems.map((item, index) => (
                                <li key={`${index}-${item.slice(0, 16)}`}>
                                  • {item}
                                </li>
                              ))
                            ) : (
                              <li className="text-slate-400/80">
                                No specific follow-ups suggested.
                              </li>
                            )}
                          </ul>
                        </div>

                        {analysis.suggestedPrompts &&
                          analysis.suggestedPrompts.length > 0 && (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <p className="text-sm font-semibold text-white">
                                Suggested OpenRouter prompts
                              </p>
                              <ul className="mt-3 space-y-2 text-sm text-slate-200/80">
                                {analysis.suggestedPrompts.map(
                                  (prompt, index) => (
                                    <li key={`${index}-${prompt.slice(0, 16)}`}>
                                      • {prompt}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
  );
}

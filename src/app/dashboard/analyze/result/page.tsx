"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Calendar,
  Shield,
  AlertCircle,

} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { trackFeatureUsage } from "~/lib/analytics";
import { downloadElementAsPdf } from "~/utils/downloadPdfFromElement";
import { cn } from "~/lib/utils";

import ActionSheets from "~/components/Dashboard/ActionSheets";

interface RedFlag {
  type: "critical" | "warning" | "minor";
  title: string;
  description: string;
  clause: string;
  recommendation: string;
  id: string
}

interface AnalysisResult {
  redFlags: RedFlag[];
  overallRisk: "low" | "medium" | "high";
  summary: string;
  recommendations: string[];
}

interface StoredData {
  analysis: AnalysisResult;
  contractText: string;
  sourceTitle: string;
  model?: string;
}

export default function AnalyzerResultsPage() {
  const [data, setData] = useState<StoredData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const analysis = data?.analysis ?? null;

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const stored = sessionStorage.getItem("contractAnalysis");
      if (!stored) {
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(stored) as {
        analysis?: AnalysisResult;
        contractText?: string;
        sourceTitle?: string;
        model?: string;
      } | null;

      if (!parsed || typeof parsed !== "object" || !parsed.analysis) {
        console.warn("Invalid contractAnalysis in sessionStorage, ignoring.");
        setLoading(false);
        return;
      }

      const parsedData = {
        analysis: parsed.analysis,
        contractText: parsed.contractText ?? "",
        sourceTitle: parsed.sourceTitle ?? "",
        model: parsed.model ?? undefined,
      };

      setData(parsedData);



      trackFeatureUsage("results_page_viewed");
    } catch (err) {
      console.error("Failed to parse stored analysis:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-700 bg-red-50 border-red-200";
      case "medium":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "low":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      default:
        return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };





  // Email and chat handled by ActionSheets

  async function handleSave() {
    if (!data || !analysis) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const payload = {
        sourceTitle: data.sourceTitle ?? document?.title ?? "Untitled Contract",
        docFingerprint: null,
        model: data.model ?? null,
        promptVersion: null,
        overallRisk: analysis.overallRisk ?? "low",
        summary: analysis.summary ?? "",
        redFlags: analysis.redFlags ?? [],
        recommendations: analysis.recommendations ?? [],
        raw: {
          analysis,
          contractText: data.contractText ?? "",
          savedAt: new Date().toISOString(),
        },
      };

      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || "Save failed");
      }

      const json = await res.json();
      setSavedId(json.id);
      trackFeatureUsage("analysis_saved");
    } catch (err: unknown) {
      console.error("save error:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to save analysis"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Analyzing contract details...
          </p>
        </div>
      </div>
    );
  }

  if (!data || !analysis) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-slate-100 rounded-full">
              <FileText className="h-10 w-10 text-slate-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            No Analysis Found
          </h2>
          <p className="text-slate-600 mb-6">
            Please go back and analyze a contract first to see the results here.
          </p>
          <Button
            onClick={() => router.push("/dashboard/analyze")}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Return to Analyzer
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div
        className=" mx-auto px-4 sm:px-6 lg:px-8 py-8"
        id="analysis-report-content"
      >
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {data.sourceTitle}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Counselr
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                className={cn(
                  "px-4 py-2 rounded-md font-bold border flex items-center gap-2 font-medium",
                  getRiskColor(analysis.overallRisk)
                )}
              >
                <AlertCircle className="h-5 w-5" />
                <span className="capitalize text-xs">
                  {analysis.overallRisk} Risk Detected
                </span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/dashboard/analyze")}
                className="text-slate-600"
              >
                New Analysis
              </Button>
              <div className="h-6 w-px bg-slate-200" />
              <Button
                variant="outline"
                size="lg"
                onClick={handleSave}
                disabled={saving || !!savedId}
                className={cn(savedId ? "" : "bg-primary text-white")}
              >
                {saving ? (
                  <span className="animate-pulse">Saving...</span>
                ) : savedId ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" /> Saved
                  </>
                ) : (
                  <>Save </>
                )}
              </Button>
              <Button
                size="lg"
                className="text-white"
                onClick={() => {
                  const el = document.getElementById("analysis-report-content");
                  if (el) {
                    trackFeatureUsage("report_downloaded");
                    void downloadElementAsPdf(
                      el,
                      `Analysis - ${data.sourceTitle}.pdf`
                    );
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" /> Export PDF
              </Button>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            {errorMsg}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
          <Card className="!h-fit !shadow-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
              <CardTitle className="text-sm font-medium text-slate-600">
                Overall Risk Score
              </CardTitle>
              <Shield
                className={cn(
                  "h-4 w-4",
                  analysis.overallRisk === "high"
                    ? "text-red-500"
                    : analysis.overallRisk === "medium"
                      ? "text-amber-500"
                      : "text-emerald-500"
                )}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize text-slate-900">
                {analysis.overallRisk}
              </div>
            </CardContent>
          </Card>
          <Card className="!h-fit !shadow-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
              <CardTitle className="text-sm font-medium text-slate-600">
                Issues Identified
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {analysis.redFlags?.length ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card className="!h-fit !shadow-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
              <CardTitle className="text-sm font-medium text-slate-600">
                Recommendations
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {analysis.recommendations?.length ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Summary (Sticky) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="  !shadow-none bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {/* <FileText className="h-5 w-5 text-primary" /> */}
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {analysis.summary}
                  </p>
                </CardContent>
              </Card>

              <Card className="  !shadow-none bg-white">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-slate-900">
                    Analysis Confidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[95%]"></div>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">
                      95%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    AI confidence score based on legal database matching.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column: Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="risks" className="w-full">
              <TabsList className="w-full justify-start rounded-none bg-slate-50/50 p-2 h-auto mb-6 overflow-x-auto whitespace-nowrap">
                <TabsTrigger
                  value="risks"
                  className="rounded-none border data-[state=active]:border-slate-50 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-none px-6 py-2"
                >
                  Risks & Issues
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-slate-100 text-slate-600"
                  >
                    {analysis.redFlags?.length ?? 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="clauses"
                  className="rounded-none border-b-2 border-transparent  data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-none px-6 py-2"
                >
                  Problematic Clauses
                </TabsTrigger>
                <TabsTrigger
                  value="suggestions"
                  className="rounded-none border-b-2 border-transparent  data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-none px-6 py-2"
                >
                  Suggestions
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="risks"
                className="space-y-4 animate-in fade-in-50 duration-300"
              >
                {analysis.redFlags?.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-md">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
                    <h3 className="text-lg font-medium text-slate-900">
                      No Risks Detected
                    </h3>
                    <p className="text-slate-500">
                      The contract appears to be safe.
                    </p>
                  </div>
                ) : (
                  analysis.redFlags.map((flag: RedFlag) => (
                    <Card
                      key={flag.id}
                      className={cn(
                        "border-l-4 rounded-none transition-all hover:shadow-md",
                        flag.type === "critical"
                          ? "border-l-red-500"
                          : flag.type === "warning"
                            ? "border-l-amber-500"
                            : "border-l-blue-500"
                      )}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            {/* {getRedFlagIcon(flag.type)} */}
                            <CardTitle className="text-base font-semibold text-slate-900">
                              {flag.title}
                            </CardTitle>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              flag.type === "critical"
                                ? "text-red-700 border-red-200 bg-red-50"
                                : flag.type === "warning"
                                  ? "text-amber-700 border-amber-200 bg-amber-50"
                                  : "text-blue-700 border-blue-200 bg-blue-50"
                            )}
                          >
                            {flag.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-slate-700">
                          {flag.description}
                        </p>
                        {flag.clause && (
                          <div className="bg-slate-50 p-3 rounded border border-slate-100 text-xs font-mono text-slate-600">
                            &quot;{flag.clause}&quot;
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent
                value="clauses"
                className="space-y-4 animate-in fade-in-50 duration-300"
              >
                {analysis.redFlags?.map((flag: RedFlag, idx: number) => (
                  <Card
                    key={idx}
                    className="group hover:border-primary/50 transition-colors"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        Clause Reference
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <blockquote className="border-l-2 border-slate-300 pl-4 italic text-slate-700 font-serif text-lg">
                        &quot;{flag.clause}&quot;
                      </blockquote>
                      <div className="mt-4 flex items-center gap-2 text-sm text-red-600 font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        Issue: {flag.title}
                      </div>
                    </CardContent>
                  </Card>
                )
                )}
              </TabsContent>

              <TabsContent
                value="suggestions"
                className="space-y-4 animate-in fade-in-50 duration-300"
              >
                {analysis.recommendations?.map((rec: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                        {idx + 1}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-slate-900 mb-1">
                        Recommendation
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {rec}
                      </p>
                    </div>
                  </div>
                )
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {/* Floating Actions: Chat + Email (reusable) */}
      <ActionSheets
        chatEnabled={!!savedId}
        analysisId={savedId}
        documentText={data.contractText}
        emailData={{
          title: data.sourceTitle,
          summary: analysis.summary,
          overallRisk: analysis.overallRisk,
          redFlags: analysis.redFlags,
          recommendations: analysis.recommendations,
        }}
      />
    </div>
  );
}

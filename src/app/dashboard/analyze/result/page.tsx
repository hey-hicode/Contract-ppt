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
  BarChart3,
  Mail,
  X,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { trackFeatureUsage } from "~/lib/analytics";

interface RedFlag {
  type: "critical" | "warning" | "minor";
  title: string;
  description: string;
  clause: string;
  recommendation: string;
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
  const [flagFilter, setFlagFilter] = useState<string>("all");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  // ADDED
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // ADDED (optional)
  const router = useRouter();
  const analysis = data?.analysis ?? null;
  useEffect(() => {
    if (!analysis || savedId || saving) return;
    // void handleSave() // uncomment to auto-save once loaded
  }, [analysis, savedId, saving]);

  // inside AnalyzerResultsPage useEffect
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

      setData({
        analysis: parsed.analysis,
        contractText: parsed.contractText ?? "",
        // make sure stored shape matches your StoredData type
        // @ts-ignore
        sourceTitle: parsed.sourceTitle ?? "",
        // @ts-ignore
        model: parsed.model ?? null,
      } as any);

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
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRedFlagIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "minor":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRedFlagColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-l-red-500 bg-red-50/50";
      case "warning":
        return "border-l-yellow-500 bg-yellow-50/50";
      case "minor":
        return "border-l-blue-500 bg-blue-50/50";
      default:
        return "border-l-gray-500 bg-gray-50/50";
    }
  };

  const generateEmailContent = (analysis: AnalysisResult) => {
    const subject = `Contract Analysis Report - Action Required`;

    const content = `Dear [Recipient Name],

I hope this email finds you well. I am writing to share the results of our recent contract analysis and discuss some important recommendations that require attention.

**Executive Summary:**
${analysis.summary}

**Key Findings:**
- Risk Level: ${
      analysis.overallRisk?.charAt(0).toUpperCase() +
      analysis.overallRisk?.slice(1)
    }
- Issues Identified: ${analysis.redFlags?.length}
- Recommendations: ${analysis.recommendations?.length}

**Priority Recommendations:**
${analysis.recommendations
  .slice(0, 3)
  .map((rec, index) => `${index + 1}. ${rec}`)
  .join("\n")}

**Critical Issues to Address:**
${analysis.redFlags
  .filter((flag) => flag.type === "critical")
  .slice(0, 2)
  .map((flag, index) => `${index + 1}. ${flag.title}: ${flag.description}`)
  .join("\n")}

I would appreciate the opportunity to discuss these findings with you in detail. Please let me know when you would be available for a meeting to review the contract and implement the necessary changes.

Thank you for your attention to this matter. I look forward to hearing from you soon.

Best regards,
[Your Name]
[Your Title]
[Your Contact Information]`;

    return { subject, content };
  };

  const handleEmailDraft = () => {
    if (!data?.analysis) return;

    trackFeatureUsage("email_draft_opened");
    const { subject, content } = generateEmailContent(data.analysis);
    setEmailSubject(subject);
    setEmailContent(content);
    setShowEmailModal(true);
  };

  const handleSendEmail = () => {
    // Track email send action
    trackFeatureUsage("email_sent");
    // Create mailto link
    openMailClient(recipientEmail, emailSubject, emailContent);
    // const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(
    //   emailSubject
    // )}&body=${encodeURIComponent(emailContent)}`;
    // window.location.href = mailtoLink;
    setShowEmailModal(false);
  };
  function openMailClient(to: string, subject: string, body: string) {
    const maxLen = 10000; // conservative safe limit
    if (body.length > maxLen) {
      // if mailto too long: download as file instead
      const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "contract-analysis.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      // toast.success("Email body was large — downloaded as contract-analysis.txt for manual attach.");
      return;
    }
    const mailto = `mailto:${encodeURIComponent(
      to
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    // open in new window (safer in some browsers)
    window.open(mailto, "_self");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: "rgb(117, 62, 233)" }}
            ></div>
            <p className="text-gray-600">Loading analysis results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Analysis Found
            </h2>
            <p className="text-gray-600 mb-6">
              Please go back and analyze a contract first.
            </p>
            <Button
              onClick={() => router.push("/dashboard/analyze")}
              className="text-white hover:opacity-90 transition-all duration-200"
              style={{ backgroundColor: "rgb(117, 62, 233)" }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analyzer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // const { analysis } = data;

  // ADDED
  // inside AnalyzerResultsPage (replace existing handleSave)
  async function handleSave() {
    if (!data || !analysis) return;
    setSaving(true);
    setErrorMsg(null);

    try {
      // Build payload - server expects camelCase keys which will be mapped to snake_case in DB insert
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
    } catch (err: any) {
      console.error("save error:", err);
      setErrorMsg(err.message ?? "Failed to save analysis");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative container mx-auto px-4 py-8">
        {/* ADDED — header actions right side */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/analyzer")}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analyzer
          </Button>

          <div className="flex items-center gap-3">
            {savedId ? (
              <Badge
                variant="outline"
                className="text-green-700 border-green-300 bg-green-50"
              >
                Saved ✓
              </Badge>
            ) : null}
            <Button
              size="lg"
              onClick={handleSave}
              disabled={saving || !!savedId}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {saving ? "Saving..." : savedId ? "Saved" : "Save to History"}
            </Button>
          </div>
        </div>

        {/* ADDED — small error text */}
        {errorMsg ? (
          <p className="text-sm text-red-600 mt-2">Couldn’t save: {errorMsg}</p>
        ) : null}
        <div className=" p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Analysis Results
                </h1>

                {/* show inferred title if available */}
                {/** data may have sourceTitle if stored earlier **/}
                {data?.sourceTitle ? (
                  <p className="text-lg text-gray-700 mt-1">
                    <strong>Document:</strong> {data.sourceTitle}
                  </p>
                ) : // optionally still show a small filename fallback if you have it
                data?.contractText ? (
                  <p className="text-sm text-gray-500 mt-1">
                    Document preview available
                  </p>
                ) : null}
                <p className="text-gray-600 mt-2 text-lg">
                  Comprehensive AI-powered contract analysis and risk assessment
                </p>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 border ${getRiskColor(
                analysis?.overallRisk!
              )}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium capitalize">
                {analysis?.overallRisk} Risk
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Results Card */}
        <Card className="bg-white/90 backdrop-blur-sm border border-white/50 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
            <CardTitle className="text-2xl font-bold flex items-center gap-3 text-gray-900">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              Contract Analysis Report
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Tabs defaultValue="overview" className="w-full">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border  border-gray-200 shadow-mdp-2 pb-4 mb-8">
                <TabsList className="grid w-full grid-cols-3 bg-transparent gap-2">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-purple-50 transition-all duration-300 rounded-xl py-3 px-4 font-semibold"
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="redflags"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-purple-50 transition-all duration-300 rounded-xl py-3 px-4 font-semibold"
                  >
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Red Flags ({analysis?.redFlags?.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="recommendations"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-purple-50 transition-all duration-300 rounded-xl py-3 px-4 font-semibold"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Recommendations
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="space-y-20">
                {/* Executive Summary */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl mt-20  border border-black/20 p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      Executive Summary
                    </h3>
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                      <p className="text-gray-700 leading-relaxed text-lg font-medium">
                        {analysis?.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl  border border-gray-200 shadow-md p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                          Issues Found
                        </h3>
                        <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="text-5xl font-bold text-gray-900 mb-2 text-center">
                        {analysis?.redFlags?.length}
                      </div>
                      <p className="text-gray-600 text-center font-medium">
                        Red flags identified
                      </p>
                      <div className="mt-4 h-2 bg-gradient-to-r from-red-400 to-pink-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl border  border-gray-200 shadow-md p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                          Recommendations
                        </h3>
                        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="text-5xl font-bold text-gray-900 mb-2 text-center">
                        {analysis?.recommendations?.length}
                      </div>
                      <p className="text-gray-600 text-center font-medium">
                        Improvement suggestions
                      </p>
                      <div className="mt-4 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl  border  border-gray-200 shadow-md p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                          Risk Assessment
                        </h3>
                        <div
                          className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                            analysis?.overallRisk === "high"
                              ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                              : analysis?.overallRisk === "medium"
                              ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                              : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          }`}
                        >
                          {analysis &&
                            analysis?.overallRisk?.charAt(0).toUpperCase() +
                              analysis?.overallRisk?.slice(1)}{" "}
                          Risk
                        </div>
                      </div>
                      <div className="text-5xl font-bold mb-4 text-center">
                        {analysis?.overallRisk === "high"
                          ? "⚠️"
                          : analysis?.overallRisk === "medium"
                          ? "⚡"
                          : "✅"}
                      </div>
                      <div
                        className={`h-2 rounded-full ${
                          analysis?.overallRisk === "high"
                            ? "bg-gradient-to-r from-red-400 to-red-600"
                            : analysis?.overallRisk === "medium"
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                            : "bg-gradient-to-r from-green-400 to-emerald-500"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="redflags" className="space-y-6">
                {analysis?.redFlags?.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                      No Red Flags Found
                    </h3>
                    <p>
                      This contract appears to be well-structured with no major
                      issues detected.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border">
                      <h3 className="text-sm font-semibold text-gray-700 mr-4 flex items-center">
                        Filter by severity:
                      </h3>
                      <Button
                        variant={flagFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setFlagFilter("all");
                          trackFeatureUsage("filter_all_flags");
                        }}
                        className={
                          flagFilter === "all"
                            ? "bg-purple-600 hover:bg-purple-700 border-purple-600 border text-white"
                            : "border-purple-600 border hover:bg-purple-50"
                        }
                      >
                        All ({analysis?.redFlags?.length})
                      </Button>
                      <Button
                        variant={
                          flagFilter === "critical" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          setFlagFilter("critical");
                          trackFeatureUsage("filter_critical_flags");
                        }}
                        className={
                          flagFilter === "critical"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "hover:bg-red-50 border-red-200 text-red-700"
                        }
                      >
                        Critical (
                        {
                          analysis?.redFlags?.filter(
                            (f) => f.type === "critical"
                          ).length
                        }
                        )
                      </Button>
                      <Button
                        variant={
                          flagFilter === "warning" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setFlagFilter("warning")}
                        className={
                          flagFilter === "warning"
                            ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                            : "hover:bg-yellow-50 border-yellow-200 text-yellow-700"
                        }
                      >
                        Warning (
                        {
                          analysis?.redFlags?.filter(
                            (f) => f.type === "warning"
                          ).length
                        }
                        )
                      </Button>
                      <Button
                        variant={flagFilter === "minor" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFlagFilter("minor")}
                        className={
                          flagFilter === "minor"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "hover:bg-blue-50 border-blue-200 text-blue-700"
                        }
                      >
                        Minor (
                        {
                          analysis?.redFlags?.filter((f) => f.type === "minor")
                            .length
                        }
                        )
                      </Button>
                    </div>

                    {/* Filtered Results */}
                    <div className="space-y-4">
                      {analysis?.redFlags
                        .filter(
                          (flag) =>
                            flagFilter === "all" || flag.type === flagFilter
                        )
                        .map((flag, index) => (
                          <div
                            key={index}
                            className={`relative overflow-hidden rounded-xl  ${getRedFlagColor(
                              flag.type
                            )} hover:shadow-lg transition-all duration-300 group`}
                          >
                            <div className="p-6 ml-4">
                              <div className="flex items-start gap-4">
                                <div
                                  className={`p-3 rounded-full ${
                                    flag.type === "critical"
                                      ? "bg-red-100"
                                      : flag.type === "warning"
                                      ? "bg-yellow-100"
                                      : "bg-blue-100"
                                  }`}
                                >
                                  {getRedFlagIcon(flag.type)}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-4">
                                    <h4 className="font-bold text-gray-900 text-xl group-hover:text-purple-700 transition-colors">
                                      {flag.title}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className={`text-sm capitalize font-semibold px-3 py-1 ${
                                        flag.type === "critical"
                                          ? "bg-red-50 text-red-700 border-red-300"
                                          : flag.type === "warning"
                                          ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                                          : "bg-blue-50 text-blue-700 border-blue-300"
                                      }`}
                                    >
                                      {flag.type}
                                    </Badge>
                                  </div>

                                  <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                                    {flag.description}
                                  </p>

                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-white/90 p-5 rounded-lg border border-gray-300 shadow-sm">
                                      <strong className="text-gray-900 block mb-3 text-sm uppercase tracking-wide">
                                        📄 Relevant Clause
                                      </strong>
                                      <p className="text-gray-700 italic leading-relaxed">
                                        "{flag.clause}"
                                      </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200 shadow-sm">
                                      <strong className="text-blue-800 block mb-3 text-sm uppercase tracking-wide">
                                        💡 Recommendation
                                      </strong>
                                      <p className="text-blue-700 leading-relaxed">
                                        {flag.recommendation}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {analysis?.redFlags?.filter(
                      (flag) => flagFilter === "all" || flag.type === flagFilter
                    ).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No {flagFilter} flags found.</p>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                {analysis?.recommendations?.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                      No Recommendations
                    </h3>
                    <p>
                      This contract appears to be well-structured with no
                      improvements needed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="mb-8">
                      <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        Action Items
                      </h3>
                      <p className="text-gray-600 text-lg">
                        Here are our recommended next steps to improve your
                        contract:
                      </p>
                    </div>
                    <div
                      className="border p-4 space-y-4 !rounded-md border-gray-200
                    "
                    >
                      {analysis?.recommendations?.map(
                        (recommendation, index) => (
                          <div
                            key={index}
                            className="bg-white/90 backdrop-blur-sm rounded-2xl     relative overflow-hidden group  transition-all duration-300"
                          >
                            <div className="absolute -top-10 left-0 w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-y-12 translate-x-12 opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>

                            <div className="relative z-10">
                              <div className="flex items-start gap-6">
                                <div className="flex-1">
                                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="p-1 bg-green-500 rounded-full">
                                        <CheckCircle className="h-4 w-4 text-white" />
                                      </div>
                                      <strong className="text-green-800 text-lg font-bold">
                                        Recommendation
                                      </strong>
                                    </div>
                                    <p className="text-green-700 leading-relaxed font-medium text-lg">
                                      {recommendation}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button
            onClick={() => router.push("/analyzer")}
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            Analyze Another Contract
          </Button>
          <Button
            onClick={handleEmailDraft}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Draft Email
          </Button>
          <Button
            onClick={() => {
              trackFeatureUsage("report_printed");
              window.print();
            }}
            className="text-white hover:opacity-90 transition-all duration-200"
            style={{ backgroundColor: "rgb(117, 62, 233)" }}
          >
            Print Report
          </Button>
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-white/50 w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Draft Email Report
                    </h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEmailModal(false)}
                    className="hover:bg-red-50 border-red-200 hover:border-red-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="Enter recipient's email address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Content
                    </label>
                    <textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      rows={20}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                      placeholder="Email content will be generated automatically..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  This will open your default email client with the pre-filled
                  content.
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowEmailModal(false)}
                    className="hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendEmail}
                    disabled={!recipientEmail.trim()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Open Email Client
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

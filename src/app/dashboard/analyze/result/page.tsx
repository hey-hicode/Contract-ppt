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
import { downloadElementAsPdf } from "~/utils/downloadPdfFromElement";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose } from "~/components/ui/dialog";

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
  const [emailContent, setEmailContent] = useState<any>("");
  const [emailSubject, setEmailSubject] = useState<any>("");
  const [recipientEmail, setRecipientEmail] = useState<any>("");
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
        // @ts-ignore
        sourceTitle: parsed.sourceTitle ?? "",
        // @ts-ignore
        model: parsed.model ?? null,
      } as any;

      setData(parsedData);

      // Pre-generate email draft when data loads
      if (parsedData?.analysis) {
        const { subject, content } = generateEmailContent(parsedData.analysis);
        setEmailSubject(subject);
        setEmailContent(content);
      }

      trackFeatureUsage("results_page_viewed");
    } catch (err) {
      console.error("Failed to parse stored analysis:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  console.log(data);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "!text-red-700 bg-red-50 !border !border-red-700";
      case "medium":
        return "!text-amber-700 bg-amber-50 !border !border-amber-700";
      case "low":
        return "!text-emerald-700 bg-emerald-50 !border !border-emerald-700";
      default:
        return "!text-slate-700 bg-slate-50 !border !border-slate-200";
    }
  };

  const getRedFlagIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case "minor":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-slate-600" />;
    }
  };

  const generateEmailContent = (analysis: AnalysisResult) => {
    const subject = `Contract Analysis Report - Action Required`;
    const content = `Dear [Recipient Name],

I hope this email finds you well. I am writing to share the results of our recent contract analysis and discuss some important recommendations that require attention.

**Executive Summary:**
${analysis.summary}

**Key Findings:**
- Risk Level: ${analysis.overallRisk?.charAt(0).toUpperCase() + analysis.overallRisk?.slice(1)}
- Issues Identified: ${analysis.redFlags?.length}
- Recommendations: ${analysis.recommendations?.length}

**Priority Recommendations:**
${analysis.recommendations.slice(0, 3).map((rec, index) => `${index + 1}. ${rec}`).join("\n")}

**Critical Issues to Address:**
${analysis.redFlags.filter((flag) => flag.type === "critical").slice(0, 2).map((flag, index) => `${index + 1}. ${flag.title}: ${flag.description}`).join("\n")}

Best regards,
[Your Name]`;
    return { subject, content };
  };

  const handleSendEmail = () => {
    trackFeatureUsage("email_sent");
    openMailClient(recipientEmail, emailSubject, emailContent);
  };

  function openMailClient(to: string, subject: string, body: string) {
    const maxLen = 10000;
    if (body.length > maxLen) {
      const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "contract-analysis.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return;
    }
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_self");
  }

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
    } catch (err: any) {
      console.error("save error:", err);
      setErrorMsg(err.message ?? "Failed to save analysis");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-300 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading analysis results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.analysis) {
    return (
      <div className="min-h-screen bg-white">
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Analysis Found</h2>
            <p className="text-slate-600 mb-6">Please go back and analyze a contract first.</p>
            <Button onClick={() => router.push("/dashboard/analyze")} className="bg-indigo-600 text-white hover:bg-indigo-700">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Analyzer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative px-6 py-8">
        {/* Header + actions */}
        <div className="flex items-center justify-between">
       {/* Document header */}
        <div className="mt-6 mb-6">
          <div className="flex  justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-slate-900">{data?.sourceTitle ?? "Contract Analysis Report"}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Uploaded {new Date().toLocaleDateString()}</span>
              </div>
            </div>
       
          </div>
        </div>

          <div className="flex items-center gap-3">
      
            <Button
             
          
              className={getRiskColor(data.analysis.overallRisk) + " border-slate-300 text-slate-700 !px-10 py-5 hover:bg-slate-50"}
            >
              {data.analysis.overallRisk}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/analyze")}
              className="border-slate-300 text-slate-700 !p-5 hover:bg-slate-50"
            >
              Analyze New Contract
            </Button>
            <Button
              onClick={() => {
                const el = document.getElementById("analysis-report");
                if (el) {
                  trackFeatureUsage("report_downloaded");
                  void downloadElementAsPdf(el, "contract-analysis.pdf");
                }
              }}
              className="bg-primary !p-5 text-white"
            >
              Download Report
            </Button>
            <Button
              size="lg"
              onClick={handleSave}
              disabled={saving || !!savedId}
              className="bg-primary hover:bg-primary-dark !p-5 text-white"
            >
              {saving ? "Saving..." : savedId ? "Saved" : "Save"}
            </Button>
          </div>
        </div>

        {errorMsg ? <p className="text-sm text-red-600 mt-2">Couldn’t save: {errorMsg}</p> : null}
       <div className="space-y-3 grid gap-4 grid-cols-3">
              <div className="rounded-md border border-slate-200 p-4 flex items-center gap-3">
                <div className="p-3 rounded-full bg-red-500">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">Risk Level</div>
                  <div className="text-2xl font-semibold text-slate-900 capitalize">{analysis?.overallRisk}</div>
                </div>
              </div>
              <div className="rounded-md border border-slate-200 p-4 flex items-center gap-3">
                <div className="p-3 rounded-full bg-amber-600">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">Issues Found</div>
                  <div className="text-2xl font-semibold text-slate-900">{analysis?.redFlags?.length ?? 0}</div>
                </div>
              </div>
              <div className="rounded-md border border-slate-200 p-4 flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">Recommendations</div>
                  <div className="text-2xl font-semibold text-slate-900">{analysis?.recommendations?.length ?? 0}</div>
                </div>
              </div>
            </div>
        {/* 3-column layout: sticky summary (left), scrollable tabs (middle), fixed email panel (right) */}
        <div id="analysis-report" className="mt-6 grid grid-cols-1 lg:flex  gap-6">
          {/* Sticky Summary Left */}

          <div className="lg:sticky lg:top-20 max-w-[500px] lg:self-start space-y-6">
            <Card className=" !border-r-2 rounded-none border-0  border-r-slate-400  !shadow-none ">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Contract Analysis Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">{analysis?.summary}</p>
              </CardContent>
            </Card>

     
          </div>

          {/* Scrollable Tabs Middle */}
          <div className="min-h-[60vh] lg:max-h-[calc(100vh-220px)] flex  w-full gap-2 overflow-y-auto pr-1">
            <Tabs defaultValue="risks" className="w-full">
              <div>
                <TabsList className="grid w-full h-[55px] grid-cols-3 bg-primary/50 rounded-md border border-slate-200">
                  <TabsTrigger value="risks" className="data-[state=active]:bg-white hover:text-primary transition-all text-white data-[state=active]:text-primary hover:bg-slate-50 rounded-none py-3 px-4 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4 mr-2" /> Risks
                  </TabsTrigger>
                  <TabsTrigger value="clauses" className="data-[state=active]:bg-white hover:text-primary transition-all data-[state=active]:text-primary text-white hover:bg-slate-50 rounded-none py-3 px-4 text-sm font-medium">
                    <FileText className="h-4 w-4 mr-2" /> Clauses
                  </TabsTrigger>
                  <TabsTrigger value="suggestions" className="data-[state=active]:bg-white hover:text-primary transition-all data-[state=active]:text-primary text-white hover:bg-slate-50 rounded-none py-3 px-4 text-sm font-medium">
                    <CheckCircle className="h-4 w-4 mr-2" /> Suggestions
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Risks */}
              <TabsContent value="risks" className="space-y-6 pt-4">
                {analysis?.redFlags?.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-600" />
                    <h3 className="text-base font-semibold mb-2 text-slate-900">No Risks Found</h3>
                    <p>This contract appears well-structured with no major issues detected.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analysis?.redFlags.map((flag, index) => (
                      <div key={index} className="rounded-md border-2 border-l-red-500 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-3">
                            {getRedFlagIcon(flag.type)}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-slate-900">{flag.title}</h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${flag.type === "critical" ? "border-red-300 text-red-700" : flag.type === "warning" ? "border-amber-300 text-amber-700" : "border-blue-300 text-blue-700"}`}>
                                  {flag.type}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 mt-1">{flag.description}</p>
                            </div>
                          </div>
                          <p className="text-xs text-emerald-600 font-medium">+ 95% confidence</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Clauses */}
              <TabsContent value="clauses" className="space-y-4 pt-4">
                {(analysis?.redFlags ?? []).map((flag, idx) => (
                  <div key={idx} className="rounded-md border border-slate-200 p-4">
                    <div className="text-xs font-semibold text-body-color mb-2">Relevant Clause</div>
                    <p className="text-sm font-bold text-slate-900 italic">"{flag.clause}"</p>
                  </div>
                ))}
              </TabsContent>

              {/* Suggestions */}
              <TabsContent value="suggestions" className="space-y-6 pt-4">
                {analysis?.recommendations?.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-600" />
                    <h3 className="text-base font-semibold mb-2 text-slate-900">No Recommendations</h3>
                    <p>This contract appears well-structured with no improvements needed.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analysis?.recommendations?.map((rec, index) => (
                      <div key={index} className="rounded-md border-2 border-l-green-600 p-4">
                        <div className="text-xs font-semibold text-body-color mb-2">Recommendation</div>
                        <p className="text-sm text-slate-900 font-bold">{rec}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

      {/* Right-side email panel removed; replaced by floating button + off-canvas drawer */}
          </div>

    
        </div>

        {/* Footer actions */}
                {/* Floating Draft Email button + Off-canvas Drawer */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="fixed bottom-6 right-6 z-50 shadow-lg bg-primary text-white hover:bg-primary-dark animate-bounce h-12 w-12 rounded-full p-0 grid place-items-center"
              aria-label="Open Draft Email"
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Draft Email</span>
            </Button>
          </DialogTrigger>
          <DialogContent
            className="!right-0 !top-0 !left-auto !translate-x-0 !translate-y-0 !h-screen bg-white !w-full  !rounded-none !border-l !p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
            showCloseButton
          >
            <div className="flex items-center justify-between border-b p-4">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                Draft Email Report
              </DialogTitle>
        
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100vh-56px-64px)]">
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-semibold text-body-color mb-1">Recipient Email</label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-body-color mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-body-color mb-1">Email Content</label>
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    rows={30}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
                  />
                </div>
              </div>
                       <div className=" p-4">
              <Button   className="w-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center gap-2"
              size={"lg"}
              
              >
                <Send className="h-4 w-4" /> Send Email
              </Button>
            </div>
            </div>
   
          </DialogContent>
        </Dialog>
  
      </div>
    </div>
  );
}

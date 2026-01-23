"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Shield,
  AlertCircle,
  Download,
  CheckCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { downloadElementAsPdf } from "~/utils/downloadPdfFromElement";
import ActionSheets from "~/components/Dashboard/ActionSheets";

const avatarColors = [
  "bg-blue-200 text-blue-700",
  "bg-purple-200 text-purple-700",
  "bg-pink-200 text-pink-700",
  "bg-green-200 text-green-700",
  "bg-yellow-200 text-yellow-700",
  "bg-indigo-200 text-indigo-700",
  "bg-red-200 text-red-700",
  "bg-teal-200 text-teal-700",
];

const getAvatarColor = (index: number) => {
  return avatarColors[index % avatarColors.length];
};

type RedFlag = {
  type: "critical" | "warning" | "minor";
  title: string;
  clause?: string;
  description?: string;
  recommendation?: string;
};

type Analysis = {
  id: string;
  sourceTitle?: string | null;
  createdAt?: string | null;
  overallRisk?: "low" | "medium" | "high" | string | null;
  summary?: string | null;
  redFlags?: RedFlag[];
  recommendations?: string[];
  dealParties?: string[];
  companiesInvolved?: string[];
  dealRoom?: string | null;
  playbook?: string | null;
  raw?: unknown;
};

function riskBadgeClasses(risk?: string | null) {
  const r = (risk ?? "").toLowerCase();
  if (r === "high") return "bg-red-100 text-red-700 border-red-200";
  if (r === "medium") return "bg-orange-100 text-orange-700 border-orange-200";
  if (r === "low") return "bg-green-100 text-green-700 border-green-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function ContractDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`/api/analysis/${id}`)
      .then(async (res) => {
        if (!res.ok)
          throw new Error((await res.text()) || "Failed to fetch analysis");
        return res.json();
      })
      .then((json) => setData(json))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params?.id]);

  const title = data?.sourceTitle ?? "Contract";
  const dateStr = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : undefined;

  // Email and chat handled by reusable ActionSheets

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard/contracts")}
        className="text-slate-500 hover:text-slate-700 p-2 bg-white mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      <div className="min-h-screen bg-white">
        <div
          className="mx-auto px-0 sm:px-6 lg:px-8 py-8"
          id="analysis-report-content"
        >
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-lg md:text-2xl font-medium text-slate-900 tracking-tight">
                    {title}
                  </h1>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  {dateStr && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {dateStr}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Counselr
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "px-4 py-2 rounded-md border flex items-center gap-2 font-medium",
                    riskBadgeClasses(data?.overallRisk)
                  )}
                >
                  <AlertCircle className="h-5 w-5" />
                  <span className="capitalize text-xs">
                    {(data?.overallRisk ?? "unknown").toString()} Risk Detected
                  </span>
                </div>
                <Button
                  size="lg"
                  className="text-white"
                  onClick={() => {
                    const el = document.getElementById(
                      "analysis-report-content"
                    );
                    if (el) {
                      void downloadElementAsPdf(
                        el as HTMLElement,
                        `Analysis - ${title}.pdf`
                      );
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" /> Export PDF
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="min-h-[200px] flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading contract...</span>
            </div>
          ) : data ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
                <Card className="!h-fit space-y-0 !shadow-none bg-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
                    <CardTitle className="text-sm font-medium text-[#535354]">
                      Overall Risk Score
                    </CardTitle>
                    <Shield
                      className={cn(
                        "h-4 w-4",
                        (data.overallRisk ?? "low") === "high"
                          ? "text-red-500"
                          : (data.overallRisk ?? "low") === "medium"
                            ? "text-amber-500"
                            : "text-emerald-500"
                      )}
                    />
                  </CardHeader>
                  <CardContent className="-mt-3">
                    <div className="text-[20px] font-bold capitalize text-[#0B101A]">
                      {data.overallRisk ?? "unknown"}
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
                      {data.redFlags?.length ?? 0}
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
                      {data.recommendations?.length ?? 0}
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
                          Executive Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-slate-700">
                          {data.summary ?? "No summary available."}
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
                          {data.redFlags?.length ?? 0}
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
                      {(data.redFlags?.length ?? 0) === 0 ? (
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
                        (data.redFlags ?? []).map((flag: RedFlag, idx) => (
                          <Card
                            key={idx}
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
                              {flag.description && (
                                <p className="text-sm text-slate-700">
                                  {flag.description}
                                </p>
                              )}
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
                      {(data.redFlags ?? []).map((flag, idx) => (
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
                            {flag.clause && (
                              <blockquote className="border-l-2 border-slate-300 pl-4 italic text-slate-700 font-serif text-lg">
                                &quot;{flag.clause}&quot;
                              </blockquote>
                            )}
                            <div className="mt-4 flex items-center gap-2 text-sm text-red-600 font-medium">
                              <AlertTriangle className="h-4 w-4" />
                              Issue: {flag.title}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent
                      value="suggestions"
                      className="space-y-4 animate-in fade-in-50 duration-300"
                    >
                      {(data.recommendations ?? []).map((rec, idx) => (
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
                      ))}
                    </TabsContent>
                  </Tabs>

                  {/* Deal Metadata Section */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {((data.dealParties?.length ?? 0) > 0 || (data.companiesInvolved?.length ?? 0) > 0) && (
                      <Card className="!shadow-none bg-slate-50/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Deal Parties & Companies
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {(data.dealParties?.length ?? 0) > 0 && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase mb-1">Parties</p>
                              <div className="flex flex-wrap gap-2">
                                {data.dealParties?.map((party, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className={cn("bg-white border-none", getAvatarColor(i))}
                                  >
                                    {party}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {(data.companiesInvolved?.length ?? 0) > 0 && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase mb-1">Companies</p>
                              <div className="flex flex-wrap gap-2">
                                {data.companiesInvolved?.map((company, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className={cn("bg-white border-none", getAvatarColor(i + (data.dealParties?.length ?? 0)))}
                                  >
                                    {company}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {(data.dealRoom || data.playbook) && (
                      <Card className="!shadow-none bg-slate-50/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            Classification
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {data.dealRoom && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase mb-1">Deal Room</p>
                              <p className="text-sm text-slate-700">{data.dealRoom}</p>
                            </div>
                          )}
                          {data.playbook && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase mb-1">Playbook</p>
                              <p className="text-sm text-slate-700">{data.playbook}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>

              {/* Floating Actions: Chat + Email (reusable) */}
              <ActionSheets
                chatEnabled={true}
                analysisId={params.id}
                documentText={
                  (data.raw as { contractText?: string })?.contractText ?? ""
                }
                emailData={{
                  title,
                  summary: data.summary ?? undefined,
                  overallRisk: data.overallRisk ?? undefined,
                  redFlags: data.redFlags ?? [],
                  recommendations: data.recommendations ?? [],
                }}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

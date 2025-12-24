// app/api/analysis/history/route.ts
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const riskColorMap: Record<string, string> = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-orange-100 text-orange-700 border-orange-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

type AnalysisRow = {
  id: string;
  source_title: string | null;
  overall_risk: string | null;
  summary: string | null;
  red_flags: unknown[] | null;
  recommendations: unknown[] | null;
  deal_parties: string[] | null;
  companies_involved: string[] | null;
  deal_room: string | null;
  playbook: string | null;
  created_at: string;
};

export async function GET(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? 20);
  const risk = url.searchParams.get("risk"); // optional: low | medium | high

  let query = supabase
    .from("analyses")
    .select(
      `
      id,
      source_title,
      overall_risk,
      summary,
      red_flags,
      recommendations,
      created_at,
       deal_parties,
    companies_involved,
    deal_room,
    playbook,
      raw
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (orgId) query = query.or(`org_id.eq.${orgId},user_id.eq.${userId}`);
  if (risk) query = query.eq("overall_risk", risk);

  const { data, error } = await query;

  if (error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

  // Map data for frontend
  const formatted = (data ?? []).map((item: AnalysisRow) => ({
    id: item.id,
    name: item.source_title ?? "Untitled Contract",
    date: new Date(item.created_at).toLocaleDateString(),
    riskLevel: item.overall_risk
      ? item.overall_risk.charAt(0).toUpperCase() + item.overall_risk.slice(1)
      : "Unknown",
    riskColor:
      riskColorMap[item.overall_risk?.toLowerCase() ?? "low"] ??
      riskColorMap.low,
    flags: item.red_flags?.length ?? 0,
    clauses: item.red_flags?.length ?? 0, // optionally track real clause count if available
    summary: item.summary,
    recommendations: item.recommendations ?? [],
    dealParties: item.deal_parties ?? [],
    companiesInvolved: item.companies_involved ?? [],
    dealRoom: item.deal_room ?? "Legal",
    playbook: item.playbook ?? "General Contract",
  }));

  return new Response(JSON.stringify(formatted), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

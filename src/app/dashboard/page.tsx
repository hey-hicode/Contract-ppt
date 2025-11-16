// app/(dashboard)/page.tsx
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import ContractTable from "~/components/Dashboard/contract-table";
import QuickAction from "~/components/Dashboard/quick-action";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardAction,
  CardFooter,
} from "~/components/ui/card";
import { Database } from "~/types/supabase";

type AnalysisRow = Database["public"]["Tables"]["analyses"]["Row"];

type RecentAnalysis = {
  id: string;
  source_title: string | null;
  overall_risk: "low" | "medium" | "high" | null;
  summary: string | null;
  red_flags: any[] | null;
  recommendations: string[] | null;
  created_at: string;
};

type StatsRow = {
  red_flags: any[] | null;
  overall_risk: "low" | "medium" | "high" | null;
};

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchDashboardData(limit = 6) {
  const { userId, orgId } = await auth();
  // if (!userId) return new Response("Unauthorized", { status: 401 });

  // Fetch recent analyses with explicit typing
  const { data: recent, error: recentErr } = await supabase
    .from("analyses")
    .select(
      "id, source_title, overall_risk, summary, red_flags, recommendations, created_at"
    )
    .eq("user_id", userId || "")
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<RecentAnalysis[]>();

  if (recentErr) {
    console.error("Supabase recent query error:", recentErr);
    throw new Error("Failed to load recent analyses");
  }

  // Fetch counts and aggregated stats
  const { count: totalCount, error: countErr } = await supabase
    .from("analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId || "");

  if (countErr) {
    console.error("Supabase count error:", countErr);
    throw new Error("Failed to load counts");
  }

  // Fetch all rows for stats computation with explicit typing
  const { data: allRows, error: allErr } = await supabase
    .from("analyses")
    .select("red_flags, overall_risk")
    .eq("user_id", userId || "")
    .returns<StatsRow[]>();

  if (allErr) {
    console.error("Supabase allRows error:", allErr);
    throw new Error("Failed to load analyses for stats");
  }

  // Compute red flags sum and safe contracts and average risk
  let redFlagsSum = 0;
  let safeCount = 0;
  let riskScoreSum = 0;
  let riskScoreCount = 0;

  const riskToScore = (r?: string | null): number | null => {
    if (!r) return null;
    if (r === "low") return 0;
    if (r === "medium") return 0.5;
    if (r === "high") return 1;
    return null;
  };

  for (const row of allRows ?? []) {
    if (row.red_flags && Array.isArray(row.red_flags)) {
      redFlagsSum += row.red_flags.length;
    }
    if (row.overall_risk === "low") safeCount++;
    const score = riskToScore(row.overall_risk);
    if (typeof score === "number") {
      riskScoreSum += score;
      riskScoreCount++;
    }
  }

  const avgRiskScore =
    riskScoreCount > 0 ? Math.round((riskScoreSum / riskScoreCount) * 100) : 0;

  return {
    recent: recent ?? [],
    totalCount: totalCount ?? 0,
    redFlagsSum,
    safeCount,
    avgRiskPercent: avgRiskScore,
  };
}

export default async function DashboardPage() {
  let data;
  try {
    data = await fetchDashboardData(6);
  } catch (err) {
    console.error("Dashboard load failed:", err);
    data = {
      recent: [],
      totalCount: 0,
      redFlagsSum: 0,
      safeCount: 0,
      avgRiskPercent: 0,
    };
  }

  return (
    <div>
      <div className="flex flex-1 flex-col space-y-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-medium tracking-tight">
            Hi, Welcome back 👋
          </h2>
 
        </div>

        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card pt-4 !px-0 grid grid-cols-1 gap-4  *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 md:grid-cols-2 lg:grid-cols-4 pb-4">
          <Card className="@container/card ">
            <CardHeader>
              <CardDescription>Contracts Analyzed</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {data.totalCount}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Red Flags Found</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {data.redFlagsSum}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Safe Contracts</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {data.safeCount}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Average Risk Score</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {data.avgRiskPercent}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="py-6">
          <div className="flex items-center pb-6  justify-between">
            <div>
              <h2 className="text-2xl font-medium tracking-tight">
                Recent Contracts
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Your latest contract analyses
              </p>
            </div>
            <Link href="/dashboard/contracts">
              <h2 className="text-base font-semibold tracking-tight">
                View All
              </h2>
            </Link>
          </div>

          <ContractTable items={data.recent} />
        </div>

        <QuickAction />
      </div>
    </div>
  );
}

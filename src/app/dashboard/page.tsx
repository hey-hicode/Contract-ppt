// app/(dashboard)/page.tsx
export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import ContractTable from "~/components/Dashboard/contract-table";
import QuickAction from "~/components/Dashboard/quick-action";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Database } from "~/types/supabase";

// type AnalysisRow = Database["public"]["Tables"]["analyses"]["Row"];
type UserPlanRow = {
  plan: "free" | "premium";
  free_quota: number;
  used_quota: number;
};

type RecentAnalysis = {
  id: string;
  source_title: string | null;
  overall_risk: "low" | "medium" | "high" | null;
  summary: string | null;
  red_flags: unknown[] | null;
  recommendations: string[] | null;
  created_at: string;
};

type StatsRow = {
  red_flags: unknown[] | null;
  overall_risk: "low" | "medium" | "high" | null;
};

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchDashboardData(limit = 6) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  // Fetch recent analyses with explicit typing
  const { data: plan, error: planErr } = await supabase
    .from("user_plans")
    .select("plan, free_quota, used_quota")
    .eq("clerk_user_id", userId)
    .single<UserPlanRow>();

  if (planErr) {
    console.error("Supabase plan error:", planErr);
    throw new Error("Failed to load user plan");
  }

  const remainingCredits =
    plan.plan === "premium"
      ? Infinity
      : Math.max(plan.free_quota - plan.used_quota, 0);
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
    plan: plan.plan,
    remainingCredits,
    freeQuota: plan.free_quota,
    usedQuota: plan.used_quota,
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
      plan: "free",
      remainingCredits: 0,
      freeQuota: 5,
      usedQuota: 0,
    };
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="w-full flex flex-col mb-4 md:flex-row justify-between items-start items-center px-4 sm:px-5 py-6 sm:py-8 lg:px-12 lg:py-9 bg-no-repeat lg:h-[200px] bg-cover bg-center "
        style={{ backgroundImage: "url('/icons/background.svg')" }}
      >
        <div className="mb-4 sm:mb-0">
          <h1 className="md:text-3xl text-2xl font-normal text-white tracking-tight">
            Hi, Welcome back 👋
          </h1>
          <p className="md:mt-2 mt-1 text-emerald-100">
            Here&apos;s how your contract analysis journey is progressing
          </p>
        </div>
        <Link
          href="/dashboard/analyze"
          className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition-colors "
        >
          Upload Contract
        </Link>
      </div>
      {/* Stats Grid */}
      <div className="px-3 sm:px-6 space-y-8 py-6 -mt-15 md:-mt-26 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1.8fr]">
          {/* Big Card - Total Contracts */}
          <Card className="flex flex-col justify-between border shadow-none border-[#E5E5E5] bg-white rounded-lg p-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Total Contracts Analyzed</span>
                <div className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                  All Time
                </div>
              </div>
              <div className="mt-6">
                <span className="text-5xl font-bold tracking-tight text-gray-900">
                  {data.totalCount}
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#FAFAFA] p-4">
                <div className="text-base font-bold text-[#535354]">Safe</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-bold text-emerald-700">{data.safeCount}</span>
                </div>
              </div>
              <div className="rounded-2xl bg-[#FAFAFA] p-4">
                <div className="text-base font-bold text-[#535354]">Risky</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-bold text-red-700">
                    {data.totalCount - data.safeCount}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Right Grid - Other Stats */}
          <div className="grid md:gap-6 gap-3 grid-cols-2">
            {/* Risk Score */}
            <Card className=" border shadow-none border-[#E5E5E5] bg-white rounded-lg p-3 md:p-6">
              <div className="flex md:flex-row flex-col items-start gap-4">
                <div className="rounded-2xl bg-[#F6F6F6] p-2 text-amber-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {data.avgRiskPercent}
                    <span className="text-sm text-[#B0B2B7] font-semibold"> out of 100</span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-500">
                    Average Risk Score
                  </div>
                </div>
              </div>
            </Card>

            {/* Red Flags */}
            <Card className="border border-[#E5E5E5] shadow-none bg-white rounded-lg p-3 md:p-6">
              <div className="flex md:flex-row w-full flex-col items-start md:gap-4">
                <div className="rounded-2xl bg-[#F6F6F6] p-2 text-red-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl w-full font-bold text-gray-900">
                    {data.redFlagsSum}
                  </div>
                  <div className="mt-1 text-sm w-full font-medium text-gray-500">
                    Red Flags Detected
                  </div>
                </div>
              </div>
            </Card>

            {/* Plan Usage */}
            <Card className="border border-[#E5E5E5]  shadow-none bg-white rounded-lg p-3 md:p-6">
              <div className="flex md:flex-row flex-col items-start gap-4">
                <div className="rounded-2xl bg-[#F6F6F6] p-2 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-"
                  >
                    <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                    <path
                      fillRule="evenodd"
                      d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {data.plan === "premium" ? "∞" : data.remainingCredits}
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-500">
                    Credits Remaining
                  </div>
                </div>
              </div>
            </Card>

            {/* Safe Contracts */}
            <Card className="border border-[#E5E5E5] shadow-none bg-white rounded-lg p-3 md:p-6">
              <div className="flex md:flex-row flex-col items-start gap-4">
                <div className="rounded-2xl bg-[#F6F6F6] p-2 text-emerald-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {data.safeCount}
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-500">
                    Safe Contracts
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="py-6">
          <div className="flex items-center pb-6 justify-between">
            <div>
              <h2 className="text-2xl font-medium tracking-tight">
                Recent Contracts
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Your latest contract analyses
              </p>
            </div>
            <Link href="/dashboard/contracts">
              <h2 className="text-base font-semibold tracking-tight text-primary hover:text-primary/80">
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

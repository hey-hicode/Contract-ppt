import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "~/types/supabase";
import DashboardLayoutClient from "~/components/Dashboard/DashboardLayoutClient";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type UserPlanRow = {
  plan: "free" | "premium";
  free_quota: number;
  used_quota: number;
};

async function getUserPlan(userId: string) {
  const { data: plan, error: planErr } = await supabase
    .from("user_plans")
    .select("plan, free_quota, used_quota")
    .eq("clerk_user_id", userId)
    .single<UserPlanRow>();

  if (planErr || !plan) {
    console.error("Supabase plan error:", planErr);
    // Return default/fallback plan if error
    return {
      plan: "free" as const,
      free_quota: 5,
      used_quota: 0,
      remainingCredits: 5,
    };
  }

  const remainingCredits =
    plan.plan === "premium"
      ? Infinity
      : Math.max(plan.free_quota - plan.used_quota, 0);

  return {
    ...plan,
    remainingCredits,
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // If no user, we can't fetch plan, but middleware should handle auth.
  // We'll pass a default or empty state if userId is missing (though unlikely here).
  const userPlan = userId
    ? await getUserPlan(userId)
    : { plan: "free" as const, free_quota: 5, used_quota: 0, remainingCredits: 5 };

  return (
    <DashboardLayoutClient userPlan={userPlan}>
      {children}
    </DashboardLayoutClient>
  );
}

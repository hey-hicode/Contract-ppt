import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "~/components/Dashboard/DashboardLayoutClient";
import { supabase } from "~/lib/supabaseClient";
import { Analytics } from "@vercel/analytics/react";

type UserPlanRow = {
  plan: "free" | "premium";
  free_quota: number;
  used_quota: number;
};
type UserProfileRow = {
  onboarding_complete: boolean;
};

async function getUserPlan(userId: string) {
  const { data, error } = await supabase
    .from("user_plans")
    .select("plan, free_quota, used_quota")
    .eq("clerk_user_id", userId)
    .single<UserPlanRow>();

  if (error || !data) {
    console.error("Supabase plan error:", error);

    return {
      plan: "free" as const,
      free_quota: 5,
      used_quota: 0,
      remainingCredits: 5,
    };
  }

  const remainingCredits =
    data.plan === "premium"
      ? Infinity
      : Math.max(data.free_quota - data.used_quota, 0);

  return {
    ...data,
    remainingCredits,
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // 🔒 HARD AUTH GUARD
  if (!userId) {
    redirect("/");
  }

  // 🔍 Onboarding check
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("onboarding_complete")
    .eq("clerk_id", userId)
    .single<UserProfileRow>();

  if (error || !profile || !profile.onboarding_complete) {
    redirect("/onboarding");
  }

  // 💳 Plan check
  const userPlan = await getUserPlan(userId);

  return (
    <DashboardLayoutClient userPlan={userPlan}>
      {children}
    </DashboardLayoutClient>
  );
}

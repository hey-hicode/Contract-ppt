import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type UserPlan = {
  plan: "free" | "premium";
  free_quota: number;
  used_quota: number;
};

/**
 * Always returns a plan row.
 * Creates one if user is new.
 */
export async function getOrCreateUserPlan(
  clerkUserId: string
): Promise<UserPlan> {
  const { data, error } = await supabase
    .from("user_plans")
    .select("plan, free_quota, used_quota")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (data) return data as UserPlan;

  // Create if missing
  const { data: created, error: createError } = await supabase
    .from("user_plans")
    .insert({
      clerk_user_id: clerkUserId,
      plan: "free",
      free_quota: 5,
      used_quota: 0,
    })
    .select("plan, free_quota, used_quota")
    .single();

  if (createError || !created) {
    throw new Error("Failed to create user plan");
  }

  return created as UserPlan;
}

/**
 * Throws if quota exceeded
 */
export function assertQuota(plan: UserPlan) {
  if (plan.plan === "free" && plan.used_quota >= plan.free_quota) {
    throw new Error("FREE_QUOTA_EXCEEDED");
  }
}

/**
 * Increment usage by 1
 */
export async function incrementUsage(clerkUserId: string) {
  await supabase.rpc("increment_usage", {
    clerk_id: clerkUserId,
  });
}

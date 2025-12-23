import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export async function requirePremium() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("user_plans")
    .select("plan")
    .eq("clerk_user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("User plan not found");
  }

  if (data.plan !== "premium") {
    throw new Error("PREMIUM_REQUIRED");
  }

  return { userId };
}

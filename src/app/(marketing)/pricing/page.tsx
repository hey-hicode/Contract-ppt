// app/(marketing)/pricing/page.tsx
import { auth } from "@clerk/nextjs/server";
import PricingClient from "~/components/Pricing/PricingClient";
import { supabase } from "~/lib/supabaseClient";

export default async function PricingPage() {
  const { userId } = await auth();

  let currentPlan: "free" | "premium" | "enterprise" = "free";

  if (userId) {
    const { data } = await supabase
      .from("user_plans")
      .select("plan")
      .eq("clerk_user_id", userId)
      .single();

    if (data?.plan) currentPlan = data.plan;
  }

  return <PricingClient currentPlan={currentPlan} />;
}

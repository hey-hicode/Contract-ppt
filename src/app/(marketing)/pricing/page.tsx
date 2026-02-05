// app/(marketing)/pricing/page.tsx
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import PricingClient from "~/components/Pricing/PricingClient";
import { supabase } from "~/lib/supabaseClient";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing for freelancers who need fast, affordable contract review with AI.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Counselr Pricing",
    description:
      "Simple pricing for freelancers who need fast, affordable contract review with AI.",
    url: "https://www.counselr.io/pricing",
  },
};

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

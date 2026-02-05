import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BillingCancelClient from "~/components/Billing/CancelClient";
import { supabase } from "~/lib/supabaseClient";

export const metadata: Metadata = {
  title: "Billing",
  description: "Manage your subscription and billing details.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function BillingCancelPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: plan } = await supabase
    .from("user_plans")
    .select("plan")
    .eq("clerk_user_id", userId)
    .single();

  const isPremium = plan?.plan === "premium";

  return <BillingCancelClient isPremium={isPremium} />;
}

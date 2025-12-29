import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BillingSuccessClient from "~/components/Billing/SuccessClient";
import { supabase } from "~/lib/supabaseClient";

export default async function BillingSuccessPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: plan } = await supabase
    .from("user_plans")
    .select("plan")
    .eq("clerk_user_id", userId)
    .single();

  // If webhook hasn't processed yet, still allow page
  const isPremium = plan?.plan === "premium";

  return <BillingSuccessClient isPremium={isPremium} />;
}

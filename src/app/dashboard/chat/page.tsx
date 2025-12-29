import { auth } from "@clerk/nextjs/server";
import UpgradeCard from "~/components/Billing/UpgradeCard";
import ChatDashboard from "~/components/Chat/ChatDashBoard";
import { Button } from "~/components/ui/button";
import { supabase } from "~/lib/supabaseClient";

export default async function ChatPage() {
  const { userId } = await auth();

  const { data: plan } = await supabase
    .from("user_plans")
    .select("plan")
    .eq("clerk_user_id", userId)
    .single();

  const isPremium = plan?.plan === "premium";

  return (
    <div className="space-y-4">
      {isPremium ? <ChatDashboard /> : <UpgradeCard />}
    </div>
  );
}

import { auth } from "@clerk/nextjs/server";
import UpgradeCard from "~/components/Billing/UpgradeCard";
import ChatDashboard from "~/components/Chat/ChatDashBoard";
import { Button } from "~/components/ui/button";
import { supabase } from "~/lib/supabaseClient";

import { DashboardMotionWrapper } from "~/components/Dashboard/DashboardMotionWrapper";

export default async function ChatPage() {
  const { userId } = await auth();

  const { data: plan } = await supabase
    .from("user_plans")
    .select("plan")
    .eq("clerk_user_id", userId)
    .single();

  const isPremium = plan?.plan === "premium";

  return (
    <DashboardMotionWrapper>
      <div className="relative">
        <ChatDashboard />
        {!isPremium && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50/10 backdrop-blur-[6px] rounded-lg border border-gray-200/50">
            <UpgradeCard />
          </div>
        )}
      </div>
    </DashboardMotionWrapper>
  );
}

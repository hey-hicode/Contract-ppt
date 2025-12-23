import { auth } from "@clerk/nextjs/server";
import ChatDashboard from "~/components/Chat/ChatDashBoard";
import { GeneralChat } from "~/components/Chat/GeneralChat";
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
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">AI Chat</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Converse with LexIQ about your contracts. Coming soon.
        </p>
      </div>
      {!isPremium ? (
        <div className="p-6 border rounded-xl bg-white text-center">
          <h3 className="text-lg font-semibold">Premium feature 🔒</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Upgrade to premium to use AI chat and contract analysis.
          </p>
          <Button className="mt-4">Upgrade</Button>
        </div>
      ) : (
        <ChatDashboard />
      )}
      {/* <Button
  onClick={async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    window.location.href = data.url;
  }}
>
  Upgrade to Premium
</Button> */}

      {/* <GeneralChat /> */}
    </div>
  );
}

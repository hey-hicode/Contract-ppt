"use client";

import { Button } from "~/components/ui/button";

export default function UpgradeCard() {
  const handleUpgrade = async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <div className="p-8 border rounded-2xl bg-white text-center max-w-xl mx-auto">
      <h2 className="text-2xl font-bold">Premium feature 🔒</h2>
      <p className="mt-2 text-slate-600">
        Upgrade to premium to unlock AI chat, advanced contract analysis, and
        unlimited conversations.
      </p>
      <Button onClick={handleUpgrade} className="mt-6 px-8">
        Upgrade to Premium
      </Button>
    </div>
  );
}

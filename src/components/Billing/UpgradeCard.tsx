"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Bot, Sparkles } from "lucide-react";

export default function UpgradeCard() {
  const router = useRouter();

  return (
    <div className="w-full max-w-xl p-10 bg-white/90 border border-gray-200/50 rounded-xl shadow-[.5] relative overflow-hidden backdrop-blur-xl text-center mx-4">
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-50" />

      <div className="relative z-10 py-10">



        <h2 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight">
          Unlock AI Legal Analyst 🔒
        </h2>

        <p className="text-gray-600 mb-10 text-sm leading-relaxed max-w-sm mx-auto font-medium">
          Upgrade to premium to unlock real-time AI chat, deep contract
          analysis, and unlimited legal consultations.
        </p>

        <Button
          onClick={() => router.push("/pricing")}
          className="w-full h-12 bg-primary  max-w-sm hover:bg-primary/90 text-white font-medium text-sm rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Upgrade to Premium
        </Button>

        <p className="mt-6 text-xs text-gray-400 font-medium">
          Cancel anytime. Starting from $20/month.
        </p>
      </div>
    </div>
  );
}

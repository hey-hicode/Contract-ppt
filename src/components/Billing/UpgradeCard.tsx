"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UpgradeCard() {
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  // const handleUpgrade = async () => {
  //   if (loading) return;

  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const res = await fetch("/api/stripe/checkout", {
  //       method: "POST",
  //     });

  //     if (!res.ok) {
  //       const text = await res.text();
  //       throw new Error(text || "Failed to start checkout");
  //     }

  //     const data = await res.json();

  //     if (!data?.url) {
  //       throw new Error("Invalid checkout session");
  //     }

  //     window.location.href = data.url;
  //   } catch (err) {
  //     console.error("Upgrade error:", err);
  //     setError("Unable to start checkout. Please try again.");
  //     setLoading(false);
  //   }
  // };

  const router = useRouter();

  return (
    <div className="p-8 border rounded-2xl bg-white text-center max-w-xl mx-auto">
      <h2 className="text-2xl font-bold">Premium feature 🔒</h2>

      <p className="mt-2 text-slate-600">
        Upgrade to premium to unlock AI chat, advanced contract analysis, and
        unlimited conversations.
      </p>

      <Button
        onClick={() => router.push("/pricing")}
        // disabled={loading}
        className="mt-6 px-8 text-white"
      >
        {/* {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting…
          </span>
        ) : (
          "Upgrade to Premium"
        )} */}
        Upgrade to Premium
      </Button>

      {/* {error && <p className="mt-3 text-sm text-red-600">{error}</p>} */}
    </div>
  );
}

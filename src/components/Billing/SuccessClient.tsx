"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function BillingSuccessClient() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      const res = await fetch("/api/billing/status");
      const data = await res.json();

      if (data.premium) {
        setPremium(true);
        setChecking(false);
        clearInterval(interval);

        // short delay for UX
        setTimeout(() => router.push("/dashboard/chat"), 1500);
      }

      // fail-safe after ~20s
      if (attempts > 10) {
        setChecking(false);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white border rounded-2xl text-center shadow-sm">
        <div className="flex justify-center mb-4">
          {checking ? (
            <Loader2 className="w-14 h-14 text-blue-600 animate-spin" />
          ) : (
            <CheckCircle className="w-14 h-14 text-emerald-600" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          {premium ? "Premium Activated 🎉" : "Processing Payment"}
        </h1>

        <p className="mt-2 text-slate-600">
          {premium
            ? "Your account is now Premium."
            : "We’re confirming your payment with Stripe. This may take a few seconds."}
        </p>

        {!checking && !premium && (
          <div className="mt-6">
            <Button onClick={() => router.push("/dashboard/chat")}>
              Continue to Dashboard
            </Button>
            <p className="mt-3 text-xs text-slate-400">
              If Premium doesn’t activate, contact support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function BillingCancelClient({
  isPremium,
}: {
  isPremium: boolean;
}) {
  const router = useRouter();

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white border rounded-2xl text-center shadow-sm">
        <div className="flex justify-center mb-4">
          <XCircle className="w-14 h-14 text-amber-500" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900">Checkout canceled</h1>

        <p className="mt-2 text-slate-600">
          No payment was made. You can upgrade anytime to unlock premium
          features.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {!isPremium && (
            <Button
              onClick={async () => {
                const res = await fetch("/api/stripe/checkout", {
                  method: "POST",
                });
                const data = await res.json();
                window.location.href = data.url;
              }}
            >
              Try upgrading again
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/chat")}
          >
            Back to dashboard
          </Button>
        </div>

        <p className="mt-4 text-xs text-slate-400">You were not charged.</p>
      </div>
    </div>
  );
}

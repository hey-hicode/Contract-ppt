"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function BillingSuccessClient({
  isPremium,
}: {
  isPremium: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard/chat");
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white border rounded-2xl text-center shadow-sm">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-14 h-14 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Payment Successful 🎉
        </h1>

        <p className="mt-2 text-slate-600">
          {isPremium
            ? "Your account has been upgraded to Premium."
            : "Your payment was received. Activating Premium…"}
        </p>

        <div className="mt-6">
          <Button
            className="w-full"
            onClick={() => router.push("/dashboard/chat")}
          >
            Go to Dashboard
          </Button>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          You’ll be redirected automatically
        </p>
      </div>
    </div>
  );
}

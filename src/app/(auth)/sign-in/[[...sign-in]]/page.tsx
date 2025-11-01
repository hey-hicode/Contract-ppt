"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white px-4 py-12">
      <SignIn
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
        appearance={{
          elements: {
            card: "shadow-xl shadow-sky-100 border border-slate-200",
          },
        }}
      />
    </div>
  );
}

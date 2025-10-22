"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white px-4 py-12">
      <SignUp
        appearance={{
          elements: {
            card: "shadow-xl shadow-sky-100 border border-slate-200",
          },
        }}
      />
    </div>
  );
}

import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BillingSuccessClient from "~/components/Billing/SuccessClient";

export const metadata: Metadata = {
  title: "Billing Success",
  description: "Your subscription is active.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function BillingSuccessPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <BillingSuccessClient />;
}

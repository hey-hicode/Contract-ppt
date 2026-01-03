import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BillingSuccessClient from "~/components/Billing/SuccessClient";

export default async function BillingSuccessPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <BillingSuccessClient />;
}

// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "~/lib/stripe";
import { supabase } from "~/lib/supabaseClient";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch or create Stripe customer
  const { data: plan } = await supabase
    .from("user_plans")
    .select("stripe_customer_id")
    .eq("clerk_user_id", userId)
    .single();

  let customerId = plan?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { clerk_user_id: userId },
    });

    customerId = customer.id;

    await supabase
      .from("user_plans")
      .update({ stripe_customer_id: customerId })
      .eq("clerk_user_id", userId);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: process.env.STRIPE_PREMIUM_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  });

  return NextResponse.json({ url: session.url });
}

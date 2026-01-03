import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "~/lib/stripe";
import { supabase } from "~/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.STRIPE_PREMIUM_PRICE_ID) {
      throw new Error("Missing STRIPE_PREMIUM_PRICE_ID");
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error("Missing NEXT_PUBLIC_APP_URL");
    }

    // Fetch or create Stripe customer
    const { data: plan, error } = await supabase
      .from("user_plans")
      .select("stripe_customer_id")
      .eq("clerk_user_id", userId)
      .single();

    if (error) throw error;

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
      line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "~/lib/stripe";
import { supabase } from "~/lib/supabaseClient";

export const dynamic = "force-dynamic";

type CheckoutPlan = "monthly" | "yearly";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Validate env early
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.error("Missing NEXT_PUBLIC_APP_URL");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // 3️⃣ Parse request
    const { plan } = (await req.json()) as { plan: CheckoutPlan };

    let priceId: string | undefined;

    switch (plan) {
      case "monthly":
        priceId = process.env.STRIPE_PRICE_PREMIUM_MONTHLY;
        break;
      case "yearly":
        priceId = process.env.STRIPE_PRICE_PREMIUM_YEARLY;
        break;
      default:
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!priceId) {
      console.error("Stripe price ID missing for plan:", plan);
      return NextResponse.json(
        { error: "Price ID not configured" },
        { status: 500 }
      );
    }

    // 4️⃣ Fetch or create Stripe customer
    const { data: userPlan, error: planError } = await supabase
      .from("user_plans")
      .select("stripe_customer_id")
      .eq("clerk_user_id", userId)
      .single();

    if (planError) {
      console.error("Failed to fetch user plan:", planError);
      return NextResponse.json(
        { error: "Failed to load user billing info" },
        { status: 500 }
      );
    }

    let customerId = userPlan?.stripe_customer_id;

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

    // 5️⃣ Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/billing/success`,
      cancel_url: `${appUrl}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}

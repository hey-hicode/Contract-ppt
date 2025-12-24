// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { stripe } from "~/lib/stripe";
import { supabase } from "~/lib/supabaseClient";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new NextResponse("Webhook error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (!session.customer || !session.subscription) {
      return NextResponse.json({ received: true });
    }

    const customer = (await stripe.customers.retrieve(
      session.customer as string
    )) as Stripe.Customer;

    const clerkUserId = customer.metadata?.clerk_user_id;
    if (!clerkUserId) return NextResponse.json({ received: true });

    await supabase
      .from("user_plans")
      .update({
        plan: "premium",
        stripe_subscription_id: session.subscription as string,
      })
      .eq("clerk_user_id", clerkUserId);
  }

  // Future: handle cancellations, downgrades, enterprise plans

  return NextResponse.json({ received: true });
}

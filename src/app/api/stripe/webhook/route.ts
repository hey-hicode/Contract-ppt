// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { stripe } from "~/lib/stripe";
import { supabase } from "~/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new NextResponse("Missing stripe-signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return new NextResponse("Webhook error", { status: 400 });
  }

  try {
    switch (event.type) {
      /**
       * ✅ Subscription started (Checkout success)
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.customer || !session.subscription) break;

        const customer = (await stripe.customers.retrieve(
          session.customer as string
        )) as Stripe.Customer;

        const clerkUserId = customer.metadata?.clerk_user_id;
        if (!clerkUserId) break;

        await supabase
          .from("user_plans")
          .update({
            plan: "premium",
            stripe_subscription_id: session.subscription as string,
          })
          .eq("clerk_user_id", clerkUserId);

        break;
      }

      /**
       * ❌ Subscription cancelled / expired
       */
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        await supabase
          .from("user_plans")
          .update({
            plan: "free",
            stripe_subscription_id: null,
            used_quota: 0,
          })
          .eq("stripe_subscription_id", sub.id);

        break;
      }

      /**
       * ⚠️ Payment failed (optional handling)
       */
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        console.warn("Payment failed for invoice:", invoice.id);
        // Optional:
        // - mark grace period
        // - notify user
        break;
      }

      default:
        // Ignore unhandled events
        break;
    }
  } catch (err) {
    console.error("Webhook handler failed:", err);
    return new NextResponse("Webhook handler error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}

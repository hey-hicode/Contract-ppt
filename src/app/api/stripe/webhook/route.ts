import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "~/lib/stripe";
import { supabase } from "~/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  // 1️⃣ Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("❌ Stripe signature verification failed", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // 2️⃣ Idempotency guard (avoid double processing)
  const { data: alreadyHandled } = await supabase
    .from("payment_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .single();

  if (alreadyHandled) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      /**
       * ✅ Checkout completed (subscription created)
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.customer || !session.subscription) break;

        const customer = (await stripe.customers.retrieve(
          session.customer as string
        )) as Stripe.Customer;

        const clerkUserId = customer.metadata?.clerk_user_id;
        if (!clerkUserId) break;

        // Update user plan
        await supabase
          .from("user_plans")
          .update({
            plan: "premium",
            stripe_subscription_id: session.subscription as string,
            updated_at: new Date().toISOString(),
          })
          .eq("clerk_user_id", clerkUserId);

        // Log event
        await supabase.from("payment_events").insert({
          stripe_event_id: event.id,
          clerk_user_id: clerkUserId,
          type: event.type,
          status: "succeeded",
          subscription_id: session.subscription,
          amount: session.amount_total,
          currency: session.currency,
          raw_event: event,
        });

        break;
      }

      /**
       * ❌ Subscription cancelled
       */
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        await supabase
          .from("user_plans")
          .update({
            plan: "free",
            stripe_subscription_id: null,
            used_quota: 0,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);

        await supabase.from("payment_events").insert({
          stripe_event_id: event.id,
          type: event.type,
          status: "cancelled",
          subscription_id: sub.id,
          raw_event: event,
        });

        break;
      }

      /**
       * ⚠️ Payment failed
       */
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        await supabase.from("payment_events").insert({
          stripe_event_id: event.id,
          type: event.type,
          status: "failed",
          invoice_id: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          raw_event: event,
        });

        break;
      }

      default:
        // Ignore other events safely
        break;
    }
  } catch (err) {
    console.error("❌ Webhook handler error", err);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return NextResponse.json({ received: true });
}

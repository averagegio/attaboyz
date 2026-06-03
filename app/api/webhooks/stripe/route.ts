import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe-server";
import { recordHandlePurchase } from "@/lib/user-handles";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not set." }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Webhook verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const type = session.metadata?.type;

        if (type === "bid" && session.metadata?.handle) {
          await recordHandlePurchase({
            userId: session.metadata.userId ?? null,
            email: session.customer_details?.email ?? session.customer_email,
            handle: session.metadata.handle,
            platform: session.metadata.platform ?? "all",
            amountUsd: session.metadata.amountUsd ? Number(session.metadata.amountUsd) : undefined,
          });
        }

        console.info("[stripe webhook] checkout completed", {
          id: session.id,
          type,
          handle: session.metadata?.handle,
          tier: session.metadata?.tier,
        });
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("[stripe webhook]", e);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

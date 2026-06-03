import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-guard";
import { getAppOrigin, getConsultingPriceId, getStripe, isStripeConfigured } from "@/lib/stripe-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }

  const priceId = getConsultingPriceId();
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe price ID missing for consulting. Set STRIPE_PRICE_CONSULTING." },
      { status: 503 },
    );
  }

  const { session, error } = await requireSession();
  if (error || !session) return error!;

  const origin = getAppOrigin(req);

  try {
    const stripe = getStripe();
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing/return?session_id={CHECKOUT_SESSION_ID}&type=consulting`,
      cancel_url: `${origin}/pricing?canceled=consulting`,
      metadata: {
        type: "consulting",
        userId: session.sub,
      },
    });

    if (!checkout.url) {
      return NextResponse.json({ error: "Checkout session did not return a URL." }, { status: 500 });
    }

    return NextResponse.json({ url: checkout.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

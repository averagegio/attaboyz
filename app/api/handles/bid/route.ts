import { NextRequest, NextResponse } from "next/server";
import { normalizeHandle } from "@/lib/handles";
import { MIN_BID_USD } from "@/lib/pricing";
import { getSessionFromCookies } from "@/lib/session";
import { getAppOrigin, getStripe, isStripeConfigured } from "@/lib/stripe-server";

export const runtime = "nodejs";

const EMAIL_MAX = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || trimmed.length > EMAIL_MAX || !EMAIL_RE.test(trimmed)) return undefined;
  return trimmed;
}

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Billing is not configured. Add STRIPE_SECRET_KEY to your environment." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = body as { handle?: string; amountUsd?: number; email?: string; platform?: string };
  const handle = parsed.handle ? normalizeHandle(parsed.handle) : null;
  if (!handle) {
    return NextResponse.json({ error: "Missing or invalid @ name." }, { status: 400 });
  }

  const amountUsd =
    typeof parsed.amountUsd === "number" && Number.isFinite(parsed.amountUsd)
      ? Math.floor(parsed.amountUsd)
      : MIN_BID_USD;

  if (amountUsd < MIN_BID_USD || amountUsd > 50000) {
    return NextResponse.json({ error: `Bid must be between $${MIN_BID_USD} and $50,000.` }, { status: 400 });
  }

  const customerEmail = normalizeEmail(parsed.email);
  const platform = typeof parsed.platform === "string" ? parsed.platform.slice(0, 32) : "all";
  const origin = getAppOrigin(req);
  const sessionUser = await getSessionFromCookies();

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountUsd * 100,
            product_data: {
              name: `Bid for @${handle}`,
              description: `ATTABOY marketplace bid — ${platform === "all" ? "all platforms" : platform}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/billing/return?session_id={CHECKOUT_SESSION_ID}&type=bid&handle=${encodeURIComponent(handle)}`,
      cancel_url: `${origin}/store?handle=${encodeURIComponent(handle)}&canceled=1`,
      metadata: {
        type: "bid",
        handle,
        platform,
        amountUsd: String(amountUsd),
        ...(sessionUser ? { userId: sessionUser.sub } : {}),
      },
      ...(customerEmail || sessionUser?.email
        ? { customer_email: customerEmail ?? sessionUser?.email }
        : {}),
    });

    if (!session.url) {
      return NextResponse.json({ error: "Checkout session did not return a URL." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

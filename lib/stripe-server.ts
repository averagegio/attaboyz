import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripe) {
    stripe = new Stripe(key, { typescript: true });
  }
  return stripe;
}

export type SubscriptionTier = "starter" | "pro" | "enterprise";

export function getPriceIdForTier(tier: SubscriptionTier): string | null {
  const id =
    tier === "starter"
      ? process.env.STRIPE_PRICE_STARTER
      : tier === "pro"
        ? process.env.STRIPE_PRICE_PRO
        : process.env.STRIPE_PRICE_ENTERPRISE;
  return id && id.length > 0 ? id : null;
}

export function getConsultingPriceId(): string | null {
  const id = process.env.STRIPE_PRICE_CONSULTING;
  return id && id.length > 0 ? id : null;
}

export function getAppOrigin(req: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  const proto = req.headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

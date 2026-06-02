import type { SubscriptionTier } from "@/lib/stripe-server";

export type Plan = {
  id: SubscriptionTier;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  highlight?: boolean;
  features: string[];
};

export const ATTABOY_PLANS: Plan[] = [
  {
    id: "starter",
    name: "Handle Scout",
    price: "$19",
    cadence: "/mo",
    blurb: "Monitor a shortlist of @ names across major social platforms.",
    features: [
      "Up to 5 handle searches / day",
      "X, Instagram, TikTok, GitHub checks",
      "Email alerts when status changes",
    ],
  },
  {
    id: "pro",
    name: "Marketplace Pro",
    price: "$49",
    cadence: "/mo",
    blurb: "Bid on @ names, track competitors, and secure your brand lane.",
    highlight: true,
    features: [
      "Unlimited AI handle searches",
      "Place bids on available @ names",
      "Priority acquisition concierge",
      "Web-wide availability intel",
    ],
  },
  {
    id: "enterprise",
    name: "Brand Command",
    price: "$149",
    cadence: "/mo",
    blurb: "Full-stack sites, agents, and secure infrastructure for teams.",
    features: [
      "Everything in Marketplace Pro",
      "Custom site + AI agent builds",
      "Dedicated success manager",
      "SLA-backed secure deployments",
    ],
  },
];

export const MIN_BID_USD = 49;
export const SUGGESTED_BID_USD = 99;

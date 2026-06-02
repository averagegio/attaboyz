"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function BillingReturnClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    setStatus("ok");
  }, [sessionId]);

  if (status === "loading") {
    return <p className="text-white/70">Confirming your checkout…</p>;
  }

  if (status === "error") {
    return (
      <div className="space-y-4">
        <p className="text-rose-200">Missing checkout session. If you were charged, contact support with your receipt.</p>
        <Link href="/store" className="attaboy-cta inline-flex rounded-full px-5 py-2 text-sm font-bold">
          Back to store
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold sm:text-3xl">
        {type === "bid" ? "Bid received" : "Subscription active"}
      </h1>
      <p className="max-w-xl text-white/70">
        {type === "bid"
          ? "Your @ name bid is in. ATTABOY will pursue acquisition and follow up on the email you used at checkout."
          : "Welcome aboard. Your plan is active — start searching @ names in the marketplace."}
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/store" className="attaboy-cta inline-flex rounded-full px-5 py-2.5 text-sm font-bold">
          Open marketplace
        </Link>
        <Link
          href="/"
          className="inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10"
        >
          Home
        </Link>
      </div>
    </div>
  );
}

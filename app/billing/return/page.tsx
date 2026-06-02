import type { Metadata } from "next";
import { Suspense } from "react";
import { BillingReturnClient } from "@/app/components/BillingReturnClient";
import { PageShell } from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "Checkout complete | ATTABOY",
  description: "Your ATTABOY checkout is complete.",
};

export default function BillingReturnPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Suspense fallback={<p className="text-white/70">Loading…</p>}>
          <BillingReturnClient />
        </Suspense>
      </div>
    </PageShell>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardClient } from "@/app/components/DashboardClient";
import { PageShell } from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "Dashboard | ATTABOY",
  description: "Manage your profile, @ names, and consulting plans.",
};

export default function DashboardPage() {
  return (
    <PageShell>
      <Suspense fallback={<p className="px-4 text-sm text-white/60">Loading…</p>}>
        <DashboardClient />
      </Suspense>
    </PageShell>
  );
}

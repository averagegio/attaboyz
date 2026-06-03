import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthScreen } from "@/app/components/AuthScreen";
import { PageShell } from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "Log in | ATTABOY",
  description: "Sign in or create an ATTABOY account.",
};

export default function AuthPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-lg px-4 pb-20 sm:px-6">
        <Suspense fallback={<p className="text-sm text-white/60">Loading…</p>}>
          <AuthScreen />
        </Suspense>
      </div>
    </PageShell>
  );
}

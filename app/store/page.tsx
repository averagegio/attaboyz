import type { Metadata } from "next";
import { StoreMarketplace } from "@/app/components/StoreMarketplace";
import { PageShell } from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "@ Name Store | ATTABOY",
  description: "Search, claim, and bid on @ names across social media with AI-powered availability checks.",
};

type Props = {
  searchParams: Promise<{ handle?: string; q?: string; canceled?: string }>;
};

export default async function StorePage({ searchParams }: Props) {
  const sp = await searchParams;
  const initialHandle = sp.handle ?? sp.q ?? "";
  const showCanceled = sp.canceled === "1";

  return (
    <PageShell>
      <StoreMarketplace initialHandle={initialHandle} showCanceled={showCanceled} />
    </PageShell>
  );
}

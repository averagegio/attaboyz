import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-guard";
import { normalizeWalletAddress, updateProfile } from "@/lib/profile";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const address = typeof (body as { address?: string }).address === "string" ? (body as { address: string }).address : "";
  const normalized = normalizeWalletAddress(address);
  if (!normalized) {
    return NextResponse.json({ error: "Enter a valid Ethereum or Solana wallet address." }, { status: 400 });
  }

  try {
    const profile = await updateProfile(session.sub, { walletAddress: normalized });
    return NextResponse.json({ profile });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save wallet.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const { session, error } = await requireSession();
  if (error || !session) return error!;

  try {
    const profile = await updateProfile(session.sub, { walletAddress: null });
    return NextResponse.json({ profile });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not disconnect wallet.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

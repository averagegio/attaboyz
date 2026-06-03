import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-guard";
import { listUserHandles } from "@/lib/user-handles";

export const runtime = "nodejs";

export async function GET() {
  const { session, error } = await requireSession();
  if (error || !session) return error!;

  try {
    const handles = await listUserHandles(session.sub);
    return NextResponse.json({ handles });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not load handles.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

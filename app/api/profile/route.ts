import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-guard";
import { findProfileById, toPublicProfile, updateProfile } from "@/lib/profile";

export const runtime = "nodejs";

export async function GET() {
  const { session, error } = await requireSession();
  if (error || !session) return error!;

  try {
    const profile = await findProfileById(session.sub);
    if (!profile) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    return NextResponse.json({ profile: toPublicProfile(profile) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not load profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error || !session) return error!;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = body as {
    name?: string;
    businessName?: string | null;
  };

  try {
    const profile = await updateProfile(session.sub, {
      name: parsed.name,
      businessName: parsed.businessName,
    });
    return NextResponse.json({ profile });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

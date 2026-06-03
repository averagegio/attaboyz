import { NextResponse } from "next/server";
import { findProfileById, toPublicProfile } from "@/lib/profile";
import { getSessionFromCookies } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ user: null, profile: null });
  }

  try {
    const profile = await findProfileById(session.sub);
    if (!profile) {
      return NextResponse.json({ user: null, profile: null });
    }
    const publicProfile = toPublicProfile(profile);
    return NextResponse.json({
      user: {
        id: publicProfile.id,
        email: publicProfile.email,
        name: publicProfile.name,
        createdAt: publicProfile.createdAt,
      },
      profile: publicProfile,
    });
  } catch {
    return NextResponse.json({ user: null, profile: null });
  }
}

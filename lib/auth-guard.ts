import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";

export async function requireSession() {
  const session = await getSessionFromCookies();
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }
  return { session, error: null };
}

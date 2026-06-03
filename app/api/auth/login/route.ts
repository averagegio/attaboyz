import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth-crypto";
import { hasNeonDatabase } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { findUserByEmail, normalizeEmail, toPublicUser } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!hasNeonDatabase()) {
    return NextResponse.json(
      { error: "Database is not configured. Set DATABASE_URL to your Neon connection string." },
      { status: 503 },
    );
  }

  if (!process.env.AUTH_SECRET?.trim()) {
    return NextResponse.json({ error: "AUTH_SECRET is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = body as { email?: string; password?: string };
  const email = parsed.email ? normalizeEmail(parsed.email) : null;
  const password = typeof parsed.password === "string" ? parsed.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    const token = await createSessionToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });
    await setSessionCookie(token);

    return NextResponse.json({ user: toPublicUser(user) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Login failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

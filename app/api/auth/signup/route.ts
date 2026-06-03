import { NextRequest, NextResponse } from "next/server";
import { hashPassword, validatePassword } from "@/lib/auth-crypto";
import { hasNeonDatabase } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { createUser, findUserByEmail, normalizeEmail, normalizeName } from "@/lib/users";

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

  const parsed = body as { email?: string; password?: string; name?: string };
  const email = parsed.email ? normalizeEmail(parsed.email) : null;
  const name = parsed.name ? normalizeName(parsed.name) : null;
  const password = typeof parsed.password === "string" ? parsed.password : "";

  if (!email) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "Enter your name (max 80 characters)." }, { status: 400 });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ email, name, passwordHash });
    const token = await createSessionToken({ sub: user.id, email: user.email, name: user.name });
    await setSessionCookie(token);

    return NextResponse.json({ user });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Signup failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

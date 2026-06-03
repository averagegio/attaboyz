import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_MAX = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MAX = 5000;
const SUBJECT_MAX = 120;
const NAME_MAX = 80;

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (!email || email.length > EMAIL_MAX || !EMAIL_RE.test(email)) return null;
  return email;
}

function normalizeText(raw: unknown, max: number): string | null {
  if (typeof raw !== "string") return null;
  const text = raw.trim().replace(/\s+/g, " ");
  if (!text || text.length > max) return null;
  return text;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim();
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim() ?? "ATTABOY Contact <onboarding@resend.dev>";

  if (!apiKey || !toEmail) {
    return NextResponse.json(
      { error: "Contact email is not configured. Set RESEND_API_KEY and CONTACT_TO_EMAIL." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = body as { name?: string; email?: string; subject?: string; message?: string };
  const name = normalizeText(parsed.name, NAME_MAX);
  const email = normalizeEmail(parsed.email);
  const subject = normalizeText(parsed.subject, SUBJECT_MAX);
  const message = typeof parsed.message === "string" ? parsed.message.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!subject) {
    return NextResponse.json({ error: "Enter a subject." }, { status: 400 });
  }
  if (!message || message.length > MESSAGE_MAX) {
    return NextResponse.json({ error: "Enter a message (max 5000 characters)." }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `[ATTABOY] ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({ error: detail || "Could not send email." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Email send failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

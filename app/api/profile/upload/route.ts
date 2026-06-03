import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-guard";
import {
  AVATAR_MAX_BYTES,
  BANNER_MAX_BYTES,
  updateProfile,
  validateImageDataUrl,
} from "@/lib/profile";

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

  const parsed = body as { type?: string; dataUrl?: string };
  const type = parsed.type;
  const dataUrl = typeof parsed.dataUrl === "string" ? parsed.dataUrl : "";

  if (type !== "avatar" && type !== "banner") {
    return NextResponse.json({ error: "Upload type must be avatar or banner." }, { status: 400 });
  }

  const maxBytes = type === "avatar" ? AVATAR_MAX_BYTES : BANNER_MAX_BYTES;
  const valid = validateImageDataUrl(dataUrl, maxBytes);
  if (!valid) {
    return NextResponse.json(
      { error: `Invalid image. Use JPEG, PNG, WebP, or GIF under ${Math.round(maxBytes / 1000)}KB.` },
      { status: 400 },
    );
  }

  try {
    const profile = await updateProfile(session.sub, {
      ...(type === "avatar" ? { avatarUrl: valid } : { bannerLogoUrl: valid }),
    });
    return NextResponse.json({ profile });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

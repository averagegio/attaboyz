import { NextRequest, NextResponse } from "next/server";
import { searchHandle } from "@/lib/handles";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const handle = typeof (body as { handle?: string }).handle === "string" ? (body as { handle: string }).handle : "";
  if (!handle.trim()) {
    return NextResponse.json({ error: "Missing handle." }, { status: 400 });
  }

  const result = await searchHandle(handle);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle") ?? req.nextUrl.searchParams.get("q") ?? "";
  if (!handle.trim()) {
    return NextResponse.json({ error: "Missing handle query param." }, { status: 400 });
  }

  const result = await searchHandle(handle);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}

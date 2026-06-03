import { NextRequest, NextResponse } from "next/server";
import { hasNeonDatabase, getSql } from "@/lib/db";
import { ensureUsersSchema } from "@/lib/schema";

export const runtime = "nodejs";

export async function GET() {
  if (!hasNeonDatabase()) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not set." }, { status: 503 });
  }

  try {
    await ensureUsersSchema();
    const sql = getSql();
    await sql`SELECT 1 AS ok`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Database check failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

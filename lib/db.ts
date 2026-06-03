import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;

export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL?.trim() || process.env.NEON_DATABASE_URL?.trim();
}

export function hasNeonDatabase(): boolean {
  return Boolean(databaseUrl());
}

export function getSql(): NeonQueryFunction<false, false> {
  const url = databaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL (or NEON_DATABASE_URL) is not set");
  }
  if (!sql) {
    sql = neon(url);
  }
  return sql;
}

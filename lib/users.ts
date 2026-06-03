import { getSql, hasNeonDatabase } from "@/lib/db";
import { ensureUsersSchema } from "@/lib/schema";

export type UserRecord = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

const EMAIL_MAX = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 80;

export function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || email.length > EMAIL_MAX || !EMAIL_RE.test(email)) return null;
  return email;
}

export function normalizeName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name || name.length > NAME_MAX) return null;
  return name;
}

export function toPublicUser(row: Pick<UserRecord, "id" | "email" | "name" | "created_at">): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
  };
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  if (!hasNeonDatabase()) return null;
  await ensureUsersSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, email, password_hash, name, created_at, updated_at
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `) as UserRecord[];
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  if (!hasNeonDatabase()) return null;
  await ensureUsersSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, email, password_hash, name, created_at, updated_at
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `) as UserRecord[];
  return rows[0] ?? null;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<PublicUser> {
  if (!hasNeonDatabase()) {
    throw new Error("DATABASE_URL is not configured.");
  }
  await ensureUsersSchema();
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${input.email}, ${input.passwordHash}, ${input.name})
    RETURNING id, email, password_hash, name, created_at, updated_at
  `) as UserRecord[];
  const row = rows[0];
  if (!row) throw new Error("Could not create user.");
  return toPublicUser(row);
}

import { getSql, hasNeonDatabase } from "@/lib/db";

let schemaReady: Promise<void> | null = null;

export async function ensureUsersSchema(): Promise<void> {
  if (!hasNeonDatabase()) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          business_name TEXT,
          avatar_url TEXT,
          banner_logo_url TEXT,
          wallet_address TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS users_email_idx ON users (email)`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name TEXT`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS banner_logo_url TEXT`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address TEXT`;

      await sql`
        CREATE TABLE IF NOT EXISTS user_handles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          handle TEXT NOT NULL,
          platform TEXT NOT NULL DEFAULT 'all',
          status TEXT NOT NULL DEFAULT 'active',
          amount_usd INTEGER,
          purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS user_handles_user_id_idx ON user_handles (user_id)`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS user_handles_user_handle_idx ON user_handles (user_id, handle)`;
    })();
  }
  await schemaReady;
}

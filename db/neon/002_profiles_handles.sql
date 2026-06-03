-- Profile columns on users + purchased @ handles

ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banner_logo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address TEXT;

CREATE TABLE IF NOT EXISTS user_handles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  handle TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'all',
  status TEXT NOT NULL DEFAULT 'active',
  amount_usd INTEGER,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_handles_user_id_idx ON user_handles (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS user_handles_user_handle_idx ON user_handles (user_id, handle);

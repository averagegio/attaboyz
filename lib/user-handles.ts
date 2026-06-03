import { getSql, hasNeonDatabase } from "@/lib/db";
import { ensureUsersSchema } from "@/lib/schema";
import { findUserByEmail } from "@/lib/users";
import { normalizeHandle } from "@/lib/handles";

export type UserHandleRecord = {
  id: string;
  user_id: string;
  handle: string;
  platform: string;
  status: string;
  amount_usd: number | null;
  purchased_at: string;
};

export type PublicUserHandle = {
  id: string;
  handle: string;
  platform: string;
  status: string;
  amountUsd: number | null;
  purchasedAt: string;
};

function toPublicHandle(row: UserHandleRecord): PublicUserHandle {
  return {
    id: row.id,
    handle: row.handle,
    platform: row.platform,
    status: row.status,
    amountUsd: row.amount_usd,
    purchasedAt: row.purchased_at,
  };
}

export async function listUserHandles(userId: string): Promise<PublicUserHandle[]> {
  if (!hasNeonDatabase()) return [];
  await ensureUsersSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, user_id, handle, platform, status, amount_usd, purchased_at
    FROM user_handles
    WHERE user_id = ${userId}
    ORDER BY purchased_at DESC
  `) as UserHandleRecord[];
  return rows.map(toPublicHandle);
}

export async function recordHandlePurchase(input: {
  userId?: string | null;
  email?: string | null;
  handle: string;
  platform?: string;
  amountUsd?: number;
}): Promise<void> {
  if (!hasNeonDatabase()) return;

  const handle = normalizeHandle(input.handle);
  if (!handle) return;

  let userId = input.userId ?? null;
  if (!userId && input.email) {
    const user = await findUserByEmail(input.email.trim().toLowerCase());
    userId = user?.id ?? null;
  }
  if (!userId) return;

  await ensureUsersSchema();
  const sql = getSql();
  const platform = (input.platform ?? "all").slice(0, 32);
  const amountUsd = typeof input.amountUsd === "number" ? input.amountUsd : null;

  await sql`
    INSERT INTO user_handles (user_id, handle, platform, status, amount_usd)
    VALUES (${userId}, ${handle}, ${platform}, 'active', ${amountUsd})
    ON CONFLICT (user_id, handle) DO UPDATE SET
      status = 'active',
      amount_usd = COALESCE(EXCLUDED.amount_usd, user_handles.amount_usd),
      purchased_at = NOW()
  `;
}

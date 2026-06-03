import { getSql, hasNeonDatabase } from "@/lib/db";
import { ensureUsersSchema } from "@/lib/schema";
import { normalizeName } from "@/lib/users";

export type ProfileRecord = {
  id: string;
  email: string;
  name: string;
  business_name: string | null;
  avatar_url: string | null;
  banner_logo_url: string | null;
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicProfile = {
  id: string;
  email: string;
  name: string;
  businessName: string | null;
  avatarUrl: string | null;
  bannerLogoUrl: string | null;
  walletAddress: string | null;
  createdAt: string;
};

const BUSINESS_NAME_MAX = 120;
const WALLET_MAX = 128;
const AVATAR_MAX_BYTES = 800_000;
const BANNER_MAX_BYTES = 1_500_000;

const DATA_URL_RE = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/i;

export function toPublicProfile(row: ProfileRecord): PublicProfile {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    businessName: row.business_name,
    avatarUrl: row.avatar_url,
    bannerLogoUrl: row.banner_logo_url,
    walletAddress: row.wallet_address,
    createdAt: row.created_at,
  };
}

export function normalizeBusinessName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name || name.length > BUSINESS_NAME_MAX) return null;
  return name;
}

export function normalizeWalletAddress(raw: string): string | null {
  const addr = raw.trim();
  if (!addr || addr.length > WALLET_MAX) return null;
  if (!/^0x[a-fA-F0-9]{40}$/.test(addr) && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)) {
    return null;
  }
  return addr;
}

export function validateImageDataUrl(raw: string, maxBytes: number): string | null {
  if (!DATA_URL_RE.test(raw)) return null;
  if (raw.length > maxBytes) return null;
  return raw;
}

export async function findProfileById(id: string): Promise<ProfileRecord | null> {
  if (!hasNeonDatabase()) return null;
  await ensureUsersSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT id, email, name, business_name, avatar_url, banner_logo_url, wallet_address, created_at, updated_at
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `) as ProfileRecord[];
  return rows[0] ?? null;
}

export async function updateProfile(
  userId: string,
  input: {
    name?: string;
    businessName?: string | null;
    avatarUrl?: string | null;
    bannerLogoUrl?: string | null;
    walletAddress?: string | null;
  },
): Promise<PublicProfile> {
  if (!hasNeonDatabase()) {
    throw new Error("DATABASE_URL is not configured.");
  }
  await ensureUsersSchema();
  const sql = getSql();

  const current = await findProfileById(userId);
  if (!current) throw new Error("User not found.");

  const name = input.name !== undefined ? normalizeName(input.name) : current.name;
  if (input.name !== undefined && !name) throw new Error("Invalid name.");

  const businessName =
    input.businessName === undefined
      ? current.business_name
      : input.businessName === null
        ? null
        : normalizeBusinessName(input.businessName);
  if (input.businessName !== undefined && input.businessName !== null && !businessName) {
    throw new Error("Invalid business name.");
  }

  const avatarUrl = input.avatarUrl === undefined ? current.avatar_url : input.avatarUrl;
  const bannerLogoUrl = input.bannerLogoUrl === undefined ? current.banner_logo_url : input.bannerLogoUrl;

  const walletAddress =
    input.walletAddress === undefined
      ? current.wallet_address
      : input.walletAddress === null
        ? null
        : normalizeWalletAddress(input.walletAddress);
  if (input.walletAddress !== undefined && input.walletAddress !== null && !walletAddress) {
    throw new Error("Invalid wallet address.");
  }

  const rows = (await sql`
    UPDATE users
    SET
      name = ${name ?? current.name},
      business_name = ${businessName},
      avatar_url = ${avatarUrl},
      banner_logo_url = ${bannerLogoUrl},
      wallet_address = ${walletAddress},
      updated_at = NOW()
    WHERE id = ${userId}
    RETURNING id, email, name, business_name, avatar_url, banner_logo_url, wallet_address, created_at, updated_at
  `) as ProfileRecord[];

  const row = rows[0];
  if (!row) throw new Error("Could not update profile.");
  return toPublicProfile(row);
}

export { AVATAR_MAX_BYTES, BANNER_MAX_BYTES };

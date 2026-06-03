"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConnectWalletButton } from "@/app/components/ConnectWalletButton";

type PublicProfile = {
  id: string;
  email: string;
  name: string;
  businessName: string | null;
  avatarUrl: string | null;
  bannerLogoUrl: string | null;
  walletAddress: string | null;
  createdAt: string;
};

type UserHandle = {
  id: string;
  handle: string;
  platform: string;
  status: string;
  amountUsd: number | null;
  purchasedAt: string;
};

const inputClass =
  "min-h-11 w-full rounded-xl border border-white/15 bg-black/50 px-4 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function DashboardClient() {
  const router = useRouter();
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"avatar" | "banner" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [handles, setHandles] = useState<UserHandle[]>([]);
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [meRes, handlesRes] = await Promise.all([fetch("/api/auth/me"), fetch("/api/handles/mine")]);
      const meData = (await meRes.json()) as { profile?: PublicProfile | null; user?: PublicProfile | null };
      if (!meData.profile && !meData.user) {
        router.replace("/auth?next=/dashboard");
        return;
      }
      const p = meData.profile ?? null;
      if (!p) {
        router.replace("/auth?next=/dashboard");
        return;
      }
      setProfile(p);
      setName(p.name);
      setBusinessName(p.businessName ?? "");

      if (handlesRes.ok) {
        const handlesData = (await handlesRes.json()) as { handles?: UserHandle[] };
        setHandles(handlesData.handles ?? []);
      }
    } catch {
      setError("Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, businessName: businessName || null }),
      });
      const data = (await res.json()) as { profile?: PublicProfile; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save profile.");
        return;
      }
      if (data.profile) setProfile(data.profile);
      setMessage("Profile saved.");
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(type: "avatar" | "banner", file: File) {
    setUploading(type);
    setError(null);
    setMessage(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await fetch("/api/profile/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, dataUrl }),
      });
      const data = (await res.json()) as { profile?: PublicProfile; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      if (data.profile) setProfile(data.profile);
      setMessage(type === "avatar" ? "Profile photo updated." : "Banner logo updated.");
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/auth");
  }

  if (loading) {
    return <p className="text-sm text-white/60">Loading dashboard…</p>;
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 pb-20 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/85">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome, {profile.name}</h1>
          <p className="mt-1 text-sm text-white/55">{profile.email}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10"
        >
          Log out
        </button>
      </header>

      {error ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>
      ) : null}
      {message ? (
        <p className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">{message}</p>
      ) : null}

      {/* Profile banner + setup */}
      <section className="pricing-card overflow-hidden rounded-3xl">
        <div
          className="relative h-36 bg-gradient-to-r from-cyan-950 via-black to-fuchsia-950 sm:h-44"
          style={
            profile.bannerLogoUrl
              ? {
                  backgroundImage: `url(${profile.bannerLogoUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute right-4 top-4">
            <ConnectWalletButton
              address={profile.walletAddress}
              onConnected={(addr) => setProfile((p) => (p ? { ...p, walletAddress: addr } : p))}
            />
          </div>
        </div>

        <div className="relative px-6 pb-6 pt-0 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-cyan-300/40 bg-black shadow-lg"
              >
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/5 text-2xl font-bold text-white/40">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  {uploading === "avatar" ? "…" : "Upload"}
                </span>
              </button>
              <input
                ref={avatarRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadImage("avatar", file);
                  e.target.value = "";
                }}
              />
              <div>
                <p className="text-lg font-semibold">{profile.name}</p>
                <p className="text-sm text-white/55">{profile.businessName || "Add your business name"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => bannerRef.current?.click()}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              {uploading === "banner" ? "Uploading…" : "Upload company banner"}
            </button>
            <input
              ref={bannerRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadImage("banner", file);
                e.target.value = "";
              }}
            />
          </div>

          <form onSubmit={saveProfile} className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
                Name
              </label>
              <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="profile-business" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
                Business name
              </label>
              <input
                id="profile-business"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your company"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className="attaboy-cta rounded-xl px-6 py-2.5 text-sm font-bold disabled:opacity-60">
                {saving ? "Saving…" : "Save profile"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* My @'s */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">My @&apos;s</h2>
          <p className="mt-1 text-sm text-white/55">@ names you&apos;ve purchased through the marketplace.</p>
        </div>

        {handles.length === 0 ? (
          <div className="pricing-card rounded-3xl p-8 text-center">
            <p className="text-white/65">No @ names yet.</p>
            <Link href="/store" className="attaboy-cta mt-6 inline-flex rounded-full px-6 py-3 text-sm font-bold">
              Browse @ store
            </Link>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {handles.map((item) => (
              <li key={item.id} className="pricing-card rounded-2xl p-4">
                <p className="text-lg font-semibold text-cyan-200">@{item.handle}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-white/45">{item.platform}</p>
                {item.amountUsd ? (
                  <p className="mt-2 text-sm text-white/60">Paid ${item.amountUsd}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

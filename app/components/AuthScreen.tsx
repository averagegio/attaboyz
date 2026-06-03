"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Mode = "signin" | "signup";

type PublicUser = {
  id: string;
  email: string;
  name: string;
};

const inputClass =
  "min-h-12 w-full rounded-2xl border border-white/15 bg-black/50 px-4 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20";

export function AuthScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const modeParam = searchParams.get("mode");
  const initialMode: Mode = modeParam === "signup" ? "signup" : "signin";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const heading = useMemo(
    () => (mode === "signup" ? "Create your ATTABOY account" : "Sign in to ATTABOY"),
    [mode],
  );

  useEffect(() => {
    setMode(modeParam === "signup" ? "signup" : "signin");
  }, [modeParam]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = (await res.json()) as { user?: PublicUser | null };
        if (!cancelled && data.user) setUser(data.user);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (checkingSession || !user) return;
    router.replace(next.startsWith("/") ? next : "/store");
  }, [checkingSession, user, next, router]);

  async function onSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(fd.get("email") ?? ""),
          password: String(fd.get("password") ?? ""),
        }),
      });
      const data = (await res.json()) as { user?: PublicUser; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not sign in.");
        return;
      }
      router.replace(next.startsWith("/") ? next : "/dashboard");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          password: String(fd.get("password") ?? ""),
        }),
      });
      const data = (await res.json()) as { user?: PublicUser; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not create account.");
        return;
      }
      router.replace(next.startsWith("/") ? next : "/dashboard");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setLoading(false);
  }

  if (checkingSession) {
    return <p className="text-sm text-white/60">Loading…</p>;
  }

  if (user) {
    return (
      <div className="pricing-card mx-auto max-w-md rounded-3xl p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">Signed in</h1>
        <p className="mt-2 text-sm text-white/65">
          Welcome back, <span className="text-cyan-300">{user.name}</span> ({user.email})
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard" className="attaboy-cta inline-flex rounded-full px-5 py-2.5 text-sm font-bold">
            Go to dashboard
          </Link>
          <button
            type="button"
            disabled={loading}
            onClick={onLogout}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:opacity-60"
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <header className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-300/85">Account</p>
        <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
        <p className="text-sm text-white/60">Secure access to the @ name marketplace and your bids.</p>
      </header>

      <div className="pricing-card rounded-3xl p-6 sm:p-8">
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-black/40 p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={[
              "rounded-xl px-3 py-2 text-sm font-semibold transition",
              mode === "signin" ? "bg-white/10 text-white" : "text-white/55 hover:text-white/80",
            ].join(" ")}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={[
              "rounded-xl px-3 py-2 text-sm font-semibold transition",
              mode === "signup" ? "bg-white/10 text-white" : "text-white/55 hover:text-white/80",
            ].join(" ")}
          >
            Sign up
          </button>
        </div>

        {error ? (
          <p className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}

        {mode === "signin" ? (
          <form onSubmit={onSignIn} className="space-y-4">
            <div>
              <label htmlFor="signin-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
                Email
              </label>
              <input id="signin-email" name="email" type="email" required autoComplete="email" className={inputClass} />
            </div>
            <div>
              <label htmlFor="signin-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
                Password
              </label>
              <input
                id="signin-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className={inputClass}
              />
            </div>
            <button type="submit" disabled={loading} className="attaboy-cta mt-2 w-full rounded-2xl py-3 text-sm font-bold disabled:opacity-60">
              {loading ? "Signing in…" : "Log in"}
            </button>
          </form>
        ) : (
          <form onSubmit={onSignUp} className="space-y-4">
            <div>
              <label htmlFor="signup-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
                Name
              </label>
              <input id="signup-name" name="name" type="text" required autoComplete="name" className={inputClass} />
            </div>
            <div>
              <label htmlFor="signup-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
                Email
              </label>
              <input id="signup-email" name="email" type="email" required autoComplete="email" className={inputClass} />
            </div>
            <div>
              <label htmlFor="signup-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
                Password
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-white/40">At least 8 characters.</p>
            </div>
            <button type="submit" disabled={loading} className="attaboy-cta mt-2 w-full rounded-2xl py-3 text-sm font-bold disabled:opacity-60">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

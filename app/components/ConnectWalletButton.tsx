"use client";

import { useState } from "react";

type ConnectWalletButtonProps = {
  address: string | null;
  onConnected: (address: string | null) => void;
};

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
    };
  }
}

export function ConnectWalletButton({ address, onConnected }: ConnectWalletButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setError(null);
    setLoading(true);
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const addr = accounts[0];
        if (!addr) {
          setError("No wallet account returned.");
          return;
        }
        const res = await fetch("/api/profile/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: addr }),
        });
        const data = (await res.json()) as { profile?: { walletAddress: string | null }; error?: string };
        if (!res.ok) {
          setError(data.error ?? "Could not save wallet.");
          return;
        }
        onConnected(data.profile?.walletAddress ?? addr);
        return;
      }

      const manual = window.prompt("Paste your wallet address (Ethereum 0x… or Solana base58)");
      if (!manual) return;
      const res = await fetch("/api/profile/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: manual }),
      });
      const data = (await res.json()) as { profile?: { walletAddress: string | null }; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save wallet.");
        return;
      }
      onConnected(data.profile?.walletAddress ?? manual.trim());
    } catch {
      setError("Wallet connection failed.");
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    setLoading(true);
    await fetch("/api/profile/wallet", { method: "DELETE" });
    onConnected(null);
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {address ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1.5 font-mono text-xs text-cyan-200">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
          <button
            type="button"
            disabled={loading}
            onClick={disconnect}
            className="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10 disabled:opacity-60"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={connect}
          className="inline-flex items-center gap-2 rounded-xl border border-fuchsia-400/35 bg-fuchsia-500/10 px-4 py-2 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/20 disabled:opacity-60"
          title="Connect wallet"
        >
          <WalletIcon />
          {loading ? "Connecting…" : "Connect wallet"}
        </button>
      )}
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}

function WalletIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
}

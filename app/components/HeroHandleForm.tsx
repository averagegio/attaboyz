"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function HeroHandleForm() {
  const router = useRouter();
  const [handle, setHandle] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = handle.trim().replace(/^@+/, "");
    if (!cleaned) return;
    router.push(`/store?handle=${encodeURIComponent(cleaned)}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex w-full max-w-md flex-col items-center gap-4">
      <label htmlFor="hero-handle" className="sr-only">
        Enter your @ name
      </label>
      <div className="relative min-h-12 w-full">
        <input
          id="hero-handle"
          type="text"
          required
          autoComplete="off"
          spellCheck={false}
          value={handle}
          onChange={(event) => setHandle(event.target.value.replace(/\s/g, ""))}
          placeholder="Enter your @ name"
          className="min-h-12 w-full rounded-full border border-white/20 bg-black/35 px-5 py-3 text-sm text-white placeholder:text-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-400/30"
        />
      </div>
      <button
        type="submit"
        className="attaboy-cta min-h-12 w-full rounded-full px-6 text-sm font-semibold tracking-wide text-black transition active:scale-[0.98] sm:w-auto sm:min-w-[10rem]"
      >
        Search
      </button>
    </form>
  );
}

"use client";

import { FormEvent, useState } from "react";

export function HeroSignupForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="mt-8 text-sm font-medium tracking-wide text-cyan-200/90 sm:text-base">
        You&apos;re on the list. We&apos;ll be in touch.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-stretch"
    >
      <label htmlFor="hero-email" className="sr-only">
        Email address
      </label>
      <input
        id="hero-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your email"
        className="min-h-12 flex-1 rounded-full border border-white/20 bg-black/35 px-5 text-sm text-white placeholder:text-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-400/30"
      />
      <button
        type="submit"
        className="attaboy-cta min-h-12 shrink-0 rounded-full px-6 text-sm font-semibold tracking-wide text-black transition active:scale-[0.98]"
      >
        Enter
      </button>
    </form>
  );
}

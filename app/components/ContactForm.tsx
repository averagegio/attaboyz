"use client";

import { FormEvent, useState } from "react";

const inputClass =
  "min-h-12 w-full rounded-2xl border border-white/15 bg-black/50 px-4 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          subject: String(fd.get("subject") ?? ""),
          message: String(fd.get("message") ?? ""),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send message.");
        return;
      }
      setSent(true);
      event.currentTarget.reset();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="pricing-card rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Message sent</h2>
        <p className="mt-2 text-sm text-white/65">Thanks — we&apos;ll get back to you at the email you provided.</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="pricing-card space-y-4 rounded-3xl p-6 sm:p-8">
      {error ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Name
          </label>
          <input id="contact-name" name="name" type="text" required autoComplete="name" className={inputClass} />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Email
          </label>
          <input id="contact-email" name="email" type="email" required autoComplete="email" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
          Subject
        </label>
        <input id="contact-subject" name="subject" type="text" required className={inputClass} />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          maxLength={5000}
          className={`${inputClass} min-h-[9rem] resize-y py-3`}
        />
      </div>

      <button type="submit" disabled={loading} className="attaboy-cta w-full rounded-2xl py-3 text-sm font-bold disabled:opacity-60">
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

import type { Metadata } from "next";
import { ContactForm } from "@/app/components/ContactForm";
import { PageShell } from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "Contact | ATTABOY",
  description: "Get in touch with ATTABOY Website Building Inc.",
};

export default function ContactPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl space-y-8 px-4 pb-20 sm:px-6">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/85">Contact</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Talk to ATTABOY</h1>
          <p className="text-base leading-relaxed text-white/65">
            Questions about @ names, builds, or billing? Send a message and we&apos;ll reply by email.
          </p>
        </header>

        <ContactForm />
      </div>
    </PageShell>
  );
}

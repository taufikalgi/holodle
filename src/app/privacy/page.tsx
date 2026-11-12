import type { Metadata } from "next";
import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: "Privacy — Holodle",
  description:
    "How Holodle uses the holodle_session cookie and aggregate, cookieless visitor statistics.",
};

const LAST_UPDATED = "November 12, 2026";
const ISSUES_URL = "https://github.com/taufikalgi/holodle/issues";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--holo-bg)]">
      <Navbar title="PRIVACY" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="text-3xl font-black tracking-widest text-[var(--holo-text)]">
          PRIVACY
        </h1>
        <p className="mt-2 text-sm text-[var(--holo-text-muted)]">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-[var(--holo-text)]">
          <section>
            <h2 className="text-base font-black uppercase tracking-widest">
              Session cookie
            </h2>
            <p className="mt-2 text-[var(--holo-text-muted)]">
              The main cookie Holodle uses is <code>holodle_session</code>. It is
              strictly necessary to keep you signed in and to associate daily
              progress with your account. It is HttpOnly, SameSite=Lax, and Secure
              in production. It is not used for advertising or cross-site tracking.
              The Google sign-in flow may also set a short-lived OAuth state cookie
              that is cleared after the callback completes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black uppercase tracking-widest">
              Visitor statistics
            </h2>
            <p className="mt-2 text-[var(--holo-text-muted)]">
              The public visitors page shows aggregate, server-side gameplay counts.
              No analytics cookies, third-party scripts, or browser fingerprinting
              are used. Counts describe sessions and guesses, not unique people;
              guest sessions rotate, so the page deliberately avoids claiming unique
              visitor numbers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black uppercase tracking-widest">
              What we do not do
            </h2>
            <p className="mt-2 text-[var(--holo-text-muted)]">
              We do not sell data, run third-party ad trackers, or embed external
              analytics. The frontend talks only to the configured Holodle API.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black uppercase tracking-widest">Contact</h2>
            <p className="mt-2 text-[var(--holo-text-muted)]">
              Questions or concerns? Open an issue at{" "}
              <a
                href={ISSUES_URL}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline text-[var(--holo-blue-dark)]"
              >
                github.com/taufikalgi/holodle/issues
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

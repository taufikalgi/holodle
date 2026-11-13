import Link from "next/link";

export default function VisitorsPrivacyNote({ note }: { note?: string }) {
  return (
    <section className="rounded-2xl border border-[var(--holo-border)] bg-[var(--holo-bg-card)] px-4 py-3 text-xs leading-relaxed text-[var(--holo-text-muted)]">
      <p>
        {note ??
          "Counts are aggregate and server-side. No analytics cookies or third-party scripts."}
      </p>
      <p className="mt-2">
        Read the{" "}
        <Link href="/privacy" className="font-bold underline text-[var(--holo-blue-dark)]">
          privacy page
        </Link>{" "}
        for details about the session cookie.
      </p>
    </section>
  );
}

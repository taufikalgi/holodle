import Link from "next/link";

export default function Footer() {
  return (
    <footer className="text-center mt-14 pb-6">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="h-px flex-1 bg-[var(--holo-border)]" />
        <span className="text-xs text-[var(--holo-blue-light)]">
          ✦
        </span>
        <div className="h-px flex-1 bg-[var(--holo-border)]" />
      </div>
      <div className="mb-3 flex items-center justify-center gap-4 text-xs font-bold text-[var(--holo-text-muted)]">
        <Link href="/visitors" className="transition-opacity hover:opacity-70">
          Visitors
        </Link>
        <Link href="/privacy" className="transition-opacity hover:opacity-70">
          Privacy
        </Link>
      </div>
      <p className="text-xs text-[var(--holo-text-muted)]" style={{ opacity: 0.6 }}>
        Holodle — Fan-made game. Not affiliated with Cover Corp.
      </p>
    </footer>
  );
}

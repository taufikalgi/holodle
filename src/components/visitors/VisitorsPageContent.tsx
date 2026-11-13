"use client";

import { AdminLoading, AdminShell } from "@/components/admin/AdminShell";
import RangeToggle from "@/components/visitors/RangeToggle";
import VisitorsChart from "@/components/visitors/VisitorsChart";
import VisitorsPrivacyNote from "@/components/visitors/VisitorsPrivacyNote";
import VisitorsSummary from "@/components/visitors/VisitorsSummary";
import VisitorsTable from "@/components/visitors/VisitorsTable";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useVisitorStats } from "@/hooks/useVisitorStats";

function LoadingSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading visitor stats">
      <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="holo-card h-24 animate-pulse" />
        ))}
      </div>
      <div className="holo-card h-56 mb-6 animate-pulse" />
      <div className="holo-card h-80 animate-pulse" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section role="alert" className="holo-card p-8 text-center">
      <p className="text-sm font-semibold text-[var(--holo-text-muted)]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-full bg-[var(--holo-blue)] px-6 py-2 text-sm font-bold text-white transition-opacity hover:opacity-80"
      >
        Retry
      </button>
    </section>
  );
}

export default function VisitorsPageContent() {
  const { user, authLoading, handleLogout } = useAdminGuard();
  const { days, setDays, data, loading, error, unavailable, retry } =
    useVisitorStats(Boolean(user));

  if (authLoading || !user) return <AdminLoading />;

  return (
    <AdminShell
      subtitle="Visitors"
      meta={data ? `${data.range_days} days` : "Aggregate stats"}
      user={user}
      onLogout={handleLogout}
    >
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-widest text-[var(--holo-text)]">
          VISITORS
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--holo-text-muted)]">
          Aggregate gameplay activity from the last {days} days. Guests rotate,
          so these are not unique-human counts.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <RangeToggle days={days} onChange={setDays} />
          {loading && data && (
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--holo-text-muted)]">
              Updating…
            </span>
          )}
        </div>
      </header>

      {error && data && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
        >
          {error}{" "}
          <button type="button" onClick={retry} className="font-black underline">
            Retry
          </button>
        </div>
      )}

      {!data && loading && <LoadingSkeleton />}

      {!data && !loading && unavailable && (
        <section className="holo-card p-8 text-center">
          <p className="text-sm font-semibold text-[var(--holo-text-muted)]">
            Visitor stats aren&apos;t available yet. Check back soon.
          </p>
        </section>
      )}

      {!data && !loading && !unavailable && error && (
        <ErrorState message={error} onRetry={retry} />
      )}

      {data && data.series.length === 0 && (
        <section className="holo-card p-8 text-center">
          <p className="text-sm font-semibold text-[var(--holo-text-muted)]">
            No activity recorded for this range yet.
          </p>
        </section>
      )}

      {data && data.series.length > 0 && (
        <div aria-busy={loading}>
          <VisitorsSummary totals={data.totals} />
          <VisitorsChart series={data.series} />
          <VisitorsTable series={data.series} />
        </div>
      )}

      <VisitorsPrivacyNote note={data?.privacy_note} />
    </AdminShell>
  );
}

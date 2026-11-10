"use client";

import type { ReactNode } from "react";
import AdminNav from "./AdminNav";

export function AdminLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--holo-bg)]">
      <span className="text-sm font-semibold animate-pulse text-[var(--holo-text-muted)]">
        Loading…
      </span>
    </main>
  );
}

export function AdminUserChip({
  name,
  picture,
}: {
  name: string;
  picture?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {picture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={picture}
          alt=""
          aria-hidden="true"
          className="w-[30px] h-[30px] rounded-full object-cover border-2 border-[var(--holo-border)]"
        />
      ) : (
        <div
          aria-hidden="true"
          className="w-[30px] h-[30px] rounded-full bg-[var(--holo-blue)] flex items-center justify-center text-xs font-extrabold text-white"
        >
          {name[0]?.toUpperCase()}
        </div>
      )}
      <span className="text-[13px] font-bold text-[var(--holo-text)]">{name}</span>
    </div>
  );
}

export function AdminShell({
  subtitle,
  meta,
  backLabel,
  onBack,
  user,
  onLogout,
  children,
}: {
  subtitle: string;
  meta: ReactNode;
  backLabel?: string;
  onBack?: () => void;
  user: { name: string; picture?: string };
  onLogout: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-[var(--holo-bg)]"
      style={{ fontFamily: '"Baloo 2", sans-serif' }}
    >
      <AdminNav
        subtitle={subtitle}
        backLabel={backLabel}
        onBack={onBack}
        meta={meta}
        userChip={<AdminUserChip name={user.name} picture={user.picture} />}
        onLogout={onLogout}
      />
      <main className="max-w-[1200px] mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

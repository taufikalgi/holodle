"use client";

import { useEffect, type ReactNode } from "react";

export function useModalChrome(open: boolean | undefined, onClose: () => void) {
  const active = open ?? true;
  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [active, onClose]);
  return active;
}

export default function Modal({
  open,
  onClose,
  label,
  maxWidth = "max-w-sm",
  children,
}: {
  open?: boolean;
  onClose: () => void;
  label: string;
  maxWidth?: string;
  children: ReactNode;
}) {
  const active = useModalChrome(open, onClose);
  if (!active) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className={`relative z-10 w-full ${maxWidth}`}>
        <div className="overflow-hidden rounded-[28px] border bg-[var(--holo-bg)] shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}

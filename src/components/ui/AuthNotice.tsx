"use client";

import { useEffect, useState } from "react";
import { onAppEvent } from "@/lib/events";

export default function AuthNotice() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return onAppEvent("holodle:notice", ({ message: next }) => setMessage(next));
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-[100] rounded-xl bg-[var(--holo-blue)] px-5 py-3 text-sm font-bold text-white shadow-lg"
    >
      {message}
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";

export default function ShareButton({
  text,
  label = "Share",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={copy}
      className="mt-3 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
      style={{ background: "var(--holo-blue)" }}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

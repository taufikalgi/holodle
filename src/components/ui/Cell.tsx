"use client";

import { useEffect, useState } from "react";

export default function Cell({
  label,
  status,
  delay,
}: {
  label: React.ReactNode;
  status: "correct" | "wrong" | "higher" | "higher-close" | "lower" | "lower-close" | "wrong-close";
  delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  const cls =
    status === "correct" || status === "higher" || status === "lower"
      ? "cell-correct"
      : status === "higher-close" || status === "lower-close" || status === "wrong-close"
        ? "cell-wrong-close"
        : "cell-wrong";
  return (
    <div
      className={`flex items-center justify-center text-center px-2 py-3 rounded-xl text-sm min-h-[54px] border transition-all duration-500 ${visible ? cls : "opacity-0 scale-90 bg-gray-100 border-gray-200"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {label}
    </div>
  );
}

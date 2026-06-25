"use client";

interface AdminToastProps {
  message: string;
  type: "ok" | "err";
}

export default function AdminToast({ message, type }: AdminToastProps) {
  return (
    <>
      <div
        className={type === "ok" ? "win-banner" : "lose-banner"}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          padding: "14px 22px",
          borderRadius: 14,
          fontWeight: 700,
          fontSize: 14,
          zIndex: 100,
          animation: "bounceIn 0.4s ease forwards",
          maxWidth: 320,
        }}
      >
        {message}
      </div>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.9) translateY(10px); opacity: 0; }
          60% { transform: scale(1.03) translateY(0); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

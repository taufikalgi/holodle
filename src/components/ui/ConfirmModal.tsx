"use client";

import Modal from "./Modal";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  error,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const close = () => {
    if (!loading) onClose();
  };

  return (
    <Modal onClose={close} label={title} maxWidth="max-w-md">
      <div
        className="holo-card animate-bounce-in"
        style={{ width: "100%", maxWidth: 420, padding: "1.5rem" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            style={{
              fontFamily: "var(--font-albert-sans), sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "var(--holo-text)",
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={close}
            disabled={loading}
            aria-label="Close"
            style={{
              background: "var(--holo-off-white)",
              border: "1.5px solid var(--holo-border)",
              borderRadius: 8,
              width: 34,
              height: 34,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 16,
              color: "var(--holo-text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: loading ? 0.6 : 1,
            }}
          >
            ✕
          </button>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.5,
            color: "var(--holo-text-muted)",
          }}
        >
          {message}
        </p>

        {error && (
          <div className="cell-wrong rounded-[10px] px-[14px] py-[10px] text-[13px] mt-4">
            ⚠ {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={close}
            disabled={loading}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "1.5px solid var(--holo-border)",
              background: "var(--holo-off-white)",
              color: "var(--holo-text-muted)",
              fontFamily: '"Baloo 2", sans-serif',
              fontWeight: 700,
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: loading
                ? "var(--holo-border)"
                : destructive
                  ? "var(--holo-rose)"
                  : "linear-gradient(135deg, var(--holo-blue), var(--holo-blue-dark))",
              color: "#fff",
              fontFamily: '"Baloo 2", sans-serif',
              fontWeight: 800,
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading
                ? "none"
                : destructive
                  ? "0 4px 14px rgba(240,101,122,0.35)"
                  : "0 4px 14px rgba(0,119,163,0.3)",
              transition: "all 0.2s ease",
            }}
          >
            {loading ? `${confirmLabel}...` : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

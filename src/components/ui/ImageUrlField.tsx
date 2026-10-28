import type { ReactNode } from "react";

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 13px",
  borderRadius: 10,
  fontSize: 14,
};

export const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--holo-text-muted)",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export function Field({ label, children, span }: { label: string; children: ReactNode; span?: boolean }) {
  return (
    <div style={span ? { gridColumn: "1 / -1" } : undefined}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function ImageUrlField({
  label,
  value,
  onChange,
  previewAlt,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  previewAlt: string;
}) {
  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <label style={labelStyle}>{label}</label>
      <input
        className="holo-input"
        style={inputStyle}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://hololive.hololivepro.com/..."
      />
      {value && (
        <div className="mt-2 flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={previewAlt}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid var(--holo-border)",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <span style={{ fontSize: 12, color: "var(--holo-text-muted)" }}>Preview</span>
        </div>
      )}
    </div>
  );
}

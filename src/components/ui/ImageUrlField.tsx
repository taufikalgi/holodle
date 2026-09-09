export default function ImageUrlField({
  label,
  value,
  onChange,
  previewAlt,
  inputStyle,
  labelStyle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  previewAlt: string;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
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
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
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

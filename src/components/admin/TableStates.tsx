export function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 8 }).map((__, j) => (
            <td key={j} style={{ padding: "14px 16px" }}>
              <div
                style={{
                  height: 14,
                  borderRadius: 7,
                  background: "var(--holo-border)",
                  opacity: 0.6,
                  width: j === 0 ? 140 : j === 6 ? 100 : 60,
                  animation: "pulse 1.5s ease infinite",
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function TableEmpty() {
  return (
    <tr>
      <td
        colSpan={8}
        style={{
          padding: "3.5rem",
          textAlign: "center",
          color: "var(--holo-text-muted)",
          fontSize: 15,
        }}
      >
        🎨 No talents found
      </td>
    </tr>
  );
}

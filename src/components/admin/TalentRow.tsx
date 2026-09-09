"use client";

import type { AdminTalent as Talent } from "@/lib/talents";
import { getBranchStyle } from "@/lib/talent-sort";

interface TalentRowProps {
  talent: Talent;
  index: number;
  onEdit: (talent: Talent) => void;
  onCrop: (talent: Talent) => void;
}

export default function TalentRow({ talent, index: idx, onEdit, onCrop }: TalentRowProps) {
  const bs = getBranchStyle(talent.branch);
  return (
    <tr
      key={talent.id}
      className="row-reveal"
      style={{
        animationDelay: `${Math.min(idx * 30, 300)}ms`,
        borderBottom: "1px solid var(--holo-border)",
      }}
    >
      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
        <div className="flex items-center gap-2.5">
          {talent.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={talent.image_url}
              alt={talent.name}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid var(--holo-border)",
                flexShrink: 0,
              }}
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.display = "none";
              }}
            />
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--holo-blue-light), var(--holo-blue))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 800,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {talent.name[0]}
            </div>
          )}
          <span
            style={{ fontWeight: 700, fontSize: 14, color: "var(--holo-text)" }}
          >
            {talent.name}
          </span>
        </div>
      </td>

      <td style={{ padding: "12px 16px" }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            padding: "3px 10px",
            borderRadius: 20,
            background: bs.bg,
            color: bs.color,
            border: `1px solid ${bs.border}`,
            whiteSpace: "nowrap",
          }}
        >
          {talent.branch}
        </span>
      </td>

      <td
        style={{
          padding: "12px 16px",
          fontSize: 13,
          color: "var(--holo-text-muted)",
          fontWeight: 600,
        }}
      >
        {talent.lore_archetype || "—"}
      </td>

      <td
        style={{
          padding: "12px 16px",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--holo-text)",
        }}
      >
        {talent.debut_year || "—"}
      </td>

      <td
        style={{
          padding: "12px 16px",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--holo-text)",
          whiteSpace: "nowrap",
        }}
      >
        {talent.height ? `${talent.height} cm` : "—"}
      </td>

      <td
        style={{
          padding: "12px 16px",
          fontSize: 13,
          color: "var(--holo-text-muted)",
          fontWeight: 600,
        }}
      >
        {talent.birth_month || "—"}
      </td>

      <td style={{ padding: "12px 16px" }}>
        <div className="flex flex-wrap gap-1">
          {talent.alt_names.length === 0 ? (
            <span
              style={{
                fontSize: 12,
                color: "var(--holo-border)",
                fontStyle: "italic",
              }}
            >
              none
            </span>
          ) : (
            talent.alt_names.map((a: string) => (
              <span
                key={a}
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: "rgba(0,180,216,0.10)",
                  border: "1px solid rgba(0,180,216,0.25)",
                  color: "var(--holo-blue-dark)",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {a}
              </span>
            ))
          )}
        </div>
      </td>

      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onEdit(talent)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1.5px solid var(--holo-border)",
              background: "var(--holo-off-white)",
              color: "var(--holo-blue-dark)",
              fontFamily: '"Baloo 2", sans-serif',
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "var(--holo-blue)";
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(0,180,216,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "var(--holo-border)";
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--holo-off-white)";
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onCrop(talent)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1.5px solid rgba(0,180,216,0.35)",
              background: "rgba(0,180,216,0.10)",
              color: "var(--holo-blue-dark)",
              fontFamily: '"Baloo 2", sans-serif',
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "var(--holo-blue)";
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(0,180,216,0.18)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(0,180,216,0.35)";
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(0,180,216,0.10)";
            }}
          >
            ✂️
          </button>
        </div>
      </td>
    </tr>
  );
}

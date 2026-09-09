"use client";

import type { AdminTalent as Talent } from "@/lib/talents";
import { ALL_BRANCHES, MONTH_ORDER } from "@/lib/talents";
import Modal from "./Modal";
import { useTalentForm } from "@/hooks/useTalentForm";
import ImageUrlField, { Field, inputStyle } from "./ImageUrlField";

interface Props {
  mode: "create" | "edit";
  initial?: Talent | null;
  onClose: () => void;
  onSaved: () => void;
}

const MONTHS = Object.keys(MONTH_ORDER);

export default function TalentModal({ mode, initial, onClose, onSaved }: Props) {
  const { form, set, altInput, setAltInput, error, loading, handleSubmit } = useTalentForm({
    mode,
    initial,
    onSaved,
    onClose,
  });

  return (
    <Modal
      onClose={onClose}
      label={mode === "edit" ? "Edit talent" : "Add talent"}
      maxWidth="max-w-2xl"
    >
      <div
        className="holo-card animate-bounce-in"
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "1.75rem 1.75rem 1.5rem",
        }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2
            style={{
              fontFamily: "var(--font-albert-sans), sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "var(--holo-text)",
              margin: 0,
            }}
          >
            {mode === "create" ? "✨ Add Talent" : "✏️ Edit Talent"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "var(--holo-off-white)",
              border: "1.5px solid var(--holo-border)",
              borderRadius: 8,
              width: 34,
              height: 34,
              cursor: "pointer",
              fontSize: 16,
              color: "var(--holo-text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <Field label="Name *" span>
              <input
                className="holo-input"
                style={inputStyle}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Tokino Sora"
                required
              />
            </Field>

            {/* Branch */}
            <Field label="Branch *">
              <select
                className="holo-input"
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.branch}
                onChange={(e) => set("branch", e.target.value)}
                required
              >
                <option value="">Select branch</option>
                {ALL_BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>

            {/* Lore archetype */}
            <Field label="Lore archetype">
              <input
                className="holo-input"
                style={inputStyle}
                value={form.lore_archetype}
                onChange={(e) => set("lore_archetype", e.target.value)}
                placeholder="Human"
              />
            </Field>

            {/* Debut year */}
            <Field label="Debut year">
              <input
                className="holo-input"
                style={inputStyle}
                type="number"
                min={2017}
                max={new Date().getFullYear()}
                value={form.debut_year ?? ""}
                onChange={(e) => set("debut_year", e.target.value ? Number(e.target.value) : null)}
                placeholder="2017"
              />
            </Field>

            {/* Height */}
            <Field label="Height (cm)">
              <input
                className="holo-input"
                style={inputStyle}
                type="number"
                min={100}
                max={250}
                value={form.height ?? ""}
                onChange={(e) => set("height", e.target.value ? Number(e.target.value) : null)}
                placeholder="160"
              />
            </Field>

            {/* Birth month */}
            <Field label="Birth month">
              <select
                className="holo-input"
                style={{ ...inputStyle, cursor: "pointer", gridColumn: "1 / -1" }}
                value={form.birth_month}
                onChange={(e) => set("birth_month", e.target.value)}
              >
                <option value="">Unknown</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>

            {/* Image URL */}
            <ImageUrlField
              label="Image URL"
              value={form.image_url}
              onChange={(v) => set("image_url", v)}
              previewAlt="Preview"
            />

            {/* Avatar URL */}
            <ImageUrlField
              label="Avatar URL"
              value={form.avatar_url}
              onChange={(v) => set("avatar_url", v)}
              previewAlt="Avatar preview"
            />

            {/* Alt names */}
            <Field label="Alt names (comma-separated)" span>
              <input
                className="holo-input"
                style={inputStyle}
                value={altInput}
                onChange={(e) => setAltInput(e.target.value)}
                placeholder="Soda, Sofa"
              />
              {altInput && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {altInput
                    .split(",")
                    .map((t: string) => t.trim())
                    .filter(Boolean)
                    .map((tag: string) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 12,
                          padding: "3px 10px",
                          borderRadius: 20,
                          background: "rgba(0,180,216,0.12)",
                          border: "1px solid rgba(0,180,216,0.3)",
                          color: "var(--holo-blue-dark)",
                          fontWeight: 600,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              )}
            </Field>
          </div>

          {error && (
            <div className="cell-wrong rounded-[10px] px-[14px] py-[10px] text-[13px] mt-4">
              ⚠ {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "1.5px solid var(--holo-border)",
                background: "var(--holo-off-white)",
                color: "var(--holo-text-muted)",
                fontFamily: '"Baloo 2", sans-serif',
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                border: "none",
                background: loading
                  ? "var(--holo-border)"
                  : "linear-gradient(135deg, var(--holo-blue), var(--holo-blue-dark))",
                color: "#fff",
                fontFamily: '"Baloo 2", sans-serif',
                fontWeight: 800,
                fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 14px rgba(0,119,163,0.3)",
                transition: "all 0.2s ease",
              }}
            >
              {loading ? "Saving..." : mode === "create" ? "✨ Create" : "💾 Update"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

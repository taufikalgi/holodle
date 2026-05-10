"use client";

import { useEffect, useRef, useState } from "react";
import type { Talent, TalentFormData } from "@/lib/talent-api";

interface Props {
  mode: "create" | "edit";
  initial?: Talent | null;
  onClose: () => void;
  onSaved: () => void;
  apiBase: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EMPTY: TalentFormData = {
  name: "",
  branch: "",
  debut_year: null,
  lore_archetype: "",
  height: null,
  birth_month: "",
  image_url: "",
  alt_names: [],
};

export default function TalentModal({ mode, initial, onClose, onSaved, apiBase }: Props) {
  const [form, setForm] = useState<TalentFormData>(initial ? { ...initial } : { ...EMPTY });
  const [altInput, setAltInput] = useState(initial?.alt_names?.join(", ") ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function set<K extends keyof TalentFormData>(key: K, value: TalentFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.branch.trim()) {
      setError("Name and branch are required.");
      return;
    }
    setLoading(true);

    const payload = {
      ...form,
      alt_names: altInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      debut_year: form.debut_year ? Number(form.debut_year) : null,
      height: form.height ? Number(form.height) : null,
      ...(mode === "edit" && initial ? { id: initial.id } : {}),
    };

    try {
      const url = mode === "create" ? `${apiBase}/talent/create` : `${apiBase}/talent/update`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Request failed");
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 13px",
    borderRadius: 10,
    fontSize: 14,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--holo-text-muted)",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,35,64,0.45)",
        backdropFilter: "blur(4px)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontFamily: '"Poppins", sans-serif',
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            {/* Name */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Name *</label>
              <input
                className="holo-input"
                style={inputStyle}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Tokino Sora"
                required
              />
            </div>

            {/* Branch */}
            <div>
              <label style={labelStyle}>Branch *</label>
              <select
                className="holo-input"
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.branch}
                onChange={(e) => set("branch", e.target.value)}
                required
              >
                <option value="">Select branch</option>
                {["JP", "EN", "ID", "DEV_IS", "ReGLOSS", "STARS"].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Lore archetype */}
            <div>
              <label style={labelStyle}>Lore archetype</label>
              <input
                className="holo-input"
                style={inputStyle}
                value={form.lore_archetype}
                onChange={(e) => set("lore_archetype", e.target.value)}
                placeholder="Human"
              />
            </div>

            {/* Debut year */}
            <div>
              <label style={labelStyle}>Debut year</label>
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
            </div>

            {/* Height */}
            <div>
              <label style={labelStyle}>Height (cm)</label>
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
            </div>

            {/* Birth month */}
            <div>
              <label style={labelStyle}>Birth month</label>
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
            </div>

            {/* Image URL */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Image URL</label>
              <input
                className="holo-input"
                style={inputStyle}
                type="url"
                value={form.image_url}
                onChange={(e) => set("image_url", e.target.value)}
                placeholder="https://hololive.hololivepro.com/..."
              />
              {form.image_url && (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.image_url}
                    alt="Preview"
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

            {/* Alt names */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Alt names (comma-separated)</label>
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
            </div>
          </div>

          {error && (
            <div
              className="cell-wrong"
              style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13, marginTop: "1rem" }}
            >
              ⚠ {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "1.5rem",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "1.5px solid var(--holo-border)",
                background: "var(--holo-off-white)",
                color: "var(--holo-text-muted)",
                fontFamily: '"Nunito", sans-serif',
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
                fontFamily: '"Nunito", sans-serif',
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
    </div>
  );
}

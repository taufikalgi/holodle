"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AdminToast } from "@/components/admin";
import { CropEditor, SavedCropsList, CropsReviewModal } from "@/components/admin/avatar-crops";
import {
  MOCK_TALENTS,
  createMockArea,
  deleteMockArea,
  fetchMockAreas,
  updateMockArea,
  type CropArea,
  type CropBox,
  type EditableArea,
  type MockTalent,
} from "@/lib/avatar-crops";

let keySeq = 0;
const nextKey = () => `area-${++keySeq}-${Date.now() % 100000}`;

export default function AvatarCropsAdminPage() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialId = searchParams.get("talentId");
  const [selectedId, setSelectedId] = useState(
    initialId && MOCK_TALENTS.some((t) => t.id === initialId) ? initialId : "mock-tokino-sora"
  );
  const talent: MockTalent = MOCK_TALENTS.find((t) => t.id === selectedId) ?? MOCK_TALENTS[0];

  const [loadedAreas, setLoadedAreas] = useState<CropArea[] | null>(null);
  const [areas, setAreas] = useState<EditableArea[]>([]);
  const [deleted, setDeleted] = useState<CropArea[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState<EditableArea | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAreas = useCallback(async (talentId: string) => {
    setLoadedAreas(null);
    setDeleted([]);
    const fetched = await fetchMockAreas(talentId);
    const editable: EditableArea[] = fetched.map((a) => ({
      ...a,
      key: nextKey(),
      dirty: false,
    }));
    setAreas(editable);
    setLoadedAreas(fetched);
    setSelectedKey(null);
  }, []);

  useEffect(() => {
    loadAreas(selectedId);
  }, [selectedId, loadAreas]);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/admin/login");
  }, [authLoading, user, router]);

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  const addArea = useCallback((box: CropBox) => {
    setAreas((prev) => [
      ...prev,
      {
        key: nextKey(),
        id: null,
        x: box.x,
        y: box.y,
        w: box.w,
        h: box.h,
        dirty: true,
      },
    ]);
  }, []);

  const updateArea = useCallback((key: string, box: CropBox) => {
    setAreas((prev) => prev.map((a) => (a.key === key ? { ...a, ...box, dirty: true } : a)));
  }, []);

  const removeArea = useCallback(
    (key: string) => {
      const target = areas.find((a) => a.key === key);
      if (target?.id) {
        const removed: CropArea = {
          id: target.id,
          x: target.x,
          y: target.y,
          w: target.w,
          h: target.h,
        };
        setDeleted((d) => [...d, removed]);
        setAreas((prev) => prev.filter((a) => a.key !== key));
      } else {
        setAreas((prev) => prev.filter((a) => a.key !== key));
      }
    },
    [areas]
  );

  const unsavedCount = useMemo(() => {
    return areas.filter((a) => a.dirty || a.id === null).length + deleted.length;
  }, [areas, deleted]);
  const savedCount = areas.filter((a) => a.id !== null).length;

  const handleSave = async () => {
    setSaving(true);
    try {
      const created = areas.filter((a) => a.id === null);
      const updated = areas.filter((a) => a.dirty && a.id !== null);

      await Promise.all(
        created.map((c) => createMockArea(selectedId, { x: c.x, y: c.y, w: c.w, h: c.h }))
      );
      await Promise.all(
        updated.map((u) =>
          updateMockArea(selectedId, u.id as string, { x: u.x, y: u.y, w: u.w, h: u.h })
        )
      );
      await Promise.all(deleted.map((d) => deleteMockArea(selectedId, d.id)));

      await loadAreas(selectedId);
      showToast(
        `Saved ${created.length + updated.length + deleted.length} change${
          created.length + updated.length + deleted.length === 1 ? "" : "s"
        } ✨`
      );
    } catch {
      showToast("Save failed — check your connection.", "err");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    await loadAreas(selectedId);
    showToast("Reset to last saved state ↺");
  };

  if (authLoading || !user) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--holo-bg)" }}
      >
        <span
          className="text-sm font-semibold animate-pulse"
          style={{ color: "var(--holo-text-muted)" }}
        >
          Loading…
        </span>
      </main>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--holo-bg)",
        fontFamily: '"Baloo 2", sans-serif',
      }}
    >
      <nav
        style={{
          background: "var(--holo-bg-card)",
          borderBottom: "1.5px solid var(--holo-border)",
          padding: "0 2rem",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 40,
          boxShadow: "0 2px 12px rgba(0,119,163,0.07)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            style={{
              padding: "7px 12px",
              borderRadius: 10,
              border: "1.5px solid var(--holo-border)",
              background: "var(--holo-off-white)",
              color: "var(--holo-blue-dark)",
              fontFamily: '"Baloo 2", sans-serif',
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            ← Talent page
          </button>
          <div>
            <span
              className="shimmer-text"
              style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 18 }}
            >
              Holodle Admin
            </span>
            <span
              style={{
                marginLeft: 10,
                fontSize: 12,
                color: "var(--holo-text-muted)",
                fontWeight: 600,
              }}
            >
              Avatar Crop Studio
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: 13, color: "var(--holo-text-muted)", fontWeight: 600 }}>
            {talent.name}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "8px 18px",
              borderRadius: 10,
              border: "1.5px solid var(--holo-border)",
              background: "var(--holo-off-white)",
              color: "var(--holo-text-muted)",
              fontFamily: '"Baloo 2", sans-serif',
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {MOCK_TALENTS.map((t) => {
            const selected = t.id === selectedId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 14px 7px 7px",
                  borderRadius: 999,
                  border: selected
                    ? "2px solid var(--holo-blue)"
                    : "1.5px solid var(--holo-border)",
                  background: selected ? "rgba(0,180,216,0.10)" : "var(--holo-bg-card)",
                  color: "var(--holo-text)",
                  fontFamily: '"Baloo 2", sans-serif',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.imageUrl}
                  alt=""
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1.5px solid var(--holo-border)",
                  }}
                />
                {t.name}
              </button>
            );
          })}
        </div>

        <div
          className="holo-card"
          style={{
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginBottom: "1.25rem",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: unsavedCount > 0 ? "#a16207" : "var(--holo-blue-dark)",
              background: unsavedCount > 0 ? "#fef9c3" : "rgba(0,180,216,0.10)",
              border: `1.5px solid ${unsavedCount > 0 ? "#fde047" : "rgba(0,180,216,0.25)"}`,
              padding: "4px 12px",
              borderRadius: 20,
            }}
          >
            {unsavedCount > 0
              ? `${unsavedCount} unsaved change${unsavedCount === 1 ? "" : "s"}`
              : "All saved ✓"}
          </span>

          <span style={{ flex: 1 }} />

          <button
            type="button"
            onClick={handleReset}
            disabled={unsavedCount === 0 || saving}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              border: "1.5px solid var(--holo-border)",
              background: "var(--holo-off-white)",
              color: "var(--holo-text-muted)",
              fontFamily: '"Baloo 2", sans-serif',
              fontWeight: 700,
              fontSize: 13,
              cursor: unsavedCount === 0 || saving ? "not-allowed" : "pointer",
              opacity: unsavedCount === 0 || saving ? 0.5 : 1,
            }}
          >
            ↺ Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={unsavedCount === 0 || saving}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, var(--holo-blue), var(--holo-blue-dark))",
              color: "#fff",
              fontFamily: '"Baloo 2", sans-serif',
              fontWeight: 800,
              fontSize: 14,
              cursor: unsavedCount === 0 || saving ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(0,119,163,0.25)",
              opacity: unsavedCount === 0 || saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving…" : `💾 Save (${unsavedCount})`}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(260px, 1fr)",
            gap: "1.25rem",
            alignItems: "start",
          }}
        >
          <div className="holo-card" style={{ padding: "1rem" }}>
            {!loadedAreas ? (
              <div
                style={{
                  aspectRatio: "1 / 0.6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--holo-text-muted)",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Loading areas…
              </div>
            ) : (
              <CropEditor
                talent={talent}
                areas={areas}
                selectedKey={selectedKey}
                onSelect={setSelectedKey}
                onAdd={addArea}
                onUpdate={updateArea}
                onRemove={removeArea}
                onNaturalSize={setNatural}
              />
            )}
          </div>

          <div className="holo-card" style={{ padding: "1rem 1.25rem" }}>
            <SavedCropsList
              src={talent.imageUrl}
              natural={natural}
              areas={areas}
              savedCount={savedCount}
              onReview={setReview}
              onDelete={removeArea}
            />
          </div>
        </div>
      </main>

      {review && (
        <CropsReviewModal
          talent={talent}
          natural={natural}
          area={{ x: review.x, y: review.y, w: review.w, h: review.h }}
          label={`Area #${areas.findIndex((a) => a.key === review.key) + 1 || "?"}`}
          onClose={() => setReview(null)}
        />
      )}

      {toast && <AdminToast message={toast.msg} type={toast.type} />}
    </div>
  );
}

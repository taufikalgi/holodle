"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, getToken } from "@/hooks/useAuth";
import { ApiError } from "@/lib/errors";
import { AdminToast } from "@/components/admin";
import { CropEditor, SavedCropsList, CropsReviewModal } from "@/components/admin/avatar-crops";
import {
  createArea,
  deleteArea,
  fetchAreas,
  updateArea,
  type CropArea,
  type CropBox,
  type Difficulty,
  type EditableArea,
  type Talent,
} from "@/lib/avatar-crops";

let keySeq = 0;
const nextKey = () => `area-${++keySeq}-${Date.now() % 100000}`;

export default function AvatarCropsAdminPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AvatarCropsAdminContent />
    </Suspense>
  );
}

function LoadingScreen() {
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

function AvatarCropsAdminContent() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialId = searchParams.get("talentId");
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [talentsLoading, setTalentsLoading] = useState(true);

  const talent: Talent | undefined =
    talents.find((t) => t.id === selectedId) ?? talents[0];

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
    try {
      const fetched = await fetchAreas(talentId);
      const editable: EditableArea[] = fetched.map((a) => ({
        ...a,
        key: nextKey(),
        dirty: false,
      }));
      setAreas(editable);
      setLoadedAreas(fetched);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        router.replace("/admin/login");
        return;
      }
      setAreas([]);
      setLoadedAreas([]);
      showToast(e instanceof Error ? e.message : "Failed to load areas", "err");
    } finally {
      setSelectedKey(null);
    }
  }, [router]);

  const fetchTalents = useCallback(async () => {
    setTalentsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/v1/talent/`, {
        headers: { Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const json = (await res.json().catch(() => null)) as { success?: boolean; data?: Talent[] } | null;
      if (!res.ok || !json?.success) throw new Error(json ? "Failed to load talents" : `Request failed (${res.status})`);
      setTalents(json.data ?? []);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load talents", "err");
    } finally {
      setTalentsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  useEffect(() => {
    if (talents.length > 0 && selectedId && !talents.some((t) => t.id === selectedId)) {
      setSelectedId(talents[0].id);
    }
  }, [talents, selectedId]);

  useEffect(() => {
    if (talent) loadAreas(talent.id);
  }, [talent, loadAreas]);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/admin/login");
  }, [authLoading, user, router]);

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  const addArea = useCallback((box: CropBox) => {
    const key = nextKey();
    setSelectedKey(key);
    setAreas((prev) => [
      ...prev,
      {
        key,
        id: null,
        x: box.x,
        y: box.y,
        w: box.w,
        h: box.h,
        difficulty: "medium",
        dirty: true,
      },
    ]);
  }, []);

  const editArea = useCallback((key: string, box: CropBox) => {
    setAreas((prev) => prev.map((a) => (a.key === key ? { ...a, ...box, dirty: true } : a)));
  }, []);

  const setAreaDifficulty = useCallback((key: string, difficulty: Difficulty) => {
    setAreas((prev) => prev.map((a) => (a.key === key ? { ...a, difficulty, dirty: true } : a)));
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
          difficulty: target.difficulty,
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
    if (!talent) return;
    setSaving(true);
    try {
      const created = areas.filter((a) => a.id === null);
      const updated = areas.filter((a) => a.dirty && a.id !== null);

      const createdResults = await Promise.all(
        created.map(async (c) => ({
          key: c.key,
          area: await createArea(talent.id, {
            x: c.x,
            y: c.y,
            w: c.w,
            h: c.h,
            difficulty: c.difficulty,
          }),
        }))
      );

      if (createdResults.length > 0) {
        const ids = new Map(createdResults.map((r) => [r.key, r.area.id]));
        setAreas((prev) =>
          prev.map((a) => (ids.has(a.key) ? { ...a, id: ids.get(a.key) ?? a.id, dirty: false } : a))
        );
      }

      await Promise.all(
        updated.map((u) =>
          updateArea(talent.id, u.id as string, {
            x: u.x,
            y: u.y,
            w: u.w,
            h: u.h,
            difficulty: u.difficulty,
          })
        )
      );
      await Promise.all(deleted.map((d) => deleteArea(talent.id, d.id)));

      await loadAreas(talent.id);
      showToast(
        `Saved ${created.length + updated.length + deleted.length} change${
          created.length + updated.length + deleted.length === 1 ? "" : "s"
        } ✨`
      );
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        router.replace("/admin/login");
        return;
      }
      showToast(e instanceof Error ? e.message : "Save failed — check your connection.", "err");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!talent) return;
    await loadAreas(talent.id);
    showToast("Reset to last saved state ↺");
  };

  if (authLoading || !user) {
    return <LoadingScreen />;
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
            {talent?.name ?? "Loading…"}
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
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            overflowX: "auto",
            paddingBottom: 6,
          }}
        >
          {talentsLoading ? (
            <span
              style={{ fontSize: 13, color: "var(--holo-text-muted)", fontWeight: 600 }}
            >
              Loading talents…
            </span>
          ) : (
            talents.map((t) => {
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
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar_url || t.image_url}
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
            })
          )}
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

        {talentsLoading ? (
          <div
            className="holo-card"
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--holo-text-muted)",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Loading talents…
          </div>
        ) : !talent ? (
          <div
            className="holo-card cell-wrong"
            style={{ padding: "2rem", textAlign: "center", fontWeight: 700, fontSize: 14 }}
          >
            Couldn&apos;t load the talent list.{" "}
            <button
              type="button"
              onClick={fetchTalents}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                fontWeight: 800,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Retry
            </button>
          </div>
        ) : (
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
                  onUpdate={editArea}
                  onSetDifficulty={setAreaDifficulty}
                  onRemove={removeArea}
                  onNaturalSize={setNatural}
                />
              )}
            </div>

            <div className="holo-card" style={{ padding: "1rem 1.25rem" }}>
              <SavedCropsList
                src={talent.avatar_url || talent.image_url}
                natural={natural}
                areas={areas}
                savedCount={savedCount}
                onReview={setReview}
                onDelete={removeArea}
              />
            </div>
          </div>
        )}
      </main>

      {review && talent && (
        <CropsReviewModal
          talent={talent}
          natural={natural}
          area={{
            x: review.x,
            y: review.y,
            w: review.w,
            h: review.h,
            difficulty: review.difficulty,
          }}
          label={`Area #${areas.findIndex((a) => a.key === review.key) + 1 || "?"}`}
          onClose={() => setReview(null)}
        />
      )}

      {toast && <AdminToast message={toast.msg} type={toast.type} />}
    </div>
  );
}

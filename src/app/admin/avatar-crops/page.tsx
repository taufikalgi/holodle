"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { AdminToast } from "@/components/admin";
import { CropEditor, SavedCropsList, CropsReviewModal } from "@/components/admin/avatar-crops";
import { useAvatarCropAdmin } from "@/hooks/useAvatarCropAdmin";

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
  const c = useAvatarCropAdmin();
  const router = useRouter();

  if (c.authLoading || !c.user) {
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
              style={{ fontFamily: "var(--font-albert-sans), sans-serif", fontWeight: 800, fontSize: 18 }}
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
            {c.talent?.name ?? "Loading…"}
          </span>
          <button
            type="button"
            onClick={c.handleLogout}
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
          {c.talentsLoading ? (
            <span
              style={{ fontSize: 13, color: "var(--holo-text-muted)", fontWeight: 600 }}
            >
              Loading talents…
            </span>
          ) : (
            c.talents.map((t) => {
              const selected = t.id === c.selectedId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => c.setSelectedId(t.id)}
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
              color: c.unsavedCount > 0 ? "#a16207" : "var(--holo-blue-dark)",
              background: c.unsavedCount > 0 ? "#fef9c3" : "rgba(0,180,216,0.10)",
              border: `1.5px solid ${c.unsavedCount > 0 ? "#fde047" : "rgba(0,180,216,0.25)"}`,
              padding: "4px 12px",
              borderRadius: 20,
            }}
          >
            {c.unsavedCount > 0
              ? `${c.unsavedCount} unsaved change${c.unsavedCount === 1 ? "" : "s"}`
              : "All saved ✓"}
          </span>

          <span style={{ flex: 1 }} />

          <button
            type="button"
            onClick={c.handleReset}
            disabled={c.unsavedCount === 0 || c.saving}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              border: "1.5px solid var(--holo-border)",
              background: "var(--holo-off-white)",
              color: "var(--holo-text-muted)",
              fontFamily: '"Baloo 2", sans-serif',
              fontWeight: 700,
              fontSize: 13,
              cursor: c.unsavedCount === 0 || c.saving ? "not-allowed" : "pointer",
              opacity: c.unsavedCount === 0 || c.saving ? 0.5 : 1,
            }}
          >
            ↺ Reset
          </button>
          <button
            type="button"
            onClick={c.handleSave}
            disabled={c.unsavedCount === 0 || c.saving}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, var(--holo-blue), var(--holo-blue-dark))",
              color: "#fff",
              fontFamily: '"Baloo 2", sans-serif',
              fontWeight: 800,
              fontSize: 14,
              cursor: c.unsavedCount === 0 || c.saving ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(0,119,163,0.25)",
              opacity: c.unsavedCount === 0 || c.saving ? 0.6 : 1,
            }}
          >
            {c.saving ? "Saving…" : `💾 Save (${c.unsavedCount})`}
          </button>
        </div>

        {c.talentsLoading ? (
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
        ) : !c.talent ? (
          <div
            className="holo-card cell-wrong"
            style={{ padding: "2rem", textAlign: "center", fontWeight: 700, fontSize: 14 }}
          >
            Couldn&apos;t load the talent list.{" "}
            <button
              type="button"
              onClick={c.fetchTalents}
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
              {!c.loadedAreas ? (
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
                  talent={c.talent}
                  areas={c.areas}
                  selectedKey={c.selectedKey}
                  onSelect={c.setSelectedKey}
                  onAdd={c.addArea}
                  onUpdate={c.editArea}
                  onSetDifficulty={c.setAreaDifficulty}
                  onRemove={c.removeArea}
                  onNaturalSize={c.setNatural}
                />
              )}
            </div>

            <div className="holo-card" style={{ padding: "1rem 1.25rem" }}>
              <SavedCropsList
                src={c.talent.avatar_url || c.talent.image_url}
                natural={c.natural}
                areas={c.areas}
                savedCount={c.savedCount}
                onReview={c.setReview}
                onDelete={c.removeArea}
              />
            </div>
          </div>
        )}
      </main>

      {c.review && c.talent && (
        <CropsReviewModal
          talent={c.talent}
          natural={c.natural}
          area={{
            x: c.review.x,
            y: c.review.y,
            w: c.review.w,
            h: c.review.h,
            difficulty: c.review.difficulty,
          }}
          label={`Area #${c.areas.findIndex((a) => a.key === c.review!.key) + 1 || "?"}`}
          onClose={() => c.setReview(null)}
        />
      )}

      {c.toast && <AdminToast message={c.toast.msg} type={c.toast.type} />}
    </div>
  );
}

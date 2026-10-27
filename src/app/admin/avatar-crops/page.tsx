"use client";

import { Suspense } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { AdminToast } from "@/components/admin";
import Modal from "@/components/ui/Modal";
import { CropEditor, SavedCropsList, CropsReviewModal } from "@/components/admin/avatar-crops";
import AdminNav from "@/components/admin/AdminNav";
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
      className="min-h-screen flex items-center justify-center bg-[var(--holo-bg)]"
    >
      <span
        className="text-sm font-semibold animate-pulse text-[var(--holo-text-muted)]"
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
      <AdminNav
        subtitle="Avatar Crop Studio"
        backLabel="← Talent page"
        onBack={() => router.push("/admin")}
        meta={c.talent?.name ?? "Loading…"}
        onLogout={c.handleLogout}
      />

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
                  disabled={c.generationBusy !== null}
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
                    opacity: c.generationBusy !== null ? 0.6 : 1,
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
            disabled={c.unsavedCount === 0 || c.saving || c.generationBusy !== null}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              border: "1.5px solid var(--holo-border)",
              background: "var(--holo-off-white)",
              color: "var(--holo-text-muted)",
              fontFamily: '"Baloo 2", sans-serif',
              fontWeight: 700,
              fontSize: 13,
              cursor: c.unsavedCount === 0 || c.saving || c.generationBusy !== null ? "not-allowed" : "pointer",
              opacity: c.unsavedCount === 0 || c.saving || c.generationBusy !== null ? 0.5 : 1,
            }}
          >
            ↺ Reset
          </button>
          <button
            type="button"
            onClick={c.handleSave}
            disabled={c.unsavedCount === 0 || c.saving || c.generationBusy !== null}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, var(--holo-blue), var(--holo-blue-dark))",
              color: "#fff",
              fontFamily: '"Baloo 2", sans-serif',
              fontWeight: 800,
              fontSize: 14,
              cursor: c.unsavedCount === 0 || c.saving || c.generationBusy !== null ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(0,119,163,0.25)",
              opacity: c.unsavedCount === 0 || c.saving || c.generationBusy !== null ? 0.6 : 1,
            }}
          >
            {c.saving ? "Saving…" : `💾 Save (${c.unsavedCount})`}
          </button>
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
          <div style={{ flex: "1 1 260px" }}>
            <div style={{ fontWeight: 800, color: "var(--holo-text)" }}>AI crop generation</div>
            <div style={{ fontSize: 12, color: "var(--holo-text-muted)" }}>
              Choose whether to preview or save generated crops. Previews use colored difficulty outlines.
            </div>
          </div>
          <label style={choiceLabelStyle()}>
            <input
              type="checkbox"
              checked={c.generationDryRun}
              onChange={(e) => c.setGenerationDryRun(e.target.checked)}
              disabled={c.generationBusy !== null}
            />
            Dry run
          </label>
          <label style={choiceLabelStyle()}>
            <input
              type="checkbox"
              checked={c.generationOverwrite}
              onChange={(e) => c.setGenerationOverwrite(e.target.checked)}
              disabled={c.generationBusy !== null}
            />
            Overwrite existing
          </label>
          <button
            type="button"
            onClick={c.handleGeneratePreview}
            disabled={!c.talent || !c.loadedAreas || c.generationBusy !== null}
            style={actionButtonStyle(!c.loadedAreas || c.generationBusy !== null)}
          >
            {c.generationBusy === "single"
              ? (c.generationDryRun ? "Generating preview…" : "Generating and saving…")
              : (c.generationDryRun ? "Generate preview" : "Generate and save")}
          </button>
          {c.generatedPreview && c.generatedPreview.talent_id === c.talent?.id && (
            <button
              type="button"
              onClick={c.handleCommitGenerated}
              disabled={c.generationBusy !== null || ((c.loadedAreas?.length ?? c.savedCount) > 0 && !c.generationOverwrite)}
              style={primaryActionStyle(c.generationBusy !== null || ((c.loadedAreas?.length ?? c.savedCount) > 0 && !c.generationOverwrite))}
            >
              Save generated crops
            </button>
          )}
          <span style={{ flexBasis: "100%", borderTop: "1px solid var(--holo-border)" }} />
          <div style={{ flex: "1 1 260px" }}>
            <div style={{ fontWeight: 800, color: "var(--holo-text)" }}>Bulk repair</div>
            <div style={{ fontSize: 12, color: "var(--holo-text-muted)" }}>
              Find invalid talents and review per-talent results before committing.
            </div>
          </div>
          <button
            type="button"
            onClick={c.handleGenerateMissingPreview}
            disabled={c.generationBusy !== null}
            style={actionButtonStyle(c.generationBusy !== null)}
          >
            {c.generationBusy === "batch" ? "Processing batch…" : "Generate missing previews"}
          </button>
          {c.batchSummary && !c.batchCommitted && (
            <button
              type="button"
              onClick={c.handleCommitMissing}
              disabled={c.generationBusy !== null}
              style={primaryActionStyle(c.generationBusy !== null)}
            >
              Commit batch
            </button>
          )}
        </div>

        {c.generatedPreview && (
          <div
            className="holo-card"
            style={{ padding: "0.85rem 1.1rem", marginBottom: "1.25rem", fontSize: 13 }}
          >
            <strong>{c.talent?.name}: {c.generatedPreview.total_generated} preview areas</strong>
            <span style={{ marginLeft: 12, color: "#b91c1c", fontWeight: 700 }}>
              Hard {c.generatedPreview.areas.filter((a) => a.difficulty === "hard").length}
            </span>
            <span style={{ marginLeft: 10, color: "#a16207", fontWeight: 700 }}>
              Medium {c.generatedPreview.areas.filter((a) => a.difficulty === "medium").length}
            </span>
            <span style={{ marginLeft: 10, color: "#15803d", fontWeight: 700 }}>
              Easy {c.generatedPreview.areas.filter((a) => a.difficulty === "easy").length}
            </span>
            <button
              type="button"
              onClick={() => c.setGeneratedPreview(null)}
              style={{ float: "right", border: 0, background: "transparent", color: "var(--holo-text-muted)", cursor: "pointer", fontWeight: 700 }}
            >
              Dismiss
            </button>
          </div>
        )}

        {c.batchSummary && (
          <section className="holo-card" style={{ padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1.25rem", alignItems: "center" }}>
              <strong style={{ color: "var(--holo-text)" }}>{c.batchCommitted ? "Committed batch results" : "Batch preview results"}</strong>
              <span>Processed {c.batchSummary.processed}</span>
              <span style={{ color: "#15803d", fontWeight: 700 }}>Succeeded {c.batchSummary.succeeded}</span>
              <span style={{ color: c.batchSummary.failed ? "#b91c1c" : "var(--holo-text-muted)", fontWeight: 700 }}>Failed {c.batchSummary.failed}</span>
              <span style={{ flex: 1 }} />
              <button
                type="button"
                onClick={() => c.setBatchSummary(null)}
                style={{ border: 0, background: "transparent", color: "var(--holo-text-muted)", cursor: "pointer", fontWeight: 700 }}
              >
                Dismiss results
              </button>
            </div>
            {c.batchSummary.details.length > 0 && (
              <div style={{ maxHeight: 240, overflowY: "auto", marginTop: 10, borderTop: "1px solid var(--holo-border)" }}>
                {c.batchSummary.details.map((item) => (
                  <div
                    key={item.talent_id}
                    style={{ display: "flex", gap: 12, padding: "7px 2px", borderBottom: "1px solid var(--holo-border)", fontSize: 13 }}
                  >
                    <strong style={{ flex: 1 }}>{item.talent_name || item.talent_id}</strong>
                    <span style={{ color: item.success ? "#15803d" : "#b91c1c", fontWeight: 700 }}>
                      {item.success ? `${item.areas_count} areas` : item.error || "Failed"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

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
                  generatedPreview={c.generatedPreview?.areas ?? []}
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

      {c.singleConfirmation && (
        <Modal
          onClose={() => {
            if (c.generationBusy === null) c.setSingleConfirmation(null);
          }}
          label="Confirm generated crop save"
        >
          <div className="holo-card" style={{ padding: "1.5rem", fontFamily: '"Baloo 2", sans-serif' }}>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "var(--holo-text)" }}>
              {c.singleConfirmation.action === "generate-and-save" ? "Generate and save crops?" : "Save generated crops?"}
            </h2>
            <p style={{ margin: "0.65rem 0 1rem", color: "var(--holo-text-muted)", fontSize: 14, lineHeight: 1.5 }}>
              {c.singleConfirmation.action === "generate-and-save"
                ? `Generate crop areas for ${c.singleConfirmation.talentName} and save them now.`
                : `Generate and save ${c.singleConfirmation.generatedCount} crop areas for ${c.singleConfirmation.talentName}.`}
            </p>
            <div style={{ display: "grid", gap: 6, marginBottom: "1rem", fontSize: 13, color: "var(--holo-text)" }}>
              <span>Overwrite existing crops: <strong>{c.singleConfirmation.overwrite ? "Yes" : "No"}</strong></span>
              {c.singleConfirmation.existingCount > 0 && (
                <span>Existing saved crops: <strong>{c.singleConfirmation.existingCount}</strong></span>
              )}
              {c.singleConfirmation.unsavedCount > 0 && (
                <span style={{ color: "#a16207", fontWeight: 700 }}>
                  This will discard {c.singleConfirmation.unsavedCount} unsaved manual edit{c.singleConfirmation.unsavedCount === 1 ? "" : "s"}.
                </span>
              )}
              {c.singleConfirmation.existingCount > 0 && c.singleConfirmation.overwrite && (
                <span style={{ color: "#b91c1c", fontWeight: 700 }}>Replacing saved crops cannot be undone.</span>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => c.setSingleConfirmation(null)}
                disabled={c.generationBusy !== null}
                style={secondaryModalButtonStyle(c.generationBusy !== null)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={c.handleConfirmSingleGeneration}
                disabled={c.generationBusy !== null}
                style={primaryModalButtonStyle(c.generationBusy !== null)}
              >
                {c.generationBusy === "single" ? "Saving…" : "Confirm and save"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {c.batchConfirmationOpen && c.batchSummary && (
        <Modal
          onClose={() => {
            if (c.generationBusy === null) c.setBatchConfirmationOpen(false);
          }}
          label="Confirm batch crop generation"
        >
          <div className="holo-card" style={{ padding: "1.5rem", fontFamily: '"Baloo 2", sans-serif' }}>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "var(--holo-text)" }}>
              Generate and save missing crops?
            </h2>
            <p style={{ margin: "0.65rem 0 1rem", color: "var(--holo-text-muted)", fontSize: 14, lineHeight: 1.5 }}>
              The batch will process invalid talents and replace incomplete crop sets.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1rem", fontSize: 13 }}>
              <span>Previewed: <strong>{c.batchSummary.processed}</strong></span>
              <span style={{ color: "#15803d" }}>Succeeded: <strong>{c.batchSummary.succeeded}</strong></span>
              <span style={{ color: c.batchSummary.failed ? "#b91c1c" : "var(--holo-text-muted)" }}>
                Failed: <strong>{c.batchSummary.failed}</strong>
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => c.setBatchConfirmationOpen(false)}
                disabled={c.generationBusy !== null}
                style={secondaryModalButtonStyle(c.generationBusy !== null)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={c.handleConfirmBatchGeneration}
                disabled={c.generationBusy !== null}
                style={primaryModalButtonStyle(c.generationBusy !== null)}
              >
                {c.generationBusy === "batch" ? "Processing…" : "Confirm and generate"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {c.toast && <AdminToast message={c.toast.msg} type={c.toast.type} />}
    </div>
  );
}

function actionButtonStyle(disabled: boolean): CSSProperties {
  return {
    padding: "9px 16px",
    borderRadius: 10,
    border: "1.5px solid var(--holo-border)",
    background: "var(--holo-bg-card)",
    color: "var(--holo-text)",
    fontFamily: '"Baloo 2", sans-serif',
    fontWeight: 800,
    fontSize: 13,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
  };
}

function choiceLabelStyle(): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    color: "var(--holo-text)",
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
  };
}

function primaryActionStyle(disabled: boolean): CSSProperties {
  return {
    ...actionButtonStyle(disabled),
    border: "none",
    background: "linear-gradient(135deg, var(--holo-blue), var(--holo-blue-dark))",
    color: "#fff",
  };
}

function secondaryModalButtonStyle(disabled: boolean): CSSProperties {
  return {
    padding: "9px 16px",
    borderRadius: 10,
    border: "1.5px solid var(--holo-border)",
    background: "var(--holo-off-white)",
    color: "var(--holo-text-muted)",
    fontFamily: '"Baloo 2", sans-serif',
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
  };
}

function primaryModalButtonStyle(disabled: boolean): CSSProperties {
  return {
    ...secondaryModalButtonStyle(disabled),
    border: "none",
    background: "linear-gradient(135deg, var(--holo-blue), var(--holo-blue-dark))",
    color: "#fff",
  };
}

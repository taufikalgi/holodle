"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/errors";
import { fetchTalentList } from "@/lib/queries";
import {
  createArea,
  deleteArea,
  fetchAreas,
  generateCrops,
  generateMissingCrops,
  updateArea,
  type BatchGenerationSummary,
  type CropGenerationResult,
  type CropArea,
  type CropBox,
  type Difficulty,
  type EditableArea,
  type Talent,
} from "@/lib/avatar-crops";

let keySeq = 0;
const nextKey = () => `area-${++keySeq}-${Date.now() % 100000}`;

type SingleGenerationConfirmation = {
  action: "generate-and-save" | "save-preview";
  talentId: string;
  talentName: string;
  overwrite: boolean;
  existingCount: number;
  unsavedCount: number;
  generatedCount?: number;
};

export function useAvatarCropAdmin() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialId = searchParams.get("talentId");
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [talentsLoading, setTalentsLoading] = useState(true);

  const talent: Talent | undefined =
    talents.find((t) => t.id === selectedId) ?? talents[0];

  const selectTalent = useCallback((id: string) => {
    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("talentId", id);
    router.replace(`/admin/avatar-crops?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const [loadedAreas, setLoadedAreas] = useState<CropArea[] | null>(null);
  const [areas, setAreas] = useState<EditableArea[]>([]);
  const [deleted, setDeleted] = useState<CropArea[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState<EditableArea | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [generatedPreview, setGeneratedPreview] = useState<CropGenerationResult | null>(null);
  const [generationDryRun, setGenerationDryRun] = useState(true);
  const [generationOverwrite, setGenerationOverwrite] = useState(false);
  const [singleConfirmation, setSingleConfirmation] = useState<SingleGenerationConfirmation | null>(null);
  const [batchSummary, setBatchSummary] = useState<BatchGenerationSummary | null>(null);
  const [batchCommitted, setBatchCommitted] = useState(false);
  const [batchConfirmationOpen, setBatchConfirmationOpen] = useState(false);
  const [generationBusy, setGenerationBusy] = useState<"single" | "batch" | null>(null);
  const singleGenerationInFlight = useRef(false);
  const handledSingleConfirmation = useRef<SingleGenerationConfirmation | null>(null);

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
      setTalents(await fetchTalentList());
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        router.replace("/admin/login");
        return;
      }
      showToast(e instanceof Error ? e.message : "Failed to load talents", "err");
    } finally {
      setTalentsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  useEffect(() => {
    if (talents.length > 0 && (!selectedId || !talents.some((t) => t.id === selectedId))) {
      selectTalent(talents[0].id);
    }
  }, [talents, selectedId, selectTalent]);

  useEffect(() => {
    setGeneratedPreview(null);
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

  const reportGenerationError = (error: unknown, fallback: string) => {
    if (error instanceof ApiError && error.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (error instanceof ApiError && error.status === 403) {
      showToast("Admin access is required to generate crop areas.", "err");
      return;
    }
    if (error instanceof ApiError && error.status === 429) {
      const retry = error.retryAfter ? ` Retry after ${error.retryAfter}.` : " Please try again later.";
      showToast(`Generation was rate limited.${retry}`, "err");
      return;
    }
    console.error("Crop generation failed", error);
    if (error instanceof TypeError && /failed to fetch|networkerror|load failed/i.test(error.message)) {
      showToast(
        "The browser could not read the generation response. Check that the API's FRONTEND_URL exactly matches this site's origin (for local: http://localhost:3000, with no trailing slash or path), and check proxy timeouts. The server may still have completed the request; reload saved crops before retrying a save.",
        "err"
      );
      return;
    }
    showToast(error instanceof Error ? error.message : fallback, "err");
  };

  const executeSingleGeneration = async (talentId: string, dryRun: boolean, overwrite: boolean) => {
    // State updates disable the button on the next render; this ref closes the
    // gap where two click events can enter the handler before that render.
    if (singleGenerationInFlight.current) return;
    singleGenerationInFlight.current = true;
    setGenerationBusy("single");
    try {
      const result = await generateCrops(talentId, { dryRun, overwrite });
      if (result.dry_run) {
        setGeneratedPreview(result);
        showToast(`Preview generated: ${result.total_generated} crop areas.`);
      } else {
        setGeneratedPreview(null);
        await loadAreas(talentId);
        showToast(`Saved ${result.total_generated} generated crop areas.`);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        if (!dryRun) await loadAreas(talentId);
        showToast(
          "Crop areas already exist for this talent. Enable Overwrite to replace them.",
          "err"
        );
        return;
      }
      if (
        !dryRun &&
        error instanceof TypeError &&
        /failed to fetch|networkerror|load failed/i.test(error.message)
      ) {
        await loadAreas(talentId);
        showToast("The save response was lost. Saved crops were reloaded; check them before retrying.", "err");
        return;
      }
      reportGenerationError(error, dryRun ? "Could not generate crop preview." : "Could not save generated crop areas.");
    } finally {
      singleGenerationInFlight.current = false;
      setGenerationBusy(null);
    }
  };

  const handleGeneratePreview = async () => {
    if (!talent || generationBusy) return;
    const existingCount = loadedAreas?.length ?? savedCount;
    if (!generationDryRun && existingCount > 0 && !generationOverwrite) {
      showToast("Turn on overwrite to replace the existing saved crop areas.", "err");
      return;
    }
    if (!generationDryRun) {
      setSingleConfirmation({
        action: "generate-and-save",
        talentId: talent.id,
        talentName: talent.name,
        overwrite: generationOverwrite,
        existingCount,
        unsavedCount,
      });
      return;
    }
    await executeSingleGeneration(talent.id, true, generationOverwrite);
  };

  const handleCommitGenerated = async () => {
    if (!talent || !generatedPreview || generatedPreview.talent_id !== talent.id || generationBusy) return;
    const overwrite = generationOverwrite;
    const existingSavedCount = loadedAreas?.length ?? savedCount;
    if (existingSavedCount > 0 && !overwrite) {
      showToast("Turn on overwrite to replace the existing saved crop areas.", "err");
      return;
    }
    setSingleConfirmation({
      action: "save-preview",
      talentId: talent.id,
      talentName: talent.name,
      overwrite,
      existingCount: existingSavedCount,
      unsavedCount,
      generatedCount: generatedPreview.total_generated,
    });
  };

  const handleConfirmSingleGeneration = async () => {
    const confirmation = singleConfirmation;
    if (
      !confirmation ||
      generationBusy ||
      singleGenerationInFlight.current ||
      handledSingleConfirmation.current === confirmation
    ) return;
    // Consume this specific confirmation synchronously. A duplicate event can
    // still hold the old callback after React has started updating the modal.
    handledSingleConfirmation.current = confirmation;
    setSingleConfirmation(null);
    await executeSingleGeneration(confirmation.talentId, false, confirmation.overwrite);
  };

  const handleGenerateMissingPreview = async () => {
    if (generationBusy) return;
    setGenerationBusy("batch");
    try {
      const result = await generateMissingCrops(true, AbortSignal.timeout(5 * 60 * 1000));
      setBatchSummary(result);
      setBatchCommitted(false);
      showToast(`Batch preview complete: ${result.succeeded} succeeded, ${result.failed} failed.`);
    } catch (error) {
      reportGenerationError(error, "Could not generate missing crop previews.");
    } finally {
      setGenerationBusy(null);
    }
  };

  const handleCommitMissing = async () => {
    if (!batchSummary || generationBusy) return;
    setBatchConfirmationOpen(true);
  };

  const handleConfirmBatchGeneration = async () => {
    if (!batchSummary || generationBusy) return;
    setBatchConfirmationOpen(false);
    setGenerationBusy("batch");
    try {
      const result = await generateMissingCrops(false, AbortSignal.timeout(5 * 60 * 1000));
      setBatchSummary(result);
      setBatchCommitted(true);
      if (talent) await loadAreas(talent.id);
      showToast(`Batch generation complete: ${result.succeeded} succeeded, ${result.failed} failed.`);
    } catch (error) {
      reportGenerationError(error, "Could not save generated crops.");
    } finally {
      setGenerationBusy(null);
    }
  };

  return {
    user,
    authLoading,
    talent,
    talents,
    talentsLoading,
    selectedId,
    areas,
    deleted,
    loadedAreas,
    selectedKey,
    setSelectedKey,
    natural,
    setNatural,
    saving,
    review,
    setReview,
    toast,
    generatedPreview,
    batchSummary,
    batchCommitted,
    batchConfirmationOpen,
    generationBusy,
    generationDryRun,
    generationOverwrite,
    singleConfirmation,
    unsavedCount,
    savedCount,
    addArea,
    editArea,
    setAreaDifficulty,
    removeArea,
    handleSave,
    handleReset,
    handleGeneratePreview,
    handleCommitGenerated,
    handleConfirmSingleGeneration,
    setSingleConfirmation,
    handleGenerateMissingPreview,
    handleCommitMissing,
    handleConfirmBatchGeneration,
    setGeneratedPreview,
    setBatchSummary,
    setBatchConfirmationOpen,
    setGenerationDryRun,
    setGenerationOverwrite,
    handleLogout,
    fetchTalents,
    setSelectedId: selectTalent,
  };
}

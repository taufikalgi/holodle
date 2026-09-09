"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/errors";
import { fetchTalentList } from "@/lib/queries";
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
    unsavedCount,
    savedCount,
    addArea,
    editArea,
    setAreaDifficulty,
    removeArea,
    handleSave,
    handleReset,
    handleLogout,
    fetchTalents,
    setSelectedId,
  };
}

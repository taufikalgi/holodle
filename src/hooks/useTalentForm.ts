"use client";

import { useState } from "react";
import type { AdminTalent as Talent, TalentFormData } from "@/lib/talents";
import { saveTalent } from "@/lib/commands";

const EMPTY: TalentFormData = {
  name: "",
  branch: "",
  debut_year: null,
  lore_archetype: "",
  height: null,
  birth_month: "",
  image_url: "",
  avatar_url: "",
  alt_names: [],
};

export function useTalentForm({
  mode,
  initial,
  onSaved,
  onClose,
}: {
  mode: "create" | "edit";
  initial?: Talent | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<TalentFormData>(initial ? { ...initial } : { ...EMPTY });
  const [altInput, setAltInput] = useState(initial?.alt_names?.join(", ") ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      await saveTalent(mode, payload);
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return { form, set, altInput, setAltInput, error, loading, handleSubmit };
}

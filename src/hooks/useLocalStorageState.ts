"use client";

import { useState, useEffect, useRef } from "react";

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  validate?: (data: unknown) => data is T
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as T;
        if (!validate || validate(parsed)) return parsed;
      }
    } catch {}
    return defaultValue;
  });

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

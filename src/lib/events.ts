/**
 * Tiny typed event bus over window CustomEvents (~20 lines).
 * Use for cross-component domain facts; local state stays local.
 */

export interface AppEventMap {
  "holodle:auth-change": void;
  "holodle:game-over": { mode: "classic" | "avatar"; won: boolean; date: string };
}

export function emitAppEvent<K extends keyof AppEventMap>(
  type: K,
  detail: AppEventMap[K]
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(type, { detail }));
}

export function onAppEvent<K extends keyof AppEventMap>(
  type: K,
  handler: (detail: AppEventMap[K]) => void
): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<AppEventMap[K]>).detail);
  window.addEventListener(type, listener);
  return () => window.removeEventListener(type, listener);
}

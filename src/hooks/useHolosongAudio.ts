"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Progress {
  value: number;
  clip: number;
}

const VOLUME_STORAGE_KEY = "holosong-clip-volume";

function readSavedVolume(): number {
  if (typeof window === "undefined") return 1;
  const raw = window.localStorage.getItem(VOLUME_STORAGE_KEY);
  if (raw === null) return 1;
  const saved = Number(raw);
  return Number.isFinite(saved) && saved >= 0 && saved <= 1 ? saved : 1;
}

export function useHolosongAudio(
  previewUrl: string | undefined,
  clipSeconds: number
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState<Progress>({ value: 0, clip: 0 });
  const [volume, setVolumeState] = useState(readSavedVolume);
  const [error, setError] = useState("");

  const stopProgress = useCallback(() => {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const setVolume = useCallback((value: number) => {
    const next = Math.min(Math.max(value, 0), 1);
    setVolumeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, String(next));
    }
  }, []);

  useEffect(() => {
    if (!previewUrl || typeof window === "undefined") return;

    const audio = new Audio(previewUrl);
    audio.preload = "auto";
    audioRef.current = audio;
    const onEnded = () => setPlaying(false);
    audio.addEventListener("ended", onEnded);

    return () => {
      stopProgress();
      audio.pause();
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [previewUrl, stopProgress]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume, previewUrl]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const clip = Math.max(clipSeconds, 0.05);
    stopProgress();
    setError("");
    setProgress({ value: 0, clip });
    audio.pause();
    audio.currentTime = 0;

    void audio
      .play()
      .then(() => {
        setPlaying(true);
        progressTimerRef.current = window.setInterval(() => {
          if (audio.currentTime >= clip) {
            audio.pause();
            setPlaying(false);
            setProgress({ value: 1, clip });
            stopProgress();
            return;
          }
          setProgress({
            value: Math.min(audio.currentTime / clip, 1),
            clip,
          });
        }, 50);
      })
      .catch(() => {
        setPlaying(false);
        setProgress({ value: 0, clip });
        setError(
          "Audio unavailable in this browser. Reload the session and try again."
        );
      });
  }, [clipSeconds, stopProgress]);

  return {
    play,
    playing,
    error,
    volume,
    setVolume,
    progress: progress.clip === clipSeconds ? progress.value : 0,
  };
}

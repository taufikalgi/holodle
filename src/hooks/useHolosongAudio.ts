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
  clipStartMS: number,
  clipSeconds: number
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState<Progress>({ value: 0, clip: 0 });
  const [volume, setVolumeState] = useState(readSavedVolume);
  const [error, setError] = useState("");

  const start = Math.max(clipStartMS, 0) / 1000;
  const clip = Math.max(clipSeconds, 0.05);
  const end = start + clip;

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

    const alignToStart = () => {
      if (audio.currentTime < start || audio.currentTime >= end) {
        audio.currentTime = start;
      }
    };
    const onEnded = () => setPlaying(false);

    audio.addEventListener("loadedmetadata", alignToStart);
    audio.addEventListener("ended", onEnded);

    return () => {
      stopProgress();
      audio.pause();
      audio.removeEventListener("loadedmetadata", alignToStart);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [previewUrl, start, end, stopProgress]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume, previewUrl]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    stopProgress();
    setError("");

    if (audio.currentTime < start || audio.currentTime >= end - 0.001) {
      audio.currentTime = start;
      setProgress({ value: 0, clip });
    } else {
      setProgress({
        value: Math.min((audio.currentTime - start) / clip, 1),
        clip,
      });
    }

    void audio
      .play()
      .then(() => {
        setPlaying(true);
        progressTimerRef.current = window.setInterval(() => {
          if (audio.currentTime >= end) {
            audio.pause();
            setPlaying(false);
            setProgress({ value: 1, clip });
            stopProgress();
            return;
          }
          setProgress({
            value: Math.min((audio.currentTime - start) / clip, 1),
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
  }, [clip, start, end, stopProgress]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    stopProgress();
    setPlaying(false);
    setProgress({
      value: Math.min(Math.max((audio.currentTime - start) / clip, 0), 1),
      clip,
    });
  }, [clip, start, stopProgress]);

  return {
    play,
    pause,
    playing,
    error,
    volume,
    setVolume,
    progress: progress.clip === clipSeconds ? progress.value : 0,
  };
}

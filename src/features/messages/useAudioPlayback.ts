import { useEffect, useRef, useState } from "react";

type UseAudioPlaybackInput = {
  audioUrl: string;
  fallbackDurationMs: number;
};

export function useAudioPlayback({
  audioUrl,
  fallbackDurationMs,
}: UseAudioPlaybackInput) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(fallbackDurationMs);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTimeMs(0);
    setDurationMs(fallbackDurationMs);
  }, [audioUrl, fallbackDurationMs]);

  async function togglePlayback() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
      return;
    }

    audio.pause();
    setIsPlaying(false);
  }

  function handleLoadedMetadata() {
    const audio = audioRef.current;

    if (!audio || Number.isNaN(audio.duration)) {
      return;
    }

    setDurationMs(audio.duration * 1000);
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    setCurrentTimeMs(audio.currentTime * 1000);
  }

  function handleEnded() {
    setIsPlaying(false);
    setCurrentTimeMs(0);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }

  const progress =
    durationMs > 0 ? Math.min(currentTimeMs / durationMs, 1) : 0;

  return {
    audioRef,
    isPlaying,
    currentTimeMs,
    durationMs,
    progress,
    togglePlayback,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleEnded,
  };
}
import { useEffect, useReducer, useRef } from "react";

type PlaybackState = {
  isPlaying: boolean;
  currentTimeMs: number;
  durationMs: number;
};

type PlaybackAction =
  | { type: "reset"; durationMs: number }
  | { type: "play" }
  | { type: "pause" }
  | { type: "time"; currentTimeMs: number }
  | { type: "duration"; durationMs: number }
  | { type: "ended" };

function playbackReducer(
  state: PlaybackState,
  action: PlaybackAction
): PlaybackState {
  switch (action.type) {
    case "reset":
      return {
        isPlaying: false,
        currentTimeMs: 0,
        durationMs: action.durationMs,
      };

    case "play":
      return {
        ...state,
        isPlaying: true,
      };

    case "pause":
      return {
        ...state,
        isPlaying: false,
      };

    case "time":
      return {
        ...state,
        currentTimeMs: action.currentTimeMs,
      };

    case "duration":
      return {
        ...state,
        durationMs: action.durationMs,
      };

    case "ended":
      return {
        ...state,
        isPlaying: false,
        currentTimeMs: 0,
      };

    default:
      return state;
  }
}

type UseAudioPlaybackInput = {
  audioUrl: string;
  fallbackDurationMs: number;
};

export function useAudioPlayback({
  audioUrl,
  fallbackDurationMs,
}: UseAudioPlaybackInput) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [state, dispatch] = useReducer(playbackReducer, {
    isPlaying: false,
    currentTimeMs: 0,
    durationMs: fallbackDurationMs,
  });

  useEffect(() => {
    dispatch({
      type: "reset",
      durationMs: fallbackDurationMs,
    });
  }, [audioUrl, fallbackDurationMs]);

  async function togglePlayback() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      await audio.play();
      dispatch({ type: "play" });
      return;
    }

    audio.pause();
    dispatch({ type: "pause" });
  }

  function handleLoadedMetadata() {
    const audio = audioRef.current;

    if (!audio || Number.isNaN(audio.duration)) {
      return;
    }

    dispatch({
      type: "duration",
      durationMs: audio.duration * 1000,
    });
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    dispatch({
      type: "time",
      currentTimeMs: audio.currentTime * 1000,
    });
  }

  function handleEnded() {
    dispatch({ type: "ended" });

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }

  const progress =
    state.durationMs > 0
      ? Math.min(state.currentTimeMs / state.durationMs, 1)
      : 0;

  return {
    audioRef,
    isPlaying: state.isPlaying,
    currentTimeMs: state.currentTimeMs,
    durationMs: state.durationMs,
    progress,
    togglePlayback,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleEnded,
  };
}
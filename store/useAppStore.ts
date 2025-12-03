import { create } from "zustand";
import { AppStatus, TrackData, Note, ProcessingState } from "../types";

interface AppState {
  status: AppStatus;
  processingState: ProcessingState;
  trackData: TrackData | null;
  audioUrl: string | null; // URL of the uploaded audio file
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number; // Playback speed multiplier (0.5x, 1.0x, etc.)
  viewMode: "split" | "3d" | "tab";

  // Actions
  setStatus: (status: AppStatus) => void;
  setProcessingState: (state: ProcessingState) => void;
  setTrackData: (data: TrackData) => void;
  setAudioUrl: (url: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  setViewMode: (mode: "split" | "3d" | "tab") => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  status: AppStatus.IDLE,
  processingState: { progress: 0, stage: "" },
  trackData: null,
  audioUrl: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  playbackRate: 1.0,
  viewMode: "split",

  setStatus: (status) => set({ status }),
  setProcessingState: (state) => set({ processingState: state }),
  setTrackData: (data) => set({ trackData: data, duration: data.duration }),
  setAudioUrl: (url) => set({ audioUrl: url }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setViewMode: (mode) => set({ viewMode: mode }),
  reset: () =>
    set({
      status: AppStatus.IDLE,
      trackData: null,
      audioUrl: null,
      isPlaying: false,
      currentTime: 0,
      processingState: { progress: 0, stage: "" },
    }),
}));

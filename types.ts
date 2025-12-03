export interface Note {
  id: string;
  time: number; // Start time in seconds
  duration: number; // Duration in seconds
  string: number; // 0 = E, 1 = A, 2 = D, 3 = G
  fret: number; // 0-24
  velocity: number; // 0-1
  pitch?: number; // MIDI pitch
}

export interface TrackData {
  title: string;
  artist: string;
  bpm: number;
  duration: number;
  notes: Note[];
  audioUrl?: string; // URL to the uploaded/processed audio
}

export enum AppStatus {
  IDLE = "IDLE",
  UPLOADING = "UPLOADING",
  SEPARATING = "SEPARATING", // Demucs running
  TRANSCRIBING = "TRANSCRIBING", // Pitch detection running
  READY = "READY",
  ERROR = "ERROR",
}

export interface ProcessingState {
  progress: number; // 0-100
  stage: string; // Human readable stage description
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  volume: number;
}

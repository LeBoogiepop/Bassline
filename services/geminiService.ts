import { TrackData, AppStatus, Note } from "../types";

/**
 * SIMULATION SERVICE
 *
 * In the real architecture, this file calls your Python/FastAPI backend.
 * For this prototype, we simulate the latency and stages of:
 * 1. Upload
 * 2. Demucs (Separation)
 * 3. Basic Pitch (Transcription)
 */

type ProgressCallback = (
  progress: number,
  stage: string,
  status: AppStatus,
) => void;

export const uploadAndTranscribe = async (
  file: File,
  onProgress: ProgressCallback,
): Promise<TrackData> => {
  // 1. UPLOAD SIMULATION
  onProgress(10, "Uploading audio file...", AppStatus.UPLOADING);
  await delay(1500);

  // 2. SEPARATION SIMULATION (Demucs)
  onProgress(30, "Isolating bass track (Demucs)...", AppStatus.SEPARATING);
  await delay(2000);
  onProgress(50, "Removing drums and vocals...", AppStatus.SEPARATING);
  await delay(2000);

  // 3. TRANSCRIPTION SIMULATION (Basic Pitch)
  onProgress(70, "Detecting pitch and timing...", AppStatus.TRANSCRIBING);
  await delay(1500);
  onProgress(85, "Calculating optimal fingering...", AppStatus.TRANSCRIBING);
  await delay(1000);
  onProgress(100, "Finalizing...", AppStatus.READY);

  // 4. RETURN MOCK DATA (This structure matches what your Python backend will return)
  return {
    title: file.name.replace(/\.[^/.]+$/, ""),
    artist: "Unknown Artist",
    bpm: 120, // Real backend would detect this
    duration: 15.0, // Should match audio file
    notes: generateMockRealBassline(),
  };
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Helper to generate a realistic looking bassline for the demo
// In production, this comes from `basic-pitch` output -> `fret_mapping_algo`
const generateMockRealBassline = (): Note[] => {
  const notes: Note[] = [];
  const baseTime = 0.5;

  // A simple funk groove pattern
  for (let i = 0; i < 16; i++) {
    const t = baseTime + i * 0.8;

    // Root note
    notes.push({
      id: `n-${i}-1`,
      time: t,
      duration: 0.4,
      string: 1, // A string
      fret: 5, // D note
      velocity: 0.9,
    });

    // Octave pop (slap bass style)
    if (i % 2 === 0) {
      notes.push({
        id: `n-${i}-2`,
        time: t + 0.4,
        duration: 0.2,
        string: 3, // G string
        fret: 7, // D octave
        velocity: 1.0,
      });
    }
  }
  return notes;
};

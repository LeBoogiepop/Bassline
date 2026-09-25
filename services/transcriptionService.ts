import { TrackData, AppStatus, Note } from "../types";

/**
 * DSP TRANSCRIPTION SERVICE
 *
 * Calls the local Python backend (Demucs + Basic Pitch).
 * Replaces the previous Gemini AI implementation.
 */

type ProgressCallback = (
  progress: number,
  stage: string,
  status: AppStatus,
) => void;

const BACKEND_URL = "http://localhost:5000";

export const uploadAndTranscribe = async (
  file: File,
  difficulty: string,
  onProgress: ProgressCallback,
): Promise<TrackData> => {
  console.log("=== TRANSCRIPTION START (DSP) ===");
  console.log(
    `File: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Difficulty: ${difficulty}`,
  );

  // 1. UPLOAD
  onProgress(10, "Uploading to DSP Backend...", AppStatus.UPLOADING);

  const formData = new FormData();
  formData.append("audio", file);
  formData.append("difficulty", difficulty);

  try {
    // Start Job
    const startResponse = await fetch(`${BACKEND_URL}/transcribe`, {
      method: "POST",
      body: formData,
    });

    if (!startResponse.ok) {
      const err = await startResponse
        .json()
        .catch(() => ({ error: "Unknown backend error" }));
      throw new Error(
        err.error || `Backend error: ${startResponse.statusText}`,
      );
    }

    const { job_id } = await startResponse.json();
    console.log(`Job started: ${job_id}`);

    // 2. POLL FOR COMPLETION
    onProgress(
      20,
      "Processing (Demucs + Basic Pitch)...",
      AppStatus.SEPARATING,
    );

    let attempts = 0;
    const maxAttempts = 3600; // Background processing may take up to one hour

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1000)); // Wait 1s
      attempts++;

      const statusResponse = await fetch(`${BACKEND_URL}/jobs/${job_id}`);
      if (statusResponse.status === 503) {
        throw new Error("Transcription queue is temporarily unavailable");
      }
      if (!statusResponse.ok) continue;

      const jobData = await statusResponse.json();
      console.log(`Job status: ${jobData.status} (${jobData.progress}%)`);

      if (jobData.status === "failed") {
        throw new Error(jobData.error || "Transcription job failed");
      }

      if (jobData.status === "completed") {
        // Job done!
        onProgress(90, "Finalizing...", AppStatus.TRANSCRIBING);

        const rawNotes: Note[] = jobData.result.notes.map(
          (n: any, i: number) => ({
            id: `note-${i}`,
            time: n.time,
            duration: n.duration,
            string: n.string, // 0-3
            fret: n.fret,
            velocity: n.velocity || 0.8,
            pitch: n.pitch,
          }),
        );

        // === AGGRESSIVE FILTERING ===
        // 1. Duration Filter: Remove notes < 0.12s (120ms)
        // This removes transient noise and fret clicks
        let cleanedNotes = rawNotes.filter((n) => n.duration >= 0.12);

        // 2. Debounce / Overlap Filter
        // Sort by time first to ensure linear processing
        cleanedNotes.sort((a, b) => a.time - b.time);

        const notes: Note[] = [];
        const lastNoteByString: Record<number, Note> = {};

        cleanedNotes.forEach((note) => {
          const lastNote = lastNoteByString[note.string];

          if (lastNote) {
            const timeDiff = note.time - lastNote.time;
            // If two notes on same string start within 50ms
            if (timeDiff < 0.05) {
              // Keep the one with longer duration
              if (note.duration > lastNote.duration) {
                // Remove last note from final array (it was the shorter/wrong one)
                notes.pop();
                notes.push(note);
                lastNoteByString[note.string] = note;
              }
              // Else ignore current note (it's the shorter/wrong one)
              return;
            }
          }

          notes.push(note);
          lastNoteByString[note.string] = note;
        });

        console.log(`Filtered notes: ${rawNotes.length} -> ${notes.length}`);

        onProgress(100, "Ready", AppStatus.READY);

        // Get duration and create audio URL for playback
        const duration = await getAudioDuration(file);
        const audioUrl = URL.createObjectURL(file);

        return {
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Bassline (DSP)",
          bpm: 120,
          duration: duration,
          notes: notes,
          audioUrl: audioUrl, // Add the audio URL for playback
        };
      }

      // Update progress based on backend status
      // Map backend progress (0-100) to UI progress (20-90)
      if (jobData.progress) {
        const uiProgress = 20 + jobData.progress * 0.7;
        onProgress(
          Math.round(uiProgress),
          `Processing... ${jobData.progress}%`,
          AppStatus.SEPARATING,
        );
      }
    }

    throw new Error("Transcription timed out");
  } catch (e: any) {
    console.error("Transcription failed:", e);
    throw e;
  }
};

// Helper to get actual duration from the file
const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const audio = document.createElement("audio");
    audio.src = objectUrl;
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      URL.revokeObjectURL(objectUrl);
    };
    audio.onerror = () => {
      resolve(180.0); // Fallback 3 mins
      URL.revokeObjectURL(objectUrl);
    };
  });
};

import React, { useRef, useState } from "react";
import {
  Upload,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileAudio,
  HelpCircle,
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { uploadAndTranscribe } from "../../services/transcriptionService";
import { AppStatus } from "../../types";
import { useSmoothProgress } from "../../hooks/useSmoothProgress";

import { SettingsToggles } from "../UI/SettingsToggles";
import { useSettings } from "../../context/SettingsContext";
import { LoadingFacts } from "../UI/LoadingFacts";
import { HelpModal } from "../UI/HelpModal";

export const Sidebar: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    setTrackData,
    setStatus,
    setProcessingState,
    status,
    processingState,
    trackData,
    setAudioUrl,
  } = useAppStore();
  const { t } = useSettings();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [difficulty, setDifficulty] = useState("beginner");

  const isProcessing =
    status === AppStatus.UPLOADING ||
    status === AppStatus.SEPARATING ||
    status === AppStatus.TRANSCRIBING;
  const smoothProgress = useSmoothProgress(
    processingState.progress,
    isProcessing,
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous state
    setStatus(AppStatus.UPLOADING);
    setProcessingState({ progress: 0, stage: "Initializing upload..." });

    try {
      // In a real app, this sends the file to Python Backend
      const data = await uploadAndTranscribe(
        file,
        difficulty,
        (progress, stage, status) => {
          setProcessingState({ progress, stage });
          setStatus(status);
        },
      );

      setTrackData(data);
      setAudioUrl(data.audioUrl || null); // Store the audio URL for playback
      setStatus(AppStatus.READY);

      // Play success sound
      const audio = new Audio("/success_sound.mp3");
      audio.volume = 0.5;
      audio.play().catch((e) => console.warn("Audio play failed", e));
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      setProcessingState({ progress: 0, stage: "Error processing file" });
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-80 bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-white/10 flex flex-col h-full shrink-0 transition-colors duration-300">
      <div className="p-6">
        <div className="w-full flex justify-start">
          <img
            src="/icon.png"
            alt="Bassline"
            className="w-40 h-auto object-contain"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          v0.2.0 • Audio Transcription
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8">
        {/* Section: Upload */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            {t("nav_new")}
          </h2>

          {/* Difficulty Selector */}
          <div className="mb-4">
            <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1.5 ml-1">
              {t("difficulty_label")}
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-gray-50 dark:bg-dark-950 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              disabled={
                status === AppStatus.UPLOADING ||
                status === AppStatus.SEPARATING ||
                status === AppStatus.TRANSCRIBING
              }
            >
              <option value="beginner">{t("diff_beginner")}</option>
              <option value="intermediate">{t("diff_intermediate")}</option>
              <option value="pro">{t("diff_pro")}</option>
            </select>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="audio/mp3,audio/wav,audio/mpeg"
            className="hidden"
          />

          <div
            onClick={
              status !== AppStatus.UPLOADING &&
              status !== AppStatus.SEPARATING &&
              status !== AppStatus.TRANSCRIBING
                ? triggerUpload
                : undefined
            }
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all group relative overflow-hidden
                  ${
                    status === AppStatus.IDLE || status === AppStatus.READY
                      ? "border-gray-300 dark:border-white/10 hover:border-brand-500/50 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                      : "border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-dark-950 cursor-not-allowed opacity-80"
                  }`}
          >
            {status === AppStatus.IDLE ||
            status === AppStatus.READY ||
            status === AppStatus.ERROR ? (
              <>
                <Upload
                  size={24}
                  className="text-gray-400 dark:text-gray-500 group-hover:text-brand-400 mb-2 transition-colors"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("nav_upload")}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-600 mt-1">
                  Max 10MB • Bass Isolation
                </p>
              </>
            ) : (
              <>
                <div className="z-10 flex flex-col items-center">
                  <LoadingFacts />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section: Progress / Status */}
        {status !== AppStatus.IDLE && (
          <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4 border border-gray-200 dark:border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {status === AppStatus.ERROR
                  ? "Processing Failed"
                  : status === AppStatus.READY
                    ? t("status_ready")
                    : t("status_processing")}
              </span>
            </div>

            {/* Steps Breakdown */}
            <div className="mt-4 space-y-2">
              <StepItem
                label="Upload Audio"
                state={getStepState(status, AppStatus.UPLOADING)}
              />
              <StepItem
                label="Isolate Bass (Demucs)"
                state={getStepState(status, AppStatus.SEPARATING)}
              />
              <StepItem
                label="Pitch Detection"
                state={getStepState(status, AppStatus.TRANSCRIBING)}
              />
            </div>

            {status === AppStatus.ERROR && (
              <div className="mt-3 flex items-start gap-2 bg-red-500/10 p-2 rounded text-red-600 dark:text-red-400 text-xs">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <p>Processing failed. Check backend console for details.</p>
              </div>
            )}
          </div>
        )}

        {/* Section: File Info */}
        {trackData && status === AppStatus.READY && (
          <div>
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {t("track_title")}
            </h2>
            <div className="bg-gray-50 dark:bg-dark-950 rounded-lg p-3 border border-gray-200 dark:border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded flex items-center justify-center text-brand-600 dark:text-brand-500">
                <FileAudio size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm text-gray-900 dark:text-white truncate font-medium">
                  {trackData.title}
                </p>
                <p className="text-xs text-gray-500">
                  {trackData.duration.toFixed(1)}s • {trackData.notes.length}{" "}
                  {t("notes_count")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-dark-950 flex flex-col gap-4 transition-colors duration-300">
        <SettingsToggles onHelpClick={() => setIsHelpOpen(true)} />

        <div className="flex items-center gap-3">
          <img
            src="/profile.jpg"
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-white/10"
          />
          <div>
            <p className="text-sm text-gray-900 dark:text-white font-medium">
              Maxime Lacombe
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              {t("role_student")}
            </p>
            <a
              href="https://github.com/LeBoogiepop"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mt-0.5 group"
            >
              <GithubIcon size={12} />
              <span className="group-hover:underline">{t("profile_view")}</span>
            </a>
          </div>
        </div>
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

const getStepState = (
  currentStatus: AppStatus,
  stepStatus: AppStatus,
): "waiting" | "active" | "done" => {
  const order = [
    AppStatus.IDLE,
    AppStatus.UPLOADING,
    AppStatus.SEPARATING,
    AppStatus.TRANSCRIBING,
    AppStatus.READY,
  ];
  const currentIdx = order.indexOf(currentStatus);
  const stepIdx = order.indexOf(stepStatus);

  if (currentStatus === AppStatus.ERROR) return "waiting";
  if (currentIdx > stepIdx) return "done";
  if (currentIdx === stepIdx) return "active";
  return "waiting";
};

const StepItem: React.FC<{
  label: string;
  state: "waiting" | "active" | "done";
}> = ({ label, state }) => {
  return (
    <div
      className={`flex items-center gap-2 text-xs transition-colors ${
        state === "done"
          ? "text-green-400"
          : state === "active"
            ? "text-brand-400"
            : "text-gray-600"
      }`}
    >
      {state === "done" ? (
        <CheckCircle2 size={12} />
      ) : state === "active" ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <div className="w-3 h-3 rounded-full border border-gray-700" />
      )}
      {label}
    </div>
  );
};

const GithubIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    height={size}
    viewBox="0 0 16 16"
    version="1.1"
    width={size}
    aria-hidden="true"
    fill="currentColor"
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
  </svg>
);

import React, { useEffect, useRef } from "react";
import { Play, Pause, SkipBack, Volume2 } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { useSettings } from "../../context/SettingsContext";

export const Controls: React.FC = () => {
  const { t } = useSettings();
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    trackData,
    volume,
    setVolume,
    playbackRate,
    setPlaybackRate,
    audioUrl,
  } = useAppStore();

  const rafRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }

    const audio = audioRef.current;

    // Set the audio source when audioUrl changes
    if (audioUrl) {
      audio.src = audioUrl;
      audio.load();
    }

    return () => {
      // Cleanup on unmount
      audio.pause();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Sync playback rate with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Playback Loop - simplified to sync with audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && audioUrl) {
      // Play the audio
      audio.play().catch((err) => {
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      });

      // Sync timeline with audio currentTime
      const syncLoop = () => {
        if (!audio.paused && !audio.ended) {
          setCurrentTime(audio.currentTime);
          rafRef.current = requestAnimationFrame(syncLoop);
        } else if (audio.ended) {
          setIsPlaying(false);
          setCurrentTime(0);
          audio.currentTime = 0;
        }
      };

      rafRef.current = requestAnimationFrame(syncLoop);
    } else {
      // Pause the audio
      audio.pause();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, audioUrl, setCurrentTime, setIsPlaying]);

  const togglePlay = () => {
    if (!trackData) return;
    setIsPlaying(!isPlaying);
  };

  const formatTime = (t: number) => {
    const val = Math.max(0, t || 0);
    const mins = Math.floor(val / 60);
    const secs = Math.floor(val % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  return (
    <div className="bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-white/10 p-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-col gap-2">
        {/* Progress Bar */}
        <div className="flex items-center gap-3 text-xs font-mono text-gray-400 dark:text-gray-400">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 1} // Ensure max is at least 1 to avoid range errors
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            disabled={!trackData}
            className="flex-1 h-1.5 bg-gray-200 dark:bg-dark-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-brand-500 [&::-webkit-slider-thumb]:rounded-full transition-all hover:[&::-webkit-slider-thumb]:bg-brand-400"
          />
          <span className="w-10">{formatTime(duration)}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setCurrentTime(0);
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                }
              }}
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              disabled={!trackData}
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={togglePlay}
              disabled={!trackData}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                !trackData
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/50 hover:scale-105 active:scale-95"
              }`}
            >
              {isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" className="ml-1" />
              )}
            </button>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {trackData?.title || t("no_track_title")}
            </h3>
            <p className="text-xs text-gray-500">
              {trackData ? trackData.artist : t("no_track_subtitle")}
            </p>
          </div>

          {/* Playback Speed Controls */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">
              {t("speed")}
            </span>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
              {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackRate(speed)}
                  disabled={!trackData}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    playbackRate === speed
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-dark-700"
                  } ${!trackData ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 w-32 group">
            <Volume2
              size={16}
              className="text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 dark:bg-dark-800 rounded-lg cursor-pointer accent-brand-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

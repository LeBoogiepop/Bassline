import React, { useEffect, useRef, useState, useMemo } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Note } from "../../types";
import { useSettings } from "../../context/SettingsContext";

export const Tablature: React.FC = () => {
  const { t } = useSettings();
  const {
    trackData,
    currentTime,
    isPlaying,
    setCurrentTime,
    viewMode,
    setViewMode,
  } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const STRINGS = ["G", "D", "A", "E"];
  const PX_PER_SECOND = 150;
  const TAB_SYNC_FIX = 0.05; // Reduced offset for tighter sync
  const VISUAL_PADDING = 0.15; // Tolerance for keeping note active

  // Pro Studio Colors: E=Orange, A=Gold, D=Steel Blue, G=Teal
  const STRING_COLORS = ["#D35400", "#F1C40F", "#5DADE2", "#1ABC9C"];
  const TEXT_COLORS = ["#FFFFFF", "#000000", "#000000", "#000000"]; // Contrast text

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Filter and sort notes to prevent overlaps
  const visibleNotes = useMemo(() => {
    if (!trackData) return [];

    // 1. Sort by time
    const sortedNotes = [...trackData.notes].sort((a, b) => a.time - b.time);

    // 2. Filter overlaps (Debounce)
    const filteredNotes: Note[] = [];
    const lastNoteByString: Record<number, Note> = {};

    sortedNotes.forEach((note) => {
      const lastNote = lastNoteByString[note.string];

      // If there's a previous note on this string
      if (lastNote) {
        const timeDiff = note.time - lastNote.time;
        // If overlap is less than 50ms (0.05s)
        if (timeDiff < 0.05) {
          // Keep the one with longer duration
          if (note.duration > lastNote.duration) {
            // Replace the last note with this one
            filteredNotes.pop(); // Remove last added
            filteredNotes.push(note);
            lastNoteByString[note.string] = note;
          }
          // Else ignore this short glitch note
          return;
        }
      }

      filteredNotes.push(note);
      lastNoteByString[note.string] = note;
    });

    return filteredNotes;
  }, [trackData]);

  // Click to seek logic
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const centerPixel = containerWidth / 2;

    // Calculate new time:
    const offsetPixels = clickX - centerPixel;
    const timeDelta = offsetPixels / PX_PER_SECOND;

    const newTime = currentTime + timeDelta;
    setCurrentTime(Math.max(0, newTime));
  };

  const toggleView = () => {
    setViewMode(viewMode === "tab" ? "split" : "tab");
  };

  if (!trackData) {
    return (
      <div className="h-56 w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-dark-950/50 text-gray-500 border-b border-gray-200 dark:border-white/5">
        <p className="font-mono text-sm">{t("overlay_upload_hint")}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-gray-100 dark:bg-dark-950 border-b border-gray-200 dark:border-white/10 h-full">
      <div className="flex-1 w-full relative group overflow-hidden">
        <div className="absolute top-2 left-4 z-20 bg-white/80 dark:bg-dark-900/80 px-2 py-1 rounded text-xs text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900/30 backdrop-blur-sm">
          {t("tab_interactive")}
        </div>

        <button
          onClick={toggleView}
          className="absolute top-2 right-4 z-20 p-1.5 bg-white/80 dark:bg-dark-900/80 rounded text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 border border-gray-200 dark:border-white/10 backdrop-blur-sm transition-colors"
          title={viewMode === "tab" ? "Minimize Tab" : "Maximize Tab"}
        >
          {viewMode === "tab" ? (
            <Minimize2 size={14} />
          ) : (
            <Maximize2 size={14} />
          )}
        </button>

        {/* Playhead Cursor - ALWAYS FIXED AT CENTER */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none shadow-[0_0_10px_rgba(239,68,68,0.8)]"
          style={{ left: "50%" }}
        >
          <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 transform rotate-45" />
        </div>

        {/* Track Container Wrapper (Handles clicks) */}
        <div
          ref={containerRef}
          onClick={handleSeek}
          className="flex-1 relative w-full h-full cursor-pointer"
        >
          {/* Moving Track Layer */}
          <div
            className="relative h-full flex transition-transform duration-75 ease-linear will-change-transform"
            style={{
              // Padding left 50% ensures t=0 starts at the center
              paddingLeft: "50%",
              // Translate left based on current time
              transform: `translateX(-${currentTime * PX_PER_SECOND}px)`,
              // Ensure width accommodates the track duration
              width: `calc(50% + ${trackData.duration * PX_PER_SECOND}px)`,
            }}
          >
            {/* Note Area */}
            <div
              className="relative h-full"
              style={{
                width: `${trackData.duration * PX_PER_SECOND}px`,
                flexShrink: 0,
              }}
            >
              {/* Background Grid / Beats */}
              {Array.from({ length: Math.ceil(trackData.duration) }).map(
                (_, sec) => (
                  <div
                    key={`sec-${sec}`}
                    className="absolute top-0 bottom-0 border-l border-gray-300 dark:border-gray-800/30 pointer-events-none"
                    style={{ left: `${sec * PX_PER_SECOND}px` }}
                  >
                    <span className="absolute bottom-2 left-1 text-[10px] text-gray-500 dark:text-gray-700 font-mono">
                      {sec}s
                    </span>
                  </div>
                ),
              )}

              {/* Centered Staff Container */}
              {(() => {
                const isFullscreen = viewMode === "tab";
                const LINE_SPACING = isFullscreen ? 80 : 30;
                const BASE_OFFSET = isFullscreen ? 0 : 20;
                const STAFF_CONTAINER_HEIGHT =
                  BASE_OFFSET * 2 + LINE_SPACING * 3;

                return (
                  <div
                    className="absolute top-1/2 left-0 w-full -translate-y-1/2 transition-all duration-500 ease-in-out"
                    style={{ height: `${STAFF_CONTAINER_HEIGHT}px` }}
                  >
                    {/* Staff Lines (Neutral) */}
                    {STRINGS.map((s, i) => {
                      const stringIdx = 3 - i; // Map visual index to data index (0=E, 3=G)
                      const color = STRING_COLORS[stringIdx];
                      return (
                        <div
                          key={s}
                          className="absolute w-full flex items-center border-b border-gray-300 dark:border-slate-800 transition-all duration-500"
                          style={{
                            top: `${i * LINE_SPACING + BASE_OFFSET}px`,
                            opacity: 0.6,
                          }}
                        >
                          <span
                            className={`sticky left-2 font-mono w-4 bg-gray-100/80 dark:bg-dark-950/80 backdrop-blur z-10 transition-all duration-500 ${isFullscreen ? "text-xl" : "text-[10px]"}`}
                            style={{ color: color }}
                          >
                            {s}
                          </span>
                        </div>
                      );
                    })}

                    {/* Notes */}
                    {visibleNotes.map((note) => {
                      const isPast =
                        currentTime >
                        note.time + note.duration + VISUAL_PADDING;
                      const isActive =
                        currentTime >= note.time &&
                        currentTime <=
                          note.time + note.duration + VISUAL_PADDING;

                      const stringColor = STRING_COLORS[note.string];
                      const textColor = TEXT_COLORS[note.string];

                      const NOTE_HEIGHT = isFullscreen ? 40 : 24;
                      const FONT_SIZE = isFullscreen ? "text-xl" : "text-xs";

                      return (
                        <div
                          key={note.id}
                          className={`absolute rounded-full flex items-center justify-center font-bold border-2 transition-all duration-500 ${
                            isActive
                              ? "z-20 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                              : isPast
                                ? "opacity-50 grayscale-[0.5]"
                                : "opacity-100"
                          } ${FONT_SIZE}`}
                          style={{
                            // Apply Sync Offset here
                            left: `${(note.time + TAB_SYNC_FIX) * PX_PER_SECOND}px`,
                            width: `${Math.max(NOTE_HEIGHT, note.duration * PX_PER_SECOND)}px`, // Min width
                            height: `${NOTE_HEIGHT}px`,
                            top: `${(3 - note.string) * LINE_SPACING + BASE_OFFSET - NOTE_HEIGHT / 2}px`, // Centered on line
                            backgroundColor: stringColor,
                            borderColor: isActive ? "#FFFFFF" : "#000000",
                            color: textColor,
                          }}
                        >
                          {note.fret}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Legend / Helper Text */}
      <div className="w-full bg-gray-200 dark:bg-dark-900/50 py-1 px-4 flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400 border-t border-gray-300 dark:border-white/5 font-mono">
        <div className="flex gap-4">
          <span>
            <strong className="text-gray-900 dark:text-white">0</strong> = Open
            String
          </span>
          <span>
            <strong className="text-gray-900 dark:text-white">1-24</strong> =
            Fret Number
          </span>
        </div>
        <div className="flex gap-2">
          <span style={{ color: STRING_COLORS[3] }}>G</span>
          <span style={{ color: STRING_COLORS[2] }}>D</span>
          <span style={{ color: STRING_COLORS[1] }}>A</span>
          <span style={{ color: STRING_COLORS[0] }}>E</span>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Sidebar } from "./components/Layout/Sidebar";
import { Scene } from "./components/3D/Scene";
import { Controls } from "./components/UI/Controls";
import { Tablature } from "./components/UI/Tablature";
import { SettingsProvider } from "./context/SettingsContext";
import { useAppStore } from "./store/useAppStore";

function App() {
  const { viewMode } = useAppStore();

  return (
    <SettingsProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-black overflow-hidden font-sans text-gray-900 dark:text-gray-200 transition-colors duration-300">
        {/* Sidebar - Fixed Width */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative h-full min-w-0 overflow-hidden">
          {/* Top: 3D Visualization */}
          <div
            className={`relative bg-dark-900 shadow-inner min-h-0 w-full transition-[height] duration-500 ease-in-out
            ${viewMode === "tab" ? "h-[0%] overflow-hidden" : "h-[50%]"}`}
          >
            <div className="absolute inset-0">
              <Scene />
            </div>
          </div>

          {/* Bottom: Tablature & Controls */}
          <div
            className={`z-10 w-full flex flex-col transition-[height] duration-500 ease-in-out
            ${viewMode === "tab" ? "h-[100%]" : "h-[50%]"}`}
          >
            <div className="flex-1 relative min-h-0">
              <Tablature />
            </div>
            <div className="z-20 w-full shrink-0">
              <Controls />
            </div>
          </div>
        </div>
      </div>
    </SettingsProvider>
  );
}

export default App;

import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  ContactShadows,
} from "@react-three/drei";
import { BassModel } from "./BassModel";
import { BassLoader } from "./BassLoader";
import { useAppStore } from "../../store/useAppStore";
import { AppStatus } from "../../types";
import { useSettings } from "../../context/SettingsContext";

export const Scene: React.FC = () => {
  const { status, processingState } = useAppStore();
  const { t } = useSettings();
  const isProcessing =
    status === AppStatus.UPLOADING ||
    status === AppStatus.SEPARATING ||
    status === AppStatus.TRANSCRIBING;

  // Manage Loader Visibility
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isProcessing) {
      setShowLoader(true);
    }
  }, [isProcessing]);

  const handleLoaderTransitionEnd = () => {
    setShowLoader(false);
  };

  return (
    <div className="w-full h-full bg-dark-900 relative group">
      <Canvas shadows gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={35} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          makeDefault
          target={[0, 0, 0]}
        />

        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 10]} intensity={1.2} castShadow />
        <spotLight
          position={[-5, 5, 5]}
          intensity={1}
          color="#ffffff"
          angle={0.5}
        />

        <Suspense fallback={null}>
          {/* Real Model - Always rendered (revealed when loader fades out) */}
          <BassModel
            position={[0, 0, 1]}
            rotation={[1.4, -1.0, 0]}
            scale={0.15}
            visible={!isProcessing} // Hide during processing to avoid Z-fighting/clutter, reveal when processing done (loader fades out)
          />

          {/* Hologram Loader - Overlay */}
          {showLoader && (
            <BassLoader
              isLoading={isProcessing}
              realProgress={processingState.progress}
              onTransitionEnd={handleLoaderTransitionEnd}
              position={[0, 0, 1]}
              rotation={[1.4, -1.0, 0]}
              scale={0.15}
            />
          )}

          <Environment preset="studio" />
        </Suspense>

        <ContactShadows
          position={[0, -2.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />
      </Canvas>

      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 text-xs text-white/60">
          <p>{t("controls_help")}</p>
        </div>
      </div>
    </div>
  );
};

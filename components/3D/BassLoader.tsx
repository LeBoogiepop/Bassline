import React, { useState, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { useSmoothProgress } from "../../hooks/useSmoothProgress";

interface BassLoaderProps {
  isLoading: boolean;
  realProgress?: number;
  onTransitionEnd?: () => void; // Callback when the loader has finished its exit animation
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

export function BassLoader({
  isLoading,
  realProgress = 0,
  onTransitionEnd,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: BassLoaderProps) {
  const { scene } = useGLTF("/bass_guitar_white.glb");
  const progress = useSmoothProgress(realProgress, isLoading);
  const [isComplete, setIsComplete] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  // Trigger completion state when progress hits 100
  useEffect(() => {
    if (progress >= 100 && !isComplete) {
      setIsComplete(true);
      // Wait a bit for the transition effect then call callback
      setTimeout(() => {
        if (onTransitionEnd) onTransitionEnd();
      }, 1000);
    }
  }, [progress, isComplete, onTransitionEnd]);

  // 2. Visuals - Clone Scene & Prepare Materials
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    // Traverse and setup materials for Hologram effect
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        // Save original material for potential restoration (if we were swapping)
        // But here we will just manipulate the material directly since it's a clone
        const originalMat = mesh.material as THREE.MeshStandardMaterial;

        // Clone material to avoid side-effects on shared cache
        mesh.material = originalMat.clone();
        const mat = mesh.material as THREE.MeshStandardMaterial;

        // Initial Hologram State
        mat.transparent = true;
        mat.opacity = 0; // Start invisible, fade in
        mat.wireframe = true;
        mat.color.set("#00f3ff"); // Cyan Neon
        mat.emissive.set("#00f3ff");
        mat.emissiveIntensity = 2;
        mat.roughness = 0.2;
        mat.metalness = 0.8;
      }
    });
    return clone;
  }, [scene]);

  // 3. Animation Loop (Hologram Pulse & Transition)
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Hologram Pulse Effect
    const pulse = Math.sin(time * 3) * 0.5 + 0.5; // 0 to 1

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;

        if (!isComplete) {
          // Loading State: Wireframe Pulse
          mat.wireframe = true;
          mat.opacity = THREE.MathUtils.lerp(
            mat.opacity,
            0.3 + pulse * 0.2,
            0.05,
          );
          mat.emissiveIntensity = 1 + pulse * 1.5;
          mat.color.set("#00f3ff");
        } else {
          // Success State: Transition to "Solid" (or fade out)
          // Since we are transitioning TO the real model (which is separate),
          // we might want to fade this loader OUT or make it look solid then disappear.
          // Let's make it flash bright white then fade out.

          mat.wireframe = false; // Switch to solid for a moment?
          mat.color.lerp(new THREE.Color("#ffffff"), 0.1);
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, 0.05); // Fade out
        }
      }
    });
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Float only while loading */}
      <Float
        speed={isComplete ? 0 : 2}
        rotationIntensity={isComplete ? 0 : 1}
        floatIntensity={isComplete ? 0 : 1}
      >
        <primitive object={clonedScene} ref={groupRef} />
      </Float>

      {/* Progress Text - Holographic Style */}
      <Html position={[0, 2, 0]} center transform sprite>
        <div
          className={`transition-opacity duration-500 ${isComplete ? "opacity-0" : "opacity-100"}`}
        >
          <div className="flex flex-col items-center justify-center pointer-events-none select-none">
            <div className="text-4xl font-bold text-cyan-400 font-mono tracking-widest drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]">
              {Math.round(progress)}%
            </div>
            <div className="text-xs text-cyan-200 uppercase tracking-[0.2em] mt-1 animate-pulse">
              {isLoading ? "Processing Audio Data" : "Initialization Complete"}
            </div>
            {/* Loading Bar */}
            <div className="w-32 h-1 bg-cyan-900/50 mt-2 rounded-full overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-cyan-400 shadow-[0_0_10px_#00f3ff]"
                style={{
                  width: `${progress}%`,
                  transition: "width 0.1s linear",
                }}
              />
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

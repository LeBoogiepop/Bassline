import React, { useMemo } from "react";
import { Text } from "@react-three/drei";
import { useAppStore } from "../../store/useAppStore";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      boxGeometry: any;
      cylinderGeometry: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      boxGeometry: any;
      cylinderGeometry: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
    }
  }
}

// Constants for Bass Geometry
const SCALE_LENGTH = 34;
const TOTAL_FRETS = 24;
const STRINGS = 4;
const NECK_WIDTH_NUT = 1.4;
const NECK_WIDTH_HEEL = 2.4;
const NECK_LENGTH = 22;
const STRING_GAUGES = [0.045, 0.035, 0.025, 0.015];
const STRING_COLORS = ["#a1a1aa", "#a1a1aa", "#a1a1aa", "#a1a1aa"];

// --- Sub-Components for Realistic Parts ---

const Headstock: React.FC = () => {
  return (
    <group position={[0, 0, 1.8]}>
      {/* Main Headstock Shape */}
      <mesh position={[0.5, -0.2, 2]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[2.5, 0.4, 4.5]} />
        <meshStandardMaterial color="#3f271e" roughness={0.6} />
      </mesh>

      {/* Tuners (Cylinders) */}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[0.5, 0, 1 + i * 0.8]}>
          {/* Post */}
          <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.6]} />
            <meshStandardMaterial
              color="silver"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          {/* Key/Paddle */}
          <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI / 2, Math.PI / 2]}>
            <boxGeometry args={[0.8, 0.1, 0.6]} />
            <meshStandardMaterial
              color="silver"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const BassBody: React.FC = () => {
  // Jazz Bass style asymmetrical body approximation using primitives
  return (
    <group position={[0, -0.3, -NECK_LENGTH + 2]}>
      {/* Main Center Block */}
      <mesh position={[0, 0, -2]}>
        <boxGeometry args={[4, 1.2, 8]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.3} />
      </mesh>

      {/* Upper Horn */}
      <mesh position={[-2.5, 0, -3]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[1.5, 1.5, 1.2, 32]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.3} />
      </mesh>

      {/* Lower Horn */}
      <mesh position={[2.5, 0, -1]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[1.2, 1.2, 1.2, 32]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.3} />
      </mesh>

      {/* Bottom Curve */}
      <mesh position={[0, 0, -6]}>
        <cylinderGeometry args={[3, 3, 1.2, 32]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.3} />
      </mesh>

      {/* Pickups */}
      <mesh position={[0, 0.61, -1]}>
        <boxGeometry args={[3.2, 0.1, 0.6]} />
        <meshStandardMaterial color="black" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.61, -3]}>
        <boxGeometry args={[3.4, 0.1, 0.6]} />
        <meshStandardMaterial color="black" roughness={0.8} />
      </mesh>

      {/* Bridge */}
      <mesh position={[0, 0.65, -5]}>
        <boxGeometry args={[3, 0.2, 1.5]} />
        <meshStandardMaterial color="silver" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Volume Knobs */}
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[1.5 + k * 0.8, 0.65, -5]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.3]} />
          <meshStandardMaterial color="silver" metalness={1} />
        </mesh>
      ))}
    </group>
  );
};

// --- Main Component ---

export const BassNeck: React.FC = () => {
  const { trackData, currentTime } = useAppStore();

  // Calculate Fret Positions
  const fretPositions = useMemo(() => {
    const positions = [];
    for (let i = 1; i <= TOTAL_FRETS; i++) {
      // Simplified linear approximation for better visual spacing
      const pos = (i / TOTAL_FRETS) * NECK_LENGTH;
      positions.push(pos);
    }
    return positions;
  }, []);

  const getStringX = (index: number) => {
    const widthAtPos = NECK_WIDTH_NUT;
    const spacing = widthAtPos / (STRINGS - 1);
    return index * spacing - widthAtPos / 2;
  };

  // Fret Z calculation (Z=0 is nut, moves negative)
  const getFretZ = (fretIndex: number) => {
    if (fretIndex === 0) return 0.5; // Open string slightly above nut
    const pos = fretPositions[fretIndex - 1];
    return -pos;
  };

  return (
    <group rotation={[0, 0, 0]} position={[0, 0, 5]}>
      {/* 
          Main Group shifted Z+5 to center the neck/body in camera view 
          Neck grows towards negative Z.
      */}

      <BassBody />
      <Headstock />

      {/* --- NECK --- */}

      {/* Neck Wood */}
      <mesh position={[0, -0.2, -NECK_LENGTH / 2 + 0.5]} receiveShadow>
        <boxGeometry args={[NECK_WIDTH_HEEL, 0.3, NECK_LENGTH + 2]} />
        <meshStandardMaterial color="#3f271e" roughness={0.6} />
      </mesh>

      {/* Fretboard Wood */}
      <mesh position={[0, 0, -NECK_LENGTH / 2 + 0.5]}>
        <boxGeometry args={[NECK_WIDTH_HEEL, 0.1, NECK_LENGTH + 2]} />
        <meshStandardMaterial color="#271a15" roughness={0.8} />
      </mesh>

      {/* Frets (Metal Bars) */}
      {fretPositions.map((z, i) => (
        <mesh
          key={`fret-${i}`}
          position={[0, 0.06, -z]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.02, 0.02, NECK_WIDTH_HEEL, 16]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Nut */}
      <mesh position={[0, 0.1, 1]}>
        <boxGeometry args={[NECK_WIDTH_NUT, 0.15, 0.2]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>

      {/* Fret Markers (Dots) */}
      {[3, 5, 7, 9, 12, 15, 17, 19, 21, 24].map((fret) => (
        <group key={`dot-${fret}`}>
          <mesh
            position={[
              0,
              0.06,
              getFretZ(fret) + (getFretZ(fret - 1) - getFretZ(fret)) / 2,
            ]}
          >
            <cylinderGeometry args={[0.1, 0.1, 0.01, 16]} />
            <meshBasicMaterial color="#d4d4d8" />
          </mesh>
          {fret === 12 || fret === 24 ? (
            <mesh
              position={[
                0.4,
                0.06,
                getFretZ(fret) + (getFretZ(fret - 1) - getFretZ(fret)) / 2,
              ]}
            >
              <cylinderGeometry args={[0.1, 0.1, 0.01, 16]} />
              <meshBasicMaterial color="#d4d4d8" />
            </mesh>
          ) : null}
        </group>
      ))}

      {/* Strings */}
      {Array.from({ length: STRINGS }).map((_, i) => (
        <mesh
          key={`string-${i}`}
          position={[getStringX(i), 0.15, -NECK_LENGTH / 2 - 2]}
        >
          {/* Strings need to be longer to reach bridge/tuners */}
          <boxGeometry
            args={[
              STRING_GAUGES[i] * 3,
              STRING_GAUGES[i] * 3,
              NECK_LENGTH + 12,
            ]}
          />
          <meshStandardMaterial
            color={STRING_COLORS[i]}
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* ACTIVE NOTES VISUALIZATION */}
      {trackData?.notes.map((note) => {
        const isActive =
          currentTime >= note.time && currentTime < note.time + note.duration;
        const isAnticipated =
          currentTime >= note.time - 0.5 && currentTime < note.time;

        if (!isActive && !isAnticipated) return null;

        const x = getStringX(note.string);
        const z = getFretZ(note.fret);

        return (
          <group key={note.id} position={[x, 0.25, z]}>
            <mesh>
              <sphereGeometry args={[isActive ? 0.25 : 0.15, 32, 32]} />
              <meshStandardMaterial
                color={isActive ? "#0ea5e9" : "#ffffff"}
                emissive={isActive ? "#0ea5e9" : "#000000"}
                emissiveIntensity={isActive ? 3 : 0}
                transparent
                opacity={isActive ? 1 : 0.4}
              />
            </mesh>
            {isActive && (
              <Text
                position={[0, 0.5, 0]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#000000"
              >
                {note.fret}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
};

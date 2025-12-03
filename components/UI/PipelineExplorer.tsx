import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CloudUpload,
  Music,
  Activity,
  GitGraph,
  ArrowRight,
  X,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

const FrontendViz = () => (
  <div className="relative h-64 w-full bg-slate-900/50 rounded-xl border border-slate-700 flex items-center justify-around p-8 overflow-hidden">
    {/* WebGL Clock */}
    <div className="text-center z-10">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="w-20 h-20 rounded-full border-4 border-cyan-500 border-t-transparent mx-auto mb-2"
      />
      <div className="text-cyan-400 font-mono text-xs">WebGL Clock</div>
      <div className="text-slate-400 text-xs">60 FPS</div>
    </div>

    {/* Connection Line */}
    <div className="h-[2px] w-24 bg-slate-700 relative">
      <motion.div
        animate={{ x: [0, 96, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-[-4px] left-0 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"
      />
    </div>

    {/* AudioContext */}
    <div className="text-center z-10">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="w-20 h-20 rounded-full border-4 border-purple-500 flex items-center justify-center mx-auto mb-2 bg-purple-500/10"
      >
        <Activity className="w-8 h-8 text-purple-400" />
      </motion.div>
      <div className="text-purple-400 font-mono text-xs">AudioContext</div>
      <div className="text-slate-400 text-xs">48kHz</div>
    </div>

    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 px-4 py-2 rounded border border-green-500/30 text-green-400 text-xs font-mono">
      Delta Time: 0.00ms (LOCKED)
    </div>
  </div>
);

const BackendViz = () => (
  <div className="relative h-64 w-full bg-slate-900/50 rounded-xl border border-slate-700 flex flex-col items-center justify-center p-8">
    <div className="flex justify-between w-full max-w-md items-center mb-8">
      {/* Client */}
      <div className="text-center">
        <div className="w-16 h-12 bg-slate-700 rounded mb-2 mx-auto flex items-center justify-center border border-slate-500">
          Laptop
        </div>
        <span className="text-xs text-slate-400">Client</span>
      </div>

      {/* Pipe */}
      <div className="flex-1 h-2 bg-slate-800 mx-4 rounded relative overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-1/3 h-full bg-blue-500 blur-sm"
        />
      </div>

      {/* Server */}
      <div className="text-center">
        <div className="w-12 h-16 bg-slate-700 rounded mb-2 mx-auto flex items-center justify-center border border-slate-500 border-b-4">
          Srv
        </div>
        <span className="text-xs text-slate-400">Flask</span>
      </div>
    </div>

    {/* Status Boxes */}
    <div className="flex gap-4 w-full max-w-md">
      <div className="flex-1 bg-slate-800 p-3 rounded border border-slate-700">
        <div className="text-[10px] text-slate-500 uppercase mb-1">
          Queue (Redis)
        </div>
        <div className="flex gap-1">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-yellow-500"
          />
          <div className="w-2 h-2 rounded-full bg-slate-600" />
          <div className="w-2 h-2 rounded-full bg-slate-600" />
        </div>
      </div>
      <div className="flex-1 bg-slate-800 p-3 rounded border border-green-900/50 relative overflow-hidden">
        <div className="text-[10px] text-green-500 uppercase mb-1">
          GPU VRAM
        </div>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "85%" }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-1 bg-green-500 rounded"
        />
      </div>
    </div>
  </div>
);

const DemucsViz = () => (
  <div className="relative h-64 w-full bg-slate-900/50 rounded-xl border border-slate-700 flex flex-col items-center justify-center p-4">
    <div className="absolute top-4 right-4 flex gap-2 text-xs">
      <span className="flex items-center">
        <div className="w-2 h-2 bg-slate-500 rounded-full mr-1" /> Input Mix
      </span>
      <span className="flex items-center">
        <div className="w-2 h-2 bg-cyan-400 rounded-full mr-1" /> Bass Stem
      </span>
    </div>

    {/* Simulation d'ondes */}
    <div className="w-full h-32 flex items-center justify-center relative">
      {/* Onde grise (Bruit) */}
      <svg viewBox="0 0 100 20" className="absolute w-full h-full opacity-30">
        <path
          d="M0 10 Q 10 0, 20 10 T 40 10 T 60 10 T 80 10 T 100 10"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
        />
        <motion.path
          d="M0 10 Q 5 20, 10 10 T 20 10 T 30 10 T 40 10 T 50 10 T 60 10 T 70 10 T 80 10 T 90 10 T 100 10"
          animate={{
            d: "M0 10 Q 5 0, 10 10 T 20 10 T 30 10 T 40 10 T 50 10 T 60 10 T 70 10 T 80 10 T 90 10 T 100 10",
          }}
          transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
          fill="none"
          stroke="white"
          strokeWidth="0.5"
        />
      </svg>

      {/* Onde Cyan (Basse Pure) */}
      <svg viewBox="0 0 100 20" className="absolute w-full h-full">
        <motion.path
          d="M0 10 C 20 20, 40 0, 60 20 S 80 0, 100 10"
          animate={{
            d: [
              "M0 10 C 20 20, 40 0, 60 20 S 80 0, 100 10",
              "M0 10 C 20 0, 40 20, 60 0 S 80 20, 100 10",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1"
          filter="drop-shadow(0 0 5px cyan)"
        />
      </svg>
    </div>

    <div className="bg-slate-800 px-3 py-1 rounded-full text-xs text-cyan-400 mt-4 animate-pulse border border-cyan-900">
      Demucs Processing...
    </div>
  </div>
);

const BasicPitchViz = () => (
  <div className="relative h-64 w-full bg-slate-900/50 rounded-xl border border-slate-700 flex flex-col items-center justify-center p-8">
    <div className="w-full h-32 border-b border-slate-600 relative flex items-end mb-4">
      {/* Transient Spikes */}
      {[10, 30, 55, 70, 90].map((left, i) => (
        <motion.div
          key={i}
          initial={{ height: "10%" }}
          animate={{ height: ["10%", "80%", "10%"] }}
          transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
          className="absolute bottom-0 w-2 bg-pink-500 rounded-t shadow-[0_0_10px_magenta]"
          style={{ left: `${left}%` }}
        />
      ))}
      {/* Wave background */}
      <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent" />
    </div>

    <div className="flex justify-between w-full font-mono text-xs text-slate-400">
      <span>PITCH: E1</span>
      <span>VEL: 110</span>
      <span>DUR: 0.4s</span>
    </div>
  </div>
);

const AlgoViz = () => (
  <div className="relative h-64 w-full bg-slate-900/50 rounded-xl border border-slate-700 flex items-center justify-center p-6">
    <div className="grid grid-cols-3 gap-4 w-full">
      {/* Option A */}
      <div className="bg-slate-800 p-3 rounded border border-red-900/30 opacity-50">
        <div className="text-[10px] text-slate-500">Option A</div>
        <div className="text-sm font-bold text-slate-300">Corde 4 / Fret 5</div>
        <div className="text-xs text-red-400 mt-1">Coût: High (Stretch)</div>
      </div>

      {/* Option B (Winner) */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          borderColor: ["#064e3b", "#34d399", "#064e3b"],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="bg-slate-800 p-3 rounded border border-green-500 relative shadow-[0_0_20px_rgba(16,185,129,0.2)]"
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">
          BEST
        </div>
        <div className="text-[10px] text-green-400">Option B</div>
        <div className="text-sm font-bold text-white">Corde 3 / Fret 0</div>
        <div className="text-xs text-green-400 mt-1">Coût: Low (0.2)</div>
      </motion.div>

      {/* Option C */}
      <div className="bg-slate-800 p-3 rounded border border-red-900/30 opacity-50">
        <div className="text-[10px] text-slate-500">Option C</div>
        <div className="text-sm font-bold text-slate-300">
          Corde 2 / Fret 10
        </div>
        <div className="text-xs text-red-400 mt-1">Coût: High (Jump)</div>
      </div>
    </div>

    {/* Fake Fretboard Lines */}
    <div className="absolute bottom-6 w-3/4 h-12 flex flex-col justify-between opacity-30 z-[-1]">
      <div className="h-px bg-slate-400 w-full" />
      <div className="h-px bg-slate-400 w-full" />
      <div className="h-px bg-slate-400 w-full" />
      <div className="h-px bg-slate-400 w-full" />
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const PipelineExplorer = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const { t } = useSettings();

  const STEPS = [
    {
      id: 1,
      title: t("pipeline_step1_title"),
      desc: t("pipeline_step1_desc"),
      icon: Clock,
      color: "text-cyan-400",
    },
    {
      id: 2,
      title: t("pipeline_step2_title"),
      desc: t("pipeline_step2_desc"),
      icon: CloudUpload,
      color: "text-blue-400",
    },
    {
      id: 3,
      title: t("pipeline_step3_title"),
      desc: t("pipeline_step3_desc"),
      icon: Music,
      color: "text-purple-400",
    },
    {
      id: 4,
      title: t("pipeline_step4_title"),
      desc: t("pipeline_step4_desc"),
      icon: Activity,
      color: "text-pink-400",
    },
    {
      id: 5,
      title: t("pipeline_step5_title"),
      desc: t("pipeline_step5_desc"),
      icon: GitGraph,
      color: "text-green-400",
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0f1014] w-full max-w-5xl h-[600px] rounded-2xl border border-slate-800 shadow-2xl flex overflow-hidden"
      >
        {/* SIDEBAR (Steps) */}
        <div className="w-1/3 bg-[#18191c] border-r border-slate-800 flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-cyan-400" />
              {t("pipeline_title")}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {t("pipeline_subtitle")}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`w-full text-left p-4 rounded-xl transition-all border ${
                  activeStep === step.id
                    ? "bg-slate-800/50 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                    : "border-transparent hover:bg-slate-800/30 text-slate-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${activeStep === step.id ? "bg-slate-800" : "bg-slate-900"}`}
                  >
                    <step.icon
                      size={18}
                      className={
                        activeStep === step.id ? step.color : "text-slate-600"
                      }
                    />
                  </div>
                  <div>
                    <div
                      className={`text-sm font-bold ${activeStep === step.id ? "text-white" : "text-slate-400"}`}
                    >
                      {step.id}. {step.title.split("(")[0]}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col relative bg-[#0f1014]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white z-50"
          >
            <X size={24} />
          </button>

          <div className="flex-1 p-10 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Title Section */}
                <div>
                  <h3
                    className={`text-2xl font-bold mb-2 ${STEPS[activeStep - 1].color}`}
                  >
                    {STEPS[activeStep - 1].title}
                  </h3>
                  <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
                    {STEPS[activeStep - 1].desc}
                  </p>
                </div>

                {/* Visualization Container */}
                <div className="w-full">
                  {activeStep === 1 && <FrontendViz />}
                  {activeStep === 2 && <BackendViz />}
                  {activeStep === 3 && <DemucsViz />}
                  {activeStep === 4 && <BasicPitchViz />}
                  {activeStep === 5 && <AlgoViz />}
                </div>

                {/* Footer Hint */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-8">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  {t("pipeline_hint")}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation (Optional) */}
          <div className="p-6 border-t border-slate-900 flex justify-between items-center bg-[#0f1014]">
            <div className="flex gap-2">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`px-2 py-1 rounded text-[10px] font-mono border ${activeStep === step.id ? "border-cyan-900 text-cyan-400 bg-cyan-900/10" : "border-slate-800 text-slate-600"}`}
                >
                  {step.title.split("(")[1]?.replace(")", "") || "SYS"}
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveStep((prev) => (prev < 5 ? prev + 1 : 1))}
              className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Next Step <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PipelineExplorer;

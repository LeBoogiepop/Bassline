import React, { useEffect, useState } from "react";
import {
  X,
  ExternalLink,
  HelpCircle,
  Music,
  Layers,
  Zap,
  Activity,
} from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import PipelineExplorer from "./PipelineExplorer";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useSettings();
  const [view, setView] = React.useState<"user" | "tech">("user");
  const [showPipeline, setShowPipeline] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl bg-dark-900 border border-brand-500/30 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.15)] overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-brand-500/20 rounded-lg text-brand-400">
                <HelpCircle size={24} />
              </div>

              {/* View Toggle */}
              <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setView("user")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    view === "user"
                      ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t("tech_toggle_user")}
                </button>
                <button
                  onClick={() => setView("tech")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    view === "tech"
                      ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t("tech_toggle_dev")}
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
            {view === "user" ? (
              <>
                {/* User Guide Content */}
                <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-brand-500 pl-4">
                  {t("help_intro")}
                </p>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-brand-500/30 transition-colors group">
                    <div className="mb-3 text-brand-400 group-hover:scale-110 transition-transform duration-300">
                      <Music size={24} />
                    </div>
                    <h3 className="font-semibold text-white mb-2 text-sm">
                      {t("help_step1_title")}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {t("help_step1_desc")}
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-brand-500/30 transition-colors group">
                    <div className="mb-3 text-brand-400 group-hover:scale-110 transition-transform duration-300">
                      <Layers size={24} />
                    </div>
                    <h3 className="font-semibold text-white mb-2 text-sm">
                      {t("help_step2_title")}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {t("help_step2_desc")}
                    </p>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-brand-500/30 transition-colors group">
                    <div className="mb-3 text-brand-400 group-hover:scale-110 transition-transform duration-300">
                      <Zap size={24} />
                    </div>
                    <h3 className="font-semibold text-white mb-2 text-sm">
                      {t("help_step3_title")}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {t("help_step3_desc")}
                    </p>
                  </div>
                </div>

                {/* Difficulty Levels Section */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    {t("help_levels_title")}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {t("help_levels_intro")}
                  </p>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: t("help_levels_beginner").replace(
                            /\*\*(.*?)\*\*/g,
                            '<strong class="text-white">$1</strong>',
                          ),
                        }}
                      />
                    </p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: t("help_levels_intermediate").replace(
                            /\*\*(.*?)\*\*/g,
                            '<strong class="text-white">$1</strong>',
                          ),
                        }}
                      />
                    </p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: t("help_levels_pro").replace(
                            /\*\*(.*?)\*\*/g,
                            '<strong class="text-white">$1</strong>',
                          ),
                        }}
                      />
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-brand-900/40 to-transparent p-6 rounded-xl border border-brand-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Music size={120} />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    {t("help_resources_title")}
                  </h3>
                  {t("help_resources_desc") && (
                    <p className="text-sm text-gray-300 mb-4 max-w-md">
                      {t("help_resources_desc")}
                    </p>
                  )}

                  <a
                    href="https://www.trackmusik.fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-0.5"
                  >
                    {t("help_link_text")}
                    <ExternalLink size={14} />
                  </a>
                </div>
              </>
            ) : (
              <>
                {/* Tech Guide Content */}
                <div className="flex justify-between items-start">
                  <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-brand-500 pl-4">
                    {t("tech_intro")}
                  </p>
                  <button
                    onClick={() => setShowPipeline(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-brand-500/30 transition-all"
                  >
                    <Activity size={16} />
                    {t("pipeline_btn_open")}
                  </button>
                </div>

                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-brand-500/30 transition-colors"
                    >
                      <h3 className="text-white mb-1 text-sm font-bold flex items-center gap-2">
                        {t(`tech_step${step}_title`)}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {t(`tech_step${step}_desc`)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <PipelineExplorer
        isOpen={showPipeline}
        onClose={() => setShowPipeline(false)}
      />
    </>
  );
};

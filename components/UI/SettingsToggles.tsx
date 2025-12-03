import React from "react";
import { Globe, HelpCircle } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

interface SettingsTogglesProps {
  onHelpClick?: () => void;
}

export const SettingsToggles: React.FC<SettingsTogglesProps> = ({
  onHelpClick,
}) => {
  const { language, setLanguage } = useSettings();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fr" : "en");
  };

  return (
    <div className="flex items-center gap-2 bg-dark-950/50 p-1.5 rounded-lg border border-white/5 w-fit">
      {/* Help Button */}
      {onHelpClick && (
        <button
          onClick={onHelpClick}
          className="p-1.5 rounded-md text-gray-400 hover:text-brand-400 hover:bg-white/5 transition-all"
          title="Help & Guide"
        >
          <HelpCircle size={14} />
        </button>
      )}

      <div className="w-px h-4 bg-white/10" />

      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-all hover:bg-white/5"
        title="Switch Language"
      >
        <Globe
          size={12}
          className={language === "en" ? "text-gray-500" : "text-brand-400"}
        />
        <span
          className={language === "en" ? "text-brand-400" : "text-gray-500"}
        >
          EN
        </span>
        <span className="text-gray-700">/</span>
        <span
          className={language === "fr" ? "text-brand-400" : "text-gray-500"}
        >
          FR
        </span>
      </button>
    </div>
  );
};

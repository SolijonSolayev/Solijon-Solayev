import React, { useState } from 'react';
import { DownloadCloud, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { soundEffects } from '../utils/soundEffects';
import { SupportedLanguage, getTranslation } from '../utils/i18n';
import { UzbekAlphabetMode } from '../utils/uzbekAlphabet';

interface PWAInstallButtonProps {
  lang: SupportedLanguage;
  alphabetMode: UzbekAlphabetMode;
  variant?: 'header' | 'hero' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  lang,
  alphabetMode,
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [justInstalled, setJustInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // If already installed, show subtle installed badge or null in compact mode
  if (isInstalled || justInstalled) {
    if (variant === 'compact') return null;
    return (
      <span
        title={getTranslation('installedApp', lang, alphabetMode)}
        className="px-2.5 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg inline-flex items-center gap-1.5"
      >
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden xl:inline">{getTranslation('installedApp', lang, alphabetMode)}</span>
      </span>
    );
  }

  // If not currently installable via beforeinstallprompt (e.g. desktop non-chromium or already prompted),
  // we show an elegant non-blocking inline guide popover without window.alert
  const handleInstall = async () => {
    soundEffects.playClick();
    if (isInstallable) {
      const ok = await installApp();
      if (ok) {
        soundEffects.playSuccess();
        setJustInstalled(true);
      }
    } else {
      soundEffects.playChime();
      setShowGuide((prev) => !prev);
    }
  };

  const label = getTranslation('installApp', lang, alphabetMode);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleInstall}
        title={label}
        className={`relative px-3 py-2 text-xs font-medium rounded-lg border transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
          isInstallable
            ? 'bg-blue-600/15 border-blue-500/50 text-blue-300 shadow-sm shadow-blue-500/20 hover:bg-blue-600/30 hover:border-blue-400'
            : 'bg-[#0F0F12] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
        }`}
      >
        <DownloadCloud
          className={`w-3.5 h-3.5 ${
            isInstallable ? 'text-blue-400 animate-bounce' : 'text-zinc-400'
          }`}
        />
        <span className="hidden sm:inline">{label}</span>
      </button>

      {showGuide && (
        <div
          role="dialog"
          aria-label="PWA Install Guide"
          className="absolute right-0 top-full mt-2 w-72 p-3 bg-zinc-900/95 border border-zinc-700 text-zinc-200 text-xs rounded-xl shadow-2xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between font-semibold text-white mb-2 pb-1.5 border-b border-zinc-800">
            <span>{getTranslation('pwaInstallTitle', lang, alphabetMode)}</span>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-zinc-300 mb-2 leading-relaxed">
            {lang === 'en'
              ? 'To install this portfolio to your device:'
              : "Portfolioni qurilmangizga o'rnatish:"}
          </p>
          <ul className="space-y-1.5 text-zinc-400 text-[11px] list-disc list-inside">
            {lang === 'en' ? (
              <>
                <li>
                  <strong className="text-zinc-200">iOS (Safari):</strong> Tap Share and choose <strong className="text-blue-400">Add to Home Screen</strong>.
                </li>
                <li>
                  <strong className="text-zinc-200">Chrome/Edge:</strong> Click the install icon in the address bar.
                </li>
              </>
            ) : (
              <>
                <li>
                  <strong className="text-zinc-200">iOS (Safari):</strong> Ulashish tugmasini bosib, <strong className="text-blue-400">Bosh ekranga qoʻshish</strong>ni tanlang.
                </li>
                <li>
                  <strong className="text-zinc-200">Chrome/Edge:</strong> Manzil qatoridagi oʻrnatish belgisini bosing.
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

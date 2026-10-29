import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { SupportedLanguage, getTranslation } from '../utils/i18n';
import { UzbekAlphabetMode } from '../utils/uzbekAlphabet';

interface OfflineIndicatorProps {
  lang: SupportedLanguage;
  alphabetMode: UzbekAlphabetMode;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang, alphabetMode }) => {
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-900/95 via-amber-800/95 to-amber-900/95 text-amber-100 text-xs py-2 px-4 shadow-lg backdrop-blur-md border-b border-amber-600/40 flex items-center justify-center gap-2"
          role="status"
          aria-live="polite"
        >
          <WifiOff className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
          <span className="font-medium text-center">
            {getTranslation('offlineNotice', lang, alphabetMode)}
          </span>
        </motion.div>
      )}

      {showRestored && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-950/95 via-emerald-900/95 to-emerald-950/95 text-emerald-100 text-xs py-2 px-4 shadow-lg backdrop-blur-md border-b border-emerald-600/40 flex items-center justify-center gap-2"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium text-center">
            {getTranslation('onlineNotice', lang, alphabetMode)}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

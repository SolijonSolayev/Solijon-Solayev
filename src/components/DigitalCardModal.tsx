import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Download, ExternalLink, Globe, Mail, MapPin, Share2, X } from 'lucide-react';
import { ProfileData } from '../types/profile';
import { formatUzbekText, UzbekAlphabetMode } from '../utils/uzbekAlphabet';
import { downloadVCard } from '../utils/vcard';

interface DigitalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  alphabetMode: UzbekAlphabetMode;
}

function buildDeterministicMatrix(seedText: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const placeFinder = (rowOffset: number, colOffset: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[rowOffset + r][colOffset + c] = isBorder || isInner;
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      if (r === 6 || c === 6) {
        grid[r][c] = (r + c) % 2 === 0;
        continue;
      }

      const cellSeed = Math.imul(hash ^ (r * 31 + c * 17), 2654435761) >>> 0;
      grid[r][c] = cellSeed % 10 < 5;
    }
  }

  return grid;
}

export const DigitalCardModal: React.FC<DigitalCardModalProps> = ({
  isOpen,
  onClose,
  profile,
  alphabetMode,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { personal } = profile;
  const tr = (text: string) => formatUzbekText(text, alphabetMode);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const qrMatrix = useMemo(
    () => buildDeterministicMatrix(`${personal.fullName}|${personal.email}|${personal.taplink}|${personal.github}`),
    [personal.fullName, personal.email, personal.taplink, personal.github]
  );

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="digital-card-title"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0F0F12] border border-zinc-800 p-5 sm:p-6 md:p-8 text-zinc-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle top ambient accent */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-40 bg-blue-600/15 blur-3xl rounded-full"
            />

            <div className="relative z-10 flex items-start justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <p className="text-xs text-zinc-400">{tr('Shaxsiy raqamli vizitka · vCard 3.0')}</p>
                <h2 id="digital-card-title" className="text-2xl font-bold tracking-tight text-white mt-1">
                  {personal.fullName}
                </h2>
                <p className="text-sm text-blue-400 mt-0.5">{personal.role}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={tr('Yopish')}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 py-6 items-center">
              {/* Left column: Contact & Official Links */}
              <div className="md:col-span-7 space-y-3.5">
                <div className="flex items-center justify-between gap-3 py-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3 min-w-0">
                    <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-500">{tr('Elektron pochta')}</p>
                      <a href={`mailto:${personal.email}`} className="text-sm text-zinc-100 hover:text-blue-400 truncate block">
                        {personal.email}
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(personal.email, 'email')}
                    className="px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white border border-zinc-800 rounded-md hover:border-zinc-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {copiedField === 'email' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> {tr('Nusxalandi')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Copy className="w-3.5 h-3.5" /> {tr('Nusxalash')}
                      </span>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <a
                    href="https://solaris3d.uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs text-zinc-200 bg-[#050505] border border-zinc-800 rounded-lg hover:border-blue-500/60 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>solaris3d.uz</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                  <a
                    href="https://tilimlo.uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs text-zinc-200 bg-[#050505] border border-zinc-800 rounded-lg hover:border-blue-500/60 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>tilimlo.uz</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                  <a
                    href={personal.taplink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs text-zinc-200 bg-[#050505] border border-zinc-800 rounded-lg hover:border-blue-500/60 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Taplink</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                  <a
                    href={personal.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs text-zinc-200 bg-[#050505] border border-zinc-800 rounded-lg hover:border-blue-500/60 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                  <a
                    href={personal.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs text-zinc-200 bg-[#050505] border border-zinc-800 rounded-lg hover:border-blue-500/60 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                  <a
                    href={personal.wikipedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs text-zinc-200 bg-[#050505] border border-zinc-800 rounded-lg hover:border-blue-500/60 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Vikipediya</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                  <a
                    href={personal.commons}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs text-zinc-200 bg-[#050505] border border-zinc-800 rounded-lg hover:border-blue-500/60 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Vikiombor</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                  <a
                    href={personal.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs text-zinc-200 bg-[#050505] border border-zinc-800 rounded-lg hover:border-blue-500/60 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>github.io</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                </div>

                <div className="flex items-center gap-4 pt-2 text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    {personal.location}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-zinc-500" />
                    {personal.yearsOfExperience}
                  </span>
                </div>
              </div>

              {/* Right column: QR card preview */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-[#050505] border border-zinc-800">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.18 }}
                  className="p-3 bg-white rounded-lg shadow-lg"
                >
                  <svg
                    viewBox="0 0 21 21"
                    className="w-32 h-32"
                    role="img"
                    aria-label={`${personal.fullName} QR vizitka kodi`}
                  >
                    {qrMatrix.map((row, rIdx) =>
                      row.map((cell, cIdx) =>
                        cell ? (
                          <rect
                            key={`${rIdx}-${cIdx}`}
                            x={cIdx}
                            y={rIdx}
                            width={1}
                            height={1}
                            fill="#050505"
                          />
                        ) : null
                      )
                    )}
                  </svg>
                </motion.div>
                <p className="text-xs text-zinc-400 mt-3 text-center">
                  {tr("vCard 3.0 kontakt ma'lumotlari")}
                </p>
              </div>
            </div>

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => handleCopy(window.location.href, 'shareUrl')}
                className="px-4 py-2.5 text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:text-white transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedField === 'shareUrl' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" /> {tr('Sayt havolasi nusxalandi')}
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" /> {tr('Vizitka havolasini nusxalash')}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => downloadVCard(profile)}
                className="px-5 py-2.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" /> {tr('Kontaktlarga saqlash (.vcf)')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

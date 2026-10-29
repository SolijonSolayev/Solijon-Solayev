"use client"

import React, { useState, useRef, MouseEvent } from 'react';
import {
  Github,
  Send,
  Linkedin,
  Mail,
  QrCode,
  Download,
  Rss,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Bot,
} from 'lucide-react';
import { ProfileData } from '../../types/profile';
import { UzbekAlphabetMode, formatUzbekText } from '../../utils/uzbekAlphabet';
import { SupportedLanguage, getTranslation } from '../../utils/i18n';

interface BeamWordmarkFooterProps {
  profile?: ProfileData;
  alphabetMode?: UzbekAlphabetMode;
  language?: SupportedLanguage;
  onNavigate?: (page: 'home' | 'loyihalar' | 'blog' | 'tajriba' | 'boglanish') => void;
  onDownloadVCard?: () => void;
  onOpenQrModal?: () => void;
  onOpenAiChat?: () => void;
  wordmarkText?: string;
}

export const BeamWordmarkFooter: React.FC<BeamWordmarkFooterProps> = ({
  profile,
  alphabetMode = 'new_2026',
  language = 'uz',
  onNavigate,
  onDownloadVCard,
  onOpenQrModal,
  onOpenAiChat,
  wordmarkText = 'SOLIJON SOLAYEV',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const tr = (text: string) => {
    if (!text) return text;
    if (language === 'en') return text;
    return formatUzbekText(text, alphabetMode);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const rawFullName = profile?.personal?.fullName || 'Solijon Solayev';
  const rawRole = profile?.personal?.role || 'Full-Stack Software Engineer & Open-Source Developer';
  const rawLocation = profile?.personal?.location || 'Toshkent, Oʻzbekiston';

  const fullName = tr(rawFullName);
  const role = tr(rawRole);
  const location = tr(rawLocation);
  const displayWordmark = tr(wordmarkText);

  return (
    <footer
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full bg-[#02040b] text-zinc-100 border-t border-zinc-800/80 overflow-hidden select-none"
    >
      {/* 1. Diagonal Shaft / Beam of Light across top-left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/4 w-[700px] h-[350px] rotate-[-24deg] bg-gradient-to-r from-blue-600/15 via-cyan-500/10 to-transparent blur-[90px] opacity-70"
      />

      {/* 2. Interactive Pointer Glow Effect (follows mouse cursor) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.14), transparent 80%)`,
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-6 flex flex-col justify-between min-h-[520px]">
        {/* Top Header Row: Brand & Glassy Social Links */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b border-zinc-800/80">
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
                {fullName}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {role} · {location}
            </p>
          </div>

          {/* Glassy Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenAiChat && (
              <button
                type="button"
                onClick={onOpenAiChat}
                className="px-3.5 py-2 text-xs font-medium text-blue-300 bg-blue-600/15 border border-blue-500/30 hover:bg-blue-600/25 rounded-xl transition-all inline-flex items-center gap-2 backdrop-blur-md cursor-pointer shadow-xs"
              >
                <Bot className="w-3.5 h-3.5 text-blue-400" />
                <span>{tr('AI Yordamchi')}</span>
              </button>
            )}

            {onDownloadVCard && (
              <button
                type="button"
                onClick={onDownloadVCard}
                className="px-3.5 py-2 text-xs font-medium text-zinc-300 bg-white/5 border border-white/10 hover:border-zinc-700 hover:text-white rounded-xl transition-all inline-flex items-center gap-2 backdrop-blur-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>vCard (.vcf)</span>
              </button>
            )}

            {onOpenQrModal && (
              <button
                type="button"
                onClick={onOpenQrModal}
                className="px-3.5 py-2 text-xs font-medium text-zinc-300 bg-white/5 border border-white/10 hover:border-zinc-700 hover:text-white rounded-xl transition-all inline-flex items-center gap-2 backdrop-blur-md cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-400" />
                <span>QR {tr('Vizitka')}</span>
              </button>
            )}

            <a
              href="https://t.me/solijon_solayev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="p-2.5 text-zinc-400 bg-white/5 border border-white/10 hover:border-blue-500/50 hover:text-blue-400 rounded-xl transition-all backdrop-blur-md"
            >
              <Send className="w-4 h-4" />
            </a>

            <a
              href={profile?.personal?.github || 'https://github.com/SolijonSolayev'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2.5 text-zinc-400 bg-white/5 border border-white/10 hover:border-blue-500/50 hover:text-white rounded-xl transition-all backdrop-blur-md"
            >
              <Github className="w-4 h-4" />
            </a>

            <a
              href="https://linkedin.com/in/solijonsolayev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2.5 text-zinc-400 bg-white/5 border border-white/10 hover:border-blue-500/50 hover:text-blue-400 rounded-xl transition-all backdrop-blur-md"
            >
              <Linkedin className="w-4 h-4" />
            </a>

            <a
              href="/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="RSS Feed"
              className="p-2.5 text-zinc-400 bg-white/5 border border-white/10 hover:border-amber-500/50 hover:text-amber-400 rounded-xl transition-all backdrop-blur-md"
            >
              <Rss className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Middle Navigation Columns with Accent Labels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 py-12">
          {/* Column 1: Main Pages */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 font-mono-tabular uppercase tracking-wider">
              <span>01 / {tr('Navigatsiya')}</span>
            </div>
            <ul className="space-y-2.5 text-sm">
              {[
                { id: 'home' as const, labelKey: 'navAbout' as const, badge: 'SPA' },
                { id: 'loyihalar' as const, labelKey: 'navProjects' as const, badge: 'Portfolio' },
                { id: 'blog' as const, labelKey: 'navBlog' as const, badge: 'Fikrlar' },
                { id: 'tajriba' as const, labelKey: 'navExperience' as const, badge: 'Xronologiya' },
                { id: 'boglanish' as const, labelKey: 'navContact' as const, badge: 'Aloqa' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate?.(item.id)}
                    className="group inline-flex items-center justify-between w-full text-zinc-400 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <span>{getTranslation(item.labelKey, language, alphabetMode)}</span>
                    <span className="text-[10px] font-mono-tabular px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                      {tr(item.badge)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Ecosystem Projects */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 font-mono-tabular uppercase tracking-wider">
              <span>02 / {tr('Ekotizim & Loyihalar')}</span>
            </div>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: 'Solaris 3D Astronomy', url: 'https://solaris3d.uz', badge: '3D WebGL' },
                { name: 'Tilimlo Platformasi', url: 'https://tilimlo.uz', badge: 'Tilshunoslik' },
                { name: 'USB Formatter Utility', url: 'https://github.com/SolijonSolayev/usb-formatter', badge: 'Python' },
                { name: 'Oʻzbekcha Vikipediya', url: 'https://uz.wikipedia.org/wiki/Foydalanuvchi:Solijon_Solayev', badge: 'Viki' },
                { name: 'Wikimedia Commons Gallery', url: 'https://commons.wikimedia.org/wiki/User:Solijon_Solayev', badge: 'CC BY-SA' },
              ].map((proj) => (
                <li key={proj.name}>
                  <a
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-between w-full text-zinc-400 hover:text-white transition-colors"
                  >
                    <span className="truncate pr-2">{tr(proj.name)}</span>
                    <span className="text-[10px] font-mono-tabular px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors shrink-0">
                      {tr(proj.badge)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Direct Inquiries */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 font-mono-tabular uppercase tracking-wider">
              <span>03 / {tr('Aloqa & Resurslar')}</span>
            </div>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={`mailto:${profile?.personal?.email || 'solijonsolayev2003@gmail.com'}`}
                  className="group inline-flex items-center justify-between w-full text-zinc-400 hover:text-white transition-colors"
                >
                  <span className="truncate pr-2">{profile?.personal?.email || 'solijonsolayev2003@gmail.com'}</span>
                  <Mail className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400 transition-colors shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/solijon_solayev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-between w-full text-zinc-400 hover:text-white transition-colors"
                >
                  <span>Telegram (@solijon_solayev)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400 transition-colors shrink-0" />
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('boglanish')}
                  className="group inline-flex items-center justify-between w-full text-zinc-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <span>{tr('Xabar Yuborish Formasi')}</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                </button>
              </li>
              <li>
                <a
                  href="/rss.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-between w-full text-zinc-400 hover:text-white transition-colors"
                >
                  <span>RSS 2.0 Feed (XML)</span>
                  <Rss className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Giant Cropped Wordmark Section */}
        <div className="relative pt-6 pb-2 overflow-hidden flex flex-col items-center justify-center">
          {/* Giant Wordmark Typography */}
          <h1
            aria-hidden="true"
            className="font-display font-black text-[12vw] sm:text-[13.5vw] lg:text-[14.5vw] tracking-tighter leading-none uppercase text-transparent bg-clip-text bg-gradient-to-b from-zinc-600/40 via-zinc-800/20 to-transparent pointer-events-none select-none text-center whitespace-nowrap opacity-90 transition-opacity duration-300"
          >
            {displayWordmark}
          </h1>

          {/* Copyright Row */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 pt-6 border-t border-zinc-800/60 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-zinc-300 font-semibold">{fullName}</span>
              <span aria-hidden="true">·</span>
              <span>© 2026 {tr('Barcha huquqlar himoyalangan')}</span>
            </div>

            <div className="flex items-center gap-4 text-zinc-400">
              <span className="inline-flex items-center gap-1.5 font-mono-tabular">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                {location}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-zinc-500 font-mono-tabular">
                v2.6.0 · AI Studio Build
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BeamWordmarkFooter;

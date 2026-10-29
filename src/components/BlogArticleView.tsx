import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Hash,
  List,
  Loader2,
  Pause,
  Printer,
  Rss,
  Share2,
  Sparkles,
  Square,
  User as UserIcon,
  Volume2,
  Sun,
  Moon,
} from 'lucide-react';
import { BlogPostItem, ProfileData } from '../types/profile';
import { formatUzbekText, UzbekAlphabetMode } from '../utils/uzbekAlphabet';
import { soundEffects } from '../utils/soundEffects';
import { triggerHaptic } from '../hooks/useHapticFeedback';
import { SpotlightCard } from './SpotlightCard';

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function createHeadingId(text: string, countIndex: number): string {
  const cleanSlug = text
    .toLowerCase()
    .replace(/['`‘ʻʼ]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return `section-${countIndex}-${cleanSlug || 'item'}`;
}

export function extractHeadings(markdown: string): TocHeading[] {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const result: TocHeading[] = [];
  let inCodeBlock = false;
  let headingCount = 0;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      const text = h2Match[1].trim();
      const id = createHeadingId(text, headingCount++);
      result.push({ id, text, level: 2 });
      continue;
    }

    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      const text = h3Match[1].trim();
      const id = createHeadingId(text, headingCount++);
      result.push({ id, text, level: 3 });
    }
  }

  return result;
}

export function formatUzbekDate(dateStr: string, mode: UzbekAlphabetMode): string {
  const tr = (t: string) => formatUzbekText(t, mode);
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return tr(dateStr);

  const year = match[1];
  const monthIndex = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);

  const months = [
    'yanvar',
    'fevral',
    'mart',
    'aprel',
    'may',
    'iyun',
    'iyul',
    'avgust',
    'sentabr',
    'oktabr',
    'noyabr',
    'dekabr',
  ];

  const monthName = months[monthIndex] || match[2];
  return tr(`${day}-${monthName}, ${year}-yil`);
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  // Tokenize inline code `...`, links [label](url), and bold **...**
  const pattern = /(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;
  const parts = text.split(pattern);

  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 text-[0.86em] font-mono-tabular bg-zinc-900 border border-zinc-800 rounded text-blue-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors inline-flex items-center gap-0.5"
        >
          {linkMatch[1]}
          <ExternalLink className="w-3 h-3 inline shrink-0" />
        </a>
      );
    }

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

interface MarkdownArticleContentProps {
  content: string;
  alphabetMode: UzbekAlphabetMode;
  onJumpToSection?: (id: string) => void;
}

export const MarkdownArticleContent: React.FC<MarkdownArticleContentProps> = ({
  content,
  alphabetMode,
  onJumpToSection,
}) => {
  const [copiedBlockIdx, setCopiedBlockIdx] = useState<number | null>(null);
  const tr = (text: string) => formatUzbekText(text, alphabetMode);

  const elements = useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    const nodes: React.ReactNode[] = [];
    let i = 0;
    let headingCount = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      // Fenced code block ```lang
      if (trimmed.startsWith('```')) {
        const lang = trimmed.slice(3).trim() || 'code';
        const codeLines: string[] = [];
        const blockStartIdx = i;
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        const codeText = codeLines.join('\n');

        nodes.push(
          <div
            key={`code-${blockStartIdx}`}
            className="my-6 rounded-xl bg-[#09090C] border border-zinc-800 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0F0F12] border-b border-zinc-800 text-xs text-zinc-400">
              <span className="font-mono-tabular uppercase tracking-wider text-zinc-400">
                {lang}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(codeText);
                  setCopiedBlockIdx(blockStartIdx);
                  setTimeout(() => setCopiedBlockIdx(null), 2000);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                {copiedBlockIdx === blockStartIdx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{tr('Nusxalandi')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{tr('Kodni nusxalash')}</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono-tabular text-zinc-200 leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        continue;
      }

      // H2 heading with anchor link
      const h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        const text = h2Match[1].trim();
        const headingId = createHeadingId(text, headingCount++);
        nodes.push(
          <h2
            id={headingId}
            key={`h2-${headingId}`}
            className="group scroll-mt-24 font-display text-2xl sm:text-[1.65rem] font-bold text-white tracking-tight mt-10 mb-4 flex items-center justify-between gap-3"
          >
            <span>{renderInlineFormatting(text)}</span>
            <button
              type="button"
              onClick={() => onJumpToSection?.(headingId)}
              title={tr("Bo'lim havolasi")}
              aria-label={`${text} ${tr("bo'limi")}`}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-zinc-800/60 focus:opacity-100 cursor-pointer shrink-0"
            >
              <Hash className="w-4 h-4" />
            </button>
          </h2>
        );
        i++;
        continue;
      }

      // H3 heading with anchor link
      const h3Match = line.match(/^###\s+(.+)$/);
      if (h3Match) {
        const text = h3Match[1].trim();
        const headingId = createHeadingId(text, headingCount++);
        nodes.push(
          <h3
            id={headingId}
            key={`h3-${headingId}`}
            className="group scroll-mt-24 font-display text-xl font-semibold text-zinc-100 mt-8 mb-3 flex items-center justify-between gap-3"
          >
            <span>{renderInlineFormatting(text)}</span>
            <button
              type="button"
              onClick={() => onJumpToSection?.(headingId)}
              title={tr("Bo'lim havolasi")}
              aria-label={`${text} ${tr("bo'limi")}`}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-zinc-800/60 focus:opacity-100 cursor-pointer shrink-0"
            >
              <Hash className="w-3.5 h-3.5" />
            </button>
          </h3>
        );
        i++;
        continue;
      }

      // Blockquote > ... (Clean all-around hairline border & surface contrast, zero thick left border)
      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = [];
        const startIdx = i;
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
          i++;
        }
        nodes.push(
          <blockquote
            key={`quote-${startIdx}`}
            className="my-6 p-5 sm:p-6 rounded-2xl bg-[#0F0F12] border border-zinc-800 text-zinc-200 text-base leading-relaxed italic"
          >
            {renderInlineFormatting(quoteLines.join(' '))}
          </blockquote>
        );
        continue;
      }

      // Unordered list - or *
      if (/^[-*]\s+/.test(trimmed)) {
        const listItems: string[] = [];
        const startIdx = i;
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''));
          i++;
        }
        nodes.push(
          <ul key={`ul-${startIdx}`} className="my-4 space-y-2.5 text-zinc-300 text-base leading-relaxed">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-blue-500 font-mono-tabular mt-0.5 select-none" aria-hidden="true">
                  /
                </span>
                <span>{renderInlineFormatting(item)}</span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered list 1. 2.
      if (/^\d+\.\s+/.test(trimmed)) {
        const listItems: string[] = [];
        const startIdx = i;
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
          i++;
        }
        nodes.push(
          <ol key={`ol-${startIdx}`} className="my-4 space-y-2.5 text-zinc-300 text-base leading-relaxed">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="font-mono-tabular text-xs text-blue-400 mt-1 shrink-0">
                  0{idx + 1}.
                </span>
                <span>{renderInlineFormatting(item)}</span>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Standard paragraph
      const paraLines: string[] = [];
      const startIdx = i;
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !lines[i].trim().startsWith('```') &&
        !lines[i].trim().startsWith('##') &&
        !lines[i].trim().startsWith('>') &&
        !/^[-*]\s+/.test(lines[i].trim()) &&
        !/^\d+\.\s+/.test(lines[i].trim())
      ) {
        paraLines.push(lines[i].trim());
        i++;
      }

      nodes.push(
        <p key={`p-${startIdx}`} className="my-4 text-zinc-300 text-base leading-[1.78]">
          {renderInlineFormatting(paraLines.join(' '))}
        </p>
      );
    }

    return nodes;
  }, [content, copiedBlockIdx, alphabetMode]);

  return <div className="max-w-[72ch]">{elements}</div>;
};

interface BlogArticleViewProps {
  post: BlogPostItem;
  allPosts: BlogPostItem[];
  profile: ProfileData;
  alphabetMode: UzbekAlphabetMode;
  onAlphabetChange: (mode: UzbekAlphabetMode) => void;
  onBackToBlog: () => void;
  onSelectPost: (postId: string) => void;
  isAdmin: boolean;
  onEditPostInAdmin: (postId: string) => void;
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const BlogArticleView: React.FC<BlogArticleViewProps> = ({
  post,
  allPosts,
  profile,
  alphabetMode,
  onAlphabetChange,
  onBackToBlog,
  onSelectPost,
  isAdmin,
  onEditPostInAdmin,
  themeMode = 'dark',
  onToggleTheme,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // AI Audio Listening (TTS) state
  const [ttsState, setTtsState] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tr = (text: string) => formatUzbekText(text, alphabetMode);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.2,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setImgFailed(false);
    // Stop any playing audio when switching articles
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setTtsState('idle');
  }, [post.id]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleTts = async () => {
    if (ttsState === 'loading') return;

    if (ttsState === 'playing') {
      if (audioRef.current) {
        audioRef.current.pause();
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      setTtsState('paused');
      return;
    }

    if (ttsState === 'paused') {
      if (audioRef.current) {
        await audioRef.current.play();
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }
      setTtsState('playing');
      return;
    }

    // Start new TTS generation
    setTtsState('loading');
    const plainContent = post.content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#>*_`~-]/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    const speechText = `${post.title}. ${post.excerpt}. ${plainContent}`.slice(0, 1600);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechText }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioBase64) {
          const mime = data.mimeType || 'audio/wav';
          const audio = new Audio(`data:${mime};base64,${data.audioBase64}`);
          audioRef.current = audio;
          audio.onended = () => setTtsState('idle');
          audio.onerror = () => setTtsState('idle');
          await audio.play();
          setTtsState('playing');
          return;
        }
      }
      throw new Error('Fallback to browser speech synthesis');
    } catch {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = 'uz-UZ';
        utterance.rate = 1.0;
        utterance.onend = () => setTtsState('idle');
        utterance.onerror = () => setTtsState('idle');
        window.speechSynthesis.speak(utterance);
        setTtsState('playing');
      } else {
        setTtsState('idle');
      }
    }
  };

  const handleStopTts = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setTtsState('idle');
  };

  const handleDownloadMarkdown = () => {
    const mdDocument = `---
title: "${post.title.replace(/"/g, '\\"')}"
author: "${profile.personal.fullName}"
category: "${post.category}"
date: "${post.publishedAt}"
readTime: "${post.readTime}"
tags: [${(post.tags || []).map((t) => `"${t}"`).join(', ')}]
url: "https://solijonsolayev.github.io/#blog/${post.slug || post.id}"
---

# ${post.title}

> ${post.excerpt}

${post.content}
`;
    const blob = new Blob([mdDocument], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.slug || post.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const headings = useMemo(() => extractHeadings(post.content), [post.content]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  // Jump smoothly to a specific section heading with haptic, sound & visual flash
  const handleJumpToSection = (id: string) => {
    soundEffects.playClick();
    triggerHaptic('selection');
    setActiveHeadingId(id);

    const targetEl = document.getElementById(id);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Trigger temporary visual highlight flash
      targetEl.classList.remove('heading-highlight-flash');
      void targetEl.offsetWidth; // force reflow
      targetEl.classList.add('heading-highlight-flash');
      setTimeout(() => {
        targetEl.classList.remove('heading-highlight-flash');
      }, 1500);

      // Cleanly sync URL hash without triggering navigation reloads
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState(null, '', `#${id}`);
      }
    }
  };

  const handleScrollToTop = () => {
    soundEffects.playClick();
    triggerHaptic('light');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (headings.length > 0) {
      setActiveHeadingId(headings[0].id);
    }
  };

  // Scrollspy: update active heading as user scrolls through article
  useEffect(() => {
    if (headings.length === 0) return;
    setActiveHeadingId(headings[0].id);

    // Initial hash check when deep linking to a section
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#section-')) {
      const initId = window.location.hash.slice(1);
      const el = document.getElementById(initId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveHeadingId(initId);
          el.classList.add('heading-highlight-flash');
          setTimeout(() => el.classList.remove('heading-highlight-flash'), 1500);
        }, 300);
      }
    }

    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const sorted = visible.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          setActiveHeadingId(sorted[0].target.id);
        }
      },
      {
        rootMargin: '-85px 0px -60% 0px',
        threshold: [0, 0.2, 1],
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [headings, post.id]);

  const currentIndex = useMemo(
    () => allPosts.findIndex((p) => p.id === post.id),
    [allPosts, post.id]
  );

  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex >= 0 && currentIndex < allPosts.length - 1
      ? allPosts[currentIndex + 1]
      : null;

  const relatedPosts = useMemo(() => {
    return allPosts
      .filter((p) => p.id !== post.id)
      .sort((a, b) => (a.category === post.category ? -1 : b.category === post.category ? 1 : 0))
      .slice(0, 2);
  }, [allPosts, post.id, post.category]);

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.search}#blog/${post.slug || post.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const telegramShareUrl = useMemo(() => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#blog/${post.slug || post.id}`;
    return `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
      post.title
    )}`;
  }, [post.id, post.slug, post.title]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col relative selection:bg-blue-600/30 selection:text-white">

      {/* Sticky Article Top Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-6 lg:px-12 py-4 bg-[#050505]/90 backdrop-blur-xl border-b border-zinc-800/80">
        <button
          type="button"
          onClick={onBackToBlog}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>{tr("Blog ro'yxatiga qaytish")}</span>
        </button>

        <div className="hidden md:block text-xs text-zinc-400 truncate max-w-md font-medium">
          {post.title}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Dual Uzbek Alphabet Switcher inside Article Reader */}
          <div
            role="group"
            aria-label={tr("O'zbek alifbosini tanlash")}
            className="flex items-center gap-1 p-1 bg-[#0F0F12] border border-zinc-800 rounded-lg"
          >
            <button
              type="button"
              onClick={() => onAlphabetChange('new_2026')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                alphabetMode === 'new_2026'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ö Ğ Ş Ç
            </button>
            <button
              type="button"
              onClick={() => onAlphabetChange('classic')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                alphabetMode === 'classic'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Oʻ Gʻ Sh Ch
            </button>
          </div>

          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              title={
                themeMode === 'dark'
                  ? tr("Kunduzgi hashamatli rejimga o'tish (Oq-sariq va oltin-qum)")
                  : tr("Tungi rejimga o'tish (Qorong'i)")
              }
              aria-label={themeMode === 'dark' ? tr("Kunduzgi rejim") : tr("Tungi rejim")}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                themeMode === 'light'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 shadow-sm shadow-amber-500/10 hover:bg-amber-500/25'
                  : 'bg-[#0F0F12] border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
              }`}
            >
              {themeMode === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{tr('Kun')}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-700" />
                  <span className="hidden sm:inline">{tr('Tun')}</span>
                </>
              )}
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => onEditPostInAdmin(post.id)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600/20 border border-blue-500/40 rounded-lg hover:bg-blue-600/30 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">{tr('Tahrirlash')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyShareLink}
            className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-[#0F0F12] border border-zinc-800 rounded-lg hover:border-zinc-700 hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{tr('Havola nusxalandi')}</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">{tr('Ulashish')}</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 lg:px-12 py-10 lg:py-16">
        {/* Article Header Metadata & Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 pb-10 border-b border-zinc-800/80"
        >
          {/* Clean Unboxed Metadata Line (Zero-Pill Rule) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-400">
            <span className="text-blue-400 font-medium">{tr(post.category)}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5 font-mono-tabular">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              {formatUzbekDate(post.publishedAt, alphabetMode)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5 font-mono-tabular">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              {post.readTime} {tr('mutolaa')}
            </span>
            {post.featured && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  {tr('Tanlangan maqola')}
                </span>
              </>
            )}
          </div>

          <h1
            className="font-display text-2xl sm:text-4xl lg:text-[2.65rem] font-bold text-white tracking-tight leading-[1.18] max-w-4xl"
            style={{ textWrap: 'balance' }}
          >
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-3xl">
            {post.excerpt}
          </p>

          {/* Author, AI Audio Reader, Markdown Download, Print & Share Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-display font-bold text-sm">
                SS
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{profile.personal.fullName}</p>
                <p className="text-xs text-zinc-400">{profile.personal.role}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* AI Audio Listening Button (Gemini TTS) */}
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleToggleTts}
                  className={`px-3.5 py-2 rounded-lg border transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    ttsState === 'playing' || ttsState === 'paused'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-[#0F0F12] border-zinc-800 hover:border-blue-500/50 text-zinc-200 hover:text-white'
                  }`}
                >
                  {ttsState === 'loading' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      <span>{tr('AI ovoz tayyorlanmoqda...')}</span>
                    </>
                  ) : ttsState === 'playing' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>{tr("To'xtatib turish")}</span>
                    </>
                  ) : ttsState === 'paused' ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{tr('Davom ettirish')}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>{tr('Maqolani tinglash (AI)')}</span>
                    </>
                  )}
                </button>
                {(ttsState === 'playing' || ttsState === 'paused') && (
                  <button
                    type="button"
                    onClick={handleStopTts}
                    title={tr('Ovozni yakunlash')}
                    className="p-2 rounded-lg bg-[#0F0F12] border border-zinc-800 hover:border-rose-500/50 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Download as Markdown (.md) */}
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                title={tr('Maqolani Markdown (.md) fayl sifatida yuklab olish')}
                className="px-3 py-2 rounded-lg bg-[#0F0F12] border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>.MD</span>
              </button>

              {/* Print / Save as PDF */}
              <button
                type="button"
                onClick={() => window.print()}
                title={tr('PDF sifatida saqlash yoki chop etish')}
                className="px-3 py-2 rounded-lg bg-[#0F0F12] border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">PDF</span>
              </button>

              {/* RSS Feed Link */}
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                title="RSS 2.0 XML"
                className="px-3 py-2 rounded-lg bg-[#0F0F12] border border-zinc-800 hover:border-amber-500/50 text-zinc-300 hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Rss className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">RSS</span>
              </a>

              <a
                href={telegramShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/50 text-zinc-200 hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <span>{tr('Telegram')}</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Cover Image Banner */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="my-10 rounded-2xl overflow-hidden bg-[#0F0F12] border border-zinc-800 aspect-video max-h-[460px] w-full relative"
        >
          {!imgFailed && post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.title}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-zinc-900 via-[#0F0F12] to-[#050505]">
              <BookOpen className="w-10 h-10 text-blue-500/60 mb-3" />
              <p className="text-sm text-zinc-400 text-center max-w-md">{post.title}</p>
            </div>
          )}
        </motion.div>

        {/* 2-Column Manuscript + Table of Contents Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-2">
          {/* Left 8 Columns: Full Article Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Mobile Collapsible Table of Contents (< lg) */}
            {headings.length > 0 && (
              <div className="lg:hidden rounded-2xl bg-[#0F0F12] border border-zinc-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    triggerHaptic('light');
                    setMobileTocOpen(!mobileTocOpen);
                  }}
                  className="w-full px-5 py-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-zinc-900/50 transition-colors"
                  aria-expanded={mobileTocOpen}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <List className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-sm font-semibold text-white truncate">
                      {tr('Mundarija')}
                    </span>
                    <span className="text-[11px] font-mono-tabular px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                      {headings.length} {tr("bo'lim")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="text-xs text-zinc-400 hidden sm:inline">
                      {mobileTocOpen ? tr('Yopish') : tr('Ochish')}
                    </span>
                    {mobileTocOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {mobileTocOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-zinc-800/80 space-y-1.5 animate-in fade-in duration-200">
                    {headings.map((h, idx) => {
                      const isActive = activeHeadingId === h.id;
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => {
                            handleJumpToSection(h.id);
                            setMobileTocOpen(false);
                          }}
                          className={`w-full text-left py-2 px-3 rounded-lg text-xs leading-relaxed transition-all flex items-start gap-2.5 cursor-pointer ${
                            isActive
                              ? 'bg-blue-600/15 text-blue-300 font-semibold border border-blue-500/30'
                              : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
                          } ${h.level === 3 ? 'pl-6' : ''}`}
                        >
                          <span className="font-mono-tabular text-[10px] text-zinc-500 shrink-0 mt-0.5">
                            {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}.
                          </span>
                          <span className="flex-1">{h.text}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <MarkdownArticleContent
              content={post.content}
              alphabetMode={alphabetMode}
              onJumpToSection={handleJumpToSection}
            />

            {/* Unboxed Tags Footer */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-8 mt-10 border-t border-zinc-800/80 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-400">
                <span className="text-zinc-500 font-medium">{tr('Mavzular:')}</span>
                {post.tags.map((tag, idx) => (
                  <React.Fragment key={tag}>
                    <span className="font-mono-tabular text-zinc-200">#{tag}</span>
                    {idx < post.tags.length - 1 && (
                      <span aria-hidden="true" className="text-zinc-600">
                        ·
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Previous / Next Post Navigation */}
            {(prevPost || nextPost) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-zinc-800/80">
                {prevPost ? (
                  <button
                    type="button"
                    onClick={() => onSelectPost(prevPost.id)}
                    className="p-5 rounded-2xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/50 transition-colors text-left space-y-1.5 group cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 group-hover:text-blue-400 transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" />
                      {tr('Oldingi maqola')}
                    </span>
                    <p className="font-display text-sm font-semibold text-white line-clamp-2">
                      {prevPost.title}
                    </p>
                  </button>
                ) : (
                  <div />
                )}

                {nextPost && (
                  <button
                    type="button"
                    onClick={() => onSelectPost(nextPost.id)}
                    className="p-5 rounded-2xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/50 transition-colors text-right space-y-1.5 group cursor-pointer"
                  >
                    <span className="inline-flex items-center justify-end gap-1.5 text-xs text-zinc-400 group-hover:text-blue-400 transition-colors">
                      {tr('Keyingi maqola')}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <p className="font-display text-sm font-semibold text-white line-clamp-2">
                      {nextPost.title}
                    </p>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right 4 Columns: Sticky Table of Contents & Author Card */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            {headings.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#0F0F12] border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <List className="w-4 h-4 text-blue-400" />
                    <h2 className="font-display text-sm font-bold text-white">
                      {tr('Maqola mundarijasi')}
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono-tabular px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400">
                    {headings.length} {tr("bo'lim")}
                  </span>
                </div>

                {/* Active Section Quick Tracker */}
                {activeHeadingId && (
                  <div className="px-3 py-2 rounded-lg bg-zinc-900/70 border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center gap-2 truncate">
                    <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0 animate-pulse" />
                    <span className="truncate">
                      {headings.find((h) => h.id === activeHeadingId)?.text || tr("O'qilmoqda...")}
                    </span>
                  </div>
                )}

                <nav
                  aria-label={tr('Maqola mundarijasi')}
                  className="space-y-1 relative pl-2 border-l border-zinc-800"
                >
                  {headings.map((h, idx) => {
                    const isActive = activeHeadingId === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => handleJumpToSection(h.id)}
                        className={`group w-full text-left py-1.5 px-2 rounded-md text-xs leading-relaxed transition-all flex items-start gap-2 cursor-pointer relative ${
                          isActive
                            ? 'text-blue-400 font-semibold bg-blue-500/10'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                        } ${h.level === 3 ? 'pl-5 text-zinc-400' : ''}`}
                      >
                        {/* Active vertical pill indicator */}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute -left-[9px] top-1.5 bottom-1.5 w-0.5 bg-blue-500 rounded-full"
                          />
                        )}
                        <span className="font-mono-tabular text-[10px] text-zinc-500 shrink-0 mt-0.5 select-none">
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>
                        <span className="flex-1 truncate">{h.text}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleScrollToTop}
                    className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
                    <span>{tr('Boshiga qaytish')}</span>
                  </button>
                  <span className="text-[11px] text-zinc-500 font-mono-tabular">
                    {Math.round(smoothProgress.get() * 100)}% {tr("o'qildi")}
                  </span>
                </div>
              </div>
            )}

            <div className="p-6 rounded-2xl bg-[#0F0F12] border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <UserIcon className="w-4 h-4 text-blue-400" />
                <h3 className="font-display text-sm font-bold text-white">
                  {tr('Muallif haqida')}
                </h3>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {profile.personal.shortBio}
              </p>
              <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-400">
                <a
                  href="https://solaris3d.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors text-zinc-200"
                >
                  solaris3d.uz
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href="https://tilimlo.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors text-zinc-200"
                >
                  tilimlo.uz
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href={profile.personal.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-20 pt-14 border-t border-zinc-800/80 space-y-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-blue-400 font-medium">{tr('Mutolaani davom ettiring')}</p>
                <h2 className="font-display text-2xl font-bold text-white mt-1">
                  {tr('Boshqa maqolalar')}
                </h2>
              </div>
              <button
                type="button"
                onClick={onBackToBlog}
                className="text-xs font-medium text-zinc-300 hover:text-blue-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>{tr('Barcha maqolalar')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <SpotlightCard
                  key={rel.id}
                  as="article"
                  onClick={() => onSelectPost(rel.id)}
                  className="p-6 rounded-2xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/40 transition-colors flex flex-col justify-between space-y-4 cursor-pointer group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="text-blue-400">{tr(rel.category)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">
                        {formatUzbekDate(rel.publishedAt, alphabetMode)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">{rel.readTime}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      {rel.title}
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                      {rel.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-mono-tabular">
                      {rel.tags.slice(0, 3).map((t) => `#${t}`).join(' · ')}
                    </span>
                    <span className="text-white font-medium group-hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                      {tr("To'liq o'qish")} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

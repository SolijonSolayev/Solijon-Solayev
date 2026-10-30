/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  Clock,
  Code2,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Flame,
  Globe,
  GraduationCap,
  Info,
  Layers,
  Mail,
  MapPin,
  Plus,
  QrCode,
  Rss,
  Search,
  Sparkles,
  Terminal,
  Trash2,
  Video,
  Sun,
  Moon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BeamWordmarkFooter } from '@/components/ui/beam-wordmark-footer';
import { Card10 } from '@/components/ui/card-10';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ParallaxImage, ParallaxLayer } from './components/ScrollParallax';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { SeoHead } from './components/SeoHead';
import { SpotlightCard } from './components/SpotlightCard';

const AdminPanelView = lazy(() =>
  import('./components/AdminPanelView').then((m) => ({ default: m.AdminPanelView }))
);
const BlogArticleView = lazy(() =>
  import('./components/BlogArticleView').then((m) => ({ default: m.BlogArticleView }))
);
const CommandPaletteModal = lazy(() =>
  import('./components/CommandPaletteModal').then((m) => ({ default: m.CommandPaletteModal }))
);
const DigitalCardModal = lazy(() =>
  import('./components/DigitalCardModal').then((m) => ({ default: m.DigitalCardModal }))
);
const FlameCursor = lazy(() =>
  import('./components/FlameCursor').then((m) => ({ default: m.FlameCursor }))
);
const LiveEcosystemSection = lazy(() =>
  import('./components/LiveEcosystemSection').then((m) => ({ default: m.LiveEcosystemSection }))
);
const PortfolioChatbot = lazy(() =>
  import('./components/PortfolioChatbot').then((m) => ({ default: m.PortfolioChatbot }))
);
const ProjectLightbox = lazy(() =>
  import('./components/ProjectLightbox').then((m) => ({ default: m.ProjectLightbox }))
);
import { DEFAULT_PROFILE_DATA } from './data/defaultProfile';
import {
  BlogCategory,
  BlogPostItem,
  ProfileData,
  ProjectCategory,
  ProjectItem,
} from './types/profile';
import {
  ALPHABET_STORAGE_KEY,
  formatUzbekText,
  UzbekAlphabetMode,
} from './utils/uzbekAlphabet';
import {
  SupportedLanguage,
  LANGUAGE_STORAGE_KEY,
  getTranslation,
  localizeProfileForLanguage,
} from './utils/i18n';
import { soundEffects } from './utils/soundEffects';
import { useHapticFeedback } from './hooks/useHapticFeedback';
import { downloadVCard } from './utils/vcard';
import { getCanonicalRepoKey } from './utils/githubHelpers';

export type ActiveSectionPage = 'home' | 'loyihalar' | 'blog' | 'tajriba' | 'boglanish';
export type ThemeMode = 'dark' | 'light';
export const THEME_STORAGE_KEY = 'solijon_theme_mode';

function formatUzbekDate(dateStr: string, mode: UzbekAlphabetMode): string {
  const tr = (t: string) => formatUzbekText(t, mode);
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return tr(dateStr);
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
  const monthName = months[parseInt(match[2], 10) - 1] || match[2];
  return tr(`${parseInt(match[3], 10)}-${monthName}, ${match[1]}-yil`);
}

function resolvePageFromHash(hash: string, search: string = ''): ActiveSectionPage {
  try {
    const params = new URLSearchParams(search);
    if (params.get('article')) return 'blog';
    const pageParam = (params.get('page') || '').toLowerCase();
    if (
      pageParam === 'loyihalar' ||
      pageParam === 'blog' ||
      pageParam === 'tajriba' ||
      pageParam === 'boglanish'
    ) {
      return pageParam;
    }
  } catch {
    // ignore URLSearchParams errors
  }
  const normalized = (hash || '').toLowerCase();
  if (normalized === '#loyihalar') return 'loyihalar';
  if (normalized === '#blog' || normalized.startsWith('#blog/')) return 'blog';
  if (normalized === '#tajriba' || normalized === '#faoliyat' || normalized === '#ekotizim') {
    return 'tajriba';
  }
  if (normalized === '#boglanish') return 'boglanish';
  return 'home';
}

function resolveBlogIdentifierFromLocation(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const articleParam = params.get('article');
    if (articleParam) {
      return articleParam;
    }
  } catch {
    // ignore URLSearchParams errors
  }
  const hash = window.location.hash;
  if (hash.startsWith('#blog/')) {
    return decodeURIComponent(hash.slice('#blog/'.length));
  }
  return null;
}

export default function App() {
  const [rawProfile, setRawProfile] = useState<ProfileData>(DEFAULT_PROFILE_DATA);
  const { triggerLight, triggerMedium, triggerSuccess, triggerSelection } = useHapticFeedback();

  // Supported Language state (uz / en)
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      if (urlLang === 'uz' || urlLang === 'en') {
        return urlLang;
      }
      const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'uz' || saved === 'en') {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return 'uz';
  });

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    soundEffects.playChime();
    triggerMedium();
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      const url = new URL(window.location.href);
      if (lang === 'en') {
        url.searchParams.set('lang', 'en');
      } else {
        url.searchParams.delete('lang');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore storage errors
    }
  };

  // Sound Effects toggle state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => soundEffects.isEnabled());
  const toggleSound = () => {
    const next = soundEffects.toggle();
    triggerLight();
    setSoundEnabled(next);
  };

  const [alphabetMode, setAlphabetMode] = useState<UzbekAlphabetMode>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlAlphabet = params.get('alphabet');
      if (urlAlphabet === 'classic' || urlAlphabet === 'new_2026') {
        return urlAlphabet;
      }
      const saved = window.localStorage.getItem(ALPHABET_STORAGE_KEY);
      if (saved === 'classic' || saved === 'new_2026') {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return 'new_2026';
  });

  const handleAlphabetChange = (mode: UzbekAlphabetMode) => {
    soundEffects.playClick();
    triggerSelection();
    setAlphabetMode(mode);
    try {
      window.localStorage.setItem(ALPHABET_STORAGE_KEY, mode);
      const url = new URL(window.location.href);
      if (mode === 'classic') {
        url.searchParams.set('alphabet', 'classic');
      } else {
        url.searchParams.delete('alphabet');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore storage errors
    }
  };

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return 'dark'; // DEFAULT TUN REJIMI
  });

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) themeMeta.setAttribute('content', '#FAF4E5');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) themeMeta.setAttribute('content', '#050505');
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // ignore storage errors
    }
  }, [themeMode]);

  const toggleThemeMode = () => {
    soundEffects.playChime();
    triggerMedium();
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const tr = (text: string) => {
    if (language === 'en') {
      return text;
    }
    return formatUzbekText(text, alphabetMode);
  };

  const profile = useMemo(
    () => localizeProfileForLanguage(rawProfile, language, alphabetMode),
    [rawProfile, language, alphabetMode]
  );

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    return window.location.hash === '#admin';
  });
  const [adminInitialEditPostId, setAdminInitialEditPostId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<ActiveSectionPage>(() =>
    resolvePageFromHash(window.location.hash, window.location.search)
  );

  // Blog reader & filtering state
  const [activeBlogIdentifier, setActiveBlogIdentifier] = useState<string | null>(() =>
    resolveBlogIdentifierFromLocation()
  );
  const [selectedBlogCategory, setSelectedBlogCategory] = useState<'Barchasi' | BlogCategory>(
    'Barchasi'
  );
  const [blogSortOrder, setBlogSortOrder] = useState<'featured' | 'newest' | 'oldest'>('featured');
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [failedBlogImages, setFailedBlogImages] = useState<Record<string, boolean>>({});

  const [selectedCategory, setSelectedCategory] = useState<'Barchasi' | ProjectCategory>('Barchasi');
  const [experienceFilter, setExperienceFilter] = useState<'Barchasi' | 'Faoliyat' | "Ta'lim">(
    'Barchasi'
  );
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [flameCursorEnabled, setFlameCursorEnabled] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem('solijon_flame_cursor_enabled');
      if (saved === 'false') return false;
    } catch {
      // ignore storage errors
    }
    return true;
  });

  const toggleFlameCursor = () => {
    setFlameCursorEnabled((prev) => {
      const next = !prev;
      soundEffects.playToggle(next);
      triggerLight();
      try {
        window.localStorage.setItem('solijon_flame_cursor_enabled', String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };
  const [heroImgError, setHeroImgError] = useState(false);
  const [failedProjectImages, setFailedProjectImages] = useState<Record<string, boolean>>({});
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Quick message form state (connected to Firestore inquiries collection)
  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [senderProjectType, setSenderProjectType] = useState<
    'Veb-ilova / SaaS' | 'Backend & API' | 'UI/UX & Mobil' | 'Texnik Konsalting'
  >('Veb-ilova / SaaS');
  const [senderMessage, setSenderMessage] = useState('');
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Scroll Parallax refs & motion values for Hero, Portfolio, and Experience sections
  const prefersReducedMotion = useReducedMotion();
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const experienceSectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress: pageScrollProgress } = useScroll();

  const smoothHeroScroll = useSpring(pageScrollProgress, {
    stiffness: 110,
    damping: 30,
    mass: 0.35,
  });

  const heroLeftY = useTransform(
    smoothHeroScroll,
    [0, 0.35],
    prefersReducedMotion ? [0, 0] : [0, -28]
  );
  const heroRightY = useTransform(
    smoothHeroScroll,
    [0, 0.35],
    prefersReducedMotion ? [0, 0] : [0, 34]
  );
  const heroMetricsY = useTransform(
    smoothHeroScroll,
    [0, 0.35],
    prefersReducedMotion ? [0, 0] : [0, -16]
  );
  const ambientGlowY = useTransform(
    smoothHeroScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 95]
  );

  const smoothExpProgress = useSpring(pageScrollProgress, {
    stiffness: 100,
    damping: 28,
    mass: 0.4,
  });

  useEffect(() => {
    let unsubPortfolio: (() => void) | null = null;
    let cancelled = false;
    let syncStarted = false;

    const startPortfolioSync = () => {
      if (syncStarted || cancelled) return;
      syncStarted = true;
      window.removeEventListener('pointerdown', startPortfolioSync);
      window.removeEventListener('pointermove', startPortfolioSync);
      window.removeEventListener('keydown', startPortfolioSync);
      window.removeEventListener('scroll', startPortfolioSync);
      window.removeEventListener('touchstart', startPortfolioSync);
      void import('./lib/firebase').then(({ subscribeToPortfolio }) => {
        if (cancelled) return;
        unsubPortfolio = subscribeToPortfolio((cloudProfile) => {
          if (cloudProfile) {
            setRawProfile(cloudProfile);
          }
        });
      });
    };

    if (window.location.hash === '#admin') {
      startPortfolioSync();
    } else {
      window.addEventListener('pointerdown', startPortfolioSync, { once: true, passive: true });
      window.addEventListener('pointermove', startPortfolioSync, { once: true, passive: true });
      window.addEventListener('keydown', startPortfolioSync, { once: true, passive: true });
      window.addEventListener('scroll', startPortfolioSync, { once: true, passive: true });
      window.addEventListener('touchstart', startPortfolioSync, { once: true, passive: true });
    }

    const handleUrlStateChange = () => {
      const hash = window.location.hash;
      setIsAdminRoute(hash === '#admin');
      const blogId = resolveBlogIdentifierFromLocation();
      if (blogId) {
        setActiveBlogIdentifier(blogId);
        setActivePage('blog');
      } else {
        setActiveBlogIdentifier(null);
        setActivePage(resolvePageFromHash(hash, window.location.search));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleUrlStateChange);
    window.addEventListener('popstate', handleUrlStateChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelled = true;
      window.removeEventListener('pointerdown', startPortfolioSync);
      window.removeEventListener('pointermove', startPortfolioSync);
      window.removeEventListener('keydown', startPortfolioSync);
      window.removeEventListener('scroll', startPortfolioSync);
      window.removeEventListener('touchstart', startPortfolioSync);
      if (unsubPortfolio) unsubPortfolio();
      window.removeEventListener('hashchange', handleUrlStateChange);
      window.removeEventListener('popstate', handleUrlStateChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isAdminRoute) return;
    let unsubAuth: (() => void) | null = null;
    let cancelled = false;
    void import('./lib/firebase').then(({ subscribeToAuth }) => {
      if (cancelled) return;
      unsubAuth = subscribeToAuth((user) => {
        setCurrentUser(user);
      });
    });
    return () => {
      cancelled = true;
      if (unsubAuth) unsubAuth();
    };
  }, [isAdminRoute]);

  // Fetch all public GitHub repositories for SolijonSolayev in real-time, update existing items with live metrics, and append new ones with 0 duplicates
  useEffect(() => {
    let isMounted = true;
    async function syncGithubProjects() {
      try {
        const res = await fetch(
          'https://api.github.com/users/SolijonSolayev/repos?sort=updated&per_page=100'
        );
        if (!res.ok) return;
        const repos = await res.json();
        if (!Array.isArray(repos) || !isMounted) return;

        setRawProfile((prev) => {
          const existingProjects = prev.projects || [];
          const projectKeyMap = new Map<string, ProjectItem>();
          const projectOrder: string[] = [];

          for (const p of existingProjects) {
            const key = getCanonicalRepoKey(p);
            if (key) {
              projectKeyMap.set(key, p);
              projectOrder.push(key);
            }
          }

          for (const repo of repos) {
            if (!repo || !repo.name) continue;
            const repoName = repo.name.trim();
            const repoKey = getCanonicalRepoKey({
              name: repoName,
              html_url: repo.html_url,
              liveUrl: repo.homepage,
            });

            if (!repoKey) continue;

            const repoUrl =
              repo.html_url || `https://github.com/SolijonSolayev/${repoName}`;
            const liveUrl =
              repo.homepage && repo.homepage.trim().length > 0
                ? repo.homepage
                : repoUrl;
            const year = repo.updated_at
              ? new Date(repo.updated_at).getFullYear().toString()
              : '2026';

            let category: ProjectCategory = 'Foydali dasturlar';
            const lowerName = repoName.toLowerCase();
            if (
              lowerName.includes('solaris') ||
              lowerName.includes('tilimlo') ||
              lowerName.includes('site') ||
              lowerName.includes('web') ||
              lowerName.includes('portfolio') ||
              lowerName.includes('beauty') ||
              lowerName.includes('sayohat') ||
              lowerName.includes('.io') ||
              repo.language === 'TypeScript' ||
              repo.language === 'JavaScript' ||
              repo.language === 'HTML' ||
              repo.language === 'CSS'
            ) {
              category = 'Veb-loyihalar';
            } else if (lowerName.includes('wiki') || lowerName.includes('commons')) {
              category = 'Ochiq bilim va Media';
            }

            let imageUrl = '/images/project_ai_analytics_1793267851074.webp';
            if (lowerName.includes('solaris')) {
              imageUrl = '/images/project_solaris3d_astronomy_1793272827947.webp';
            } else if (lowerName.includes('tilimlo')) {
              imageUrl = '/images/project_tilimlo_platform_1793272827504.webp';
            } else if (lowerName.includes('formatter') || lowerName.includes('usb')) {
              imageUrl = '/images/project_fintech_platform_1793267850542.webp';
            } else if (lowerName.includes('tozalash') || lowerName.includes('clean')) {
              imageUrl = '/images/project_mobile_banking_1793267852640.webp';
            } else if (
              lowerName.includes('kvadrat') ||
              lowerName.includes('math') ||
              lowerName.includes('beauty') ||
              lowerName.includes('sayohat')
            ) {
              imageUrl = '/images/project_ecommerce_engine_1793267852059.webp';
            }

            const existingP = projectKeyMap.get(repoKey);
            if (existingP) {
              // Update existing item with live stars, language, and repoUrl without duplicating
              projectKeyMap.set(repoKey, {
                ...existingP,
                year: year || existingP.year,
                impactMetric: `GitHub Repozitoriya · ${
                  repo.language || existingP.technologies[0] || 'Code'
                } · ★ ${repo.stargazers_count || 0}`,
                repoUrl: repoUrl || existingP.repoUrl,
                liveUrl: liveUrl || existingP.liveUrl,
              });
            } else {
              // Brand new repo: add to map and order
              projectKeyMap.set(repoKey, {
                id: `gh_${repo.id || repoName}`,
                title: repo.description ? `${repoName} — ${repo.description}` : repoName,
                category,
                year,
                client: 'Ochiq manbali loyiha (GitHub)',
                role: 'Muallif va dasturchi',
                featured: false,
                summary: repo.description || `GitHub repozitoriyasi: ${repoName}`,
                challenge: `Ochiq manbali dasturiy ta'minot yaratish va ${
                  repo.language || 'kod'
                } bazasini rivojlantirish.`,
                solution: `GitHub platformasida erkin kodi taqdim etilgan ${repoName} ishlanmasi.`,
                impactMetric: `GitHub Repozitoriya · ${
                  repo.language || 'Code'
                } · ★ ${repo.stargazers_count || 0}`,
                technologies: [repo.language || 'Code', 'GitHub', 'Open Source'].filter(
                  Boolean
                ),
                imageUrl,
                liveUrl,
                repoUrl,
              });
              projectOrder.push(repoKey);
            }
          }

          const nextProjects = projectOrder
            .map((k) => projectKeyMap.get(k))
            .filter((p): p is ProjectItem => Boolean(p));

          return {
            ...prev,
            projects: nextProjects,
          };
        });
      } catch {
        // ignore github fetch errors
      }
    }

    let ghStarted = false;
    const triggerGithubSync = () => {
      if (ghStarted || !isMounted) return;
      ghStarted = true;
      window.removeEventListener('pointerdown', triggerGithubSync);
      window.removeEventListener('pointermove', triggerGithubSync);
      window.removeEventListener('scroll', triggerGithubSync);
      window.removeEventListener('touchstart', triggerGithubSync);
      void syncGithubProjects();
    };
    window.addEventListener('pointerdown', triggerGithubSync, { once: true, passive: true });
    window.addEventListener('pointermove', triggerGithubSync, { once: true, passive: true });
    window.addEventListener('scroll', triggerGithubSync, { once: true, passive: true });
    window.addEventListener('touchstart', triggerGithubSync, { once: true, passive: true });
    return () => {
      isMounted = false;
      window.removeEventListener('pointerdown', triggerGithubSync);
      window.removeEventListener('pointermove', triggerGithubSync);
      window.removeEventListener('scroll', triggerGithubSync);
      window.removeEventListener('touchstart', triggerGithubSync);
    };
  }, []);

  const isAdmin = Boolean(
    currentUser &&
      currentUser.emailVerified &&
      currentUser.email?.toLowerCase() === 'solijonsolayev2003@gmail.com'
  );
  const [confirmQuickDeletePostId, setConfirmQuickDeletePostId] = useState<string | null>(null);

  const navigateToPage = (page: ActiveSectionPage) => {
    soundEffects.playClick();
    triggerSelection();
    setActiveBlogIdentifier(null);
    setActivePage(page);
    const nextHash = page === 'home' ? '#men-haqimda' : `#${page}`;
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('article');
      url.searchParams.delete('page');
      url.hash = nextHash;
      window.history.pushState('', document.title, url.toString());
    } catch {
      if (window.location.hash !== nextHash) {
        window.history.pushState(
          '',
          document.title,
          `${window.location.pathname}${window.location.search}${nextHash}`
        );
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAdminPanel = (editPostId?: string) => {
    if (editPostId) {
      setAdminInitialEditPostId(editPostId);
    }
    window.location.hash = 'admin';
    setIsAdminRoute(true);
    setActiveBlogIdentifier(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickDeleteBlogPost = async (postId: string) => {
    if (!isAdmin) return;
    const nextBlogPosts = (rawProfile.blogPosts || []).filter((p) => p.id !== postId);
    const nextProfile: ProfileData = {
      ...rawProfile,
      blogPosts: nextBlogPosts,
    };
    setRawProfile(nextProfile);
    setConfirmQuickDeletePostId(null);
    try {
      const { savePortfolioToFirestore } = await import('./lib/firebase');
      await savePortfolioToFirestore(nextProfile);
    } catch {
      // Local state is already updated
    }
  };

  const exitAdminPanel = () => {
    if (window.location.hash === '#admin') {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
    setIsAdminRoute(false);
  };

  const openBlogPost = (post: BlogPostItem) => {
    soundEffects.playClick();
    triggerSelection();
    const slugOrId = post.slug || post.id;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('article', slugOrId);
      url.hash = `blog/${encodeURIComponent(slugOrId)}`;
      window.history.pushState('', document.title, url.toString());
    } catch {
      window.location.hash = `blog/${encodeURIComponent(slugOrId)}`;
    }
    setActiveBlogIdentifier(slugOrId);
    setActivePage('blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeBlogPost = () => {
    soundEffects.playClick();
    triggerSelection();
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('article');
      url.hash = 'blog';
      window.history.pushState('', document.title, url.toString());
    } catch {
      history.pushState('', document.title, `${window.location.pathname}#blog`);
    }
    setActiveBlogIdentifier(null);
    setActivePage('blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const publishedBlogPosts = useMemo(() => {
    return (profile.blogPosts || []).filter((p) => p.published !== false);
  }, [profile.blogPosts]);

  const sortedAndFilteredBlogPosts = useMemo(() => {
    const filtered = publishedBlogPosts.filter((post) => {
      const matchesCategory =
        selectedBlogCategory === 'Barchasi' || post.category === selectedBlogCategory;
      const q = blogSearchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;
      return (
        matchesCategory &&
        (post.title.toLowerCase().includes(q) ||
          post.excerpt.toLowerCase().includes(q) ||
          (post.tags || []).some((t) => t.toLowerCase().includes(q)))
      );
    });

    return [...filtered].sort((a, b) => {
      if (blogSortOrder === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.publishedAt || '').localeCompare(a.publishedAt || '');
      }
      if (blogSortOrder === 'newest') {
        return (b.publishedAt || '').localeCompare(a.publishedAt || '');
      }
      return (a.publishedAt || '').localeCompare(b.publishedAt || '');
    });
  }, [publishedBlogPosts, selectedBlogCategory, blogSearchQuery, blogSortOrder]);

  const activeBlogPost: BlogPostItem | null = useMemo(() => {
    if (!activeBlogIdentifier) return null;
    return (
      publishedBlogPosts.find(
        (p) => p.id === activeBlogIdentifier || p.slug === activeBlogIdentifier
      ) || null
    );
  }, [publishedBlogPosts, activeBlogIdentifier]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'Barchasi') return profile.projects;
    return profile.projects.filter((p) => p.category === selectedCategory);
  }, [profile.projects, selectedCategory]);

  const activeProject: ProjectItem | null = useMemo(() => {
    if (!activeProjectId) return null;
    return profile.projects.find((p) => p.id === activeProjectId) || null;
  }, [profile.projects, activeProjectId]);

  const filteredExperience = useMemo(() => {
    if (experienceFilter === 'Barchasi') return profile.experience;
    return profile.experience.filter((e) => e.type === experienceFilter);
  }, [profile.experience, experienceFilter]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profile.personal.email);
    soundEffects.playSuccess();
    triggerSuccess();
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderContact.trim() || isSendingInquiry) return;
    setIsSendingInquiry(true);
    try {
      const { createContactInquiry } = await import('./lib/firebase');
      await createContactInquiry({
        senderName,
        senderContact,
        projectType: senderProjectType,
        message: senderMessage || `${senderProjectType} bo'yicha murojaat`,
      });
      soundEffects.playSuccess();
      triggerSuccess();
      setInquirySubmitted(true);
    } finally {
      setIsSendingInquiry(false);
    }
  };

  if (isAdminRoute) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
        <ScrollProgressBar themeMode={themeMode} />
        <FlameCursor enabled={flameCursorEnabled} />
        <AdminPanelView
          currentUser={currentUser}
          profile={rawProfile}
          alphabetMode={alphabetMode}
          onAlphabetModeChange={handleAlphabetChange}
          onUpdateLocalProfile={setRawProfile}
          onExitAdmin={exitAdminPanel}
          initialEditPostId={adminInitialEditPostId}
          onClearInitialEditPost={() => setAdminInitialEditPostId(null)}
        />
      </Suspense>
    );
  }

  if (activeBlogPost) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
        <ScrollProgressBar themeMode={themeMode} />
        <FlameCursor enabled={flameCursorEnabled} />
        <SeoHead
          rawProfile={rawProfile}
          alphabetMode={alphabetMode}
          activePage="blog"
          activeBlogPost={activeBlogPost}
        />
        <BlogArticleView
          post={activeBlogPost}
          allPosts={publishedBlogPosts}
          profile={profile}
          alphabetMode={alphabetMode}
          onAlphabetChange={handleAlphabetChange}
          onBackToBlog={closeBlogPost}
          onSelectPost={(postId) => {
            const target = publishedBlogPosts.find((p) => p.id === postId);
            if (target) openBlogPost(target);
          }}
          isAdmin={isAdmin}
          onEditPostInAdmin={(postId) => openAdminPanel(postId)}
          themeMode={themeMode}
          onToggleTheme={toggleThemeMode}
        />
        <PortfolioChatbot
          profile={profile}
          alphabetMode={alphabetMode}
          onAlphabetModeChange={handleAlphabetChange}
          isOpenExternal={isChatbotOpen}
          onOpenChangeExternal={setIsChatbotOpen}
        />
        {isCommandPaletteOpen && (
          <CommandPaletteModal
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            profile={profile}
            alphabetMode={alphabetMode}
            themeMode={themeMode}
            onToggleTheme={toggleThemeMode}
            onToggleAlphabet={() =>
              handleAlphabetChange(alphabetMode === 'new_2026' ? 'classic' : 'new_2026')
            }
            onSelectBlogPost={(post) => openBlogPost(post)}
            onSelectProject={(proj) => {
              closeBlogPost();
              setActiveProjectId(proj.id);
            }}
            onDownloadVCard={() => downloadVCard(profile)}
            onOpenQrModal={() => {
              closeBlogPost();
              setIsCardModalOpen(true);
            }}
            onOpenAiChat={() => setIsChatbotOpen(true)}
          />
        )}
      </Suspense>
    );
  }

  const { personal } = profile;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col relative selection:bg-blue-600/30 selection:text-white">
      <ScrollProgressBar themeMode={themeMode} />
      <OfflineIndicator lang={language} alphabetMode={alphabetMode} />
      <Suspense fallback={null}>
        <FlameCursor enabled={flameCursorEnabled} />
      </Suspense>
      <SeoHead
        rawProfile={rawProfile}
        alphabetMode={alphabetMode}
        activePage={activePage}
        activeBlogPost={null}
      />
      {/* Subtle Architectural Grid & Parallax Ambient Cobalt Atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-architectural-grid mask-radial-fade"
      />
      <motion.div
        aria-hidden="true"
        style={{ y: ambientGlowY }}
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[780px] h-[360px] bg-blue-600/10 blur-[140px] rounded-full z-0 will-change-transform ambient-glow-aura"
      />

      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-12 py-2.5 sm:py-3.5 bg-[#050505]/90 backdrop-blur-xl border-b border-zinc-800/80 max-w-full overflow-hidden">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#men-haqimda"
          onClick={(e) => {
            e.preventDefault();
            navigateToPage('home');
          }}
          className="font-display text-sm sm:text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 truncate max-w-[120px] xs:max-w-[150px] sm:max-w-none"
        >
          {personal.fullName}
        </a>

        {/* Zone 2: 5 concise single-line page navigation links */}
        <nav
          aria-label={getTranslation('mainNavAria', language, alphabetMode)}
          className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm font-medium text-zinc-400"
        >
          <a
            href="#men-haqimda"
            aria-current={activePage === 'home' ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault();
              navigateToPage('home');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activePage === 'home'
                ? 'text-white bg-blue-600/15 border border-blue-500/40 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/70 border border-transparent'
            }`}
          >
            {getTranslation('navAbout', language, alphabetMode)}
          </a>
          <a
            href="#loyihalar"
            aria-current={activePage === 'loyihalar' ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault();
              navigateToPage('loyihalar');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activePage === 'loyihalar'
                ? 'text-white bg-blue-600/15 border border-blue-500/40 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/70 border border-transparent'
            }`}
          >
            {getTranslation('navProjects', language, alphabetMode)}
          </a>
          <a
            href="#blog"
            aria-current={activePage === 'blog' ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault();
              navigateToPage('blog');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activePage === 'blog'
                ? 'text-white bg-blue-600/15 border border-blue-500/40 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/70 border border-transparent'
            }`}
          >
            {getTranslation('navBlog', language, alphabetMode)}
          </a>
          <a
            href="#tajriba"
            aria-current={activePage === 'tajriba' ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault();
              navigateToPage('tajriba');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activePage === 'tajriba'
                ? 'text-white bg-blue-600/15 border border-blue-500/40 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/70 border border-transparent'
            }`}
          >
            {getTranslation('navExperience', language, alphabetMode)}
          </a>
          <a
            href="#boglanish"
            aria-current={activePage === 'boglanish' ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault();
              navigateToPage('boglanish');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activePage === 'boglanish'
                ? 'text-white bg-blue-600/15 border border-blue-500/40 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/70 border border-transparent'
            }`}
          >
            {getTranslation('navContact', language, alphabetMode)}
          </a>
        </nav>

        {/* Zone 3: PWA Install, Audio FX, Language Switcher, Theme, Flame & Primary Action */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* PWA Install Button (desktop & tablet) */}
          <div className="hidden sm:inline-flex">
            <PWAInstallButton lang={language} alphabetMode={alphabetMode} />
          </div>

          {/* Sound FX Haptic Synthesizer Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            title={
              soundEnabled
                ? getTranslation('soundMute', language, alphabetMode)
                : getTranslation('soundUnmute', language, alphabetMode)
            }
            aria-label={`${getTranslation('sound', language, alphabetMode)} — ${
              soundEnabled
                ? getTranslation('soundMute', language, alphabetMode)
                : getTranslation('soundUnmute', language, alphabetMode)
            }`}
            className={`hidden sm:inline-flex px-2 sm:px-2.5 py-1.5 sm:py-2 text-xs font-medium rounded-lg border transition-all items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              soundEnabled
                ? 'bg-blue-600/15 border-blue-500/40 text-blue-300 hover:bg-blue-600/25'
                : 'bg-[#0F0F12] border-zinc-800 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
            )}
            <span className="hidden xl:inline">{getTranslation('sound', language, alphabetMode)}</span>
          </button>

          {/* Dual Language Switcher: O'zbekcha / English */}
          <button
            type="button"
            onClick={() => handleLanguageChange(language === 'uz' ? 'en' : 'uz')}
            title={language === 'uz' ? 'Switch interface to English' : "Interfeysni o'zbek tiliga o'tkazish"}
            aria-label={language === 'uz' ? 'OʻZ — Switch interface to English' : "EN — Interfeysni o'zbek tiliga o'tkazish"}
            className="px-2 sm:px-2.5 py-1.5 sm:py-2 text-xs font-medium rounded-lg border border-zinc-800 bg-[#0F0F12] text-zinc-300 hover:text-white hover:border-zinc-700 transition-all inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold">{language === 'uz' ? 'OʻZ' : 'EN'}</span>
          </button>

          {/* Dual Theme Mode Toggle: Tun (Default) / Kun (Hashamatli oq-sariq) */}
          <button
            type="button"
            onClick={toggleThemeMode}
            title={
              themeMode === 'dark'
                ? getTranslation('toDayMode', language, alphabetMode)
                : getTranslation('toNightMode', language, alphabetMode)
            }
            aria-label={
              themeMode === 'dark'
                ? `${getTranslation('dayMode', language, alphabetMode)} — ${getTranslation('toDayMode', language, alphabetMode)}`
                : `${getTranslation('nightMode', language, alphabetMode)} — ${getTranslation('toNightMode', language, alphabetMode)}`
            }
            className={`px-2 sm:px-2.5 py-1.5 sm:py-2 text-xs font-medium rounded-lg border transition-all inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
              themeMode === 'light'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 shadow-sm shadow-amber-500/10 hover:bg-amber-500/25'
                : 'bg-[#0F0F12] border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
            }`}
          >
            {themeMode === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{getTranslation('dayMode', language, alphabetMode)}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">{getTranslation('nightMode', language, alphabetMode)}</span>
              </>
            )}
          </button>

          {/* Interactive Flame Cursor Toggle (large screens) */}
          <button
            type="button"
            onClick={toggleFlameCursor}
            title={
              flameCursorEnabled
                ? getTranslation('flameCursorDisable', language, alphabetMode)
                : getTranslation('flameCursorEnable', language, alphabetMode)
            }
            aria-pressed={flameCursorEnabled}
            className={`hidden lg:inline-flex px-2.5 sm:px-3 py-2 text-xs font-medium rounded-lg border transition-all items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              flameCursorEnabled
                ? 'bg-orange-500/15 border-orange-500/50 text-orange-300 shadow-sm shadow-orange-500/20 hover:bg-orange-500/25'
                : 'bg-[#0F0F12] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                flameCursorEnabled ? 'text-orange-400 animate-pulse' : 'text-zinc-500'
              }`}
            />
            <span>{getTranslation('flameCursor', language, alphabetMode)}</span>
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              soundEffects.playClick();
              triggerMedium();
              setIsCardModalOpen(true);
            }}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-lg shadow-blue-600/20"
          >
            {getTranslation('digitalCard', language, alphabetMode)}
          </motion.button>
        </div>
      </header>

      <main id="top" className="flex-1 relative z-10 pb-20 md:pb-0">
        {/* Mobile Quick Utility Bar */}
        <div className="md:hidden border-b border-zinc-800/80 bg-[#0A0A0D]/95 backdrop-blur-md px-3 py-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setIsCommandPaletteOpen(true);
            }}
            title={language === 'en' ? 'Quick search & command palette' : tr('Tezkor qidiruv va buyruqlar oynasi')}
            className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0F0F12] border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer inline-flex items-center justify-between"
          >
            <span className="inline-flex items-center gap-1.5 truncate">
              <Search className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{getTranslation('search', language, alphabetMode)}</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono-tabular bg-zinc-900 border border-zinc-800 rounded text-zinc-400 shrink-0">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={toggleSound}
              title={soundEnabled ? 'Mute' : 'Unmute'}
              className="p-2 text-xs font-medium rounded-lg bg-[#0F0F12] border border-zinc-800 text-zinc-300 cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleFlameCursor}
              title={flameCursorEnabled ? 'Disable Flame' : 'Enable Flame'}
              className="p-2 text-xs font-medium rounded-lg bg-[#0F0F12] border border-zinc-800 text-zinc-300 cursor-pointer"
            >
              <Flame className={`w-3.5 h-3.5 ${flameCursorEnabled ? 'text-orange-400' : 'text-zinc-500'}`} />
            </button>
          </div>
        </div>

        {/* Mobile Floating Bottom Thumb Dock Navigation (< md) */}
        <div
          aria-label={getTranslation('mainNavAria', language, alphabetMode)}
          className="md:hidden fixed bottom-3 left-3 right-3 z-50 flex items-center justify-around gap-1 p-1.5 rounded-2xl bg-[#0F0F12]/95 backdrop-blur-2xl border border-zinc-800/90 shadow-2xl shadow-black/90 max-w-md mx-auto"
        >
          {(
            [
              { id: 'home', labelKey: 'navAbout' as const, icon: Info },
              { id: 'loyihalar', labelKey: 'navProjects' as const, icon: Code2 },
              { id: 'blog', labelKey: 'navBlog' as const, icon: BookOpen },
              { id: 'tajriba', labelKey: 'navExperience' as const, icon: Layers },
              { id: 'boglanish', labelKey: 'navContact' as const, icon: Mail },
            ] as const
          ).map((tab) => {
            const isActive = activePage === tab.id;
            const IconComponent = tab.icon;
            const label = getTranslation(tab.labelKey, language, alphabetMode);

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigateToPage(tab.id)}
                className={`relative flex-1 py-2 px-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer select-none ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobileBottomDockActiveTab"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 bg-blue-600 rounded-xl shadow-md shadow-blue-600/35 -z-0"
                  />
                )}
                <IconComponent className="w-4 h-4 relative z-10 shrink-0" />
                <span className="text-[10px] font-medium leading-none tracking-tight relative z-10 truncate max-w-[62px]">
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dedicated Sub-Page Top Bar (shown when viewing Loyihalar, Blog, Faoliyat, or Bog'lanish as a standalone page) */}
        {activePage !== 'home' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-2">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigateToPage('home')}
                  className="px-3.5 py-2 text-xs font-medium text-zinc-200 bg-[#0F0F12] border border-zinc-800 rounded-lg hover:border-blue-500/50 hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
                  <span>{getTranslation('backToHome', language, alphabetMode)}</span>
                </button>
                <span aria-hidden="true" className="text-zinc-600 hidden sm:inline">
                  /
                </span>
                <span className="text-xs font-mono-tabular text-blue-400 hidden sm:inline">
                  {activePage === 'loyihalar' && (language === 'en' ? 'Projects Page' : tr('Loyihalar sahifasi'))}
                  {activePage === 'blog' && (language === 'en' ? 'Personal Blog' : tr('Shaxsiy Blog sahifasi'))}
                  {activePage === 'tajriba' && (language === 'en' ? 'Experience & Live Ecosystem' : tr("Faoliyat, Ko'nikmalar va Jonli Ekotizim"))}
                  {activePage === 'boglanish' && (language === 'en' ? 'Contact & Inquiries' : tr("Bog'lanish va Murojaat sahifasi"))}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Language Switcher */}
                <button
                  type="button"
                  onClick={() => handleLanguageChange(language === 'uz' ? 'en' : 'uz')}
                  title={language === 'uz' ? 'Switch interface to English' : "Interfeysni o'zbek tiliga o'tkazish"}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-800 bg-[#0F0F12] text-zinc-300 hover:text-white hover:border-zinc-700 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold">{language === 'uz' ? 'OʻZ' : 'EN'}</span>
                </button>

                {language === 'uz' && (
                  <div
                    role="group"
                    aria-label={tr("O'zbek alifbosini tanlash")}
                    className="flex items-center gap-1 p-1 bg-[#0F0F12] border border-zinc-800 rounded-lg"
                  >
                    {(
                      [
                        {
                          id: 'new_2026',
                          label: 'Ö Ğ Ş Ç · Yangi',
                          title: 'Yangilangan özbek lotin alifbosi (2026)',
                        },
                        {
                          id: 'classic',
                          label: 'Oʻ Gʻ Sh Ch · Amaldagi',
                          title: "Amaldagi o'zbek lotin alifbosi",
                        },
                      ] as const
                    ).map((item) => {
                      const isActive = alphabetMode === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAlphabetChange(item.id)}
                          title={item.title}
                          className={`relative px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="activeSubpageAlphabetSwitch"
                              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                              className="absolute inset-0 bg-blue-600 rounded-md -z-0"
                            />
                          )}
                          <span className="relative z-10">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  type="button"
                  onClick={toggleThemeMode}
                  title={
                    themeMode === 'dark'
                      ? tr("Kunduzgi hashamatli rejimga o'tish (Oq-sariq va oltin-qum)")
                      : tr("Tungi rejimga o'tish (Qorong'i)")
                  }
                  aria-label={
                    themeMode === 'dark'
                      ? `${tr('Kun')} — ${tr('Kunduzgi rejim')}`
                      : `${tr('Tun')} — ${tr('Tungi rejim')}`
                  }
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    themeMode === 'light'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 shadow-sm shadow-amber-500/10 hover:bg-amber-500/25'
                      : 'bg-[#0F0F12] border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {themeMode === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>{tr('Kun')}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-amber-700" />
                      <span>{tr('Tun')}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="px-3 py-2 text-xs font-medium text-zinc-300 bg-[#0F0F12] border border-zinc-800 rounded-lg hover:border-blue-500/50 hover:text-white transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-blue-400" />
                  <span>{getTranslation('search', language, alphabetMode)}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activePage === 'home' && (
          <>
            {/* Split-Screen Hero Section with Subtle Scroll Parallax */}
            <section
              ref={heroSectionRef}
              id="men-haqimda"
              className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-16 lg:pt-16 lg:pb-24"
            >
          {/* Role, Status & Dual Uzbek Alphabet Switcher Row */}
          <div
            className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-zinc-800/80"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
              <span className="text-zinc-200 font-medium">{personal.role}</span>
              <span aria-hidden="true">·</span>
              <span>{personal.location}</span>
              <span aria-hidden="true">·</span>
              <span className="text-blue-400">{personal.availability}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Dual Language Switcher: OʻZ / EN */}
              <button
                type="button"
                onClick={() => handleLanguageChange(language === 'uz' ? 'en' : 'uz')}
                title={language === 'uz' ? 'Switch interface to English' : "Interfeysni o'zbek tiliga o'tkazish"}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-zinc-800 bg-[#0F0F12] text-zinc-300 hover:text-white hover:border-zinc-700 transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>{language === 'uz' ? 'OʻZ' : 'EN'}</span>
              </button>

              {/* Animated Dual Uzbek Alphabet Switcher (active when in Uzbek) */}
              {language === 'uz' && (
                <div
                  role="group"
                  aria-label={tr("O'zbek alifbosini tanlash")}
                  className="flex items-center gap-1 p-1 bg-[#0F0F12] border border-zinc-800 rounded-lg"
                >
                  {(
                    [
                      {
                        id: 'new_2026',
                        label: 'Ö Ğ Ş Ç · Yangi',
                        title: 'Yangilangan özbek lotin alifbosi (2026)',
                      },
                      {
                        id: 'classic',
                        label: 'Oʻ Gʻ Sh Ch · Amaldagi',
                        title: "Amaldagi o'zbek lotin alifbosi",
                      },
                    ] as const
                  ).map((item) => {
                    const isActive = alphabetMode === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleAlphabetChange(item.id)}
                        title={item.title}
                        className={`relative px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="activeAlphabetSwitch"
                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                            className="absolute inset-0 bg-blue-600 rounded-md -z-0"
                          />
                        )}
                        <span className="relative z-10">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={toggleThemeMode}
                title={
                  themeMode === 'dark'
                    ? tr("Kunduzgi hashamatli rejimga o'tish (Oq-sariq va oltin-qum)")
                    : tr("Tungi rejimga o'tish (Qorong'i)")
                }
                aria-label={
                  themeMode === 'dark'
                    ? `${tr('Kun')} — ${tr('Kunduzgi rejim')}`
                    : `${tr('Tun')} — ${tr('Tungi rejim')}`
                }
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  themeMode === 'light'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-900 shadow-sm shadow-amber-500/10 hover:bg-amber-500/25'
                    : 'bg-[#0F0F12] border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                }`}
              >
                {themeMode === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>{tr('Kun')}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-amber-700" />
                    <span>{tr('Tun')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setIsCommandPaletteOpen(true);
                }}
                title={language === 'en' ? 'Quick search & command palette (Ctrl+K)' : tr('Tezkor qidiruv va buyruqlar oynasi (Ctrl+K)')}
                className="px-3 py-2 text-xs font-medium text-zinc-300 bg-[#0F0F12] border border-zinc-800 rounded-lg hover:border-blue-500/50 hover:text-white transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <span>{getTranslation('search', language, alphabetMode)}</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono-tabular bg-zinc-900 border border-zinc-700 rounded text-zinc-400">
                  ⌘K
                </kbd>
              </button>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  soundEffects.playSuccess();
                  triggerSuccess();
                  downloadVCard(profile);
                }}
                className="px-3.5 py-2 text-xs font-medium text-zinc-200 bg-[#0F0F12] border border-zinc-800 rounded-lg hover:border-zinc-700 hover:text-white transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                {language === 'en' ? 'Download vCard (.vcf)' : tr('vCard (.vcf) yuklash')}
              </motion.button>
            </div>
          </div>

          {/* 2-Column Split-Screen Hero with Counter-Balanced Parallax */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Column: Typographic Hierarchy with Upward Parallax Drift */}
            <motion.div
              style={{ y: heroLeftY }}
              className="lg:col-span-7 flex flex-col justify-between space-y-8 will-change-transform"
            >
              <div className="space-y-5">
                <p className="text-xs md:text-sm text-blue-400/90 font-medium tracking-wide">
                  {personal.kicker}
                </p>

                <h1
                  className="font-display text-3xl sm:text-4xl lg:text-[2.95rem] font-bold tracking-tight text-white leading-[1.14]"
                  style={{ textWrap: 'balance' }}
                >
                  {personal.headline}
                </h1>

                <p className="text-base text-zinc-300 leading-relaxed max-w-2xl">
                  {personal.shortBio}
                </p>

                <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
                  {personal.detailedBio}
                </p>
              </div>

              {/* Primary CTAs & Official Links Row */}
              <div className="space-y-6 pt-2">
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-3.5 max-w-full">
                  <motion.a
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    href="#loyihalar"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToPage('loyihalar');
                    }}
                    className="w-full sm:w-auto justify-center px-5 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 shadow-lg shadow-blue-600/20"
                  >
                    {tr('GitHub loyihalarim')} <ArrowUpRight className="w-4 h-4" />
                  </motion.a>

                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsCardModalOpen(true)}
                    className="w-full sm:w-auto justify-center px-5 py-3 text-sm font-medium text-zinc-100 bg-[#0F0F12] border border-zinc-800 rounded-lg hover:border-zinc-700 hover:text-white transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-blue-500" /> {tr('Barcha havolalar & QR')}
                  </motion.button>

                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleCopyEmail}
                    className="w-full sm:w-auto justify-center px-4 py-3 text-sm font-medium text-zinc-300 bg-transparent border border-zinc-800/80 rounded-lg hover:border-zinc-700 hover:text-white transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer min-w-0"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" /> {tr('Email nusxalandi')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-zinc-400 shrink-0" /> <span className="truncate max-w-[200px] xs:max-w-none">{personal.email}</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Unboxed Official Platform & Project Links Line */}
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-xs text-zinc-400 pt-3 border-t border-zinc-900">
                  <a
                    href="https://solaris3d.uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors font-medium text-zinc-200"
                  >
                    solaris3d.uz
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href="https://tilimlo.uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors font-medium text-zinc-200"
                  >
                    tilimlo.uz
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href={personal.taplink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Taplink
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href={personal.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    GitHub (@SolijonSolayev)
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href={personal.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    solijonsolayev.github.io
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href={personal.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    YouTube
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href={personal.wikipedia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Vikipediya
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href={personal.commons}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Vikiombor
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Interactive 3D Tilt + Scroll Parallax Showcase Card */}
            <motion.div
              style={{ y: heroRightY }}
              className="lg:col-span-5 flex will-change-transform"
            >
              <SpotlightCard
                enableTilt={true}
                className="w-full min-h-[340px] lg:h-full rounded-2xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/40 transition-colors shadow-2xl"
              >
                {!heroImgError && personal.heroImageUrl ? (
                  <div className="absolute inset-0">
                    <ParallaxImage
                      src={personal.heroImageUrl}
                      alt={tr(`${personal.fullName} ish stoli va dasturlash muhiti`)}
                      onError={() => setHeroImgError(true)}
                      intensity={22}
                      priority={true}
                      className="transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-[#0F0F12] to-[#050505] flex items-center justify-center">
                    <Terminal className="w-12 h-12 text-blue-500/50" />
                  </div>
                )}

                {/* Measured contrast scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

                {/* Interactive Business Card Overlay Footer */}
                <div className="relative z-10 mt-auto p-6 md:p-7 space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-mono-tabular text-blue-400">
                      {personal.yearsOfExperience} · {personal.location}
                    </p>
                    <h2 className="font-display text-2xl font-bold text-white">
                      {personal.fullName}
                    </h2>
                    <p className="text-xs text-zinc-300">{personal.role}</p>
                  </div>

                  <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-3">
                    <a
                      href={personal.taplink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-200 hover:text-white truncate"
                    >
                      taplink.cc/solijon_solayev
                    </a>
                    <button
                      type="button"
                      onClick={() => downloadVCard(profile)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-white/15 hover:bg-white/25 backdrop-blur-xs rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {tr('vCard yuklash')}
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          </div>

          {/* Full-Width 4-Column Summary Row Below Hero Split using Card10 Statistics Cards */}
          <motion.div
            style={{ y: heroMetricsY }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-10 border-t border-zinc-800/80 will-change-transform"
          >
            {profile.metrics.map((item, idx) => {
              const metaMap: Record<
                string,
                {
                  icon: React.ReactNode;
                  category: string;
                  badge: string;
                  actionText?: string;
                  onClick?: () => void;
                }
              > = {
                m1: {
                  icon: <Sparkles className="w-5 h-5 text-blue-400" />,
                  category: tr('Astronomiya · 3D'),
                  badge: 'solaris3d.uz',
                  actionText: tr('solaris3d.uz ga oʻtish'),
                  onClick: () => window.open('https://solaris3d.uz', '_blank', 'noopener,noreferrer'),
                },
                m2: {
                  icon: <BookOpen className="w-5 h-5 text-blue-400" />,
                  category: tr('Oʻzbek Tili · Imlo'),
                  badge: 'tilimlo.uz',
                  actionText: tr('tilimlo.uz ga oʻtish'),
                  onClick: () => window.open('https://tilimlo.uz', '_blank', 'noopener,noreferrer'),
                },
                m3: {
                  icon: <Code2 className="w-5 h-5 text-blue-400" />,
                  category: tr('Ochiq Kodli Dasturlar'),
                  badge: 'GitHub',
                  actionText: tr('Dasturlarni koʻrish'),
                  onClick: () => navigateToPage('loyihalar'),
                },
                m4: {
                  icon: <Globe className="w-5 h-5 text-blue-400" />,
                  category: tr('Erkin Bilim & Media'),
                  badge: 'Viki-Faoliyat',
                  actionText: tr('Ekotizimni koʻrish'),
                  onClick: () => navigateToPage('tajriba'),
                },
              };

              const currentMeta = metaMap[item.id] || {
                icon: <Code2 className="w-5 h-5 text-blue-400" />,
                category: tr('Faoliyat'),
                badge: 'IT Portfolio',
                actionText: undefined,
                onClick: undefined,
              };

              return (
                <Card10
                  key={item.id}
                  title={item.label}
                  value={item.value}
                  description={item.context}
                  category={currentMeta.category}
                  badge={currentMeta.badge}
                  icon={currentMeta.icon}
                  onClick={currentMeta.onClick}
                  actionText={currentMeta.actionText}
                />
              );
            })}
          </motion.div>
        </section>

        {/* Subtle Editorial Marquee Ribbon Divider */}
        <div className="border-y border-zinc-800/80 bg-[#0A0A0D]/90 py-3.5 overflow-hidden select-none">
          <div className="animate-marquee flex items-center gap-8 text-xs text-zinc-400">
            {Array.from({ length: 2 }).map((_, loopIdx) => (
              <div key={loopIdx} className="flex items-center gap-8 shrink-0">
                <span>
                  {tr('Solaris 3D (solaris3d.uz) · Tilimlo.uz · Frontend Web Development')}
                </span>
                <span aria-hidden="true" className="text-blue-500">
                  ·
                </span>
                <span>
                  {tr('GitHub Ochiq Manbali Dasturlar (usb-formatter · AqlliTozalash)')}
                </span>
                <span aria-hidden="true" className="text-blue-500">
                  ·
                </span>
                <span>{tr("O'zbekcha Vikipediya va Vikiombor Faoli")}</span>
                <span aria-hidden="true" className="text-blue-500">
                  ·
                </span>
                <span>{tr('YouTube (@Solijon_Solayev) va «Fikr qilamiz» Blogi')}</span>
                <span aria-hidden="true" className="text-blue-500">
                  ·
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Concise Section Previews on Home Page ("Men haqimda" is primary; other sections show key highlights & open as dedicated pages) */}
        <section
          aria-label={tr("Bo'limlar bo'yicha qisqacha prevyu")}
          className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20 space-y-16"
        >
          {/* 1. Loyihalar Concise Preview (Top 2 Projects) */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-5">
              <div className="space-y-1">
                <p className="text-xs text-blue-400 font-medium">
                  {tr('01 · Loyihalar Prevyusi')}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {tr('Eng muhim veb va ochiq kodli loyihalar')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigateToPage('loyihalar')}
                className="px-4 py-2.5 text-xs font-medium text-white bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/50 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer group"
              >
                <span>
                  {tr('Barcha loyihalar sahifasiga oʻtish')} ({profile.projects.length})
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.projects.slice(0, 6).map((project) => (
                <Card10
                  key={project.id}
                  title={project.title}
                  value={project.impactMetric}
                  description={project.summary}
                  category={project.category}
                  badge={project.year === '2025' ? '2026' : project.year}
                  imageUrl={project.imageUrl}
                  subMetrics={project.technologies.slice(0, 2).map((t) => ({ label: tr('Texnologiya'), value: t }))}
                  actionText={tr('Toʻliq tafsilotlar')}
                  onClick={() => setActiveProjectId(project.id)}
                />
              ))}
            </div>
          </div>

          {/* 2. Blog Concise Preview (Top 2 Articles) */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-5">
              <div className="space-y-1">
                <p className="text-xs text-blue-400 font-medium">
                  {tr('02 · Shaxsiy Blog Prevyusi («Fikr qilamiz»)')}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {tr("So'nggi va tanlangan maqolalar")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigateToPage('blog')}
                className="px-4 py-2.5 text-xs font-medium text-white bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/50 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer group"
              >
                <span>
                  {tr('Blog sahifasiga oʻtish')} ({publishedBlogPosts.length})
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedAndFilteredBlogPosts.slice(0, 2).map((post) => (
                <SpotlightCard
                  key={post.id}
                  as="article"
                  onClick={() => openBlogPost(post)}
                  className="group p-6 rounded-2xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/40 flex flex-col justify-between space-y-4 transition-colors cursor-pointer"
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span className="text-blue-400 font-medium">{tr(post.category)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">
                        {formatUzbekDate(post.publishedAt, alphabetMode)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">{post.readTime}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                      <a
                        href={`?article=${encodeURIComponent(post.slug || post.id)}#blog/${encodeURIComponent(post.slug || post.id)}`}
                        onClick={(e) => {
                          e.preventDefault();
                          openBlogPost(post);
                        }}
                      >
                        {post.title}
                      </a>
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="font-mono-tabular text-zinc-500 truncate">
                      {(post.tags || [])
                        .slice(0, 3)
                        .map((t) => `#${t}`)
                        .join(' · ')}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-white group-hover:text-blue-400 transition-colors shrink-0">
                      {tr("Maqolani o'qish")} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>

          {/* 3. Faoliyat & Tajriba Concise Preview */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-5">
              <div className="space-y-1">
                <p className="text-xs text-blue-400 font-medium">
                  {tr("03 · Faoliyat, Texnologiyalar va Jonli Ekotizim Prevyusi")}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {tr("Amaliy tajriba, ko'nikmalar va Vikipediya faoliyati")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigateToPage('tajriba')}
                className="px-4 py-2.5 text-xs font-medium text-white bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/50 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer group"
              >
                <span>{tr("To'liq faoliyat sahifasiga oʻtish")}</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card10
                title={tr('Faoliyat va Tajriba')}
                value={profile.experience[0]?.period || tr('Hozirgi vaqtda')}
                description={profile.experience[0]?.description || tr('Mustaqil veb va ochiq kodli loyihalar')}
                category={tr('Faoliyat')}
                badge={tr('Amaliy tajriba')}
                subMetrics={profile.experience.slice(0, 2).map((exp) => ({ label: exp.company, value: exp.role }))}
                actionText={tr("To'liq faoliyat xronologiyasi")}
                onClick={() => navigateToPage('tajriba')}
              />

              <Card10
                title={tr("Texnik Stack & Ekotizim")}
                value="React · TypeScript · Python"
                description={tr("Frontend arxitektura, tizim avtomatizatsiyasi va Vikipediya erkin bilim ulashish faoliyati.")}
                category={tr('Texnologiyalar')}
                badge={tr('Frontend & IT')}
                subMetrics={[
                  { label: 'Platforma', value: 'Solaris 3D · Tilimlo' },
                  { label: 'Ochiq Kod', value: 'GitHub & Vikiombor' },
                ]}
                actionText={tr("Jonli ekotizim va tajribani ko'rish")}
                onClick={() => navigateToPage('tajriba')}
              />
            </div>
          </div>

          {/* 4. Bog'lanish Concise Callout Banner */}
          <SpotlightCard className="p-6 sm:p-8 rounded-2xl bg-[#0F0F12] border border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <p className="text-xs text-blue-400 font-medium">
                {tr("04 · Bog'lanish va Hamkorlik")}
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                {tr('Savol, taklif yoki loyiha boʻyicha murojaat qiling')}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {tr(
                  "Barcha rasmiy sahifalarim, Taplink muloqot qoidasi va to'g'ridan-to'g'ri xabar yuborish formasi alohida Bog'lanish sahifasida jamlangan."
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-4 py-2.5 text-xs font-medium text-zinc-200 bg-[#050505] border border-zinc-800 rounded-lg hover:border-zinc-700 hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{tr('Email nusxalandi')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{personal.email}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigateToPage('boglanish')}
                className="px-5 py-2.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
              >
                <span>{tr("Bog'lanish sahifasiga o'tish")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </SpotlightCard>
        </section>
          </>
        )}

        {activePage === 'tajriba' && (
        <section
          id="faoliyat"
          className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16 border-b border-zinc-800/80"
        >
          <ParallaxLayer offsetY={[18, -14]}>
            <div className="space-y-2 max-w-2xl mb-14">
              <p className="text-xs text-blue-400 font-medium">
                {tr("Asosiy Yo'nalishlar va Qiziqishlar")}
              </p>
              <h2
                className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                {tr('Veb-dasturlash, foydali ochiq kodli vositalar va erkin bilim ulashish')}
              </h2>
            </div>
          </ParallaxLayer>

          {/* 4 Curated Editorial Activity Blocks with Spotlight Hover */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {profile.services.map((service, idx) => (
              <ParallaxLayer
                key={service.id}
                offsetY={idx % 2 === 0 ? [18, -16] : [28, -12]}
                className="h-full"
              >
                <Card10
                  title={service.title}
                  value={service.number}
                  description={service.description}
                  category={tr('Yoʻnalish')}
                  badge={service.technologies[0] || 'Dasturlash'}
                  subMetrics={service.deliverables.slice(0, 2).map((del) => ({
                    label: tr('Natija'),
                    value: del,
                  }))}
                  actionText={tr('Murojaat va bogʻlanish')}
                  onClick={() => navigateToPage('boglanish')}
                  className="h-full"
                />
              </ParallaxLayer>
            ))}
          </div>

          {/* Structured Technical Stack Matrix */}
          <ParallaxLayer offsetY={[14, -10]} className="mt-14 pt-12 border-t border-zinc-800/80">
            <h3 className="font-display text-lg font-semibold text-white mb-6">
              {tr('Foydalanadigan Texnologiyalar va Platformalarim')}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {profile.skillGroups.map((group) => (
                <div key={group.id} className="space-y-3">
                  <h4 className="text-sm font-medium text-blue-400">{group.category}</h4>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm text-zinc-300 leading-relaxed">
                    {group.items.map((skill, idx) => (
                      <React.Fragment key={skill}>
                        <span className="hover:text-white transition-colors">{skill}</span>
                        {idx < group.items.length - 1 && (
                          <span aria-hidden="true" className="text-zinc-600">
                            ·
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ParallaxLayer>
        </section>
        )}

        {/* Media-First Bento Grid Portfolio Section with Staggered Card & Inner Image Parallax */}
        {activePage === 'loyihalar' && (
        <section
          id="loyihalar"
          className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16 border-b border-zinc-800/80"
        >
          <ParallaxLayer offsetY={[18, -14]}>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs text-blue-400 font-medium">
                  {tr('GitHub va Veb Loyihalarim')}
                </p>
                <h2
                  className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  {tr('Ochiq kodli dasturlar, tizim skriptlari va frontend ishlanmalar')}
                </h2>
              </div>

              {/* Interactive Filter Controls with Animated Active Tab Indicator */}
              <div className="flex items-center gap-1 p-1 bg-[#0F0F12] border border-zinc-800 rounded-lg overflow-x-auto w-max max-w-full">
                {(
                  ['Barchasi', 'Veb-loyihalar', 'Foydali dasturlar', 'Ochiq bilim va Media'] as const
                ).map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`relative px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeProjectCategoryTab"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          className="absolute inset-0 bg-blue-600 rounded-md shadow-xs"
                        />
                      )}
                      <span className="relative z-10">{tr(cat)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </ParallaxLayer>

          {/* Dynamic Animated Bento Grid with Staggered Scroll Parallax */}
          <motion.div layout className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => {
                const isWide = index === 0 && selectedCategory === 'Barchasi';
                const hasImgFailed = failedProjectImages[project.id];
                const cardParallaxOffset: [number, number] = isWide
                  ? [16, -16]
                  : index % 2 === 0
                  ? [24, -18]
                  : [34, -10];

                return (
                  <motion.div
                    layout
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.96, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className={isWide ? 'lg:col-span-2 lg:row-span-2' : 'col-span-1 row-span-1'}
                  >
                    <ParallaxLayer offsetY={cardParallaxOffset} className="h-full">
                      <Card10
                        title={project.title}
                        value={project.impactMetric}
                        description={project.summary}
                        category={project.category}
                        badge={`${project.year === '2025' ? '2026' : project.year} · ${project.client}`}
                        imageUrl={project.imageUrl}
                        subMetrics={project.technologies.slice(0, 4).map((tech) => ({
                          label: 'Tech',
                          value: tech,
                        }))}
                        actionText={tr('Batafsil loyiha sahifasi')}
                        onClick={() => setActiveProjectId(project.id)}
                        className="h-full"
                      />
                    </ParallaxLayer>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </section>
        )}

        {/* Personal Blog & Articles Section (#blog) */}
        {activePage === 'blog' && (
        <section
          id="blog"
          className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16 border-b border-zinc-800/80"
        >
          <ParallaxLayer offsetY={[18, -14]}>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs text-blue-400 font-medium">
                  {tr('Shaxsiy Blog va Maqolalar («Fikr qilamiz»)')}
                </p>
                <h2
                  className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  {tr("Dasturlash, 3D astronomiya, o'zbek tili imlosi va shaxsiy mulohazalar")}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href="/rss.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 text-xs font-medium text-zinc-300 bg-[#0F0F12] border border-zinc-800 rounded-lg hover:border-amber-500/50 hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Rss className="w-3.5 h-3.5 text-amber-400" />
                  <span>{tr('RSS Oqimi')}</span>
                </a>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => openAdminPanel()}
                    className="px-4 py-2.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-lg shadow-blue-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    {tr('Admin orqali yangi post yozish')}
                  </button>
                )}
              </div>
            </div>

            {/* Blog Category Tabs, Sort Controls & Search Bar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-8 mb-8 border-b border-zinc-800/80">
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-[#0F0F12] border border-zinc-800 rounded-lg overflow-x-auto w-max max-w-full">
                {(
                  [
                    'Barchasi',
                    'Dasturlash va IT',
                    'Astronomiya va Fan',
                    "O'zbek tili va Imlo",
                    'Shaxsiy fikrlar',
                  ] as const
                ).map((cat) => {
                  const isActive = selectedBlogCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedBlogCategory(cat)}
                      className={`relative px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeBlogCategoryTab"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          className="absolute inset-0 bg-blue-600 rounded-md"
                        />
                      )}
                      <span className="relative z-10">{tr(cat)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sorting & Search Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 p-1 bg-[#0F0F12] border border-zinc-800 rounded-lg">
                  {(
                    [
                      { id: 'featured', label: 'Muhim va yangilar' },
                      { id: 'newest', label: 'Eng yangilari' },
                      { id: 'oldest', label: 'Xronologik' },
                    ] as const
                  ).map((sortOpt) => (
                    <button
                      key={sortOpt.id}
                      type="button"
                      onClick={() => setBlogSortOrder(sortOpt.id)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        blogSortOrder === sortOpt.id
                          ? 'bg-zinc-800 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tr(sortOpt.label)}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={blogSearchQuery}
                    onChange={(e) => setBlogSearchQuery(e.target.value)}
                    placeholder={tr('Maqolalardan qidirish...')}
                    className="w-full pl-8 pr-3.5 py-1.5 text-xs bg-[#0F0F12] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </ParallaxLayer>

          {sortedAndFilteredBlogPosts.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#0F0F12] border border-zinc-800 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-medium text-zinc-300">
                {tr("Tanlangan bo'lim yoki qidiruv bo'yicha maqolalar topilmadi")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedBlogCategory('Barchasi');
                  setBlogSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-white transition-colors cursor-pointer"
              >
                {tr("Barcha maqolalarni ko'rsatish")}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Featured Top Article Banner (when showing all without search filter) */}
              {selectedBlogCategory === 'Barchasi' &&
                !blogSearchQuery.trim() &&
                sortedAndFilteredBlogPosts.length > 0 && (
                  <ParallaxLayer offsetY={[16, -14]}>
                    {(() => {
                      const leadPost = sortedAndFilteredBlogPosts[0];
                      const hasFailed = failedBlogImages[leadPost.id];
                      return (
                        <SpotlightCard
                          as="article"
                          onClick={() => openBlogPost(leadPost)}
                          className="group rounded-2xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/40 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-colors cursor-pointer"
                        >
                          <div className="lg:col-span-6 relative aspect-video lg:aspect-auto lg:min-h-[320px] bg-[#050505] border-b lg:border-b-0 lg:border-r border-zinc-800 overflow-hidden">
                            {!hasFailed && leadPost.imageUrl ? (
                              <ParallaxImage
                                src={leadPost.imageUrl}
                                alt={leadPost.title}
                                onError={() =>
                                  setFailedBlogImages((prev) => ({
                                    ...prev,
                                    [leadPost.id]: true,
                                  }))
                                }
                                intensity={16}
                                className="group-hover:scale-[1.03] transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-zinc-900 via-[#0F0F12] to-[#050505]">
                                <BookOpen className="w-10 h-10 text-blue-500/60 mb-2" />
                                <span className="text-xs text-zinc-400">
                                  {tr(leadPost.category)}
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
                          </div>

                          <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                            <div className="space-y-3.5">
                              {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
                              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-400">
                                {leadPost.featured && (
                                  <>
                                    <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                                      <Sparkles className="w-3.5 h-3.5" />
                                      {tr('Asosiy maqola')}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                  </>
                                )}
                                <span className="text-blue-400 font-medium">
                                  {tr(leadPost.category)}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="inline-flex items-center gap-1 font-mono-tabular">
                                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                  {formatUzbekDate(leadPost.publishedAt, alphabetMode)}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="inline-flex items-center gap-1 font-mono-tabular">
                                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                  {leadPost.readTime}
                                </span>
                              </div>

                              <h3 className="font-display text-xl sm:text-2xl lg:text-[1.7rem] font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                                <a
                                  href={`?article=${encodeURIComponent(leadPost.slug || leadPost.id)}#blog/${encodeURIComponent(leadPost.slug || leadPost.id)}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    openBlogPost(leadPost);
                                  }}
                                >
                                  {leadPost.title}
                                </a>
                              </h3>

                              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed line-clamp-3">
                                {leadPost.excerpt}
                              </p>
                            </div>

                            <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono-tabular text-zinc-400">
                                {(leadPost.tags || []).slice(0, 4).map((tag, tIdx, arr) => (
                                  <React.Fragment key={tag}>
                                    <span>#{tag}</span>
                                    {tIdx < arr.length - 1 && (
                                      <span aria-hidden="true" className="text-zinc-600">
                                        ·
                                      </span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                {isAdmin && (
                                  <div
                                    className="flex items-center gap-1.5 mr-2"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => openAdminPanel(leadPost.id)}
                                      className="px-2.5 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      {tr('Tahrirlash')}
                                    </button>
                                    {confirmQuickDeletePostId === leadPost.id ? (
                                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950/70 border border-rose-800">
                                        <button
                                          type="button"
                                          onClick={() => handleQuickDeleteBlogPost(leadPost.id)}
                                          className="px-1.5 py-0.5 text-[11px] font-semibold text-white bg-rose-600 rounded hover:bg-rose-500 cursor-pointer"
                                        >
                                          {tr('Ha')}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setConfirmQuickDeletePostId(null)}
                                          className="px-1.5 py-0.5 text-[11px] text-zinc-300 hover:text-white cursor-pointer"
                                        >
                                          {tr("Yo'q")}
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmQuickDeletePostId(leadPost.id)}
                                        className="px-2.5 py-1 text-xs font-medium text-rose-400 bg-zinc-900 border border-zinc-800 hover:border-rose-800/60 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        {tr("O'chirish")}
                                      </button>
                                    )}
                                  </div>
                                )}
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white group-hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">
                                  {tr("Maqolani to'liq o'qish")}
                                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </SpotlightCard>
                      );
                    })()}
                  </ParallaxLayer>
                )}

              {/* Ordered Grid of Articles */}
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {(selectedBlogCategory === 'Barchasi' && !blogSearchQuery.trim()
                    ? sortedAndFilteredBlogPosts.slice(1)
                    : sortedAndFilteredBlogPosts
                  ).map((post, idx) => {
                    const hasFailed = failedBlogImages[post.id];
                    return (
                      <motion.div
                        layout
                        key={post.id}
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.28, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <ParallaxLayer
                          offsetY={idx % 2 === 0 ? [18, -14] : [26, -10]}
                          className="h-full"
                        >
                          <SpotlightCard
                            as="article"
                            onClick={() => openBlogPost(post)}
                            className="group h-full rounded-2xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/40 overflow-hidden flex flex-col justify-between transition-colors cursor-pointer"
                          >
                            <div className="relative aspect-4/3 w-full overflow-hidden bg-[#050505] border-b border-zinc-800">
                              {!hasFailed && post.imageUrl ? (
                                <ParallaxImage
                                  src={post.imageUrl}
                                  alt={post.title}
                                  onError={() =>
                                    setFailedBlogImages((prev) => ({
                                      ...prev,
                                      [post.id]: true,
                                    }))
                                  }
                                  intensity={14}
                                  className="group-hover:scale-[1.03] transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-900 via-[#0F0F12] to-[#050505]">
                                  <BookOpen className="w-8 h-8 text-blue-500/60 mb-2" />
                                  <span className="text-xs text-zinc-400">
                                    {tr(post.category)}
                                  </span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
                              <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between gap-2 text-xs text-zinc-200">
                                <span className="font-mono-tabular text-blue-400">
                                  {formatUzbekDate(post.publishedAt, alphabetMode)}
                                </span>
                                <span className="font-mono-tabular text-zinc-300">
                                  {post.readTime}
                                </span>
                              </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                              <div className="space-y-2.5">
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                  <span className="text-blue-400 font-medium">
                                    {tr(post.category)}
                                  </span>
                                  {post.featured && (
                                    <>
                                      <span aria-hidden="true">·</span>
                                      <span className="text-amber-400">{tr('Tanlangan')}</span>
                                    </>
                                  )}
                                </div>

                                <h3 className="font-display text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                                  <a
                                    href={`?article=${encodeURIComponent(post.slug || post.id)}#blog/${encodeURIComponent(post.slug || post.id)}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      openBlogPost(post);
                                    }}
                                  >
                                    {post.title}
                                  </a>
                                </h3>

                                <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
                                  {post.excerpt}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <span className="font-mono-tabular text-zinc-500 truncate">
                                  {(post.tags || [])
                                    .slice(0, 2)
                                    .map((t) => `#${t}`)
                                    .join(' · ')}
                                </span>
                                <div className="flex items-center gap-2 shrink-0">
                                  {isAdmin && (
                                    <div
                                      className="flex items-center gap-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => openAdminPanel(post.id)}
                                        className="px-2 py-1 text-[11px] font-medium text-white bg-blue-600 rounded hover:bg-blue-500 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                        {tr('Tahrirlash')}
                                      </button>
                                      {confirmQuickDeletePostId === post.id ? (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/70 border border-rose-800">
                                          <button
                                            type="button"
                                            onClick={() => handleQuickDeleteBlogPost(post.id)}
                                            className="px-1.5 py-0.5 text-[10px] font-semibold text-white bg-rose-600 rounded hover:bg-rose-500 cursor-pointer"
                                          >
                                            {tr('Ha')}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setConfirmQuickDeletePostId(null)}
                                            className="px-1 py-0.5 text-[10px] text-zinc-300 hover:text-white cursor-pointer"
                                          >
                                            {tr("Yo'q")}
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => setConfirmQuickDeletePostId(post.id)}
                                          className="px-2 py-1 text-[11px] font-medium text-rose-400 bg-zinc-900 border border-zinc-800 hover:border-rose-800/60 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                          {tr("O'chirish")}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  <span className="inline-flex items-center gap-1 font-medium text-white group-hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">
                                    {tr("To'liq o'qish")} <ArrowRight className="w-3.5 h-3.5" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          </SpotlightCard>
                        </ParallaxLayer>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </section>
        )}

        {activePage === 'tajriba' && (
          <>
            {/* Activities, Wikipedia & Content Timeline Section with Differential Scroll Parallax */}
            <section
              ref={experienceSectionRef}
              id="tajriba"
              className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16 border-b border-zinc-800/80"
            >
          <ParallaxLayer offsetY={[18, -14]}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs text-blue-400 font-medium">
                  {tr('Faoliyat, Vikipediya va Media')}
                </p>
                <h2
                  className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  {tr('Amaliy dasturlash, erkin ensiklopediya va IT blog faoliyati')}
                </h2>
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#0F0F12] border border-zinc-800 rounded-lg w-max">
                {(['Barchasi', 'Faoliyat', "Ta'lim"] as const).map((tab) => {
                  const isActive = experienceFilter === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setExperienceFilter(tab)}
                      className={`relative px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeExperienceTab"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          className="absolute inset-0 bg-blue-600 rounded-md"
                        />
                      )}
                      <span className="relative z-10">{tr(tab)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </ParallaxLayer>

          <div className="relative divide-y divide-zinc-800/80 border-t border-b border-zinc-800/80">
            {/* Subtle Scroll-Linked Vertical Accent Line on Desktop */}
            <motion.div
              aria-hidden="true"
              style={{ scaleY: smoothExpProgress, transformOrigin: 'top' }}
              className="hidden lg:block pointer-events-none absolute left-[31.5%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-blue-500/60 via-blue-500/30 to-transparent will-change-transform"
            />

            <AnimatePresence mode="popLayout">
              {filteredExperience.map((item, idx) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, delay: idx * 0.04 }}
                  className="py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start hover:bg-zinc-900/20 px-3 -mx-3 rounded-xl transition-colors"
                >
                  <ParallaxLayer offsetY={[12, -12]} className="lg:col-span-4 space-y-1.5">
                    <p className="font-mono-tabular text-xs text-blue-400">{item.period}</p>
                    <h3 className="font-display text-lg font-bold text-white">{item.company}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        {item.type === 'Faoliyat' ? (
                          <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                        ) : (
                          <GraduationCap className="w-3.5 h-3.5 text-zinc-500" />
                        )}
                        {tr(item.type)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.location}</span>
                    </div>
                  </ParallaxLayer>

                  <ParallaxLayer offsetY={[24, -18]} className="lg:col-span-8 space-y-4">
                    <h4 className="font-display text-xl font-semibold text-zinc-100">{item.role}</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed">{item.description}</p>

                    {item.achievements.length > 0 && (
                      <ul className="space-y-2 text-sm text-zinc-400">
                        {item.achievements.map((ach) => (
                          <li key={ach} className="flex items-start gap-2.5">
                            <span
                              className="text-blue-500 font-mono-tabular mt-0.5"
                              aria-hidden="true"
                            >
                              /
                            </span>
                            <span>{ach}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono-tabular text-zinc-400 pt-1">
                      {item.technologies.map((tech, tIdx) => (
                        <React.Fragment key={tech}>
                          <span className="text-zinc-300">{tech}</span>
                          {tIdx < item.technologies.length - 1 && (
                            <span aria-hidden="true" className="text-zinc-600">
                              ·
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </ParallaxLayer>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Real-Time Open-Source, Uzbek Wikipedia & Wikimedia Commons Live Ecosystem Section */}
        <Suspense fallback={null}>
          <LiveEcosystemSection alphabetMode={alphabetMode} />
        </Suspense>
          </>
        )}

        {/* Contact, Official Links, Taplink Etiquette & Direct Inquiry Section */}
        {activePage === 'boglanish' && (
        <section id="boglanish" className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Official Profiles & Taplink Communication Rules */}
            <ParallaxLayer offsetY={[16, -14]} className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <p className="text-xs text-blue-400 font-medium">
                  {tr('Rasmiy Sahifalar va Aloqa')}
                </p>
                <h2
                  className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  {tr("Ijtimoiy tarmoqlardagi sahifalarim va bog'lanish")}
                </h2>
              </div>

              {/* Taplink Communication Etiquette Box */}
              {personal.etiquetteNote && (
                <div className="p-5 rounded-2xl bg-[#0F0F12] border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                    <Info className="w-4 h-4 shrink-0" />
                    {tr('Muloqot qoidasi (Taplink)')}
                  </div>
                  <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                    {personal.etiquetteNote}
                  </p>
                </div>
              )}

              {/* 8 Official Project & Platform Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <motion.a
                  whileHover={{ y: -2 }}
                  href="https://solaris3d.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/60 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        Solaris 3D
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {tr('solaris3d.uz (3D Astronomiya)')}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 shrink-0 group-hover:text-blue-400 transition-colors" />
                </motion.a>

                <motion.a
                  whileHover={{ y: -2 }}
                  href="https://tilimlo.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/60 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        Tilimlo.uz
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {tr("tilimlo.uz (O'zbek tili & imlo)")}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 shrink-0 group-hover:text-blue-400 transition-colors" />
                </motion.a>

                <motion.a
                  whileHover={{ y: -2 }}
                  href={personal.taplink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/60 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        Taplink
                      </p>
                      <p className="text-xs text-zinc-400 truncate">taplink.cc/solijon_solayev</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 shrink-0 group-hover:text-blue-400 transition-colors" />
                </motion.a>

                <motion.a
                  whileHover={{ y: -2 }}
                  href={personal.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/60 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Video className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {tr('YouTube Kanal')}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">@Solijon_Solayev</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 shrink-0 group-hover:text-blue-400 transition-colors" />
                </motion.a>

                <motion.a
                  whileHover={{ y: -2 }}
                  href={personal.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/60 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Code2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {tr('GitHub Profil')}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">github.com/SolijonSolayev</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 shrink-0 group-hover:text-blue-400 transition-colors" />
                </motion.a>

                <motion.a
                  whileHover={{ y: -2 }}
                  href={personal.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/60 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Terminal className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {tr('GitHub Pages Sayt')}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">solijonsolayev.github.io</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 shrink-0 group-hover:text-blue-400 transition-colors" />
                </motion.a>

                <motion.a
                  whileHover={{ y: -2 }}
                  href={personal.wikipedia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/60 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {tr("O'zbekcha Vikipediya")}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">Foydalanuvchi:Solijon_Solayev</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 shrink-0 group-hover:text-blue-400 transition-colors" />
                </motion.a>

                <motion.a
                  whileHover={{ y: -2 }}
                  href={personal.commons}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/60 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Layers className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        Wikimedia Commons
                      </p>
                      <p className="text-xs text-zinc-400 truncate">User:Solijon_Solayev</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 shrink-0 group-hover:text-blue-400 transition-colors" />
                </motion.a>
              </div>

              {/* Email row */}
              <div className="p-4 rounded-xl bg-[#0F0F12] border border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-400">{tr('Elektron pochta')}</p>
                    <a
                      href={`mailto:${personal.email}`}
                      className="text-sm font-semibold text-white hover:text-blue-400 transition-colors truncate block"
                    >
                      {personal.email}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedEmail ? tr('Nusxalandi') : tr('Nusxalash')}
                </button>
              </div>
            </ParallaxLayer>

            {/* Right Column: Interactive Message Form (saves directly to Admin Panel inbox) */}
            <ParallaxLayer offsetY={[26, -18]} className="lg:col-span-6">
              <SpotlightCard className="p-6 md:p-8 rounded-2xl bg-[#0F0F12] border border-zinc-800">
                <h3 className="font-display text-xl font-bold text-white">
                  {tr('Xabar yoki taklif qoldirish')}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 mb-6">
                  {tr(
                    "Savol, fikr yoki hamkorlik taklifingizni bitta aniq xabarda yozib qoldiring — u to'g'ridan-to'g'ri shaxsiy Admin panelimga boradi."
                  )}
                </p>

                {inquirySubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-xl bg-[#050505] border border-zinc-800 space-y-4"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                      <Check className="w-5 h-5" /> {tr('Xabaringiz muvaffaqiyatli yuborildi!')}
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {tr('Rahmat,')}{' '}
                      <span className="text-white font-medium">{senderName}</span>!{' '}
                      {tr("Xabaringiz saqlandi, ko'rib chiqib aloqaga chiqaman.")}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInquirySubmitted(false);
                          setSenderName('');
                          setSenderContact('');
                          setSenderMessage('');
                        }}
                        className="px-4 py-2.5 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {tr('Yana xabar yozish')}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="sender-name" className="block text-xs text-zinc-400 mb-1.5">
                          {tr('Ismingiz')}
                        </label>
                        <input
                          id="sender-name"
                          type="text"
                          required
                          maxLength={120}
                          placeholder={tr('Ismingizni kiriting')}
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="sender-contact"
                          className="block text-xs text-zinc-400 mb-1.5"
                        >
                          {tr('Telegram (@username) yoki Email')}
                        </label>
                        <input
                          id="sender-contact"
                          type="text"
                          required
                          maxLength={160}
                          placeholder={tr('@username yoki email')}
                          value={senderContact}
                          onChange={(e) => setSenderContact(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1.5">
                        {tr('Murojaat mavzusi')}
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#050505] border border-zinc-800 rounded-lg">
                        {(
                          [
                            'Veb-ilova / SaaS',
                            'Backend & API',
                            'UI/UX & Mobil',
                            'Texnik Konsalting',
                          ] as const
                        ).map((type) => {
                          const isActive = senderProjectType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setSenderProjectType(type)}
                              className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                              }`}
                            >
                              {isActive && (
                                <motion.span
                                  layoutId="activeInquiryTypeTab"
                                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                  className="absolute inset-0 bg-blue-600 rounded-md"
                                />
                              )}
                              <span className="relative z-10">{tr(type)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="sender-message" className="block text-xs text-zinc-400 mb-1.5">
                        {tr('Xabar matni')}
                      </label>
                      <textarea
                        id="sender-message"
                        rows={4}
                        required
                        maxLength={2000}
                        placeholder={tr(
                          'Savol yoki taklifingizni bitta xabarda batafsil yozib qoldiring...'
                        )}
                        value={senderMessage}
                        onChange={(e) => setSenderMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={isSendingInquiry}
                      className="w-full py-3 px-5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors cursor-pointer shadow-lg shadow-blue-600/20"
                    >
                      {isSendingInquiry ? tr('Yuborilmoqda...') : tr('Xabarni yuborish')}
                    </motion.button>
                  </form>
                )}
              </SpotlightCard>
            </ParallaxLayer>
          </div>
        </section>
        )}
      </main>

      {/* Light Beam Footer with Giant Wordmark */}
      <BeamWordmarkFooter
        profile={profile}
        alphabetMode={alphabetMode}
        language={language}
        onNavigate={navigateToPage}
        onDownloadVCard={() => downloadVCard(profile)}
        onOpenQrModal={() => setIsCardModalOpen(true)}
        onOpenAiChat={() => setIsChatbotOpen(true)}
        wordmarkText="SOLIJON SOLAYEV"
      />

      {/* Interactive Modals */}
      <Suspense fallback={null}>
        {isCardModalOpen && (
          <DigitalCardModal
            isOpen={isCardModalOpen}
            onClose={() => setIsCardModalOpen(false)}
            profile={profile}
            alphabetMode={alphabetMode}
          />
        )}

        {activeProject && (
          <ProjectLightbox
            project={activeProject}
            onClose={() => setActiveProjectId(null)}
            alphabetMode={alphabetMode}
          />
        )}

        {isCommandPaletteOpen && (
          <CommandPaletteModal
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            profile={profile}
            alphabetMode={alphabetMode}
            themeMode={themeMode}
            onToggleTheme={toggleThemeMode}
            onToggleAlphabet={() =>
              handleAlphabetChange(alphabetMode === 'new_2026' ? 'classic' : 'new_2026')
            }
            onSelectBlogPost={(post) => openBlogPost(post)}
            onSelectProject={(proj) => setActiveProjectId(proj.id)}
            onDownloadVCard={() => downloadVCard(profile)}
            onOpenQrModal={() => setIsCardModalOpen(true)}
            onOpenAiChat={() => setIsChatbotOpen(true)}
          />
        )}
        <PortfolioChatbot
          profile={profile}
          alphabetMode={alphabetMode}
          onAlphabetModeChange={handleAlphabetChange}
          isOpenExternal={isChatbotOpen}
          onOpenChangeExternal={setIsChatbotOpen}
        />
      </Suspense>
    </div>
  );
}

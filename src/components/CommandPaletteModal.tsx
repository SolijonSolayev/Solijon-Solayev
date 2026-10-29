import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  BookOpen,
  Layers,
  Globe,
  Sparkles,
  Download,
  QrCode,
  Rss,
  ArrowRight,
  Command,
  X,
  Check,
  Copy,
  Languages,
} from 'lucide-react';
import { ProfileData, BlogPostItem, ProjectItem } from '../types/profile';
import { UzbekAlphabetMode, formatUzbekText } from '../utils/uzbekAlphabet';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  alphabetMode: UzbekAlphabetMode;
  onToggleAlphabet: () => void;
  onSelectBlogPost: (post: BlogPostItem) => void;
  onSelectProject: (project: ProjectItem) => void;
  onDownloadVCard: () => void;
  onOpenQrModal: () => void;
  onOpenAiChat: () => void;
}

interface CommandItem {
  id: string;
  group: 'actions' | 'blog' | 'projects' | 'links';
  title: string;
  subtitle: string;
  keywords: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  profile,
  alphabetMode,
  onToggleAlphabet,
  onSelectBlogPost,
  onSelectProject,
  onDownloadVCard,
  onOpenQrModal,
  onOpenAiChat,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const tr = (text: string) => formatUzbekText(text, alphabetMode);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  const items: CommandItem[] = useMemo(() => {
    const publishedPosts = (profile.blogPosts || []).filter((p) => p.published !== false);

    const quickActions: CommandItem[] = [
      {
        id: 'act-alphabet',
        group: 'actions',
        title:
          alphabetMode === 'new_2026'
            ? tr("Yozuvni Amaldagi O'zbek Lotinga (Oʻ, Gʻ, Sh, Ch) o'tkazish")
            : tr("Yozuvni 2026 Yangi O'zbek Alifbosiga (Ö, Ğ, Ş, Ç) o'tkazish"),
        subtitle: tr('Sayt va maqolalar alifbosini bir zumda almashtirish'),
        keywords: 'alifbo lotin 2026 alphabet script uzbek',
        icon: <Languages className="w-4 h-4 text-blue-400" />,
        onSelect: () => {
          onToggleAlphabet();
          onClose();
        },
      },
      {
        id: 'act-ai-chat',
        group: 'actions',
        title: tr('AI Yordamchi bilan suhbatlashish'),
        subtitle: tr("Solijon Solayev faoliyati va loyihalari bo'yicha savol berish"),
        keywords: 'ai chat gemini yordamchi savol',
        icon: <Sparkles className="w-4 h-4 text-blue-400" />,
        onSelect: () => {
          onClose();
          onOpenAiChat();
        },
      },
      {
        id: 'act-vcard',
        group: 'actions',
        title: tr('vCard (.vcf) kontaktni telefonga saqlash'),
        subtitle: `${profile.personal.email} · ${profile.personal.location}`,
        keywords: 'vcard kontakt telefon raqam saqlash download',
        icon: <Download className="w-4 h-4 text-emerald-400" />,
        onSelect: () => {
          onDownloadVCard();
          onClose();
        },
      },
      {
        id: 'act-qr',
        group: 'actions',
        title: tr('Raqamli Vizitka va QR-kod oynasini ochish'),
        subtitle: tr('Tezkor ulashish uchun QR-kod'),
        keywords: 'qr kod vizitka ulashish share card',
        icon: <QrCode className="w-4 h-4 text-blue-400" />,
        onSelect: () => {
          onClose();
          onOpenQrModal();
        },
      },
      {
        id: 'act-copy-email',
        group: 'actions',
        title: copiedEmail
          ? tr('E-pochta manzili nusxalandi!')
          : tr('E-pochta manzilidan nusxa olish'),
        subtitle: profile.personal.email,
        keywords: 'email pochta copy nusxa aloqa',
        icon: copiedEmail ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Copy className="w-4 h-4 text-zinc-400" />
        ),
        onSelect: () => {
          navigator.clipboard.writeText(profile.personal.email);
          setCopiedEmail(true);
          setTimeout(() => {
            setCopiedEmail(false);
            onClose();
          }, 700);
        },
      },
      {
        id: 'act-rss',
        group: 'actions',
        title: tr('Blog RSS oqimini ochish (/rss.xml)'),
        subtitle: tr("RSS o'quvchilar va agregatorlar uchun XML tasma"),
        keywords: 'rss xml feed blog obuna',
        icon: <Rss className="w-4 h-4 text-amber-400" />,
        onSelect: () => {
          window.location.href = '/rss.xml';
          onClose();
        },
      },
    ];

    const blogItems: CommandItem[] = publishedPosts.map((post) => ({
      id: `blog-${post.id}`,
      group: 'blog',
      title: tr(post.title),
      subtitle: `${tr(post.category)} · ${tr(post.readTime)}`,
      keywords: `${post.title} ${post.excerpt} ${(post.tags || []).join(' ')} ${post.category} blog maqola`,
      icon: <BookOpen className="w-4 h-4 text-blue-400" />,
      onSelect: () => {
        onClose();
        onSelectBlogPost(post);
      },
    }));

    const projectItems: CommandItem[] = profile.projects.map((proj) => ({
      id: `proj-${proj.id}`,
      group: 'projects',
      title: tr(proj.title),
      subtitle: `${tr(proj.role)} · ${proj.impactMetric}`,
      keywords: `${proj.title} ${proj.summary} ${(proj.technologies || []).join(' ')} portfolio loyiha`,
      icon: <Layers className="w-4 h-4 text-blue-400" />,
      onSelect: () => {
        onClose();
        onSelectProject(proj);
      },
    }));

    const linkItems: CommandItem[] = [
      {
        id: 'link-solaris',
        group: 'links',
        title: 'Solaris 3D — 3D Quyosh tizimi va Astronomiya',
        subtitle: 'https://solaris3d.uz',
        keywords: 'solaris 3d webgl astronomiya koinot',
        icon: <Globe className="w-4 h-4 text-emerald-400" />,
        onSelect: () => {
          window.open('https://solaris3d.uz', '_blank', 'noopener,noreferrer');
          onClose();
        },
      },
      {
        id: 'link-tilimlo',
        group: 'links',
        title: tr("Tilimlo.uz — O'zbek tili imlo va alifbo platformasi"),
        subtitle: 'https://tilimlo.uz',
        keywords: 'tilimlo imlo alifbo lotin',
        icon: <Globe className="w-4 h-4 text-emerald-400" />,
        onSelect: () => {
          window.open('https://tilimlo.uz', '_blank', 'noopener,noreferrer');
          onClose();
        },
      },
      {
        id: 'link-github',
        group: 'links',
        title: 'GitHub — @SolijonSolayev',
        subtitle: 'https://github.com/SolijonSolayev',
        keywords: 'github kod repo',
        icon: <Globe className="w-4 h-4 text-zinc-300" />,
        onSelect: () => {
          window.open('https://github.com/SolijonSolayev', '_blank', 'noopener,noreferrer');
          onClose();
        },
      },
      {
        id: 'link-wiki',
        group: 'links',
        title: tr("O'zbekcha Vikipediya — Foydalanuvchi:Solijon_Solayev"),
        subtitle: 'https://uz.wikipedia.org/wiki/Foydalanuvchi:Solijon_Solayev',
        keywords: 'wikipedia vikipediya ensiklopediya',
        icon: <Globe className="w-4 h-4 text-blue-400" />,
        onSelect: () => {
          window.open(
            'https://uz.wikipedia.org/wiki/Foydalanuvchi:Solijon_Solayev',
            '_blank',
            'noopener,noreferrer'
          );
          onClose();
        },
      },
    ];

    return [...quickActions, ...blogItems, ...projectItems, ...linkItems];
  }, [profile, alphabetMode, copiedEmail]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredItems.length ? (prev + 1) % filteredItems.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
        );
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        filteredItems[selectedIndex].onSelect();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  const groupLabels: Record<CommandItem['group'], string> = {
    actions: tr('Tezkor amallar'),
    blog: tr('Blog maqolalari'),
    projects: tr('Portfolio loyihalari'),
    links: tr('Rasmiy platformalar'),
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0F0F12] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800 bg-[#050505]">
          <Search className="w-4 h-4 text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr('Maqola, loyiha, alifbo yoki tezkor buyruqni qidiring...')}
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-zinc-400 hover:text-white px-1.5 py-0.5 cursor-pointer"
            >
              {tr('Tozalash')}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-zinc-800/60">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-zinc-300">{tr('Hech qanday natija topilmadi.')}</p>
              <p className="text-xs font-mono-tabular text-zinc-500 mt-1">
                {tr(
                  "Boshqa kalit so'z bilan qidirib ko'ring (masalan: Solaris 3D, Tilimlo, vCard, AI)"
                )}
              </p>
            </div>
          ) : (
            (['actions', 'blog', 'projects', 'links'] as const).map((groupKey) => {
              const groupItems = filteredItems.filter((i) => i.group === groupKey);
              if (groupItems.length === 0) return null;

              return (
                <div key={groupKey} className="py-2 first:pt-1 last:pb-1">
                  <p className="px-3 py-1 text-[11px] font-mono-tabular uppercase tracking-wider text-zinc-500">
                    {groupLabels[groupKey]}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {groupItems.map((item) => {
                      const flatIndex = filteredItems.findIndex((fi) => fi.id === item.id);
                      const isActive = flatIndex === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          onClick={item.onSelect}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-blue-600/15 text-white border border-blue-500/40'
                              : 'text-zinc-300 hover:bg-zinc-900/70 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-[#050505] border border-zinc-800 shrink-0">
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-zinc-400 truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                          <ArrowRight
                            className={`w-4 h-4 shrink-0 transition-transform ${
                              isActive ? 'text-blue-400 translate-x-0.5' : 'text-zinc-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-4 py-2.5 bg-[#050505] border-t border-zinc-800 flex items-center justify-between text-xs font-mono-tabular text-zinc-500">
          <div className="flex items-center gap-3">
            <span>↑↓ {tr('Tanlash')}</span>
            <span>↵ {tr('Ochish')}</span>
            <span>ESC {tr('Yopish')}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-blue-400">
            <Command className="w-3 h-3" /> Ctrl+K
          </span>
        </div>
      </div>
    </div>
  );
};

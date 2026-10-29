import React, { useEffect, useMemo, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Check,
  Code2,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Heading2,
  Heading3,
  Inbox,
  Link2,
  List,
  Lock,
  LogOut,
  Mail,
  Plus,
  Quote,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  ADMIN_EMAIL,
  ContactInquiryRecord,
  FIREBASE_PROJECT_ID,
  FIRESTORE_DATABASE_ID,
  deleteInquiry,
  isUserVerifiedAdmin,
  savePortfolioToFirestore,
  signInAdminWithGoogle,
  signOutAdmin,
  subscribeToInquiries,
  updateInquiryStatus,
} from '../lib/firebase';
import { DEFAULT_PROFILE_DATA } from '../data/defaultProfile';
import {
  BlogCategory,
  BlogPostItem,
  ExperienceItem,
  ProfileData,
  ProjectCategory,
  ProjectItem,
} from '../types/profile';
import { formatUzbekText, localizeProfileData, UzbekAlphabetMode } from '../utils/uzbekAlphabet';
import { formatUzbekDate, MarkdownArticleContent } from './BlogArticleView';

interface AdminPanelViewProps {
  currentUser: User | null;
  profile: ProfileData;
  alphabetMode: UzbekAlphabetMode;
  onAlphabetModeChange: (mode: UzbekAlphabetMode) => void;
  onUpdateLocalProfile: (next: ProfileData) => void;
  onExitAdmin: () => void;
  initialEditPostId?: string | null;
  onClearInitialEditPost?: () => void;
}

type AdminTab =
  | 'inquiries'
  | 'blog'
  | 'personal'
  | 'metrics_services'
  | 'projects'
  | 'experience'
  | 'contacts';

const COVER_IMAGE_PRESETS = [
  {
    label: 'Solaris 3D / Astronomiya',
    url: '/src/assets/images/project_solaris3d_astronomy_1793272827947.jpg',
  },
  {
    label: 'Tilimlo.uz / Imlo',
    url: '/src/assets/images/project_tilimlo_platform_1793272827504.jpg',
  },
  {
    label: 'Dasturlash va Tahlil',
    url: '/src/assets/images/project_ai_analytics_1793267851074.jpg',
  },
  {
    label: 'Tizim va Arxitektura',
    url: '/src/assets/images/project_fintech_platform_1793267850542.jpg',
  },
  {
    label: 'Veb va Mobil Ilova',
    url: '/src/assets/images/project_mobile_banking_1793267852640.jpg',
  },
  {
    label: 'Frontend va Dizayn',
    url: '/src/assets/images/project_ecommerce_engine_1793267852059.jpg',
  },
  {
    label: 'Ish Stoli (Workspace)',
    url: '/src/assets/images/hero_developer_workspace_1793267849323.jpg',
  },
];

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/ö/g, 'o')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 'sh')
    .replace(/ç/g, 'ch')
    .replace(/o['ʻʼ’‘`]/g, 'o')
    .replace(/g['ʻʼ’‘`]/g, 'g')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function estimateReadTime(content: string): string {
  const words = (content || '').trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 160));
  return `${minutes} daqiqa`;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  currentUser,
  profile,
  alphabetMode,
  onAlphabetModeChange,
  onUpdateLocalProfile,
  onExitAdmin,
  initialEditPostId,
  onClearInitialEditPost,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(() =>
    initialEditPostId ? 'blog' : 'inquiries'
  );
  const [draft, setDraft] = useState<ProfileData>(() => ({
    ...profile,
    blogPosts: Array.isArray(profile.blogPosts)
      ? profile.blogPosts
      : DEFAULT_PROFILE_DATA.blogPosts,
  }));
  const [inquiries, setInquiries] = useState<ContactInquiryRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showDomainHelp, setShowDomainHelp] = useState(false);
  const [copiedField, setCopiedField] = useState<'domain' | 'project' | null>(null);
  const [copiedSeoPostId, setCopiedSeoPostId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Blog Admin Editor & Auto-Populated Form State
  const [editingPostId, setEditingPostId] = useState<string | null>(initialEditPostId || null);
  const [postForm, setPostForm] = useState<BlogPostItem | null>(() => {
    if (!initialEditPostId) return null;
    const initialList = Array.isArray(profile.blogPosts)
      ? profile.blogPosts
      : DEFAULT_PROFILE_DATA.blogPosts;
    const found = initialList.find((p) => p.id === initialEditPostId) || null;
    return found ? { ...found, tags: [...(found.tags || [])] } : null;
  });
  const [postTagsInput, setPostTagsInput] = useState<string>(() => {
    if (!initialEditPostId) return '';
    const initialList = Array.isArray(profile.blogPosts)
      ? profile.blogPosts
      : DEFAULT_PROFILE_DATA.blogPosts;
    const found = initialList.find((p) => p.id === initialEditPostId);
    return found ? (found.tags || []).join(', ') : '';
  });
  const [isCreatingNewPost, setIsCreatingNewPost] = useState(false);
  const [confirmDeletePostId, setConfirmDeletePostId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState<'Barchasi' | BlogCategory>(
    'Barchasi'
  );
  const [aiAssistLoading, setAiAssistLoading] = useState<'full_draft' | 'metadata_only' | null>(
    null
  );
  const [aiAssistStatus, setAiAssistStatus] = useState<string | null>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const postFormSectionRef = useRef<HTMLDivElement | null>(null);

  const tr = (text: string) => formatUzbekText(text, alphabetMode);
  const isAdmin = isUserVerifiedAdmin(currentUser);

  useEffect(() => {
    setDraft({
      ...profile,
      blogPosts: Array.isArray(profile.blogPosts)
        ? profile.blogPosts
        : DEFAULT_PROFILE_DATA.blogPosts,
    });
  }, [profile]);

  const handleStartEditBlogPost = (post: BlogPostItem) => {
    setEditingPostId(post.id);
    setIsCreatingNewPost(false);
    setConfirmDeletePostId(null);
    setPostForm({
      ...post,
      tags: [...(post.tags || [])],
    });
    setPostTagsInput((post.tags || []).join(', '));
    setEditorMode('write');
    setTimeout(() => {
      postFormSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  useEffect(() => {
    if (initialEditPostId) {
      setActiveTab('blog');
      const target = (draft.blogPosts || []).find((p) => p.id === initialEditPostId);
      if (target) {
        setEditingPostId(target.id);
        setIsCreatingNewPost(false);
        setPostForm({ ...target, tags: [...(target.tags || [])] });
        setPostTagsInput((target.tags || []).join(', '));
        setEditorMode('write');
      }
      if (onClearInitialEditPost) {
        onClearInitialEditPost();
      }
    }
  }, [initialEditPostId, onClearInitialEditPost, draft.blogPosts]);

  useEffect(() => {
    if (!isAdmin) {
      setInquiries([]);
      return;
    }
    const unsub = subscribeToInquiries((items) => {
      setInquiries(items);
    });
    return () => unsub();
  }, [isAdmin]);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      const user = await signInAdminWithGoogle();
      if (!isUserVerifiedAdmin(user)) {
        setAuthError(
          tr(
            `Ruxsat rad etildi: (${user.email}) sayt egasi emas. Faqat ${ADMIN_EMAIL} hisobi tahrirlash huquqiga ega.`
          )
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : tr('Google orqali kirishda xatolik yuz berdi.');
      setAuthError(message);
      if (message.includes('auth/unauthorized-domain')) {
        setShowDomainHelp(true);
      }
    }
  };

  const handleCopyText = (text: string, field: 'domain' | 'project') => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2200);
  };

  const handleSaveToCloud = async (
    dataToSave: ProfileData = draft,
    customSuccessMsg?: string
  ) => {
    if (!isAdmin) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await savePortfolioToFirestore(dataToSave);
      onUpdateLocalProfile(dataToSave);
      setSaveMessage(
        customSuccessMsg || tr("Barcha o'zgarishlar bulutli bazaga saqlandi!")
      );
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err) {
      setSaveMessage(
        err instanceof Error ? `Xatolik: ${err.message}` : tr('Saqlashda xatolik yuz berdi')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updatePersonalField = (key: keyof ProfileData['personal'], value: string) => {
    setDraft((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [key]: value,
      },
    }));
  };

  // Blog Management Handlers
  const handleAddBlogPost = () => {
    const today = new Date().toISOString().slice(0, 10);
    const defaultTitle = tr('Yangi maqola sarlavhasi');
    const newPost: BlogPostItem = {
      id: `post_${Date.now()}`,
      slug: `maqola-${Date.now()}`,
      title: defaultTitle,
      category: 'Dasturlash va IT',
      publishedAt: today,
      readTime: '3 daqiqa',
      featured: false,
      published: true,
      excerpt: tr(
        "Ushbu maqolada ko'rib chiqiladigan asosiy mavzu va foydali xulosalar haqida qisqacha anons."
      ),
      content: tr(`## Kirish

Bu yerda maqolangizning asosiy kirish qismini yozishingiz mumkin. Matn ichida **qalin yozuv**, \`kod bo'laklari\` va [havolalar](https://solaris3d.uz) ishlatish mumkin.

### Asosiy qism

- Birinchi muhim fikr yoki qadam
- Ikkinchi muhim fikr yoki texnik yechim

> Muhim eslatma yoki iqtibosni shu ko'rinishda ajratib ko'rsatishingiz mumkin.`),
      tags: ['IT', 'Dasturlash'],
      imageUrl: '/src/assets/images/project_ai_analytics_1793267851074.jpg',
    };

    setEditingPostId(newPost.id);
    setIsCreatingNewPost(true);
    setConfirmDeletePostId(null);
    setPostForm(newPost);
    setPostTagsInput(newPost.tags.join(', '));
    setEditorMode('write');
    setTimeout(() => {
      postFormSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleUpdatePostForm = (patch: Partial<BlogPostItem>) => {
    setPostForm((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      if (patch.title !== undefined && (!prev.slug || prev.slug.startsWith('maqola-'))) {
        const generated = slugifyTitle(patch.title);
        if (generated) {
          updated.slug = generated;
        }
      }
      return updated;
    });
  };

  const handleSubmitBlogPostForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!postForm) return;

    const normalizedTags = postTagsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const finalPost: BlogPostItem = {
      ...postForm,
      title: postForm.title.trim() || tr('Sarlavhasiz maqola'),
      slug: postForm.slug.trim() || slugifyTitle(postForm.title) || `maqola-${Date.now()}`,
      readTime: postForm.readTime.trim() || estimateReadTime(postForm.content),
      tags: normalizedTags.length > 0 ? normalizedTags : ['Maqola'],
    };

    const existingList = draft.blogPosts || [];
    const exists = existingList.some((p) => p.id === finalPost.id);
    const nextBlogPosts = exists
      ? existingList.map((p) => (p.id === finalPost.id ? finalPost : p))
      : [finalPost, ...existingList];

    const nextDraft: ProfileData = {
      ...draft,
      blogPosts: nextBlogPosts,
    };

    setDraft(nextDraft);
    setPostForm(finalPost);
    setIsCreatingNewPost(false);
    await handleSaveToCloud(
      nextDraft,
      exists
        ? tr("Maqola muvaffaqiyatli tahrirlandi va bazaga saqlandi!")
        : tr("Yangi maqola muvaffaqiyatli chop etildi va bazaga saqlandi!")
    );
  };

  const handleCancelEditPost = () => {
    setPostForm(null);
    setEditingPostId(null);
    setIsCreatingNewPost(false);
    setConfirmDeletePostId(null);
  };

  const handleResetPostFormToSaved = () => {
    if (!editingPostId) return;
    const saved = (draft.blogPosts || []).find((p) => p.id === editingPostId);
    if (saved) {
      setPostForm({ ...saved, tags: [...(saved.tags || [])] });
      setPostTagsInput((saved.tags || []).join(', '));
    }
  };

  const handleUpdateBlogPost = (id: string, patch: Partial<BlogPostItem>) => {
    const nextPosts = (draft.blogPosts || []).map((post) => {
      if (post.id !== id) return post;
      const updated = { ...post, ...patch };
      if (patch.title !== undefined && (!post.slug || post.slug.startsWith('maqola-'))) {
        const generated = slugifyTitle(patch.title);
        if (generated) {
          updated.slug = generated;
        }
      }
      return updated;
    });
    const nextDraft = { ...draft, blogPosts: nextPosts };
    setDraft(nextDraft);
    if (postForm && postForm.id === id) {
      setPostForm((prev) => (prev ? { ...prev, ...patch } : prev));
    }
    onUpdateLocalProfile(nextDraft);
  };

  const handleDeleteBlogPost = async (id: string) => {
    const nextPosts = (draft.blogPosts || []).filter((p) => p.id !== id);
    const nextDraft = { ...draft, blogPosts: nextPosts };
    setDraft(nextDraft);
    setConfirmDeletePostId(null);
    if (editingPostId === id || postForm?.id === id) {
      setEditingPostId(null);
      setPostForm(null);
      setIsCreatingNewPost(false);
    }
    await handleSaveToCloud(nextDraft, tr("Maqola bazadan muvaffaqiyatli o'chirildi!"));
  };

  const handleMoveBlogPost = (index: number, direction: -1 | 1) => {
    const list = [...(draft.blogPosts || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    const nextDraft = { ...draft, blogPosts: list };
    setDraft(nextDraft);
    onUpdateLocalProfile(nextDraft);
  };

  const insertMarkdownSnippet = (prefix: string, suffix = '') => {
    if (!postForm) return;
    const textarea = contentTextareaRef.current;
    if (!textarea) {
      const nextContent = `${postForm.content}\n${prefix}${suffix}`;
      handleUpdatePostForm({
        content: nextContent,
        readTime: estimateReadTime(nextContent),
      });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = postForm.content.slice(start, end) || tr('Matn');
    const replacement = `${prefix}${selectedText}${suffix}`;
    const nextContent =
      postForm.content.slice(0, start) + replacement + postForm.content.slice(end);

    handleUpdatePostForm({
      content: nextContent,
      readTime: estimateReadTime(nextContent),
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  const handleRunBlogAiAssist = async (
    post: BlogPostItem,
    mode: 'full_draft' | 'metadata_only'
  ) => {
    if (aiAssistLoading) return;
    setAiAssistLoading(mode);
    setAiAssistStatus(null);
    try {
      const response = await fetch('/api/blog-ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post.title,
          category: post.category,
          content: post.content,
          alphabetMode: alphabetMode === 'new_2026' ? 'new2026' : 'classic',
          mode,
        }),
      });
      if (!response.ok) {
        throw new Error('AI xizmati javob bermadi');
      }
      const data = await response.json();
      const patch: Partial<BlogPostItem> = {};
      if (mode === 'full_draft' && data.content) {
        patch.content = formatUzbekText(data.content, alphabetMode);
      }
      if (data.excerpt) {
        patch.excerpt = formatUzbekText(data.excerpt, alphabetMode);
      }
      if (Array.isArray(data.tags) && data.tags.length > 0) {
        const formattedTags = data.tags.map((t: string) => formatUzbekText(t, alphabetMode));
        patch.tags = formattedTags;
        setPostTagsInput(formattedTags.join(', '));
      }
      if (data.readTime) {
        patch.readTime = formatUzbekText(data.readTime, alphabetMode);
      } else if (patch.content) {
        patch.readTime = estimateReadTime(patch.content);
      }
      handleUpdatePostForm(patch);
      setAiAssistStatus(
        mode === 'full_draft'
          ? tr("AI maqola qoralamasi, anons va teglar muvaffaqiyatli yaratildi!")
          : tr("AI anons, teglar va o'qish vaqti yangilandi!")
      );
      setTimeout(() => setAiAssistStatus(null), 4000);
    } catch {
      setAiAssistStatus(tr("AI yordamchida xatolik yuz berdi. Qayta urinib ko'ring."));
    } finally {
      setAiAssistLoading(null);
    }
  };

  const editingPost = postForm;

  const filteredAdminBlogPosts = useMemo(() => {
    return (draft.blogPosts || []).filter((p) => {
      const matchesCat =
        blogCategoryFilter === 'Barchasi' || p.category === blogCategoryFilter;
      const q = blogSearchQuery.trim().toLowerCase();
      if (!q) return matchesCat;
      return (
        matchesCat &&
        (p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }, [draft.blogPosts, blogCategoryFilter, blogSearchQuery]);

  const handleAddProject = () => {
    const newProject: ProjectItem = {
      id: `p_${Date.now()}`,
      title: tr('Yangi Loyiha'),
      category: 'Veb-loyihalar',
      year: new Date().getFullYear().toString(),
      client: tr('Ochiq manbali loyiha'),
      role: tr('Muallif'),
      featured: false,
      summary: tr("Loyiha haqida qisqacha ma'lumot va uning asosiy maqsadi."),
      challenge: tr("Loyiha oldiga qo'yilgan asosiy vazifa."),
      solution: tr("Qo'llanilgan texnologiyalar va yechim."),
      impactMetric: tr('Ochiq kodli amaliy loyiha'),
      technologies: ['HTML', 'CSS', 'Tailwind CSS', 'React'],
      imageUrl: '/src/assets/images/project_fintech_platform_1793267850542.jpg',
      liveUrl: 'https://github.com/SolijonSolayev',
      repoUrl: 'https://github.com/SolijonSolayev',
    };
    setDraft((prev) => ({
      ...prev,
      projects: [newProject, ...prev.projects],
    }));
  };

  const handleDeleteProject = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  const handleUpdateProject = (id: string, patch: Partial<ProjectItem>) => {
    setDraft((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `e_${Date.now()}`,
      period: tr('2025 — Hozirgi vaqtda'),
      role: tr('Frontend Dasturchi'),
      company: tr('Yangi Loyiha yoki Faoliyat'),
      location: tr("O'zbekiston"),
      type: 'Faoliyat',
      description: tr('Asosiy vazifalar va faoliyat tavsifi.'),
      achievements: [tr('Amalga oshirilgan ishlar')],
      technologies: ['HTML', 'CSS', 'Tailwind CSS', 'React'],
    };
    setDraft((prev) => ({
      ...prev,
      experience: [newExp, ...prev.experience],
    }));
  };

  const handleDeleteExperience = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  };

  const handleUpdateExperience = (id: string, patch: Partial<ExperienceItem>) => {
    setDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(draft, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'solijon_solayev_vizitka.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyPostSeoUrl = (post: BlogPostItem) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://solijonsolayev.uz';
    const slugOrId = encodeURIComponent(post.slug || post.id);
    const seoUrl = `${origin}/?article=${slugOrId}`;
    navigator.clipboard.writeText(seoUrl);
    setCopiedSeoPostId(post.id);
    setTimeout(() => setCopiedSeoPostId(null), 2200);
  };

  const handleDownloadSitemapXml = () => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://solijonsolayev.github.io';
    const today = new Date().toISOString().slice(0, 10);
    const publishedPosts = (draft.blogPosts || []).filter((p) => p.published !== false);

    const staticUrls = [
      { loc: `${origin}/`, lastmod: today, changefreq: 'weekly', priority: '1.0' },
      { loc: `${origin}/?alphabet=new_2026`, lastmod: today, changefreq: 'weekly', priority: '0.95' },
      { loc: `${origin}/?alphabet=classic`, lastmod: today, changefreq: 'weekly', priority: '0.95' },
      { loc: `${origin}/?page=loyihalar`, lastmod: today, changefreq: 'weekly', priority: '0.90' },
      { loc: `${origin}/?page=blog`, lastmod: today, changefreq: 'daily', priority: '0.95' },
      { loc: `${origin}/?page=tajriba`, lastmod: today, changefreq: 'weekly', priority: '0.85' },
      { loc: `${origin}/?page=boglanish`, lastmod: today, changefreq: 'monthly', priority: '0.80' },
    ];

    const postUrls = publishedPosts.map((post) => {
      const slug = encodeURIComponent(post.slug || post.id);
      return {
        loc: `${origin}/?article=${slug}`,
        lastmod: post.publishedAt || today,
        changefreq: 'monthly',
        priority: post.featured ? '0.90' : '0.85',
      };
    });

    const allUrls = [...staticUrls, ...postUrls];
    const xmlLines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...allUrls.map(
        (u) =>
          `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
      ),
      '</urlset>',
    ];

    const blob = new Blob([xmlLines.join('\n')], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadRssXml = () => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://solijonsolayev.github.io';
    const publishedPosts = (draft.blogPosts || []).filter((p) => p.published !== false);
    const escapeXml = (str: string) =>
      (str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const itemsXml = publishedPosts
      .map((post) => {
        const slug = encodeURIComponent(post.slug || post.id);
        const link = `${origin}/?article=${slug}`;
        const pubDate = post.publishedAt
          ? new Date(post.publishedAt).toUTCString()
          : new Date().toUTCString();
        return [
          '    <item>',
          `      <title>${escapeXml(post.title)}</title>`,
          `      <link>${link}</link>`,
          `      <guid isPermaLink="true">${link}</guid>`,
          `      <pubDate>${pubDate}</pubDate>`,
          `      <category>${escapeXml(post.category)}</category>`,
          `      <description>${escapeXml(post.excerpt)}</description>`,
          '    </item>',
        ].join('\n');
      })
      .join('\n');

    const rssContent = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
      '  <channel>',
      `    <title>${escapeXml(draft.personal.fullName)} — Shaxsiy Blog («Fikr qilamiz»)</title>`,
      `    <link>${origin}/?page=blog</link>`,
      `    <description>${escapeXml(draft.personal.shortBio)}</description>`,
      '    <language>uz</language>',
      itemsXml,
      '  </channel>',
      '</rss>',
    ].join('\n');

    const blob = new Blob([rssContent], { type: 'application/rss+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rss.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result));
        if (parsed && parsed.personal && Array.isArray(parsed.projects)) {
          setDraft({
            ...parsed,
            blogPosts: Array.isArray(parsed.blogPosts)
              ? parsed.blogPosts
              : DEFAULT_PROFILE_DATA.blogPosts,
          });
        }
      } catch {
        // Ignore invalid JSON
      }
    };
    reader.readAsText(file);
  };

  if (!isAdmin) {
    const currentHostname =
      typeof window !== 'undefined' ? window.location.hostname : 'sizning-saytingiz.vercel.app';
    const isUnauthorizedDomainError = Boolean(
      authError && authError.includes('auth/unauthorized-domain')
    );
    const firebaseAuthSettingsUrl = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`;

    return (
      <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col">
        <header className="flex items-center justify-between gap-8 px-6 lg:px-12 py-4 border-b border-zinc-800">
          <button
            type="button"
            onClick={onExitAdmin}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> {tr('Asosiy saytga qaytish')}
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-[#0F0F12] border border-zinc-800 rounded-lg">
              <button
                type="button"
                onClick={() => onAlphabetModeChange('new_2026')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  alphabetMode === 'new_2026'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Ö Ğ Ş Ç
              </button>
              <button
                type="button"
                onClick={() => onAlphabetModeChange('classic')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  alphabetMode === 'classic'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Oʻ Gʻ Sh Ch
              </button>
            </div>
            <span className="text-xs text-zinc-500 hidden sm:inline">
              {tr('Himoyalangan Boshqaruv Tizimi')}
            </span>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-2xl bg-[#0F0F12] border border-zinc-800 p-8 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center">
              <Lock className="w-6 h-6 text-blue-500" />
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold text-white">
                {tr('Admin Panelga Kirish')}
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {tr(
                  "Vizitka sayti ma'lumotlarini tahrirlash, blog maqolalarini chop etish va murojaatlarni o'qish faqat sayt egasi uchun ochiq."
                )}
              </p>
            </div>

            {currentUser && !isAdmin && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {tr("Ruxsat yo'q")} ({currentUser.email})
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {tr('Siz hozir boshqa hisob orqali kirgansiz. Admin panel faqat')}{' '}
                  <span className="font-mono-tabular text-white">{ADMIN_EMAIL}</span>{' '}
                  {tr('hisobi uchun qulflangan.')}
                </p>
              </div>
            )}

            {authError && (
              <div className="text-xs text-rose-300 bg-rose-950/35 border border-rose-800/60 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-rose-400">{tr(authError)}</p>
                {isUnauthorizedDomainError && (
                  <p className="text-zinc-300 leading-relaxed">
                    {tr(
                      "Vercel yoki yangi domenga yuklanganda Firebase xavfsizlik tizimi ushbu domenni (Authorized domains) ro'yxatiga qo'shishingizni talab qiladi. Quyidagi yo'riqnoma orqali 30 soniyada hal qiling:"
                    )}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleLogin}
                className="w-full py-3 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors cursor-pointer"
              >
                {tr('Google orqali Admin sifatida kirish')}
              </button>

              {currentUser && (
                <button
                  type="button"
                  onClick={() => signOutAdmin()}
                  className="w-full py-2.5 px-4 text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-white transition-colors cursor-pointer"
                >
                  {tr('Joriy hisobdan chiqish')}
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowDomainHelp((prev) => !prev)}
                className="w-full py-2 px-3 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                {showDomainHelp || isUnauthorizedDomainError
                  ? tr("Vercel / Firebase domen yo'riqnomasini yopish")
                  : tr('Vercel da "auth/unauthorized-domain" xatosi chiqyaptimi?')}
              </button>
            </div>

            {(showDomainHelp || isUnauthorizedDomainError) && (
              <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3.5 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-100">
                    {tr('Firebase Loyiha maʼlumotlari va Domen ruxsati')}
                  </p>
                  <p className="text-zinc-400 leading-relaxed">
                    {tr(
                      "AI Studio ushbu sayt bazasini Google Cloud / Firebase ichida avtomatik yaratgan. Loyiha nomi va joriy domenni nusxalab Firebase Console ichiga qo'shing:"
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#050505] border border-zinc-800">
                    <div className="min-w-0">
                      <span className="block text-[10px] uppercase tracking-wider text-zinc-500">
                        {tr('1. Firebase Project ID (Loyiha nomi)')}
                      </span>
                      <code className="text-xs font-mono-tabular text-blue-400 break-all">
                        {FIREBASE_PROJECT_ID}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(FIREBASE_PROJECT_ID, 'project')}
                      className="px-2.5 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedField === 'project' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{tr('Nusxalandi')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{tr('Nusxalash')}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#050505] border border-zinc-800">
                    <div className="min-w-0">
                      <span className="block text-[10px] uppercase tracking-wider text-zinc-500">
                        {tr("2. Qo'shiladigan Domen (Authorized Domain)")}
                      </span>
                      <code className="text-xs font-mono-tabular text-emerald-400 break-all">
                        {currentHostname}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(currentHostname, 'domain')}
                      className="px-2.5 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedField === 'domain' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{tr('Nusxalandi')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{tr('Nusxalash')}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#050505] border border-zinc-800/70">
                    <span className="block text-[10px] uppercase tracking-wider text-zinc-500">
                      {tr('Firestore Database ID')}
                    </span>
                    <code className="text-[11px] font-mono-tabular text-zinc-400 break-all">
                      {FIRESTORE_DATABASE_ID}
                    </code>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 leading-relaxed">
                  <li>
                    {tr('Quyidagi koʻk tugma orqali toʻgʻridan-toʻgʻri')}{' '}
                    <strong className="text-white">{FIREBASE_PROJECT_ID}</strong>{' '}
                    {tr('loyihasining Authentication sozlamalarini oching.')}
                  </li>
                  <li>
                    <strong className="text-white">Authorized domains</strong>{' '}
                    {tr('boʻlimidan')}{' '}
                    <strong className="text-white">Add domain</strong>{' '}
                    {tr('tugmasini bosing.')}
                  </li>
                  <li>
                    {tr('Vercel domeningizni')}{' '}
                    <code className="text-emerald-400">{currentHostname}</code>{' '}
                    {tr("ko'rinishida (https:// siz) qo'shib saqlang.")}
                  </li>
                </ol>

                <a
                  href={firebaseAuthSettingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 hover:text-white transition-colors inline-flex items-center justify-center gap-2 font-medium"
                >
                  <span>{tr('Firebase Console → Authorized Domains ni ochish')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const newInquiriesCount = inquiries.filter((i) => i.status === 'new').length;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col">
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 px-6 lg:px-12 py-4 bg-[#050505]/95 backdrop-blur-md border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onExitAdmin}
            className="px-3.5 py-2 text-xs font-medium text-zinc-200 bg-[#0F0F12] border border-zinc-800 rounded-lg hover:border-zinc-700 hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {tr("Saytni ko'rish")}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <h1 className="font-display text-base font-bold text-white">
                {tr('Boshqaruv Paneli (Admin)')}
              </h1>
            </div>
            <p className="text-xs text-zinc-400">{currentUser?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {saveMessage && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
              <Check className="w-4 h-4" /> {saveMessage}
            </span>
          )}

          {/* Alphabet Switcher inside Admin Header */}
          <div className="flex items-center gap-1 p-1 bg-[#0F0F12] border border-zinc-800 rounded-lg">
            <button
              type="button"
              onClick={() => {
                onAlphabetModeChange('new_2026');
                setDraft((prev) => localizeProfileData(prev, 'new_2026'));
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                alphabetMode === 'new_2026'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ö Ğ Ş Ç
            </button>
            <button
              type="button"
              onClick={() => {
                onAlphabetModeChange('classic');
                setDraft((prev) => localizeProfileData(prev, 'classic'));
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                alphabetMode === 'classic'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Oʻ Gʻ Sh Ch
            </button>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSaveToCloud(draft)}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? tr('Saqlanmoqda...') : tr("O'zgarishlarni bazaga saqlash")}
          </button>

          <button
            type="button"
            onClick={() => signOutAdmin()}
            className="px-3.5 py-2 text-xs font-medium text-zinc-400 bg-[#0F0F12] border border-zinc-800 rounded-lg hover:text-white hover:border-zinc-700 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> {tr('Chiqish')}
          </button>
        </div>
      </header>

      <div className="max-w-6xl w-full mx-auto px-6 lg:px-12 py-8 flex-1 space-y-8">
        <div className="overflow-x-auto pb-1">
          <div className="flex items-center gap-1 p-1 bg-[#0F0F12] border border-zinc-800 rounded-xl w-max">
            {(
              [
                {
                  id: 'blog',
                  label: tr(`Blog va Maqolalar (${(draft.blogPosts || []).length})`),
                },
                {
                  id: 'inquiries',
                  label: tr(
                    `Murojaatlar (${inquiries.length}${
                      newInquiriesCount > 0 ? ` · ${newInquiriesCount} yangi` : ''
                    })`
                  ),
                },
                { id: 'personal', label: tr('Shaxsiy & Bio') },
                { id: 'metrics_services', label: tr("Faoliyat & Ko'nikmalar") },
                { id: 'projects', label: tr(`Loyihalar (${draft.projects.length})`) },
                { id: 'experience', label: tr(`Faoliyat va Ta'lim (${draft.experience.length})`) },
                { id: 'contacts', label: tr('Havolalar & Zaxira') },
              ] as { id: AdminTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Blog & Articles Management Studio */}
        {activeTab === 'blog' && (
          <div className="space-y-8" ref={postFormSectionRef}>
            {editingPost && (
              /* Auto-Populated Article Editor & Live Preview Form */
              <form
                onSubmit={handleSubmitBlogPostForm}
                className="p-6 lg:p-8 rounded-2xl bg-[#0F0F12] border border-blue-500/40 shadow-2xl shadow-blue-950/20 space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-800">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md border ${
                          isCreatingNewPost
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                        }`}
                      >
                        {isCreatingNewPost
                          ? tr('Yangi maqola yaratish')
                          : tr('Mavjud maqolani tahrirlash')}
                      </span>
                      <span className="text-xs font-mono-tabular text-zinc-500">
                        ID: {editingPost.id}
                      </span>
                    </div>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                      {isCreatingNewPost
                        ? tr('Yangi blog postini tayyorlash va chop etish')
                        : `${tr('Tahrirlanmoqda')}: ${tr(editingPost.title)}`}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Write / Preview Mode Switcher */}
                    <div className="flex items-center gap-1 p-1 bg-[#050505] border border-zinc-800 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setEditorMode('write')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                          editorMode === 'write'
                            ? 'bg-blue-600 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        {tr('Matn muharriri')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode('preview')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                          editorMode === 'preview'
                            ? 'bg-blue-600 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {tr("To'liq o'qish ko'rinishi")}
                      </button>
                    </div>

                    {!isCreatingNewPost && (
                      <button
                        type="button"
                        onClick={handleResetPostFormToSaved}
                        title={tr("Saqlangan asl matnni qayta yuklash")}
                        className="px-3 py-2 text-xs font-medium text-zinc-300 bg-[#050505] border border-zinc-800 rounded-lg hover:border-zinc-700 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {tr('Asl holatiga qaytarish')}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleCancelEditPost}
                      className="px-3 py-2 text-xs font-medium text-zinc-300 bg-[#050505] border border-zinc-800 rounded-lg hover:border-zinc-700 hover:text-white transition-colors cursor-pointer"
                    >
                      {tr('Yopish / Bekor qilish')}
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-lg shadow-blue-600/20"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSaving
                        ? tr('Saqlanmoqda...')
                        : isCreatingNewPost
                        ? tr('Maqolani chop etish va saqlash')
                        : tr("O'zgarishlarni saqlash")}
                    </button>
                  </div>
                </div>

                {editorMode === 'preview' ? (
                  <div className="p-6 lg:p-10 rounded-2xl bg-[#050505] border border-zinc-800 space-y-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span className="text-blue-400 font-medium">
                        {tr(editingPost.category)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">
                        {formatUzbekDate(editingPost.publishedAt, alphabetMode)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">{tr(editingPost.readTime)}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {editingPost.published ? tr('Nashr qilingan') : tr('Qoralama')}
                      </span>
                    </div>

                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                      {tr(editingPost.title)}
                    </h1>

                    <p className="text-base text-zinc-300 leading-relaxed">
                      {tr(editingPost.excerpt)}
                    </p>

                    {editingPost.imageUrl && (
                      <div className="rounded-xl overflow-hidden border border-zinc-800 aspect-video max-h-80 bg-zinc-900">
                        <img
                          src={editingPost.imageUrl}
                          alt={editingPost.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="pt-4 border-t border-zinc-800">
                      <MarkdownArticleContent
                        content={tr(editingPost.content)}
                        alphabetMode={alphabetMode}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Gemini AI Blog Assistant Studio Bar */}
                    <div className="p-4 rounded-xl bg-[#050505] border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{tr('AI Maqola Yordamchisi (Gemini)')}</span>
                        </div>
                        <p className="text-xs text-zinc-400">
                          {aiAssistStatus ||
                            tr(
                              "Sarlavha asosida to'liq Markdown maqola qoralamasini yozish yoki anons va teglarni avtomatik boyitish."
                            )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={Boolean(aiAssistLoading)}
                          onClick={() => handleRunBlogAiAssist(editingPost, 'full_draft')}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {aiAssistLoading === 'full_draft'
                              ? tr('AI yozmoqda...')
                              : tr('AI bilan qoralama yozish')}
                          </span>
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(aiAssistLoading)}
                          onClick={() => handleRunBlogAiAssist(editingPost, 'metadata_only')}
                          className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/50 hover:text-white disabled:opacity-50 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>
                            {aiAssistLoading === 'metadata_only'
                              ? tr('Tahlil qilinmoqda...')
                              : tr('Anons va teglarni AI bilan boyitish')}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      <div className="lg:col-span-8">
                        <label className="block text-xs text-zinc-400 mb-1.5">
                          {tr('Maqola sarlavhasi')}
                        </label>
                        <input
                          type="text"
                          required
                          value={editingPost.title}
                          onChange={(e) => handleUpdatePostForm({ title: e.target.value })}
                          placeholder={tr('Masalan: Solaris 3D platformasida yangi imkoniyatlar')}
                          className="w-full px-3.5 py-2.5 text-sm font-semibold bg-[#050505] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="lg:col-span-4">
                        <label className="block text-xs text-zinc-400 mb-1.5">
                          {tr("Bo'lim (Kategoriya)")}
                        </label>
                        <select
                          value={editingPost.category}
                          onChange={(e) =>
                            handleUpdatePostForm({
                              category: e.target.value as BlogCategory,
                            })
                          }
                          className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-blue-500"
                        >
                          <option value="Dasturlash va IT">{tr('Dasturlash va IT')}</option>
                          <option value="Astronomiya va Fan">{tr('Astronomiya va Fan')}</option>
                          <option value="O'zbek tili va Imlo">{tr("O'zbek tili va Imlo")}</option>
                          <option value="Shaxsiy fikrlar">{tr('Shaxsiy fikrlar')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1.5">
                          {tr('Nashr sanasi (YYYY-MM-DD)')}
                        </label>
                        <input
                          type="date"
                          value={editingPost.publishedAt}
                          onChange={(e) =>
                            handleUpdatePostForm({
                              publishedAt: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs font-mono-tabular bg-[#050505] border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 mb-1.5">
                          {tr("O'qish vaqti")}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingPost.readTime}
                            onChange={(e) => handleUpdatePostForm({ readTime: e.target.value })}
                            placeholder="5 daqiqa"
                            className="w-full px-3 py-2 text-xs font-mono-tabular bg-[#050505] border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdatePostForm({
                                readTime: estimateReadTime(editingPost.content),
                              })
                            }
                            title={tr('Matn hajmiga qarab avtomatik hisoblash')}
                            className="px-2.5 py-2 text-xs text-zinc-300 bg-[#050505] border border-zinc-800 rounded-lg hover:border-zinc-700 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {tr('Avto')}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 mb-1.5">
                          {tr('Maqola havolasi (Slug)')}
                        </label>
                        <input
                          type="text"
                          value={editingPost.slug}
                          onChange={(e) =>
                            handleUpdatePostForm({
                              slug: slugifyTitle(e.target.value),
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs font-mono-tabular bg-[#050505] border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-end gap-3">
                        <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#050505] border border-zinc-800 text-xs text-zinc-200 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={editingPost.published}
                            onChange={(e) =>
                              handleUpdatePostForm({
                                published: e.target.checked,
                              })
                            }
                            className="accent-blue-600"
                          />
                          <span>{tr('Saytda ochiq')}</span>
                        </label>

                        <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#050505] border border-zinc-800 text-xs text-amber-300 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={editingPost.featured}
                            onChange={(e) =>
                              handleUpdatePostForm({
                                featured: e.target.checked,
                              })
                            }
                            className="accent-blue-600"
                          />
                          <span>{tr('Asosiy (Pin)')}</span>
                        </label>
                      </div>
                    </div>

                    {/* Cover Image & Quick Presets */}
                    <div className="space-y-2">
                      <label className="block text-xs text-zinc-400">
                        {tr('Muqova rasmi manzili (URL yoki tayyor mavzuli tasvirlar)')}
                      </label>
                      <input
                        type="text"
                        value={editingPost.imageUrl}
                        onChange={(e) => handleUpdatePostForm({ imageUrl: e.target.value })}
                        placeholder="/src/assets/images/..."
                        className="w-full px-3.5 py-2 text-xs font-mono-tabular bg-[#050505] border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {COVER_IMAGE_PRESETS.map((preset) => (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => handleUpdatePostForm({ imageUrl: preset.url })}
                            className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                              editingPost.imageUrl === preset.url
                                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                                : 'bg-[#050505] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {tr(preset.label)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Excerpt / Summary */}
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1.5">
                        {tr('Qisqacha mazmun (Anons — blog kartochkasida ko‘rinadi)')}
                      </label>
                      <textarea
                        rows={2}
                        value={editingPost.excerpt}
                        onChange={(e) => handleUpdatePostForm({ excerpt: e.target.value })}
                        placeholder={tr('Maqolaning qisqacha mazmuni (1-2 jumla)...')}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Full Article Content with Formatting Toolbar */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="block text-xs text-zinc-400">
                          {tr("Maqolaning to'liq matni (Markdown formatlash qo'llab-quvvatlanadi)")}
                        </label>
                        <div className="flex flex-wrap items-center gap-1 bg-[#050505] border border-zinc-800 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('## ')}
                            title={tr('Katta sarlavha (H2)')}
                            className="px-2 py-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 rounded inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Heading2 className="w-3.5 h-3.5" /> H2
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('### ')}
                            title={tr('Kichik sarlavha (H3)')}
                            className="px-2 py-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 rounded inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Heading3 className="w-3.5 h-3.5" /> H3
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('**', '**')}
                            title={tr('Qalin yozuv')}
                            className="px-2 py-1 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 rounded cursor-pointer"
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('> ')}
                            title={tr('Iqtibos / Eslatma')}
                            className="px-2 py-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 rounded inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Quote className="w-3.5 h-3.5" /> {tr('Iqtibos')}
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('- ')}
                            title={tr("Ro'yxat")}
                            className="px-2 py-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 rounded inline-flex items-center gap-1 cursor-pointer"
                          >
                            <List className="w-3.5 h-3.5" /> {tr("Ro'yxat")}
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('```typescript\n', '\n```')}
                            title={tr('Kod bloki')}
                            className="px-2 py-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 rounded inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Code2 className="w-3.5 h-3.5" /> {tr('Kod')}
                          </button>
                          <button
                            type="button"
                            onClick={() => insertMarkdownSnippet('[', '](https://)')}
                            title={tr('Havola')}
                            className="px-2 py-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 rounded inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Link2 className="w-3.5 h-3.5" /> {tr('Havola')}
                          </button>
                        </div>
                      </div>

                      <textarea
                        ref={contentTextareaRef}
                        rows={16}
                        required
                        value={editingPost.content}
                        onChange={(e) => handleUpdatePostForm({ content: e.target.value })}
                        placeholder={tr("Maqolaning to'liq matnini shu yerga yozing...")}
                        className="w-full px-4 py-3 text-sm font-mono-tabular bg-[#050505] border border-zinc-800 rounded-xl text-zinc-100 leading-relaxed focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1.5">
                        {tr('Teglar / Kalit so‘zlar (vergul bilan ajrating)')}
                      </label>
                      <input
                        type="text"
                        value={postTagsInput}
                        onChange={(e) => setPostTagsInput(e.target.value)}
                        placeholder="Solaris 3D, Astronomiya, TypeScript, Tilimlo.uz"
                        className="w-full px-3.5 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Form Footer Actions (Save, Cancel, Delete) */}
                    <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {!isCreatingNewPost && (
                          <>
                            {confirmDeletePostId === editingPost.id ? (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/70">
                                <span className="text-xs text-rose-300">
                                  {tr("Rostdan ham ushbu maqola o'chirilsinmi?")}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBlogPost(editingPost.id)}
                                  className="px-2.5 py-1 text-xs font-medium text-white bg-rose-600 rounded hover:bg-rose-500 transition-colors cursor-pointer"
                                >
                                  {tr("Ha, o'chirish")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeletePostId(null)}
                                  className="px-2.5 py-1 text-xs text-zinc-300 hover:text-white cursor-pointer"
                                >
                                  {tr('Bekor qilish')}
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePostId(editingPost.id)}
                                className="px-3.5 py-2 text-xs font-medium text-rose-400 bg-rose-950/30 border border-rose-900/60 rounded-lg hover:bg-rose-950/50 hover:text-rose-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                {tr("Maqolani o'chirish")}
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={handleCancelEditPost}
                          className="px-4 py-2 text-xs font-medium text-zinc-300 bg-[#050505] border border-zinc-800 rounded-lg hover:border-zinc-700 hover:text-white transition-colors cursor-pointer"
                        >
                          {tr('Bekor qilish')}
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-5 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/20"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {isSaving
                            ? tr('Saqlanmoqda...')
                            : isCreatingNewPost
                            ? tr('Yangi maqolani chop etish va saqlash')
                            : tr("Tahrirlangan maqolani saqlash")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* Blog Posts List, Sorting & Filtering View (Always Visible for Quick Edit / Delete) */}
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    {tr('Shaxsiy Blog Maqolalarini Boshqarish')} (
                    {(draft.blogPosts || []).length})
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {tr(
                      "Har bir maqoladagi «Tahrirlash» tugmasini bosganda postning barcha ma'lumotlari yuqoridagi formaga avtomatik to'ldiriladi."
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadSitemapXml}
                    title={tr(
                      "Yangi maqolalar qo'shilgan dinamik sitemap.xml faylini Google Search Console uchun yuklab olish"
                    )}
                    className="px-3.5 py-2.5 text-xs font-medium text-zinc-200 bg-[#0F0F12] border border-zinc-800 rounded-lg hover:border-blue-500/50 hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    {tr('Sitemap.xml (SEO)')}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadRssXml}
                    title={tr("Yangi maqolalar bilan boyitilgan RSS.xml faylini yuklab olish")}
                    className="px-3.5 py-2.5 text-xs font-medium text-zinc-200 bg-[#0F0F12] border border-zinc-800 rounded-lg hover:border-amber-500/50 hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    {tr('RSS.xml')}
                  </button>

                  <button
                    type="button"
                    onClick={handleAddBlogPost}
                    className="px-4 py-2.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-lg shadow-blue-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    {tr('Yangi maqola yozish')}
                  </button>
                </div>
              </div>

              {/* Filter & Search Bar inside Admin Blog List */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0F0F12] border border-zinc-800">
                <div className="flex items-center gap-1 p-1 bg-[#050505] border border-zinc-800 rounded-lg overflow-x-auto">
                  {(
                    [
                      'Barchasi',
                      'Dasturlash va IT',
                      'Astronomiya va Fan',
                      "O'zbek tili va Imlo",
                      'Shaxsiy fikrlar',
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setBlogCategoryFilter(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        blogCategoryFilter === cat
                          ? 'bg-blue-600 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tr(cat)}
                    </button>
                  ))}
                </div>

                <input
                  type="search"
                  value={blogSearchQuery}
                  onChange={(e) => setBlogSearchQuery(e.target.value)}
                  placeholder={tr('Maqolalarni qidirish...')}
                  className="w-full md:w-64 px-3.5 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {filteredAdminBlogPosts.length === 0 ? (
                <div className="p-12 rounded-2xl bg-[#0F0F12] border border-zinc-800 text-center space-y-3">
                  <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-sm font-medium text-zinc-300">
                    {tr('Maqolalar topilmadi')}
                  </p>
                  <button
                    type="button"
                    onClick={handleAddBlogPost}
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {tr('Birinchi maqolani yaratish')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAdminBlogPosts.map((post) => {
                    const realIndex = (draft.blogPosts || []).findIndex(
                      (p) => p.id === post.id
                    );
                    const isCurrentlyEditing =
                      editingPost?.id === post.id && !isCreatingNewPost;
                    const isConfirmingDelete = confirmDeletePostId === post.id;

                    return (
                      <div
                        key={post.id}
                        className={`p-5 rounded-2xl bg-[#0F0F12] border transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                          isCurrentlyEditing
                            ? 'border-blue-500/60 bg-blue-950/10'
                            : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-400">
                            <span className="font-mono-tabular text-blue-400">
                              #{realIndex + 1}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="text-zinc-200 font-medium">
                              {tr(post.category)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-tabular">
                              {formatUzbekDate(post.publishedAt, alphabetMode)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-tabular">{tr(post.readTime)}</span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                post.published ? 'text-emerald-400' : 'text-amber-400'
                              }
                            >
                              {post.published ? tr('Nashr qilingan') : tr('Qoralama')}
                            </span>
                            {post.featured && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-amber-400 inline-flex items-center gap-1 font-medium">
                                  <Sparkles className="w-3 h-3" /> {tr('Asosiy (Pin)')}
                                </span>
                              </>
                            )}
                            {isCurrentlyEditing && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-blue-400 font-semibold">
                                  {tr('Formada ochilgan')}
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="font-display text-base sm:text-lg font-bold text-white">
                            {tr(post.title)}
                          </h3>

                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {tr(post.excerpt)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {/* Reorder Up / Down Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={realIndex <= 0}
                              onClick={() => handleMoveBlogPost(realIndex, -1)}
                              title={tr("Yuqoriga ko'tarish")}
                              className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 bg-[#050505] border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={
                                realIndex < 0 ||
                                realIndex >= (draft.blogPosts || []).length - 1
                              }
                              onClick={() => handleMoveBlogPost(realIndex, 1)}
                              title={tr('Pastga tushirish')}
                              className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 bg-[#050505] border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Toggle Featured / Pin */}
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateBlogPost(post.id, { featured: !post.featured })
                            }
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              post.featured
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                                : 'bg-[#050505] border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {post.featured ? tr('Tanlangan ★') : tr('Pin qilish')}
                          </button>

                          {/* Copy Direct Indexable SEO Link (?article=slug) */}
                          <button
                            type="button"
                            onClick={() => handleCopyPostSeoUrl(post)}
                            title={tr(
                              "Google va ijtimoiy tarmoqlar uchun to'g'ridan-to'g'ri indekslanadigan SEO havolani (?article=...) nusxalash"
                            )}
                            className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-[#050505] border border-zinc-800 rounded-lg hover:border-blue-500/50 hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {copiedSeoPostId === post.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">{tr('SEO havola nusxalandi')}</span>
                              </>
                            ) : (
                              <>
                                <Link2 className="w-3.5 h-3.5 text-blue-400" />
                                <span>{tr('SEO havola')}</span>
                              </>
                            )}
                          </button>

                          {/* Edit Button: Auto-Populates Form */}
                          <button
                            type="button"
                            onClick={() => handleStartEditBlogPost(post)}
                            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                              isCurrentlyEditing
                                ? 'bg-blue-500 text-white ring-2 ring-blue-400/50'
                                : 'bg-blue-600 text-white hover:bg-blue-500'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            {isCurrentlyEditing
                              ? tr('Tahrirlanmoqda')
                              : tr('Tahrirlash')}
                          </button>

                          {/* Delete Button with Safe Inline Confirmation */}
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-800/70">
                              <span className="text-[11px] text-rose-300">
                                {tr("O'chirilsinmi?")}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteBlogPost(post.id)}
                                className="px-2 py-1 text-xs font-semibold text-white bg-rose-600 rounded hover:bg-rose-500 transition-colors cursor-pointer"
                              >
                                {tr('Ha')}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePostId(null)}
                                className="px-2 py-1 text-xs text-zinc-300 hover:text-white cursor-pointer"
                              >
                                {tr("Yo'q")}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeletePostId(post.id)}
                              aria-label={tr("Maqolani o'chirish")}
                              className="px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-[#050505] hover:bg-rose-950/30 border border-zinc-800 hover:border-rose-800/60 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{tr("O'chirish")}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-bold text-white">
                {tr('Saytdan kelgan murojaatlar')}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {tr("Bog'lanish formasi orqali yuborilgan xabarlar faqat sizga ko'rinadi.")}
              </p>
            </div>

            {inquiries.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#0F0F12] border border-zinc-800 text-center space-y-2">
                <Inbox className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-medium text-zinc-300">
                  {tr("Hozircha yangi murojaatlar yo'q")}
                </p>
                <p className="text-xs text-zinc-500">
                  {tr(
                    "Foydalanuvchilar saytdagi bog'lanish formasini to'ldirganda xabarlar shu yerda paydo bo'ladi."
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 rounded-2xl bg-[#0F0F12] border border-zinc-800 flex flex-col md:flex-row md:items-start justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                        <span className="font-semibold text-white text-sm">{item.senderName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular text-blue-400">{item.senderContact}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tr(item.projectType)}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {tr('Holat:')}{' '}
                          {item.status === 'new'
                            ? tr('Yangi')
                            : item.status === 'read'
                            ? tr("O'qilgan")
                            : tr('Arxivlangan')}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                        {tr(item.message)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {item.status === 'new' && (
                        <button
                          type="button"
                          onClick={() => updateInquiryStatus(item.id, 'read')}
                          className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {tr("O'qildi deb belgilash")}
                        </button>
                      )}
                      {item.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={() => updateInquiryStatus(item.id, 'archived')}
                          className="px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {tr('Arxivlash')}
                        </button>
                      )}
                      <a
                        href={`mailto:${item.senderContact.includes('@') ? item.senderContact : ''}?subject=${encodeURIComponent(
                          `Javob: ${item.projectType}`
                        )}`}
                        className="px-3 py-1.5 text-xs font-medium text-blue-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-blue-500/50 transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <Mail className="w-3.5 h-3.5" /> {tr('Javob yozish')}
                      </a>
                      <button
                        type="button"
                        onClick={() => deleteInquiry(item.id)}
                        aria-label={tr("Murojaatni o'chirish")}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Personal & Bio */}
        {activeTab === 'personal' && (
          <div className="p-6 lg:p-8 rounded-2xl bg-[#0F0F12] border border-zinc-800 space-y-5">
            <h2 className="font-display text-xl font-bold text-white">
              {tr("Shaxsiy Ma'lumotlar va Bio")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">{tr('Ism va Familiya')}</label>
                <input
                  type="text"
                  value={draft.personal.fullName}
                  onChange={(e) => updatePersonalField('fullName', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">{tr("Yo'nalish / Unvon")}</label>
                <input
                  type="text"
                  value={draft.personal.role}
                  onChange={(e) => updatePersonalField('role', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  {tr("Yuqori qator yo'nalishlari (Kicker)")}
                </label>
                <input
                  type="text"
                  value={draft.personal.kicker}
                  onChange={(e) => updatePersonalField('kicker', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  {tr("Tug'ilgan yil yoki tajriba yorlig'i")}
                </label>
                <input
                  type="text"
                  value={draft.personal.yearsOfExperience}
                  onChange={(e) => updatePersonalField('yearsOfExperience', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">
                {tr('Asosiy Sarlavha (Hero Headline)')}
              </label>
              <textarea
                rows={2}
                value={draft.personal.headline}
                onChange={(e) => updatePersonalField('headline', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">{tr('Qisqacha Bio')}</label>
              <textarea
                rows={3}
                value={draft.personal.shortBio}
                onChange={(e) => updatePersonalField('shortBio', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">
                {tr("Qo'shimcha Ma'lumot (Vikipediya, YouTube, GitHub faoliyati)")}
              </label>
              <textarea
                rows={4}
                value={draft.personal.detailedBio}
                onChange={(e) => updatePersonalField('detailedBio', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">
                {tr('Muloqot Odobi (Taplink uslubidagi eslatma)')}
              </label>
              <textarea
                rows={2}
                value={draft.personal.etiquetteNote}
                onChange={(e) => updatePersonalField('etiquetteNote', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">{tr('Joylashuv')}</label>
                <input
                  type="text"
                  value={draft.personal.location}
                  onChange={(e) => updatePersonalField('location', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">{tr('Holat (Status)')}</label>
                <input
                  type="text"
                  value={draft.personal.availability}
                  onChange={(e) => updatePersonalField('availability', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab: KPI Metrics, Services & Tech Stack */}
        {activeTab === 'metrics_services' && (
          <div className="space-y-8">
            <div className="p-6 lg:p-8 rounded-2xl bg-[#0F0F12] border border-zinc-800 space-y-4">
              <h2 className="font-display text-lg font-bold text-white">
                {tr("4 ta Asosiy Yo'nalish Bloki")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {draft.metrics.map((metric, idx) => (
                  <div key={metric.id} className="p-4 rounded-xl bg-[#050505] border border-zinc-800 space-y-2.5">
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">
                        {tr('Sarlavha')} #{idx + 1}
                      </label>
                      <input
                        type="text"
                        value={metric.value}
                        onChange={(e) => {
                          const nextMetrics = [...draft.metrics];
                          nextMetrics[idx] = { ...metric, value: e.target.value };
                          setDraft({ ...draft, metrics: nextMetrics });
                        }}
                        className="w-full px-3 py-2 text-sm font-mono-tabular bg-[#0F0F12] border border-zinc-800 rounded-md text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">{tr('Tavsif')}</label>
                      <input
                        type="text"
                        value={metric.label}
                        onChange={(e) => {
                          const nextMetrics = [...draft.metrics];
                          nextMetrics[idx] = { ...metric, label: e.target.value };
                          setDraft({ ...draft, metrics: nextMetrics });
                        }}
                        className="w-full px-3 py-2 text-xs bg-[#0F0F12] border border-zinc-800 rounded-md text-zinc-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 lg:p-8 rounded-2xl bg-[#0F0F12] border border-zinc-800 space-y-4">
              <h2 className="font-display text-lg font-bold text-white">
                {tr("Ko'nikmalar va Qiziqishlar (Vergul bilan ajrating)")}
              </h2>
              <div className="space-y-4">
                {draft.skillGroups.map((group, idx) => (
                  <div key={group.id} className="p-4 rounded-xl bg-[#050505] border border-zinc-800 space-y-2.5">
                    <input
                      type="text"
                      value={group.category}
                      onChange={(e) => {
                        const nextGroups = [...draft.skillGroups];
                        nextGroups[idx] = { ...group, category: e.target.value };
                        setDraft({ ...draft, skillGroups: nextGroups });
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold bg-[#0F0F12] border border-zinc-800 rounded-md text-white"
                    />
                    <input
                      type="text"
                      value={group.items.join(', ')}
                      onChange={(e) => {
                        const nextGroups = [...draft.skillGroups];
                        nextGroups[idx] = {
                          ...group,
                          items: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        };
                        setDraft({ ...draft, skillGroups: nextGroups });
                      }}
                      className="w-full px-3 py-2 text-xs bg-[#0F0F12] border border-zinc-800 rounded-md text-zinc-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 lg:p-8 rounded-2xl bg-[#0F0F12] border border-zinc-800 space-y-4">
              <h2 className="font-display text-lg font-bold text-white">
                {tr("Faoliyat Yo'nalishlari (01–04)")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {draft.services.map((service, idx) => (
                  <div key={service.id} className="p-4 rounded-xl bg-[#050505] border border-zinc-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono-tabular text-blue-400">{service.number}</span>
                      <input
                        type="text"
                        value={service.title}
                        onChange={(e) => {
                          const nextServices = [...draft.services];
                          nextServices[idx] = { ...service, title: e.target.value };
                          setDraft({ ...draft, services: nextServices });
                        }}
                        className="w-full px-3 py-2 text-sm font-medium bg-[#0F0F12] border border-zinc-800 rounded-md text-white"
                      />
                    </div>
                    <textarea
                      rows={3}
                      value={service.description}
                      onChange={(e) => {
                        const nextServices = [...draft.services];
                        nextServices[idx] = { ...service, description: e.target.value };
                        setDraft({ ...draft, services: nextServices });
                      }}
                      className="w-full px-3 py-2 text-xs bg-[#0F0F12] border border-zinc-800 rounded-md text-zinc-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Portfolio Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-white">
                {tr('GitHub va Veb Loyihalarni Boshqarish')}
              </h2>
              <button
                type="button"
                onClick={handleAddProject}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> {tr("Yangi loyiha qo'shish")}
              </button>
            </div>

            {draft.projects.map((proj) => (
              <div key={proj.id} className="p-6 rounded-2xl bg-[#0F0F12] border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => handleUpdateProject(proj.id, { title: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm font-semibold bg-[#050505] border border-zinc-800 rounded-lg text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(proj.id)}
                    aria-label={tr("Loyihani o'chirish")}
                    className="p-2.5 text-zinc-400 hover:text-rose-400 border border-zinc-800 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={proj.category}
                    onChange={(e) =>
                      handleUpdateProject(proj.id, { category: e.target.value as ProjectCategory })
                    }
                    className="px-3.5 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-200"
                  >
                    <option value="Veb-loyihalar">{tr('Veb-loyihalar')}</option>
                    <option value="Foydali dasturlar">{tr('Foydali dasturlar')}</option>
                    <option value="Ochiq bilim va Media">{tr('Ochiq bilim va Media')}</option>
                  </select>
                  <input
                    type="text"
                    placeholder={tr('Yil (masalan, 2025)')}
                    value={proj.year}
                    onChange={(e) => handleUpdateProject(proj.id, { year: e.target.value })}
                    className="px-3.5 py-2 text-xs font-mono-tabular bg-[#050505] border border-zinc-800 rounded-lg text-zinc-200"
                  />
                  <input
                    type="text"
                    placeholder={tr('Loyiha turi')}
                    value={proj.client}
                    onChange={(e) => handleUpdateProject(proj.id, { client: e.target.value })}
                    className="px-3.5 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-200"
                  />
                </div>

                <textarea
                  rows={2}
                  placeholder={tr('Loyiha qisqacha tavsifi')}
                  value={proj.summary}
                  onChange={(e) => handleUpdateProject(proj.id, { summary: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-300"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder={tr('GitHub yoki sayt havolasi')}
                    value={proj.liveUrl}
                    onChange={(e) =>
                      handleUpdateProject(proj.id, {
                        liveUrl: e.target.value,
                        repoUrl: e.target.value,
                      })
                    }
                    className="px-3.5 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-200"
                  />
                  <input
                    type="text"
                    placeholder={tr('Texnologiyalar (vergul bilan)')}
                    value={proj.technologies.join(', ')}
                    onChange={(e) =>
                      handleUpdateProject(proj.id, {
                        technologies: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="px-3.5 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-200"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Experience & Activities */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-white">
                {tr('Faoliyat, Vikipediya va Blog')}
              </h2>
              <button
                type="button"
                onClick={handleAddExperience}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> {tr("Yangi band qo'shish")}
              </button>
            </div>

            {draft.experience.map((exp) => (
              <div key={exp.id} className="p-6 rounded-2xl bg-[#0F0F12] border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => handleUpdateExperience(exp.id, { role: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm font-semibold bg-[#050505] border border-zinc-800 rounded-lg text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteExperience(exp.id)}
                    aria-label={tr("O'chirish")}
                    className="p-2.5 text-zinc-400 hover:text-rose-400 border border-zinc-800 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleUpdateExperience(exp.id, { company: e.target.value })}
                    placeholder={tr('Loyiha yoki platforma')}
                    className="px-3.5 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-200"
                  />
                  <input
                    type="text"
                    value={exp.period}
                    onChange={(e) => handleUpdateExperience(exp.id, { period: e.target.value })}
                    placeholder={tr('Davr')}
                    className="px-3.5 py-2 text-xs font-mono-tabular bg-[#050505] border border-zinc-800 rounded-lg text-zinc-200"
                  />
                  <select
                    value={exp.type}
                    onChange={(e) =>
                      handleUpdateExperience(exp.id, {
                        type: e.target.value as 'Faoliyat' | "Ta'lim",
                      })
                    }
                    className="px-3.5 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-200"
                  >
                    <option value="Faoliyat">{tr('Faoliyat')}</option>
                    <option value="Ta'lim">{tr("Ta'lim")}</option>
                  </select>
                </div>

                <textarea
                  rows={2}
                  value={exp.description}
                  onChange={(e) => handleUpdateExperience(exp.id, { description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-300"
                />
              </div>
            ))}
          </div>
        )}

        {/* Tab: Official Links & Backup */}
        {activeTab === 'contacts' && (
          <div className="p-6 lg:p-8 rounded-2xl bg-[#0F0F12] border border-zinc-800 space-y-6">
            <h2 className="font-display text-xl font-bold text-white">
              {tr('Rasmiy Havolalar va Kontaktlar')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  {tr('Elektron pochta (Email)')}
                </label>
                <input
                  type="email"
                  value={draft.personal.email}
                  onChange={(e) => updatePersonalField('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">{tr('Taplink havolasi')}</label>
                <input
                  type="url"
                  value={draft.personal.taplink}
                  onChange={(e) => updatePersonalField('taplink', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">{tr('GitHub profili')}</label>
                <input
                  type="url"
                  value={draft.personal.github}
                  onChange={(e) => updatePersonalField('github', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  {tr('Shaxsiy sayt (solijonsolayev.github.io)')}
                </label>
                <input
                  type="url"
                  value={draft.personal.website}
                  onChange={(e) => updatePersonalField('website', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  {tr('YouTube kanal (@Solijon_Solayev)')}
                </label>
                <input
                  type="url"
                  value={draft.personal.youtube}
                  onChange={(e) => updatePersonalField('youtube', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  {tr("O'zbekcha Vikipediya sahifasi")}
                </label>
                <input
                  type="url"
                  value={draft.personal.wikipedia}
                  onChange={(e) => updatePersonalField('wikipedia', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  {tr('Vikiombor (Wikimedia Commons) sahifasi')}
                </label>
                <input
                  type="url"
                  value={draft.personal.commons}
                  onChange={(e) => updatePersonalField('commons', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  {tr("Qo'shimcha aloqa yozuvi / Telefon")}
                </label>
                <input
                  type="text"
                  value={draft.personal.phone}
                  onChange={(e) => updatePersonalField('phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#050505] border border-zinc-800 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800 space-y-3">
              <h3 className="text-sm font-semibold text-white">
                {tr('Zaxira Nusxa (JSON) va Asl Holatga Qaytarish')}
              </h3>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-4 py-2 text-xs font-medium text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> {tr('JSON Eksport qilish')}
                </button>

                <label className="px-4 py-2 text-xs font-medium text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> {tr('JSON Yuklash')}
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>

                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="px-4 py-2 text-xs font-medium text-rose-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-rose-900 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> {tr("Asl ma'lumotlarni tiklash")}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(DEFAULT_PROFILE_DATA);
                        handleSaveToCloud(DEFAULT_PROFILE_DATA);
                        setConfirmReset(false);
                      }}
                      className="px-3 py-2 text-xs font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {tr('Tasdiqlash va Saqlash')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {tr('Bekor qilish')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

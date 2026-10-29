import React, { useState, useEffect, useCallback } from 'react';
import {
  Github,
  Globe,
  Camera,
  ExternalLink,
  RefreshCw,
  Shuffle,
  ArrowUpRight,
  Clock,
  FileText,
  Maximize2,
  X,
  Eye as EyeIcon,
} from 'lucide-react';
import { UzbekAlphabetMode, formatUzbekText } from '../utils/uzbekAlphabet';
import { SpotlightCard } from './SpotlightCard';
import { MouseFollowingEyes } from '@/components/ui/mouse-following-eyes';

interface GithubRepoItem {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
  homepage: string;
}

interface WikiContributionItem {
  revid: number;
  title: string;
  timestamp: string;
  comment: string;
  sizediff: number;
  url: string;
}

interface CommonsPhotoItem {
  title: string;
  cleanTitle: string;
  timestamp: string;
  thumbUrl: string;
  fullUrl: string;
  descriptionUrl: string;
  width: number;
  height: number;
}

interface LiveActivityResponse {
  updatedAt: string;
  github: {
    username: string;
    profileUrl: string;
    publicRepos: number;
    followers: number;
    repos: GithubRepoItem[];
  };
  wikipedia: {
    username: string;
    profileUrl: string;
    editCount: number;
    registration: string;
    contributions: WikiContributionItem[];
  };
  commons: {
    username: string;
    profileUrl: string;
    photos: CommonsPhotoItem[];
  };
}

const FALLBACK_DATA: LiveActivityResponse = {
  updatedAt: new Date().toISOString(),
  github: {
    username: 'SolijonSolayev',
    profileUrl: 'https://github.com/SolijonSolayev',
    publicRepos: 8,
    followers: 12,
    repos: [
      {
        id: 1,
        name: 'SolijonSolayev.github.io',
        description: 'Shaxsiy IT raqamli vizitka, portfolio va texnik blog platformasi',
        url: 'https://github.com/SolijonSolayev/SolijonSolayev.github.io',
        stars: 5,
        forks: 1,
        language: 'TypeScript',
        updatedAt: '2026-03-29T10:00:00Z',
        homepage: 'https://solijonsolayev.github.io',
      },
      {
        id: 2,
        name: 'usb-formatter',
        description: 'Flesh-xotira va tashqi disklarni xavfsiz hamda tezkor formatlash dasturi',
        url: 'https://github.com/SolijonSolayev/usb-formatter',
        stars: 6,
        forks: 1,
        language: 'Python',
        updatedAt: '2026-03-18T14:20:00Z',
        homepage: 'https://github.com/SolijonSolayev/usb-formatter',
      },
      {
        id: 3,
        name: 'AqlliTozalash',
        description: 'Tizimdagi ortiqcha vaqtinchalik fayllar va keshni aqlli tozalash skripti',
        url: 'https://github.com/SolijonSolayev/AqlliTozalash',
        stars: 7,
        forks: 2,
        language: 'Batchfile',
        updatedAt: '2026-02-25T09:15:00Z',
        homepage: 'https://github.com/SolijonSolayev/AqlliTozalash',
      },
    ],
  },
  wikipedia: {
    username: 'Solijon_Solayev',
    profileUrl: 'https://uz.wikipedia.org/wiki/Foydalanuvchi:Solijon_Solayev',
    editCount: 420,
    registration: '2022-05-10T00:00:00Z',
    contributions: [
      {
        revid: 101,
        title: 'Yangiariq tumani',
        timestamp: '2026-03-20T12:00:00Z',
        comment: "Hududiy ma'lumotlar va tarixiy manbalar boyitildi",
        sizediff: 640,
        url: 'https://uz.wikipedia.org/wiki/Yangiariq_tumani',
      },
      {
        revid: 102,
        title: 'Xorazm viloyati',
        timestamp: '2026-03-11T15:30:00Z',
        comment: "Infratuzilma va madaniy meros ma'lumotlari yangilandi",
        sizediff: 410,
        url: 'https://uz.wikipedia.org/wiki/Xorazm_viloyati',
      },
      {
        revid: 103,
        title: "O'zbek lotin alifbosi",
        timestamp: '2026-02-28T08:45:00Z',
        comment: 'Alifbo islohotlari va harflar jadvali yangilandi',
        sizediff: 520,
        url: 'https://uz.wikipedia.org/wiki/O%CA%BBzbek_lotin_alifbosi',
      },
    ],
  },
  commons: {
    username: 'Solijon_Solayev',
    profileUrl: 'https://commons.wikimedia.org/wiki/User:Solijon_Solayev',
    photos: [
      {
        title: 'File:Khiva Ichan Kala Sunset.jpg',
        cleanTitle: 'Khiva Ichan Kala Architectural Panorama',
        timestamp: '2026-02-15T16:00:00Z',
        thumbUrl: '/src/assets/images/project_solaris3d_astronomy_1793272827947.jpg',
        fullUrl: '/src/assets/images/project_solaris3d_astronomy_1793272827947.jpg',
        descriptionUrl: 'https://commons.wikimedia.org/wiki/User:Solijon_Solayev',
        width: 3840,
        height: 2160,
      },
      {
        title: 'File:Tilimlo Platform Interface.jpg',
        cleanTitle: 'Wikimedia Commons Open Media Contribution',
        timestamp: '2026-01-22T11:20:00Z',
        thumbUrl: '/src/assets/images/project_tilimlo_platform_1793272827504.jpg',
        fullUrl: '/src/assets/images/project_tilimlo_platform_1793272827504.jpg',
        descriptionUrl: 'https://commons.wikimedia.org/wiki/User:Solijon_Solayev',
        width: 3840,
        height: 2160,
      },
    ],
  },
};

function createShuffledPhotos(
  pool: CommonsPhotoItem[],
  previousFirstTitle?: string
): CommonsPhotoItem[] {
  if (pool.length <= 1) return [...pool];
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  if (previousFirstTitle && copy.length > 1 && copy[0].title === previousFirstTitle) {
    const swapIdx = 1 + Math.floor(Math.random() * (copy.length - 1));
    [copy[0], copy[swapIdx]] = [copy[swapIdx], copy[0]];
  }
  return copy;
}

async function fetchDirectWikimediaCommonsPool(): Promise<CommonsPhotoItem[]> {
  try {
    const res = await fetch(
      'https://commons.wikimedia.org/w/api.php?action=query&generator=allimages&gaiuser=Solijon_Solayev&gaisort=timestamp&gaidir=descending&gailimit=50&prop=imageinfo&iiprop=url|timestamp|dimensions&iiurlwidth=640&format=json&origin=*'
    );
    if (!res.ok) return [];
    const commonsJson = (await res.json()) as {
      query?: {
        pages?: Record<
          string,
          {
            pageid?: number;
            title?: string;
            imageinfo?: Array<{
              thumburl?: string;
              url?: string;
              descriptionurl?: string;
              timestamp?: string;
              width?: number;
              height?: number;
            }>;
          }
        >;
      };
    };
    const pagesObj = commonsJson.query?.pages || {};
    return Object.values(pagesObj)
      .map((page, idx) => {
        const info = page.imageinfo?.[0];
        if (!info || (!info.thumburl && !info.url)) return null;
        const cleanedTitle = (page.title || `Commons Photo ${idx + 1}`)
          .replace(/^File:/i, '')
          .replace(/\.[^.]+$/, '')
          .replace(/_/g, ' ');
        return {
          title: page.title || cleanedTitle,
          cleanTitle: cleanedTitle,
          thumbUrl: info.thumburl || info.url || '',
          fullUrl: info.url || info.thumburl || '',
          descriptionUrl:
            info.descriptionurl ||
            `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title || '')}`,
          timestamp: info.timestamp || new Date().toISOString(),
          width: info.width || 0,
          height: info.height || 0,
        };
      })
      .filter((item): item is CommonsPhotoItem => Boolean(item && item.thumbUrl));
  } catch {
    return [];
  }
}

interface LiveEcosystemSectionProps {
  alphabetMode: UzbekAlphabetMode;
}

export const LiveEcosystemSection: React.FC<LiveEcosystemSectionProps> = ({ alphabetMode }) => {
  const [data, setData] = useState<LiveActivityResponse>(FALLBACK_DATA);
  const [shuffledPhotos, setShuffledPhotos] = useState<CommonsPhotoItem[]>(
    FALLBACK_DATA.commons.photos
  );
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'github' | 'wikipedia' | 'commons'>('all');
  const [previewPhoto, setPreviewPhoto] = useState<CommonsPhotoItem | null>(null);

  const tr = (text: string) => formatUzbekText(text, alphabetMode);

  const randomizeCommonsPhotos = useCallback(() => {
    setIsShuffling(true);
    setShuffledPhotos((prev) =>
      createShuffledPhotos(data.commons.photos, prev[0]?.title)
    );
    window.setTimeout(() => setIsShuffling(false), 350);
  }, [data.commons.photos]);

  const fetchLiveActivity = async () => {
    setLoading(true);
    try {
      const [response, directCommonsPool] = await Promise.all([
        fetch('/api/live-activity').catch(() => null),
        fetchDirectWikimediaCommonsPool(),
      ]);

      if (response && response.ok) {
        const json = await response.json();
        const normalizedRepos: GithubRepoItem[] = Array.isArray(json.github?.repos) && json.github.repos.length
          ? json.github.repos.map((r: Partial<GithubRepoItem> & { htmlUrl?: string }, idx: number) => ({
              id: r.id ?? idx + 1,
              name: r.name || `repo-${idx + 1}`,
              description: r.description || '',
              url: r.url || r.htmlUrl || `https://github.com/SolijonSolayev/${r.name || ''}`,
              stars: typeof r.stars === 'number' ? r.stars : 0,
              forks: typeof r.forks === 'number' ? r.forks : 0,
              language: r.language || 'Web / Code',
              updatedAt: r.updatedAt || new Date().toISOString(),
              homepage: r.homepage || '',
            }))
          : FALLBACK_DATA.github.repos;

        const normalizedContribs: WikiContributionItem[] = Array.isArray(json.wikipedia?.contributions) && json.wikipedia.contributions.length
          ? json.wikipedia.contributions.map((c: Partial<WikiContributionItem> & { revId?: number; sizeDiff?: number }, idx: number) => ({
              revid: c.revid ?? c.revId ?? idx + 100,
              title: c.title || `Maqola #${idx + 1}`,
              timestamp: c.timestamp || new Date().toISOString(),
              comment: c.comment || "Ensiklopedik maqola tahriri va ma'lumotlar boyitilishi",
              sizediff: typeof c.sizediff === 'number' ? c.sizediff : typeof c.sizeDiff === 'number' ? c.sizeDiff : 0,
              url: c.url || 'https://uz.wikipedia.org/wiki/Foydalanuvchi:Solijon_Solayev',
            }))
          : FALLBACK_DATA.wikipedia.contributions;

        const serverPhotos: CommonsPhotoItem[] = Array.isArray(json.commons?.photos) && json.commons.photos.length
          ? json.commons.photos.map((p: Partial<CommonsPhotoItem>, idx: number) => ({
              title: p.title || `commons-photo-${idx + 1}`,
              cleanTitle: (p.cleanTitle || p.title || 'Wikimedia Commons Media').replace(/_/g, ' '),
              timestamp: p.timestamp || new Date().toISOString(),
              thumbUrl: p.thumbUrl || p.fullUrl || FALLBACK_DATA.commons.photos[0].thumbUrl,
              fullUrl: p.fullUrl || p.thumbUrl || FALLBACK_DATA.commons.photos[0].fullUrl,
              descriptionUrl: p.descriptionUrl || 'https://commons.wikimedia.org/wiki/User:Solijon_Solayev',
              width: typeof p.width === 'number' ? p.width : 0,
              height: typeof p.height === 'number' ? p.height : 0,
            }))
          : [];

        // Merge server photos and direct Wikimedia Commons pool by unique title
        const photoMap = new Map<string, CommonsPhotoItem>();
        for (const item of [...directCommonsPool, ...serverPhotos]) {
          if (item && item.thumbUrl && !photoMap.has(item.title)) {
            photoMap.set(item.title, item);
          }
        }
        const mergedPhotos =
          photoMap.size > 0 ? Array.from(photoMap.values()) : FALLBACK_DATA.commons.photos;

        setData({
          updatedAt: json.updatedAt || json.fetchedAt || new Date().toISOString(),
          github: {
            ...FALLBACK_DATA.github,
            ...json.github,
            repos: normalizedRepos,
          },
          wikipedia: {
            ...FALLBACK_DATA.wikipedia,
            ...json.wikipedia,
            contributions: normalizedContribs,
          },
          commons: {
            ...FALLBACK_DATA.commons,
            ...json.commons,
            photos: mergedPhotos,
          },
        });
        setShuffledPhotos(createShuffledPhotos(mergedPhotos));
      } else if (directCommonsPool.length > 0) {
        setData((prev) => ({
          ...prev,
          commons: {
            ...prev.commons,
            photos: directCommonsPool,
          },
        }));
        setShuffledPhotos(createShuffledPhotos(directCommonsPool));
      }
    } catch {
      // Keep fallback data if offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveActivity();
  }, []);

  // Automatically rotate Wikimedia Commons images randomly every 7 seconds
  useEffect(() => {
    if (previewPhoto || data.commons.photos.length <= 1) return;
    const intervalId = window.setInterval(() => {
      randomizeCommonsPhotos();
    }, 7000);
    return () => window.clearInterval(intervalId);
  }, [previewPhoto, data.commons.photos.length, randomizeCommonsPhotos]);

  const formatShortDate = (iso: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return iso.slice(0, 10);
    }
  };

  return (
    <section
      id="ekotizim"
      className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-24 border-b border-zinc-800/80"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs text-blue-400 font-medium inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {tr('Real-Vaqt Integratsiyasi · GitHub, Vikipediya va Vikiombor')}
          </p>
          <h2
            className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white"
            style={{ textWrap: 'balance' }}
          >
            {tr('Ochiq kodli repozitoriylar va erkin ensiklopediyadagi jonli faoliyat')}
          </h2>
        </div>

        {/* Filter & Refresh Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-[#0F0F12] border border-zinc-800 rounded-lg">
            {(
              [
                { id: 'all', label: 'Barchasi' },
                { id: 'github', label: 'GitHub' },
                { id: 'wikipedia', label: 'Vikipediya' },
                { id: 'commons', label: 'Vikiombor' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tr(tab.label)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={fetchLiveActivity}
            disabled={loading}
            title={tr("Jonli ma'lumotlarni yangilash")}
            className="p-2 rounded-lg bg-[#0F0F12] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Live Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <a
          href={data.github.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group p-5 rounded-2xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/40 transition-colors flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-blue-400" />
              GitHub · @{data.github.username}
            </p>
            <p className="font-display text-2xl font-bold text-white mt-1.5 font-mono-tabular">
              {data.github.publicRepos}{' '}
              <span className="text-xs font-sans font-normal text-zinc-400">
                {tr('ochiq repozitoriy')}
              </span>
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
        </a>

        <a
          href={data.wikipedia.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group p-5 rounded-2xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/40 transition-colors flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              {tr("O'zbekcha Vikipediya")}
            </p>
            <p className="font-display text-2xl font-bold text-white mt-1.5 font-mono-tabular">
              {data.wikipedia.editCount}+{' '}
              <span className="text-xs font-sans font-normal text-zinc-400">
                {tr('ensiklopedik tahrir')}
              </span>
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
        </a>

        <a
          href={data.commons.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group p-5 rounded-2xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/40 transition-colors flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              Wikimedia Commons
            </p>
            <p className="font-display text-2xl font-bold text-white mt-1.5 font-mono-tabular">
              {data.commons.photos.length}+{' '}
              <span className="text-xs font-sans font-normal text-zinc-400">
                {tr('mualliflik media fayl')}
              </span>
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
        </a>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Column 1: GitHub Repositories */}
        {(activeTab === 'all' || activeTab === 'github') && (
          <div
            className={`${
              activeTab === 'github' ? 'lg:col-span-12' : 'lg:col-span-4'
            } flex flex-col`}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-blue-400" />
                <h3 className="font-display text-sm font-bold text-white">
                  {tr('GitHub Repozitoriylar')}
                </h3>
              </div>
              <a
                href={data.github.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                @{data.github.username}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div
              className={`grid gap-3.5 ${
                activeTab === 'github' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
              }`}
            >
              {data.github.repos.map((repo, idx) => (
                <SpotlightCard
                  key={`github-repo-${repo.id ?? repo.name}-${idx}`}
                  as="article"
                  className="p-4 rounded-xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-white hover:text-blue-400 transition-colors font-mono-tabular break-all"
                      >
                        {repo.name}
                      </a>
                      <ArrowUpRight className="w-4 h-4 text-zinc-500 shrink-0" />
                    </div>
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {tr(repo.description || 'Ochiq kodli dasturiy loyiha va texnik ishlanma.')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono-tabular text-zinc-500 mt-4 pt-3 border-t border-zinc-800/80">
                    <span className="text-zinc-300">
                      {repo.language} · ★ {repo.stars}
                    </span>
                    <span>{formatShortDate(repo.updatedAt)}</span>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        )}

        {/* Column 2: Uzbek Wikipedia Contributions */}
        {(activeTab === 'all' || activeTab === 'wikipedia') && (
          <div
            className={`${
              activeTab === 'wikipedia' ? 'lg:col-span-12' : 'lg:col-span-4'
            } flex flex-col`}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <h3 className="font-display text-sm font-bold text-white">
                  {tr('Vikipediya Tahrirlari')}
                </h3>
              </div>
              <a
                href={data.wikipedia.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                uz.wikipedia.org
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div
              className={`grid gap-3.5 ${
                activeTab === 'wikipedia'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {data.wikipedia.contributions.map((item, idx) => (
                <SpotlightCard
                  key={`wiki-contrib-${item.revid ?? item.title}-${idx}`}
                  as="article"
                  className="p-4 rounded-xl bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-white hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{tr(item.title)}</span>
                      </a>
                      <span
                        className={`text-xs font-mono-tabular shrink-0 ${
                          item.sizediff >= 0 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {item.sizediff >= 0 ? `+${item.sizediff} B` : `${item.sizediff} B`}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {tr(item.comment || "Ensiklopedik maqola tahriri va ma'lumotlar boyitilishi")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono-tabular text-zinc-500 mt-4 pt-3 border-t border-zinc-800/80">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatShortDate(item.timestamp)}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline font-sans"
                    >
                      {tr('Maqolani ochish →')}
                    </a>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        )}

        {/* Column 3: Wikimedia Commons Authored Photos */}
        {(activeTab === 'all' || activeTab === 'commons') && (
          <div
            className={`${
              activeTab === 'commons' ? 'lg:col-span-12' : 'lg:col-span-4'
            } flex flex-col`}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                <h3 className="font-display text-sm font-bold text-white">
                  {tr('Vikiombor Fotogalereyasi')}
                </h3>
              </div>
              <div className="flex items-center gap-2.5">
                {data.commons.photos.length > 1 && (
                  <button
                    type="button"
                    onClick={randomizeCommonsPhotos}
                    title={tr('Vikimedia rasmlarini tasodifiy yangilash')}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 hover:border-blue-500/40 text-[11px] font-medium text-zinc-300 hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <Shuffle
                      className={`w-3 h-3 text-blue-400 transition-transform duration-300 ${
                        isShuffling ? 'rotate-180 scale-110' : ''
                      }`}
                    />
                    <span>{tr('Tasodifiy')}</span>
                  </button>
                )}
                <a
                  href={data.commons.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  Commons
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div
              className={`grid gap-3.5 transition-opacity duration-300 ${
                isShuffling ? 'opacity-60' : 'opacity-100'
              } ${
                activeTab === 'commons'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-2'
              }`}
            >
              {(activeTab === 'commons'
                ? shuffledPhotos.slice(0, 12)
                : shuffledPhotos.slice(0, 6)
              ).map((photo, idx) => (
                <div
                  key={`commons-photo-${photo.title || photo.cleanTitle}-${idx}`}
                  onClick={() => setPreviewPhoto(photo)}
                  className="group relative rounded-xl overflow-hidden bg-[#0F0F12] border border-zinc-800 hover:border-blue-500/50 cursor-pointer aspect-4/3"
                >
                  <img
                    src={photo.thumbUrl}
                    alt={photo.cleanTitle}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                  <div className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/70 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <p className="text-xs font-medium text-white line-clamp-1">
                      {photo.cleanTitle}
                    </p>
                    <p className="text-[11px] font-mono-tabular text-zinc-400 mt-0.5">
                      {photo.width > 0 ? `${photo.width}×${photo.height}` : 'CC BY-SA 4.0'} ·{' '}
                      {formatShortDate(photo.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive UI Widget Showcase: Mouse Following Eyes */}
      <div className="mt-10 p-6 rounded-2xl bg-[#0F0F12] border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <EyeIcon className="w-4 h-4 text-blue-400" />
            <h3 className="font-display text-sm font-bold text-white">
              {tr("Interaktiv UI Vidjeti · Sichqonchaga Ergashuvchi Ko'zlar (Mouse Following Eyes)")}
            </h3>
          </div>
          <span className="text-[11px] font-mono-tabular px-2.5 py-0.5 rounded bg-blue-600/15 border border-blue-500/30 text-blue-300">
            shadcn/ui component
          </span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {tr("Sichqonchani ushbu interaktiv hudud ustida harakatlantiring. Sichqoncha kursorining koordinatalari bo'yicha qorachiqlar trigonometrik hisoblash asosida dinamik ergashadi.")}
        </p>
        <div className="rounded-xl bg-[#050505] border border-zinc-800/80 overflow-hidden relative group">
          <MouseFollowingEyes className="w-full h-48 flex justify-center items-center bg-gradient-to-br from-zinc-950 via-[#0A0A0D] to-zinc-900" />
        </div>
      </div>

      {/* Lightbox Modal for Wikimedia Commons Photo */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="max-w-4xl w-full bg-[#0F0F12] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-[#050505] max-h-[70vh] flex items-center justify-center overflow-hidden">
              <img
                src={previewPhoto.fullUrl || previewPhoto.thumbUrl}
                alt={previewPhoto.cleanTitle}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900/80 text-zinc-300 hover:text-white border border-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-blue-400 font-medium">
                  Wikimedia Commons · {tr('Muallif: Solijon Solayev')}
                </p>
                <h4 className="font-display text-base font-bold text-white mt-1">
                  {previewPhoto.cleanTitle}
                </h4>
                <p className="text-xs font-mono-tabular text-zinc-400 mt-1">
                  {previewPhoto.width > 0
                    ? `${previewPhoto.width} × ${previewPhoto.height} px · `
                    : ''}
                  {formatShortDate(previewPhoto.timestamp)}
                </p>
              </div>
              <a
                href={previewPhoto.descriptionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-xs hover:bg-blue-500 transition-colors shrink-0"
              >
                <span>{tr("Vikiomborda ko'rish")}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

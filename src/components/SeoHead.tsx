import React, { useEffect } from 'react';
import { BlogPostItem, ProfileData } from '../types/profile';
import {
  formatUzbekText,
  toClassicUzbekLatin,
  toNewUzbekLatin,
  UzbekAlphabetMode,
} from '../utils/uzbekAlphabet';

export type SeoActivePage = 'home' | 'loyihalar' | 'blog' | 'tajriba' | 'boglanish';

interface SeoHeadProps {
  rawProfile: ProfileData;
  alphabetMode: UzbekAlphabetMode;
  activePage?: SeoActivePage;
  activeBlogPost?: BlogPostItem | null;
}

const DEFAULT_SITE_TITLE = 'Solijon Solayev — Shaxsiy Vizitka va IT Portfolio';
const DEFAULT_SITE_DESCRIPTION =
  "Solijon Solayevning shaxsiy raqamli vizitkasi, IT portfeli (Solaris 3D, Tilimlo.uz), shaxsiy blogi, Vikipediya va Vikiombor jonli ekotizimi hamda ikki alifboli (Ö, Ğ, Ş, Ç va Oʻ, Gʻ, Sh, Ch) veb-platformasi.";

interface DynamicSocialMetaPayload {
  pageTitle: string;
  pageDescription: string;
  ogType: 'website' | 'article';
  ogUrl: string;
  ogSiteName: string;
  ogLocale: string;
  ogLocaleAlternate: string;
  ogImage: string;
  ogImageAlt: string;
  ogImageWidth: string;
  ogImageHeight: string;
  twitterCard: 'summary_large_image' | 'summary';
  twitterSite: string;
  twitterCreator: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterImageAlt: string;
  twitterLabel1: string;
  twitterData1: string;
  twitterLabel2: string;
  twitterData2: string;
  articleMeta?: {
    publishedTime: string;
    modifiedTime: string;
    author: string;
    section: string;
    tags: string[];
  };
}

function toIsoDateTime(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString();
  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return new Date().toISOString();
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateDynamicArticleOgSvgDataUri(
  post: BlogPostItem,
  authorName: string,
  alphabetMode: UzbekAlphabetMode
): string {
  const tr = (text: string) => formatUzbekText(text, alphabetMode);
  const title = escapeXml(tr(post.title).slice(0, 90));
  const category = escapeXml(tr(post.category || 'Maqola'));
  const readTime = escapeXml(tr(post.readTime || '3 daqiqa'));
  const date = escapeXml(post.publishedAt || '');
  const author = escapeXml(authorName);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#050505" />
        <stop offset="55%" stop-color="#0b132b" />
        <stop offset="100%" stop-color="#1e3a8a" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)" />
    <rect x="48" y="48" width="1104" height="534" rx="24" fill="none" stroke="#3b82f6" stroke-opacity="0.35" stroke-width="2" />
    <text x="96" y="130" fill="#60a5fa" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="700" letter-spacing="2">${category.toUpperCase()} · ${readTime}</text>
    <text x="96" y="260" fill="#f8fafc" font-family="Inter, system-ui, sans-serif" font-size="46" font-weight="800">${title}</text>
    <text x="96" y="510" fill="#e2e8f0" font-family="Inter, system-ui, sans-serif" font-size="28" font-weight="600">${author}</text>
    <text x="96" y="548" fill="#94a3b8" font-family="Inter, system-ui, sans-serif" font-size="22">${date} · solijonsolayev.vercel.app</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function buildDynamicSocialMeta({
  rawProfile,
  alphabetMode,
  activePage,
  activeBlogPost,
  origin,
  baseUrl,
  canonicalUrl,
}: {
  rawProfile: ProfileData;
  alphabetMode: UzbekAlphabetMode;
  activePage: SeoActivePage;
  activeBlogPost: BlogPostItem | null;
  origin: string;
  baseUrl: string;
  canonicalUrl: string;
}): DynamicSocialMetaPayload {
  const tr = (text: string) => formatUzbekText(text, alphabetMode);
  const ogSiteName = tr(DEFAULT_SITE_TITLE);
  const ogLocale = alphabetMode === 'new_2026' ? 'uz_Latn_UZ' : 'uz_UZ';
  const ogLocaleAlternate = alphabetMode === 'new_2026' ? 'uz_UZ' : 'uz_Latn_UZ';
  const defaultHeroImage = `${origin}${rawProfile.personal.heroImageUrl}`;

  if (activeBlogPost) {
    const cleanTitle = tr(activeBlogPost.title);
    const cleanCategory = tr(activeBlogPost.category || 'Blog');
    const cleanReadTime = tr(activeBlogPost.readTime || '3 daqiqa');
    const rawExcerpt =
      activeBlogPost.excerpt?.trim() ||
      (activeBlogPost.content || '').replace(/[#>*_`~-]/g, '').slice(0, 180).trim() ||
      DEFAULT_SITE_DESCRIPTION;
    const cleanDescription = tr(rawExcerpt);

    const pageTitle = `${cleanTitle} — ${cleanCategory} | Solijon Solayev Blogi`;
    const twitterTitle = `${cleanTitle} | Solijon Solayev`;

    let resolvedArticleImage = defaultHeroImage;
    if (activeBlogPost.imageUrl && activeBlogPost.imageUrl.trim()) {
      resolvedArticleImage = activeBlogPost.imageUrl.startsWith('http')
        ? activeBlogPost.imageUrl
        : `${origin}${activeBlogPost.imageUrl}`;
    } else {
      resolvedArticleImage = generateDynamicArticleOgSvgDataUri(
        activeBlogPost,
        rawProfile.personal.fullName,
        alphabetMode
      );
    }

    const imageAlt = `${cleanTitle} — ${cleanCategory} (${rawProfile.personal.fullName})`;
    const isoDate = toIsoDateTime(activeBlogPost.publishedAt);

    // Combine both alphabet variants of tags so search & social crawlers match either script
    const uniqueTags = Array.from(
      new Set(
        (activeBlogPost.tags || []).flatMap((tag) => [
          tr(tag),
          toClassicUzbekLatin(tag),
          toNewUzbekLatin(tag),
        ])
      )
    ).filter(Boolean);

    return {
      pageTitle,
      pageDescription: cleanDescription,
      ogType: 'article',
      ogUrl: canonicalUrl,
      ogSiteName,
      ogLocale,
      ogLocaleAlternate,
      ogImage: resolvedArticleImage,
      ogImageAlt: imageAlt,
      ogImageWidth: '1200',
      ogImageHeight: '630',
      twitterCard: 'summary_large_image',
      twitterSite: '@SolijonSolayev',
      twitterCreator: '@SolijonSolayev',
      twitterTitle,
      twitterDescription: cleanDescription,
      twitterImage: resolvedArticleImage,
      twitterImageAlt: imageAlt,
      twitterLabel1: tr("Bo'lim va Muallif"),
      twitterData1: `${cleanCategory} · ${rawProfile.personal.fullName}`,
      twitterLabel2: tr("O'qish vaqti"),
      twitterData2: `${cleanReadTime} · ${activeBlogPost.publishedAt}`,
      articleMeta: {
        publishedTime: isoDate,
        modifiedTime: isoDate,
        author: rawProfile.personal.fullName,
        section: cleanCategory,
        tags: uniqueTags,
      },
    };
  }

  let pageTitle = tr(DEFAULT_SITE_TITLE);
  let pageDescription = tr(DEFAULT_SITE_DESCRIPTION);
  let sectionLabel = tr('Asosiy sahifa');

  if (activePage === 'loyihalar') {
    pageTitle = `${tr('Loyihalar va Ochiq Kodli Dasturlar')} — Solijon Solayev`;
    pageDescription = tr(
      "Solijon Solayev tomonidan yaratilgan Solaris 3D (solaris3d.uz) astronomiya observatoriyasi, Tilimlo.uz o'zbek tili imlosi platformasi hamda GitHub'dagi usb-formatter va AqlliTozalash dasturlari."
    );
    sectionLabel = tr('Loyihalar portfeli');
  } else if (activePage === 'blog') {
    pageTitle = `${tr('Shaxsiy Blog («Fikr qilamiz» va IT Maqolalar)')} — Solijon Solayev`;
    pageDescription = tr(
      "Dasturlash, 3D WebGL astronomiya, o'zbek tili imlosi (2026-yilgi yangilangan Ö, Ğ, Ş, Ç va amaldagi alifbo), Linux/Windows/macOS tizim vositalari hamda Vikipediya haqidagi mualliflik maqolalari."
    );
    sectionLabel = tr('Shaxsiy Blog');
  } else if (activePage === 'tajriba') {
    pageTitle = `${tr("Faoliyat, Ko'nikmalar va Jonli Ekotizim")} — Solijon Solayev`;
    pageDescription = tr(
      "Solijon Solayevning kasbiy faoliyati, texnik ko'nikmalari, GitHub repozitoriylari, O'zbekcha Vikipediya tahrirlari va Vikiombor (Wikimedia Commons) tasodifiy mualliflik fotogalereyasi."
    );
    sectionLabel = tr('Faoliyat va Ekotizim');
  } else if (activePage === 'boglanish') {
    pageTitle = `${tr("Bog'lanish, vCard (.vcf) va Murojaat")} — Solijon Solayev`;
    pageDescription = tr(
      "Solijon Solayev bilan bog'lanish, muloqot odobi, raqamli vizitka (vCard .vcf va QR-kod) hamda tezkor xabar qoldirish sahifasi."
    );
    sectionLabel = tr("Bog'lanish");
  }

  const defaultImageAlt = `${rawProfile.personal.fullName} — ${tr(rawProfile.personal.role)}`;

  return {
    pageTitle,
    pageDescription,
    ogType: 'website',
    ogUrl: canonicalUrl || baseUrl,
    ogSiteName,
    ogLocale,
    ogLocaleAlternate,
    ogImage: defaultHeroImage,
    ogImageAlt: defaultImageAlt,
    ogImageWidth: '1200',
    ogImageHeight: '630',
    twitterCard: 'summary_large_image',
    twitterSite: '@SolijonSolayev',
    twitterCreator: '@SolijonSolayev',
    twitterTitle: pageTitle,
    twitterDescription: pageDescription,
    twitterImage: defaultHeroImage,
    twitterImageAlt: defaultImageAlt,
    twitterLabel1: tr('Muallif'),
    twitterData1: `${rawProfile.personal.fullName} (${sectionLabel})`,
    twitterLabel2: tr('Loyihalar'),
    twitterData2: 'Solaris 3D · Tilimlo.uz · GitHub',
  };
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  rawProfile,
  alphabetMode,
  activePage = 'home',
  activeBlogPost = null,
}) => {
  useEffect(() => {
    const origin = window.location.origin;
    const baseUrl = `${origin}${window.location.pathname}`;

    let sectionHash = '';
    const params = new URLSearchParams();
    if (alphabetMode === 'classic') {
      params.set('alphabet', 'classic');
    }

    if (activeBlogPost) {
      const slugOrId = activeBlogPost.slug || activeBlogPost.id;
      params.set('article', slugOrId);
      sectionHash = `#blog/${encodeURIComponent(slugOrId)}`;
    } else if (activePage !== 'home') {
      sectionHash = `#${activePage}`;
    }

    const queryString = params.toString();
    const querySuffix = queryString ? `?${queryString}` : '';
    const canonicalUrl = activeBlogPost
      ? `${baseUrl}${querySuffix}`
      : `${baseUrl}${querySuffix}${sectionHash}`;

    // Update <html lang="..."> attribute for search engines while keeping both scripts indexed
    document.documentElement.setAttribute(
      'lang',
      alphabetMode === 'new_2026' ? 'uz-Latn' : 'uz'
    );

    const setOrCreateLink = (
      rel: string,
      href: string,
      extraAttrs: Record<string, string> = {}
    ) => {
      const selectorParts = [`link[rel="${rel}"]`];
      for (const [k, v] of Object.entries(extraAttrs)) {
        selectorParts.push(`[${k}="${v}"]`);
      }
      const selector = selectorParts.join('');
      let linkEl = document.head.querySelector<HTMLLinkElement>(selector);
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.setAttribute('rel', rel);
        for (const [k, v] of Object.entries(extraAttrs)) {
          linkEl.setAttribute(k, v);
        }
        document.head.appendChild(linkEl);
      }
      linkEl.setAttribute('href', href);
    };

    const setOrCreateMeta = (attrName: 'name' | 'property', attrVal: string, content: string) => {
      let metaEl = document.head.querySelector<HTMLMetaElement>(
        `meta[${attrName}="${attrVal}"]`
      );
      if (!metaEl) {
        metaEl = document.createElement('meta');
        metaEl.setAttribute(attrName, attrVal);
        document.head.appendChild(metaEl);
      }
      metaEl.setAttribute('content', content);
    };

    const removeMeta = (attrName: 'name' | 'property', attrVal: string) => {
      const elements = document.head.querySelectorAll(`meta[${attrName}="${attrVal}"]`);
      elements.forEach((el) => el.remove());
    };

    // Build dynamic OpenGraph & Twitter meta tags for current article or page
    const socialMeta = buildDynamicSocialMeta({
      rawProfile,
      alphabetMode,
      activePage,
      activeBlogPost,
      origin,
      baseUrl,
      canonicalUrl,
    });

    const { pageTitle, pageDescription, ogImage } = socialMeta;

    document.title = pageTitle;
    setOrCreateMeta('name', 'description', pageDescription);

    // Core OpenGraph meta tags
    setOrCreateMeta('property', 'og:title', socialMeta.pageTitle);
    setOrCreateMeta('property', 'og:description', socialMeta.pageDescription);
    setOrCreateMeta('property', 'og:type', socialMeta.ogType);
    setOrCreateMeta('property', 'og:url', socialMeta.ogUrl);
    setOrCreateMeta('property', 'og:site_name', socialMeta.ogSiteName);
    setOrCreateMeta('property', 'og:locale', socialMeta.ogLocale);
    setOrCreateMeta('property', 'og:locale:alternate', socialMeta.ogLocaleAlternate);
    setOrCreateMeta('property', 'og:image', socialMeta.ogImage);
    setOrCreateMeta('property', 'og:image:alt', socialMeta.ogImageAlt);
    setOrCreateMeta('property', 'og:image:width', socialMeta.ogImageWidth);
    setOrCreateMeta('property', 'og:image:height', socialMeta.ogImageHeight);

    // Article-specific OpenGraph tags (article:*)
    removeMeta('property', 'article:tag');
    if (socialMeta.articleMeta) {
      setOrCreateMeta('property', 'article:published_time', socialMeta.articleMeta.publishedTime);
      setOrCreateMeta('property', 'article:modified_time', socialMeta.articleMeta.modifiedTime);
      setOrCreateMeta('property', 'article:author', socialMeta.articleMeta.author);
      setOrCreateMeta('property', 'article:section', socialMeta.articleMeta.section);
      socialMeta.articleMeta.tags.forEach((tag) => {
        const tagMeta = document.createElement('meta');
        tagMeta.setAttribute('property', 'article:tag');
        tagMeta.setAttribute('content', tag);
        document.head.appendChild(tagMeta);
      });
    } else {
      removeMeta('property', 'article:published_time');
      removeMeta('property', 'article:modified_time');
      removeMeta('property', 'article:author');
      removeMeta('property', 'article:section');
    }

    // Dynamic Twitter Card meta tags
    setOrCreateMeta('name', 'twitter:card', socialMeta.twitterCard);
    setOrCreateMeta('name', 'twitter:site', socialMeta.twitterSite);
    setOrCreateMeta('name', 'twitter:creator', socialMeta.twitterCreator);
    setOrCreateMeta('name', 'twitter:url', socialMeta.ogUrl);
    setOrCreateMeta('name', 'twitter:title', socialMeta.twitterTitle);
    setOrCreateMeta('name', 'twitter:description', socialMeta.twitterDescription);
    setOrCreateMeta('name', 'twitter:image', socialMeta.twitterImage);
    setOrCreateMeta('name', 'twitter:image:alt', socialMeta.twitterImageAlt);
    setOrCreateMeta('name', 'twitter:label1', socialMeta.twitterLabel1);
    setOrCreateMeta('name', 'twitter:data1', socialMeta.twitterData1);
    setOrCreateMeta('name', 'twitter:label2', socialMeta.twitterLabel2);
    setOrCreateMeta('name', 'twitter:data2', socialMeta.twitterData2);

    // Canonical & alternate hreflang links for both alphabets
    const articleQueryPart = activeBlogPost
      ? `&article=${encodeURIComponent(activeBlogPost.slug || activeBlogPost.id)}`
      : '';
    const defaultArticleQuery = activeBlogPost
      ? `?article=${encodeURIComponent(activeBlogPost.slug || activeBlogPost.id)}`
      : sectionHash;

    setOrCreateLink('canonical', canonicalUrl);
    setOrCreateLink('alternate', `${baseUrl}?alphabet=new_2026${articleQueryPart}${sectionHash}`, {
      hreflang: 'uz-Latn',
    });
    setOrCreateLink('alternate', `${baseUrl}?alphabet=classic${articleQueryPart}${sectionHash}`, {
      hreflang: 'uz',
    });
    setOrCreateLink('alternate', `${baseUrl}${defaultArticleQuery}`, { hreflang: 'x-default' });

    // Dual-alphabet SEO keywords for Google, Yandex, and Bing
    const classicBio = toClassicUzbekLatin(rawProfile.personal.shortBio);
    const new2026Bio = toNewUzbekLatin(rawProfile.personal.shortBio);

    const bilingualKeywords = [
      'Solijon Solayev',
      'Solijon_Solayev',
      'solaris3d.uz',
      'Solaris 3D',
      'tilimlo.uz',
      'Tilimlo',
      'usb-formatter',
      'AqlliTozalash',
      'kvadrat-tenglamalar',
      'solijonsolayev.github.io',
      'Fikr qilamiz blog',
      'Wikimedia Commons Solijon_Solayev',
      'Vikiombor fotogalereya',
      // Classic Uzbek Latin keywords
      'Frontend dasturchi',
      "O'zbekiston IT portfolio",
      'Shaxsiy vizitka sayt',
      "O'zbekcha Vikipediya",
      "O'zbek tili imlosi",
      '3D astronomiya observatoriya',
      'Xorazm Yangiariq dasturchi',
      // Reformed 2026 Uzbek Latin keywords (Ö, Ğ, Ş, Ç)
      'Frontend dasturçi',
      'Özbekiston IT portfolio',
      'Şaxsiy vizitka sayt',
      'Özbekça Vikipediya',
      'Özbek tili imlosi',
      'Oçiq manbali dasturlar',
      'Xorazm Yangiariq dasturçi',
      ...(activeBlogPost?.tags || []),
    ].join(', ');

    setOrCreateMeta('name', 'keywords', bilingualKeywords);

    // Build comprehensive dual-alphabet Schema.org JSON-LD (@graph)
    const graphEntities: Record<string, unknown>[] = [
      {
        '@type': 'Person',
        '@id': `${baseUrl}#person`,
        name: rawProfile.personal.fullName,
        alternateName: [
          'Solijon Solayev',
          'Solijon_Solayev',
          toNewUzbekLatin(rawProfile.personal.role),
          toClassicUzbekLatin(rawProfile.personal.role),
        ],
        jobTitle: [
          toNewUzbekLatin(rawProfile.personal.role),
          toClassicUzbekLatin(rawProfile.personal.role),
        ],
        description: `${new2026Bio} | ${classicBio}`,
        email: `mailto:${rawProfile.personal.email}`,
        url: baseUrl,
        image: `${origin}${rawProfile.personal.heroImageUrl}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Yangiariq, Xorazm',
          addressRegion: 'Xorazm',
          addressCountry: 'UZ',
        },
        knowsLanguage: ['uz', 'uz-Latn'],
        knowsAbout: [
          'Frontend Web Development',
          'TypeScript',
          'React',
          'Tailwind CSS',
          '3D WebGL Astronomy (Solaris 3D)',
          'Uzbek Orthography & Linguistics (Tilimlo.uz)',
          'Python Open Source Utilities',
          'Uzbek Wikipedia & Wikimedia Commons Photography',
        ],
        sameAs: [
          'https://solaris3d.uz',
          'https://tilimlo.uz',
          rawProfile.personal.taplink,
          rawProfile.personal.github,
          rawProfile.personal.website,
          rawProfile.personal.youtube,
          rawProfile.personal.wikipedia,
          rawProfile.personal.commons,
        ].filter(Boolean),
      },
      {
        '@type': 'ProfilePage',
        '@id': `${baseUrl}#profilepage`,
        url: canonicalUrl,
        name: pageTitle,
        alternateName: 'Solijon Solayev — Şaxsiy Vizitka va IT Portfolio',
        inLanguage: ['uz-Latn', 'uz'],
        mainEntity: {
          '@id': `${baseUrl}#person`,
        },
        description: `${toNewUzbekLatin(rawProfile.personal.detailedBio)} | ${toClassicUzbekLatin(
          rawProfile.personal.detailedBio
        )}`,
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}#website`,
        url: baseUrl,
        name: DEFAULT_SITE_TITLE,
        alternateName: 'Solijon Solayev — Şaxsiy Vizitka va IT Portfolio',
        inLanguage: ['uz-Latn', 'uz'],
        author: {
          '@id': `${baseUrl}#person`,
        },
        hasPart: [
          {
            '@type': 'WebPage',
            name: 'Men haqimda — Asosiy sahifa',
            url: `${baseUrl}#men-haqimda`,
          },
          {
            '@type': 'CollectionPage',
            name: 'Loyihalar — Solaris 3D, Tilimlo.uz va GitHub dasturlar',
            url: `${baseUrl}#loyihalar`,
          },
          {
            '@type': 'Blog',
            name: 'Shaxsiy Blog — «Fikr qilamiz» va IT maqolalar',
            url: `${baseUrl}#blog`,
          },
          {
            '@type': 'ProfilePage',
            name: "Faoliyat, Ko'nikmalar va Jonli Ekotizim (GitHub, Vikipediya, Vikiombor)",
            url: `${baseUrl}#tajriba`,
          },
          {
            '@type': 'ContactPage',
            name: "Bog'lanish va Murojaat",
            url: `${baseUrl}#boglanish`,
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${baseUrl}#breadcrumbs`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Men haqimda',
            item: `${baseUrl}#men-haqimda`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Loyihalar',
            item: `${baseUrl}#loyihalar`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Blog',
            item: `${baseUrl}#blog`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'Faoliyat va Jonli Ekotizim',
            item: `${baseUrl}#tajriba`,
          },
          {
            '@type': 'ListItem',
            position: 5,
            name: "Bog'lanish",
            item: `${baseUrl}#boglanish`,
          },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${baseUrl}#projects`,
        name: 'Solijon Solayev Loyihalari / Portfolio Projects',
        itemListElement: rawProfile.projects.map((proj, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'SoftwareApplication',
            name: toNewUzbekLatin(proj.title),
            alternateName: toClassicUzbekLatin(proj.title),
            applicationCategory: 'WebApplication',
            operatingSystem: 'All',
            url: proj.liveUrl || proj.repoUrl,
            author: {
              '@id': `${baseUrl}#person`,
            },
            description: `${toNewUzbekLatin(proj.summary)} | ${toClassicUzbekLatin(proj.summary)}`,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          },
        })),
      },
      {
        '@type': 'ImageGallery',
        '@id': `${baseUrl}#ekotizim-commons`,
        name: 'Solijon Solayev — Vikiombor (Wikimedia Commons) Tasodifiy Mualliflik Fotogalereyasi',
        alternateName:
          'Solijon Solayev — Vikiombor (Wikimedia Commons) Erkin Media va Tasvirlar Toʻplami',
        url: `${baseUrl}#ekotizim`,
        sameAs: rawProfile.personal.commons,
        author: {
          '@id': `${baseUrl}#person`,
        },
        description:
          "Solijon Solayev tomonidan Wikimedia Commons (Vikiombor) fondiga yuklangan mualliflik fotosuratlari va tasodifiy yangilanib turuvchi jonli fotogalereya.",
      },
      {
        '@type': 'Blog',
        '@id': `${baseUrl}#blog`,
        name: 'Solijon Solayev Shaxsiy Blogi («Fikr qilamiz» va IT maqolalar)',
        alternateName: 'Solijon Solayev Şaxsiy Blogi («Fikr qilamiz» va IT maqolalar)',
        inLanguage: ['uz-Latn', 'uz'],
        author: {
          '@id': `${baseUrl}#person`,
        },
        blogPost: (rawProfile.blogPosts || [])
          .filter((p) => p.published !== false)
          .map((post) => {
            const postSlug = encodeURIComponent(post.slug || post.id);
            const postUrl = `${baseUrl}?article=${postSlug}`;
            return {
              '@type': 'BlogPosting',
              '@id': postUrl,
              mainEntityOfPage: postUrl,
              headline: toNewUzbekLatin(post.title),
              alternativeHeadline: toClassicUzbekLatin(post.title),
              datePublished: post.publishedAt,
              dateModified: post.publishedAt,
              articleSection: post.category,
              keywords: (post.tags || []).join(', '),
              url: postUrl,
              author: {
                '@id': `${baseUrl}#person`,
              },
              description: `${toNewUzbekLatin(post.excerpt)} | ${toClassicUzbekLatin(post.excerpt)}`,
            };
          }),
      },
    ];

    if (activeBlogPost) {
      const wordCount = (activeBlogPost.content || '').trim().split(/\s+/).filter(Boolean).length;
      graphEntities.push({
        '@type': 'BlogPosting',
        '@id': canonicalUrl,
        mainEntityOfPage: canonicalUrl,
        headline: toNewUzbekLatin(activeBlogPost.title),
        alternativeHeadline: toClassicUzbekLatin(activeBlogPost.title),
        datePublished: activeBlogPost.publishedAt,
        dateModified: activeBlogPost.publishedAt,
        articleSection: activeBlogPost.category,
        keywords: (activeBlogPost.tags || []).join(', '),
        wordCount,
        image: ogImage,
        inLanguage: ['uz-Latn', 'uz'],
        author: {
          '@id': `${baseUrl}#person`,
        },
        publisher: {
          '@id': `${baseUrl}#person`,
        },
        description: `${toNewUzbekLatin(activeBlogPost.excerpt)} | ${toClassicUzbekLatin(
          activeBlogPost.excerpt
        )}`,
        articleBody: `${toNewUzbekLatin(activeBlogPost.content || '')}\n\n${toClassicUzbekLatin(
          activeBlogPost.content || ''
        )}`,
      });
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': graphEntities,
    };

    let scriptEl = document.head.querySelector<HTMLScriptElement>(
      'script#dynamic-seo-jsonld'
    );
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'dynamic-seo-jsonld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(structuredData);
  }, [rawProfile, alphabetMode, activePage, activeBlogPost]);

  return null;
};


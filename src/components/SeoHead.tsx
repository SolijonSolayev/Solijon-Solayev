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

export const SeoHead: React.FC<SeoHeadProps> = ({
  rawProfile,
  alphabetMode,
  activePage = 'home',
  activeBlogPost = null,
}) => {
  useEffect(() => {
    const origin = window.location.origin;
    const baseUrl = `${origin}${window.location.pathname}`;
    const tr = (text: string) => formatUzbekText(text, alphabetMode);

    let sectionHash = '';
    if (activeBlogPost) {
      sectionHash = `#blog/${encodeURIComponent(activeBlogPost.slug || activeBlogPost.id)}`;
    } else if (activePage !== 'home') {
      sectionHash = `#${activePage}`;
    }

    const querySuffix = alphabetMode === 'classic' ? '?alphabet=classic' : '';
    const canonicalUrl = `${baseUrl}${querySuffix}${sectionHash}`;

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

    // Determine dynamic page title & description based on active sub-page or blog article
    let pageTitle = DEFAULT_SITE_TITLE;
    let pageDescription = DEFAULT_SITE_DESCRIPTION;
    let ogType = 'website';
    let ogImage = `${origin}${rawProfile.personal.heroImageUrl}`;

    if (activeBlogPost) {
      pageTitle = `${tr(activeBlogPost.title)} — Solijon Solayev Blogi`;
      pageDescription = tr(activeBlogPost.excerpt || DEFAULT_SITE_DESCRIPTION);
      ogType = 'article';
      if (activeBlogPost.imageUrl) {
        ogImage = activeBlogPost.imageUrl.startsWith('http')
          ? activeBlogPost.imageUrl
          : `${origin}${activeBlogPost.imageUrl}`;
      }
    } else if (activePage === 'loyihalar') {
      pageTitle = `${tr('Loyihalar va Ochiq Kodli Dasturlar')} — Solijon Solayev`;
      pageDescription = tr(
        "Solijon Solayev tomonidan yaratilgan Solaris 3D (solaris3d.uz) astronomiya observatoriyasi, Tilimlo.uz o'zbek tili imlosi platformasi hamda GitHub'dagi usb-formatter va AqlliTozalash dasturlari."
      );
    } else if (activePage === 'blog') {
      pageTitle = `${tr('Shaxsiy Blog («Fikr qilamiz» va IT Maqolalar)')} — Solijon Solayev`;
      pageDescription = tr(
        "Dasturlash, 3D WebGL astronomiya, o'zbek tili imlosi (2026-yilgi yangilangan Ö, Ğ, Ş, Ç va amaldagi alifbo), Linux/Windows/macOS tizim vositalari hamda Vikipediya haqidagi mualliflik maqolalari."
      );
    } else if (activePage === 'tajriba') {
      pageTitle = `${tr("Faoliyat, Ko'nikmalar va Jonli Ekotizim")} — Solijon Solayev`;
      pageDescription = tr(
        "Solijon Solayevning kasbiy faoliyati, texnik ko'nikmalari, GitHub repozitoriylari, O'zbekcha Vikipediya tahrirlari va Vikiombor (Wikimedia Commons) tasodifiy mualliflik fotogalereyasi."
      );
    } else if (activePage === 'boglanish') {
      pageTitle = `${tr("Bog'lanish, vCard (.vcf) va Murojaat")} — Solijon Solayev`;
      pageDescription = tr(
        "Solijon Solayev bilan bog'lanish, muloqot odobi, raqamli vizitka (vCard .vcf va QR-kod) hamda tezkor xabar qoldirish sahifasi."
      );
    }

    document.title = pageTitle;
    setOrCreateMeta('name', 'description', pageDescription);
    setOrCreateMeta('property', 'og:title', pageTitle);
    setOrCreateMeta('property', 'og:description', pageDescription);
    setOrCreateMeta('property', 'og:type', ogType);
    setOrCreateMeta('property', 'og:url', canonicalUrl);
    setOrCreateMeta('property', 'og:image', ogImage);
    setOrCreateMeta('name', 'twitter:title', pageTitle);
    setOrCreateMeta('name', 'twitter:description', pageDescription);
    setOrCreateMeta('name', 'twitter:image', ogImage);

    // Canonical & alternate hreflang links for both alphabets
    setOrCreateLink('canonical', canonicalUrl);
    setOrCreateLink('alternate', `${baseUrl}?alphabet=new_2026${sectionHash}`, {
      hreflang: 'uz-Latn',
    });
    setOrCreateLink('alternate', `${baseUrl}?alphabet=classic${sectionHash}`, {
      hreflang: 'uz',
    });
    setOrCreateLink('alternate', `${baseUrl}${sectionHash}`, { hreflang: 'x-default' });

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
          .filter((p) => p.published)
          .map((post) => ({
            '@type': 'BlogPosting',
            headline: toNewUzbekLatin(post.title),
            alternativeHeadline: toClassicUzbekLatin(post.title),
            datePublished: post.publishedAt,
            articleSection: post.category,
            keywords: (post.tags || []).join(', '),
            url: `${baseUrl}#blog/${post.slug || post.id}`,
            author: {
              '@id': `${baseUrl}#person`,
            },
            description: `${toNewUzbekLatin(post.excerpt)} | ${toClassicUzbekLatin(post.excerpt)}`,
          })),
      },
    ];

    if (activeBlogPost) {
      graphEntities.push({
        '@type': 'BlogPosting',
        '@id': canonicalUrl,
        mainEntityOfPage: canonicalUrl,
        headline: toNewUzbekLatin(activeBlogPost.title),
        alternativeHeadline: toClassicUzbekLatin(activeBlogPost.title),
        datePublished: activeBlogPost.publishedAt,
        articleSection: activeBlogPost.category,
        keywords: (activeBlogPost.tags || []).join(', '),
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


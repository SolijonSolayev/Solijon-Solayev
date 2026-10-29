import { ProfileData } from '../types/profile';

export type UzbekAlphabetMode = 'new_2026' | 'classic';

export const ALPHABET_STORAGE_KEY = 'solijon_uzbek_alphabet_mode_v2';

// Technical English words containing "sh" or "ch" that should never be transliterated
const PROTECTED_TECH_WORDS = new Set([
  'shell',
  'bash',
  'batch',
  'batchfile',
  'tech',
  'search',
  'chrome',
  'chart',
  'charts',
  'touch',
  'switch',
  'cache',
  'dashboard',
  'flash',
  'push',
  'fetch',
  'match',
  'patch',
  'watch',
  'branch',
  'architecture',
  'archive',
  'channel',
  'chat',
  'chatbot',
  'check',
  'chip',
  'chips',
  'choice',
  'chunk',
  'chunks',
  'refresh',
  'hash',
  'crash',
  'slash',
  'mesh',
  'ssh',
  'sh',
  'ch',
]);

function isUrlOrPathOrEmail(token: string): boolean {
  if (!token) return false;
  if (
    token.startsWith('http://') ||
    token.startsWith('https://') ||
    token.startsWith('mailto:') ||
    token.startsWith('/src/') ||
    token.startsWith('/assets/')
  ) {
    return true;
  }
  if (token.includes('@') && token.includes('.')) {
    return true;
  }
  if (
    /\b(?:solaris3d\.uz|tilimlo\.uz|taplink\.cc|github\.com|github\.io|wikipedia\.org|wikimedia\.org|youtube\.com)\b/i.test(
      token
    )
  ) {
    return true;
  }
  return false;
}

function convertWordToNewLatin(word: string): string {
  if (!word) return word;

  const cleanAlpha = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (PROTECTED_TECH_WORDS.has(cleanAlpha)) {
    return word;
  }

  let res = word;

  // 1. O' / Oʻ / O‘ / O’ / O` -> Ö / ö
  res = res.replace(/O(?:ʻ|ʼ|’|‘|'|`)/g, 'Ö');
  res = res.replace(/o(?:ʻ|ʼ|’|‘|'|`)/g, 'ö');

  // 2. G' / Gʻ / G‘ / G’ / G` -> Ğ / ğ
  res = res.replace(/G(?:ʻ|ʼ|’|‘|'|`)/g, 'Ğ');
  res = res.replace(/g(?:ʻ|ʼ|’|‘|'|`)/g, 'ğ');

  // 3. Preserve remaining apostrophes as standard U+2019 ’ (tutuq belgisi, e.g. ta’lim, ma’no, ma’lumot)
  res = res.replace(/([A-Za-zÖöĞğ])['`‘ʻʼ]([A-Za-zÖöĞğ])/g, '$1’$2');

  // 4. Convert Digraphs (Sh -> Ş, Ch -> Ç) with case sensitivity
  res = res.replace(/SH/g, 'Ş');
  res = res.replace(/Sh/g, 'Ş');
  res = res.replace(/sh/g, 'ş');

  res = res.replace(/CH/g, 'Ç');
  res = res.replace(/Ch/g, 'Ç');
  res = res.replace(/ch/g, 'ç');

  return res;
}

function transformPlainSegmentToNewLatin(segment: string): string {
  if (!segment) return segment;
  if (isUrlOrPathOrEmail(segment.trim())) return segment;

  const parts = segment.split(/(\s+)/);
  return parts
    .map((part) => {
      if (/^\s+$/.test(part)) return part;
      if (isUrlOrPathOrEmail(part)) return part;
      return convertWordToNewLatin(part);
    })
    .join('');
}

export function toNewUzbekLatin(text: string): string {
  if (!text) return text;
  if (isUrlOrPathOrEmail(text.trim())) return text;

  if (text.includes('`')) {
    return text
      .split(/(```[\s\S]*?```|`[^`\n]+`)/g)
      .map((chunk) => {
        if (chunk.startsWith('`') && chunk.endsWith('`')) {
          return chunk;
        }
        return transformPlainSegmentToNewLatin(chunk);
      })
      .join('');
  }

  return transformPlainSegmentToNewLatin(text);
}

function transformPlainSegmentToClassicLatin(segment: string): string {
  if (!segment) return segment;
  let res = segment;
  res = res.replace(/Ö/g, 'Oʻ');
  res = res.replace(/ö/g, 'oʻ');
  res = res.replace(/Ğ/g, 'Gʻ');
  res = res.replace(/ğ/g, 'gʻ');
  res = res.replace(/Ş/g, 'Sh');
  res = res.replace(/ş/g, 'sh');
  res = res.replace(/Ç/g, 'Ch');
  res = res.replace(/ç/g, 'ch');
  // Standardize straight quotes for O' and G' in classic mode
  res = res.replace(/O['’‘`]/g, 'Oʻ');
  res = res.replace(/o['’‘`]/g, 'oʻ');
  res = res.replace(/G['’‘`]/g, 'Gʻ');
  res = res.replace(/g['’‘`]/g, 'gʻ');
  return res;
}

export function toClassicUzbekLatin(text: string): string {
  if (!text) return text;
  if (isUrlOrPathOrEmail(text.trim())) return text;

  if (text.includes('`')) {
    return text
      .split(/(```[\s\S]*?```|`[^`\n]+`)/g)
      .map((chunk) => {
        if (chunk.startsWith('`') && chunk.endsWith('`')) {
          return chunk;
        }
        return transformPlainSegmentToClassicLatin(chunk);
      })
      .join('');
  }

  return transformPlainSegmentToClassicLatin(text);
}

export function formatUzbekText(text: string, mode: UzbekAlphabetMode): string {
  if (!text) return text;
  if (mode === 'new_2026') {
    return toNewUzbekLatin(text);
  }
  return toClassicUzbekLatin(text);
}

export function localizeProfileData(
  profile: ProfileData,
  mode: UzbekAlphabetMode
): ProfileData {
  const tr = (val: string) => formatUzbekText(val, mode);

  return {
    ...profile,
    personal: {
      ...profile.personal,
      fullName: tr(profile.personal.fullName),
      role: tr(profile.personal.role),
      kicker: tr(profile.personal.kicker),
      headline: tr(profile.personal.headline),
      shortBio: tr(profile.personal.shortBio),
      detailedBio: tr(profile.personal.detailedBio),
      location: tr(profile.personal.location),
      availability: tr(profile.personal.availability),
      phone: tr(profile.personal.phone),
      etiquetteNote: tr(profile.personal.etiquetteNote),
      yearsOfExperience: tr(profile.personal.yearsOfExperience),
      // URLs & email remain untouched
      email: profile.personal.email,
      telegram: profile.personal.telegram,
      github: profile.personal.github,
      linkedin: profile.personal.linkedin,
      website: profile.personal.website,
      youtube: profile.personal.youtube,
      wikipedia: profile.personal.wikipedia,
      commons: profile.personal.commons,
      taplink: profile.personal.taplink,
      heroImageUrl: profile.personal.heroImageUrl,
    },
    metrics: profile.metrics.map((m) => ({
      ...m,
      value: tr(m.value),
      label: tr(m.label),
      context: tr(m.context),
    })),
    services: profile.services.map((s) => ({
      ...s,
      title: tr(s.title),
      description: tr(s.description),
      deliverables: s.deliverables.map(tr),
      technologies: s.technologies.map(tr),
    })),
    skillGroups: profile.skillGroups.map((g) => ({
      ...g,
      category: tr(g.category),
      items: g.items.map(tr),
    })),
    projects: profile.projects.map((p) => ({
      ...p,
      title: tr(p.title),
      client: tr(p.client),
      role: tr(p.role),
      summary: tr(p.summary),
      challenge: tr(p.challenge),
      solution: tr(p.solution),
      impactMetric: tr(p.impactMetric),
      technologies: p.technologies.map(tr),
      // Keep category canonical for filtering, translate at display time
    })),
    experience: profile.experience.map((e) => ({
      ...e,
      period: tr(e.period),
      role: tr(e.role),
      company: tr(e.company),
      location: tr(e.location),
      description: tr(e.description),
      achievements: e.achievements.map(tr),
      technologies: e.technologies.map(tr),
    })),
    blogPosts: (profile.blogPosts || []).map((post) => ({
      ...post,
      title: tr(post.title),
      readTime: tr(post.readTime),
      excerpt: tr(post.excerpt),
      content: tr(post.content),
      tags: (post.tags || []).map(tr),
      // Keep category, id, slug, publishedAt, imageUrl, featured, published canonical
    })),
  };
}

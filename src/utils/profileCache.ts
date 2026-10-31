import firebaseConfig from '../../firebase-applet-config.json';
import { DEFAULT_PROFILE_DATA } from '../data/defaultProfile';
import { ProfileData } from '../types/profile';
import { resolveAssetUrl } from './assetUrl';
import { getCanonicalRepoKey } from './githubHelpers';

const PORTFOLIO_CACHE_KEY = 'solijon_portfolio_cache_v3';
const PORTFOLIO_DOC_ID = 'solijon_v3';

/**
 * Merges cloud or cached portfolio data with DEFAULT_PROFILE_DATA,
 * ensuring newly created blog posts and projects appear first with resolved WebP/Wikimedia URLs.
 */
export function mergePortfolioDataWithDefaults(data: Record<string, any>): ProfileData {
  const d = DEFAULT_PROFILE_DATA.personal;

  const defaultPosts = DEFAULT_PROFILE_DATA.blogPosts || [];
  const fsPosts = Array.isArray(data.blogPosts)
    ? (data.blogPosts as NonNullable<ProfileData['blogPosts']>)
    : [];
  const defPostMap = new Map(defaultPosts.map((bp) => [bp.id, bp]));
  const mergedBlogPosts: NonNullable<ProfileData['blogPosts']> = [];
  const processedPosts = new Set<string>();

  // Put cloud/newly created posts FIRST in their saved order
  for (const fsPost of fsPosts) {
    if (!fsPost || !fsPost.id || processedPosts.has(fsPost.id)) continue;
    processedPosts.add(fsPost.id);
    const defMatch = defPostMap.get(fsPost.id);
    mergedBlogPosts.push({
      ...(defMatch || {}),
      ...fsPost,
      imageUrl: resolveAssetUrl(fsPost.imageUrl, defMatch?.imageUrl || ''),
    });
  }

  // Append any default posts not yet present
  for (const defPost of defaultPosts) {
    if (!processedPosts.has(defPost.id)) {
      processedPosts.add(defPost.id);
      mergedBlogPosts.push({
        ...defPost,
        imageUrl: resolveAssetUrl(defPost.imageUrl, ''),
      });
    }
  }

  // Sort so the newest published articles are prioritized first
  mergedBlogPosts.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

  return {
    personal: {
      fullName: data.fullName || data.personal?.fullName || d.fullName,
      role: data.role || data.personal?.role || d.role,
      kicker: data.kicker || data.personal?.kicker || d.kicker,
      headline: (() => {
        const h = data.headline || data.personal?.headline;
        return h &&
          !h.includes('kontent kreyter') &&
          !h.includes('elektron mahsulotlar sotuvchisi')
          ? h
          : d.headline;
      })(),
      shortBio: (() => {
        const sb = data.shortBio || data.personal?.shortBio;
        return sb && sb.includes('Teamit Academy') && sb.includes('Jizzax politexnika')
          ? sb
          : d.shortBio;
      })(),
      detailedBio: (() => {
        const dbio = data.detailedBio || data.personal?.detailedBio;
        return dbio && dbio.includes('Teamit Academy') && dbio.includes('Jizzax politexnika')
          ? dbio
          : d.detailedBio;
      })(),
      location: data.location || data.personal?.location || d.location,
      availability: data.availability || data.personal?.availability || d.availability,
      email: data.publicEmail || data.personal?.email || d.email,
      phone: data.publicPhone || data.personal?.phone || d.phone,
      telegram: data.telegram || data.personal?.telegram || d.telegram,
      github: data.github || data.personal?.github || d.github,
      linkedin: data.linkedin || data.personal?.linkedin || d.linkedin,
      website: data.website || data.personal?.website || d.website,
      youtube: data.youtube || data.personal?.youtube || d.youtube,
      wikipedia: data.wikipedia || data.personal?.wikipedia || d.wikipedia,
      commons: data.commons || data.personal?.commons || d.commons,
      taplink: data.taplink || data.personal?.taplink || d.taplink,
      etiquetteNote: data.etiquetteNote || data.personal?.etiquetteNote || d.etiquetteNote,
      heroImageUrl: resolveAssetUrl(
        data.heroImageUrl || data.personal?.heroImageUrl,
        d.heroImageUrl
      ),
      yearsOfExperience:
        data.yearsOfExperience || data.personal?.yearsOfExperience || d.yearsOfExperience,
    },
    metrics: Array.isArray(data.metrics) ? data.metrics : DEFAULT_PROFILE_DATA.metrics,
    services: Array.isArray(data.services) ? data.services : DEFAULT_PROFILE_DATA.services,
    skillGroups: Array.isArray(data.skillGroups)
      ? data.skillGroups
      : DEFAULT_PROFILE_DATA.skillGroups,
    projects: Array.isArray(data.projects)
      ? (() => {
          const defaultProjList = DEFAULT_PROFILE_DATA.projects;
          const fsProjList = data.projects as ProfileData['projects'];
          const merged: ProfileData['projects'] = [];
          const processedKeys = new Set<string>();

          const fsMap = new Map<string, ProfileData['projects'][number]>();
          for (const fsP of fsProjList) {
            const key = getCanonicalRepoKey(fsP);
            if (key) fsMap.set(key, fsP);
          }

          for (const defProj of defaultProjList) {
            const key = getCanonicalRepoKey(defProj);
            if (key) processedKeys.add(key);
            const fsMatch = fsMap.get(key);
            if (fsMatch) {
              merged.push({
                ...defProj,
                ...fsMatch,
                imageUrl: resolveAssetUrl(fsMatch.imageUrl, defProj.imageUrl),
              });
            } else {
              merged.push(defProj);
            }
          }

          for (const fsProj of fsProjList) {
            const key = getCanonicalRepoKey(fsProj);
            if (key && !processedKeys.has(key)) {
              processedKeys.add(key);
              merged.push({
                ...fsProj,
                imageUrl: resolveAssetUrl(fsProj.imageUrl, ''),
              });
            }
          }
          return merged;
        })()
      : DEFAULT_PROFILE_DATA.projects,
    experience: Array.isArray(data.experience)
      ? (() => {
          const defaultExpList = DEFAULT_PROFILE_DATA.experience;
          const fsExpList = data.experience as ProfileData['experience'];
          const fsMap = new Map(fsExpList.map((e) => [e.id, e]));
          const merged: ProfileData['experience'] = [];
          const processed = new Set<string>();

          for (const defItem of defaultExpList) {
            processed.add(defItem.id);
            const fsItem = fsMap.get(defItem.id);
            if (fsItem) {
              merged.push({ ...defItem, ...fsItem });
            } else {
              merged.push(defItem);
            }
          }
          for (const fsItem of fsExpList) {
            if (!processed.has(fsItem.id)) {
              merged.push(fsItem);
            }
          }
          return merged;
        })()
      : DEFAULT_PROFILE_DATA.experience,
    blogPosts: mergedBlogPosts,
  };
}

export function loadCachedProfile(): ProfileData {
  if (typeof window === 'undefined') return DEFAULT_PROFILE_DATA;
  try {
    const raw = window.localStorage.getItem(PORTFOLIO_CACHE_KEY);
    if (!raw) return DEFAULT_PROFILE_DATA;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_PROFILE_DATA;
    return mergePortfolioDataWithDefaults(parsed);
  } catch {
    return DEFAULT_PROFILE_DATA;
  }
}

export function saveCachedProfile(profile: ProfileData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PORTFOLIO_CACHE_KEY, JSON.stringify(profile));
  } catch {
    // ignore storage quota errors
  }
}

function parseFirestoreRestValue(val: any): any {
  if (!val || typeof val !== 'object') return undefined;
  if ('stringValue' in val) return val.stringValue;
  if ('booleanValue' in val) return Boolean(val.booleanValue);
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) {
    const values = val.arrayValue?.values;
    return Array.isArray(values) ? values.map(parseFirestoreRestValue) : [];
  }
  if ('mapValue' in val) {
    const fields = val.mapValue?.fields || {};
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = parseFirestoreRestValue(v);
    }
    return out;
  }
  return undefined;
}

/**
 * Ultra-fast zero-SDK REST fetch from Firestore edge (~80ms, 0 KB extra JS).
 * Ensures newly created articles appear immediately without waiting for the 187 KB Firebase SDK bundle.
 */
export async function fetchCloudPortfolioFast(): Promise<ProfileData | null> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      firebaseConfig.projectId
    )}/databases/${encodeURIComponent(
      firebaseConfig.firestoreDatabaseId
    )}/documents/portfolio/${PORTFOLIO_DOC_ID}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const docJson = await res.json();
    if (!docJson?.fields) return null;

    const plainData: Record<string, any> = {};
    for (const [key, val] of Object.entries(docJson.fields)) {
      plainData[key] = parseFirestoreRestValue(val);
    }

    const merged = mergePortfolioDataWithDefaults(plainData);
    saveCachedProfile(merged);
    return merged;
  } catch {
    return null;
  }
}

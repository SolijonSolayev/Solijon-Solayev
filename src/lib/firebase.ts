import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import {
  GoogleAuthProvider,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { DEFAULT_PROFILE_DATA } from '../data/defaultProfile';
import { ProfileData } from '../types/profile';
import { getCanonicalRepoKey } from '../utils/githubHelpers';
import { resolveAssetUrl } from '../utils/assetUrl';

export const ADMIN_EMAIL = 'solijonsolayev2003@gmail.com';
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId;
const PORTFOLIO_DOC_ID = 'solijon_v3';

const app = initializeApp({
  ...firebaseConfig,
  measurementId: firebaseConfig.measurementId || 'G-047NZXKJ8Z',
});
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

if (typeof window !== 'undefined') {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch(() => {
      // Ignore analytics errors in restricted iframe/adblock environments
    });
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'portfolio', PORTFOLIO_DOC_ID));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export function isUserVerifiedAdmin(user: User | null): boolean {
  return Boolean(
    user &&
      user.emailVerified &&
      user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );
}

export async function signInAdminWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Truncates and sanitizes ProfileData to strictly match firebase-blueprint.json & firestore.rules bounds.
 */
function sanitizePortfolioPayload(profile: ProfileData, ownerUid: string) {
  const p = profile.personal;
  const d = DEFAULT_PROFILE_DATA.personal;
  const clip = (val: string, max: number, fallback = '-') => {
    const trimmed = (val || '').trim();
    if (!trimmed) return fallback;
    return trimmed.slice(0, max);
  };

  return {
    ownerUid,
    fullName: clip(p.fullName, 120, d.fullName),
    role: clip(p.role, 160, d.role),
    kicker: clip(p.kicker, 240, d.kicker),
    headline: clip(p.headline, 300, d.headline),
    shortBio: clip(p.shortBio, 1000, d.shortBio),
    detailedBio: clip(p.detailedBio, 2000, d.detailedBio),
    location: clip(p.location, 120, d.location),
    availability: clip(p.availability, 160, d.availability),
    publicEmail: clip(p.email, 160, ADMIN_EMAIL),
    publicPhone: clip(p.phone, 80, d.phone),
    telegram: clip(p.telegram, 200, d.telegram),
    github: clip(p.github, 200, d.github),
    linkedin: clip(p.linkedin, 200, d.linkedin),
    website: clip(p.website, 200, d.website),
    youtube: clip(p.youtube, 200, d.youtube),
    wikipedia: clip(p.wikipedia, 200, d.wikipedia),
    commons: clip(p.commons, 200, d.commons),
    taplink: clip(p.taplink, 200, d.taplink),
    etiquetteNote: clip(p.etiquetteNote, 500, d.etiquetteNote),
    heroImageUrl: clip(p.heroImageUrl, 500, d.heroImageUrl),
    yearsOfExperience: clip(p.yearsOfExperience, 60, d.yearsOfExperience),
    metrics: (profile.metrics || []).slice(0, 10),
    services: (profile.services || []).slice(0, 10),
    skillGroups: (profile.skillGroups || []).slice(0, 10),
    projects: (profile.projects || []).slice(0, 20),
    experience: (profile.experience || []).slice(0, 20),
    blogPosts: (profile.blogPosts || []).slice(0, 30),
    updatedAt: serverTimestamp(),
  };
}

export function subscribeToPortfolio(
  onData: (profile: ProfileData | null) => void
): () => void {
  const path = `portfolio/${PORTFOLIO_DOC_ID}`;
  const d = DEFAULT_PROFILE_DATA.personal;
  return onSnapshot(
    doc(db, 'portfolio', PORTFOLIO_DOC_ID),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      const data = snapshot.data();
      const loaded: ProfileData = {
        personal: {
          fullName: data.fullName || d.fullName,
          role: data.role || d.role,
          kicker: data.kicker || d.kicker,
          headline:
            data.headline &&
            !data.headline.includes('kontent kreyter') &&
            !data.headline.includes('elektron mahsulotlar sotuvchisi')
              ? data.headline
              : d.headline,
          shortBio:
            data.shortBio &&
            data.shortBio.includes('Teamit Academy') &&
            data.shortBio.includes('Jizzax politexnika')
              ? data.shortBio
              : d.shortBio,
          detailedBio:
            data.detailedBio &&
            data.detailedBio.includes('Teamit Academy') &&
            data.detailedBio.includes('Jizzax politexnika')
              ? data.detailedBio
              : d.detailedBio,
          location: data.location || d.location,
          availability: data.availability || d.availability,
          email: data.publicEmail || d.email,
          phone: data.publicPhone || d.phone,
          telegram: data.telegram || d.telegram,
          github: data.github || d.github,
          linkedin: data.linkedin || d.linkedin,
          website: data.website || d.website,
          youtube: data.youtube || d.youtube,
          wikipedia: data.wikipedia || d.wikipedia,
          commons: data.commons || d.commons,
          taplink: data.taplink || d.taplink,
          etiquetteNote: data.etiquetteNote || d.etiquetteNote,
          heroImageUrl: resolveAssetUrl(data.heroImageUrl, d.heroImageUrl),
          yearsOfExperience: data.yearsOfExperience || d.yearsOfExperience,
        },
        metrics: Array.isArray(data.metrics) ? data.metrics : DEFAULT_PROFILE_DATA.metrics,
        services: Array.isArray(data.services) ? data.services : DEFAULT_PROFILE_DATA.services,
        skillGroups: Array.isArray(data.skillGroups) ? data.skillGroups : DEFAULT_PROFILE_DATA.skillGroups,
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
        blogPosts: Array.isArray(data.blogPosts)
          ? (() => {
              const defaultPosts = DEFAULT_PROFILE_DATA.blogPosts || [];
              const fsPosts = data.blogPosts as NonNullable<ProfileData['blogPosts']>;
              const fsMap = new Map(fsPosts.map((bp) => [bp.id, bp]));
              const merged: NonNullable<ProfileData['blogPosts']> = [];
              const processed = new Set<string>();

              for (const defPost of defaultPosts) {
                processed.add(defPost.id);
                const fsPost = fsMap.get(defPost.id);
                if (fsPost) {
                  merged.push({
                    ...defPost,
                    ...fsPost,
                    imageUrl: resolveAssetUrl(fsPost.imageUrl, defPost.imageUrl),
                  });
                } else {
                  merged.push(defPost);
                }
              }
              for (const fsPost of fsPosts) {
                if (!processed.has(fsPost.id)) {
                  merged.push({
                    ...fsPost,
                    imageUrl: resolveAssetUrl(fsPost.imageUrl, ''),
                  });
                }
              }
              return merged;
            })()
          : DEFAULT_PROFILE_DATA.blogPosts,
      };
      onData(loaded);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function savePortfolioToFirestore(profile: ProfileData): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Avtorizatsiyadan o\'tilmagan.');
  }
  const path = `portfolio/${PORTFOLIO_DOC_ID}`;
  try {
    const payload = sanitizePortfolioPayload(profile, user.uid);
    await setDoc(doc(db, 'portfolio', PORTFOLIO_DOC_ID), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export interface ContactInquiryRecord {
  id: string;
  senderName: string;
  senderContact: string;
  projectType: 'Veb-ilova / SaaS' | 'Backend & API' | 'UI/UX & Mobil' | 'Texnik Konsalting';
  message: string;
  status: 'new' | 'read' | 'archived';
  recipientEmail: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export async function createContactInquiry(input: {
  senderName: string;
  senderContact: string;
  projectType: 'Veb-ilova / SaaS' | 'Backend & API' | 'UI/UX & Mobil' | 'Texnik Konsalting';
  message: string;
}): Promise<void> {
  const path = 'inquiries';
  try {
    await addDoc(collection(db, 'inquiries'), {
      senderName: input.senderName.trim().slice(0, 120),
      senderContact: input.senderContact.trim().slice(0, 160),
      projectType: input.projectType,
      message: (input.message.trim() || 'Murojaat qoldirildi').slice(0, 2000),
      status: 'new',
      recipientEmail: ADMIN_EMAIL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToInquiries(
  onData: (items: ContactInquiryRecord[]) => void
): () => void {
  const path = 'inquiries';
  const q = query(
    collection(db, 'inquiries'),
    where('recipientEmail', '==', ADMIN_EMAIL),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const records: ContactInquiryRecord[] = snapshot.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          senderName: raw.senderName || '',
          senderContact: raw.senderContact || '',
          projectType: raw.projectType || 'Veb-ilova / SaaS',
          message: raw.message || '',
          status: raw.status || 'new',
          recipientEmail: raw.recipientEmail || ADMIN_EMAIL,
          createdAt: raw.createdAt || null,
          updatedAt: raw.updatedAt || null,
        };
      });
      onData(records);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: 'new' | 'read' | 'archived'
): Promise<void> {
  const path = `inquiries/${inquiryId}`;
  try {
    await updateDoc(doc(db, 'inquiries', inquiryId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInquiry(inquiryId: string): Promise<void> {
  const path = `inquiries/${inquiryId}`;
  try {
    await deleteDoc(doc(db, 'inquiries', inquiryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

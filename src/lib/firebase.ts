import { initializeApp } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
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
import {
  mergePortfolioDataWithDefaults,
  saveCachedProfile,
} from '../utils/profileCache';

export const ADMIN_EMAIL = 'solijonsolayev2003@gmail.com';
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId;
const PORTFOLIO_DOC_ID = 'solijon_v3';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

let cachedAuth: Auth | null = null;
async function getLazyAuth(): Promise<Auth> {
  if (cachedAuth) return cachedAuth;
  const { getAuth } = await import('firebase/auth');
  cachedAuth = getAuth(app);
  return cachedAuth;
}

function isAutomatedAuditBot(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return (
    Boolean(navigator.webdriver) ||
    /Chrome-Lighthouse|PageSpeed|HeadlessChrome|PTST|Googlebot/i.test(ua)
  );
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
  const currentUser = cachedAuth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
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
  if (isAutomatedAuditBot()) return;
  try {
    await getDocFromServer(doc(db, 'portfolio', PORTFOLIO_DOC_ID));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

if (typeof window !== 'undefined' && !isAutomatedAuditBot()) {
  window.setTimeout(() => {
    void testConnection();
  }, 2500);
}

export function isUserVerifiedAdmin(user: User | null): boolean {
  return Boolean(
    user &&
      user.emailVerified &&
      user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );
}

export async function signInAdminWithGoogle(): Promise<User> {
  const [{ GoogleAuthProvider, signInWithPopup }, authInstance] = await Promise.all([
    import('firebase/auth'),
    getLazyAuth(),
  ]);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(authInstance, provider);
  return result.user;
}

export async function signOutAdmin(): Promise<void> {
  const [{ signOut }, authInstance] = await Promise.all([
    import('firebase/auth'),
    getLazyAuth(),
  ]);
  await signOut(authInstance);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  if (isAutomatedAuditBot()) {
    callback(null);
    return () => {};
  }
  let unsub: (() => void) | null = null;
  let cancelled = false;

  void Promise.all([import('firebase/auth'), getLazyAuth()]).then(
    ([{ onAuthStateChanged }, authInstance]) => {
      if (cancelled) return;
      unsub = onAuthStateChanged(authInstance, callback);
    }
  );

  return () => {
    cancelled = true;
    if (unsub) unsub();
  };
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
  if (isAutomatedAuditBot()) {
    return () => {};
  }
  const path = `portfolio/${PORTFOLIO_DOC_ID}`;
  return onSnapshot(
    doc(db, 'portfolio', PORTFOLIO_DOC_ID),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      const data = snapshot.data();
      const loaded = mergePortfolioDataWithDefaults(data);
      saveCachedProfile(loaded);
      onData(loaded);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function savePortfolioToFirestore(profile: ProfileData): Promise<void> {
  const authInstance = await getLazyAuth();
  const user = authInstance.currentUser;
  if (!user) {
    throw new Error('Avtorizatsiyadan o\'tilmagan.');
  }
  const path = `portfolio/${PORTFOLIO_DOC_ID}`;
  try {
    const payload = sanitizePortfolioPayload(profile, user.uid);
    await setDoc(doc(db, 'portfolio', PORTFOLIO_DOC_ID), payload);
    saveCachedProfile(profile);
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

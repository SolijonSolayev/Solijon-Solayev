import { ProfileData } from '../types/profile';
import { formatUzbekText, localizeProfileData, UzbekAlphabetMode } from './uzbekAlphabet';

export type SupportedLanguage = 'uz' | 'en';
export const LANGUAGE_STORAGE_KEY = 'solijon_language_pref';

export const TRANSLATIONS = {
  uz: {
    // Navigation
    navAbout: 'Men haqimda',
    navProjects: 'Loyihalar',
    navBlog: 'Blog',
    navExperience: 'Faoliyat',
    navContact: "Bog'lanish",
    mainNavAria: 'Asosiy navigatsiya',

    // Header Controls
    dayMode: 'Kun',
    nightMode: 'Tun',
    toDayMode: "Kunduzgi hashamatli rejimga o'tish (Oq-sariq va oltin-qum)",
    toNightMode: "Tungi rejimga o'tish (Qorong'i)",
    flameCursor: 'Olov kursor',
    flameCursorDisable: "Olovli kursorni o'chirish",
    flameCursorEnable: 'Olovli kursorni yoqish',
    digitalCard: 'Raqamli Vizitka',
    sound: 'Tovush',
    soundMute: "Tovush effektlarini o'chirish",
    soundUnmute: 'Tovush effektlarini yoqish',
    installApp: "O'rnatish",
    installedApp: "O'rnatildi",
    search: 'Qidiruv',
    searchPlaceholder: 'Loyiha, blog maqola yoki texnologiyani qidiring...',
    backToHome: 'Asosiy sahifaga (Men haqimda)',

    // Hero & Bio
    openToWork: 'Faoliyatga ochiq (Remote / Kontrakt)',
    downloadVCard: 'vCard Yuklash',
    copyEmail: 'Email nusxalash',
    emailCopied: 'Email nusxalandi!',
    viewProjects: 'Loyihalarni koʻrish',
    writeMessage: 'Murojaat yozish',
    bioHeading: 'Men haqimda',
    bioSubheading: 'Shaxsiy maʼlumot va qiziqishlar',
    experienceYears: '3+ yillik amaliy tajriba',

    // Section Titles
    projectsTitle: 'Tanlangan Loyihalar',
    projectsSubtitle: 'Ishlab chiqilgan veb-ilovalar, interaktiv 3D simulyatsiyalar va ochiq kodli dasturlar',
    allCategories: 'Barchasi',
    blogTitle: 'Shaxsiy Blog',
    blogSubtitle: '«Fikr qilamiz» rukni, IT tahlillar, texnologik maqolalar va falsafiy mulohazalar',
    ecosystemTitle: 'Jonli Ekotizim',
    ecosystemSubtitle: 'GitHub, Oʻzbekcha Vikipediya va Vikiombor faoliyati real vaqtda',
    contactTitle: "Bog'lanish va Murojaat",
    contactSubtitle: 'Hamkorlik, maslahat yoki IT loyihalar boʻyicha bevosita xabar qoldiring',

    // Offline Banner
    offlineNotice: "Oflayn rejim faol — portfolio ma'lumotlari keshdan to'liq ishlamoqda",
    onlineNotice: 'Internet aloqasi tiklandi',
    pwaInstallTitle: "Ilovani qurilmaga o'rnatish",
    pwaInstallDesc: "Portfolioni telefon yoki kompyuteringizga mustaqil ilova (PWA) sifatida o'rnating.",
  },
  en: {
    // Navigation
    navAbout: 'About Me',
    navProjects: 'Projects',
    navBlog: 'Blog',
    navExperience: 'Experience',
    navContact: 'Contact',
    mainNavAria: 'Main navigation',

    // Header Controls
    dayMode: 'Day',
    nightMode: 'Night',
    toDayMode: 'Switch to Luxury Gold & Sand Day Mode',
    toNightMode: 'Switch to Cyber Obsidian Night Mode',
    flameCursor: 'Flame Cursor',
    flameCursorDisable: 'Disable interactive flame cursor',
    flameCursorEnable: 'Enable interactive flame cursor',
    digitalCard: 'Digital Card',
    sound: 'Sound',
    soundMute: 'Mute UI audio effects',
    soundUnmute: 'Enable UI audio effects',
    installApp: 'Install App',
    installedApp: 'Installed',
    search: 'Search',
    searchPlaceholder: 'Search projects, blog articles, or technologies...',
    backToHome: 'Back to Main Page (About Me)',

    // Hero & Bio
    openToWork: 'Open for Opportunities (Remote / Contract)',
    downloadVCard: 'Download vCard',
    copyEmail: 'Copy Email',
    emailCopied: 'Email copied to clipboard!',
    viewProjects: 'Explore Projects',
    writeMessage: 'Send Inquiry',
    bioHeading: 'About Me',
    bioSubheading: 'Personal background, passions, and core domains',
    experienceYears: '3+ Years Hands-on Experience',

    // Section Titles
    projectsTitle: 'Featured Projects',
    projectsSubtitle: 'Web applications, interactive 3D simulations, and open-source developer utilities',
    allCategories: 'All',
    blogTitle: 'Personal Blog',
    blogSubtitle: 'Deep-dive IT essays, architectural musings, and technology articles',
    ecosystemTitle: 'Live Ecosystem',
    ecosystemSubtitle: 'Real-time metrics from GitHub, Uzbek Wikipedia, and Wikimedia Commons',
    contactTitle: 'Get in Touch',
    contactSubtitle: 'Drop a message for collaborations, technical consulting, or development projects',

    // Offline Banner
    offlineNotice: 'Offline mode active — portfolio is fully accessible from local cache',
    onlineNotice: 'Internet connection restored',
    pwaInstallTitle: 'Install App to Device',
    pwaInstallDesc: 'Install this portfolio as a standalone Progressive Web App on your phone or desktop.',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.uz;

export function getTranslation(
  key: TranslationKey,
  lang: SupportedLanguage,
  alphabetMode: UzbekAlphabetMode = 'new_2026'
): string {
  const text = TRANSLATIONS[lang]?.[key] || TRANSLATIONS.uz[key] || '';
  if (lang === 'uz') {
    return formatUzbekText(text, alphabetMode);
  }
  return text;
}

export function localizeProfileForLanguage(
  profile: ProfileData,
  lang: SupportedLanguage,
  alphabetMode: UzbekAlphabetMode
): ProfileData {
  if (lang === 'uz') {
    return localizeProfileData(profile, alphabetMode);
  }

  // English translation mapping
  return {
    ...profile,
    personal: {
      ...profile.personal,
      fullName: 'Solijon Solayev',
      role: 'Frontend Engineer & Open-Source Creator',
      kicker: 'Creative Engineer & Digital Builder',
      headline:
        'Crafting impactful web applications, interactive 3D simulations, and open-source software.',
      shortBio:
        'Born in 2003 in Yangiariq, Khorezm. Earned a Bachelor degree in Transport Logistics from Jizzakh Polytechnic Institute and completed Web Programming (Frontend) at Teamit Academy in Jizzakh.',
      detailedBio:
        'Completed higher education in Transport Logistics at Jizzakh Polytechnic Institute and graduated from the Web Programming (Frontend) course at Teamit Academy in Jizzakh. Creator of Solaris 3D (solaris3d.uz) and Tilimlo.uz.',
      location: 'Yangiariq, Khorezm, Uzbekistan',
      availability: 'Open for Opportunities (Remote / Contract)',
      etiquetteNote: 'Fast response within 2 hours. English & Uzbek welcome.',
      yearsOfExperience: '3+ Years Practical Experience',
    },
    metrics: profile.metrics.map((m) => {
      let labelEn = m.label;
      let contextEn = m.context;
      if (m.label.includes('Ochiq') || m.label.includes('Oçiq')) {
        labelEn = 'Open Source Projects';
        contextEn = 'GitHub & PyPI repositories';
      } else if (m.label.includes('3D')) {
        labelEn = '3D Astronomy Simulations';
        contextEn = 'Solaris 3D & interactive celestial maps';
      } else if (m.label.includes('Vikipediya')) {
        labelEn = 'Wikipedia Contributions';
        contextEn = 'Edits & featured articles created';
      } else if (m.label.includes('Vikiombor') || m.label.includes('Fotogalereya')) {
        labelEn = 'Wikimedia Commons Photos';
        contextEn = 'Historical & natural heritage photos';
      }
      return {
        ...m,
        label: labelEn,
        context: contextEn,
      };
    }),
    services: profile.services.map((s) => ({
      ...s,
      title:
        s.title.includes('Frontend') ? 'Modern Frontend & Web App Engineering' :
        s.title.includes('3D') ? 'Interactive 3D Web & Canvas Simulations' :
        s.title.includes('Ochiq') || s.title.includes('Oçiq') ? 'Open Source Utilities & Automation' :
        s.title,
      description:
        s.title.includes('Frontend')
          ? 'Architecting ultra-fast, accessible, responsive single page applications using React, TypeScript, and modern CSS.'
          : s.title.includes('3D')
          ? 'Building real-time WebGL, Three.js, and Canvas simulations with smooth performance and physics.'
          : s.description,
    })),
    experience: profile.experience.map((e) => {
      if (e.id === 'e_teamit') {
        return {
          ...e,
          period: 'Studies Completed',
          role: 'Web Programming (Frontend) Graduate',
          company: 'Teamit Academy Learning Center',
          location: 'Jizzakh, Uzbekistan',
          description: 'Successfully completed the intensive practical Web Programming (Frontend) course at Teamit Academy in Jizzakh.',
        };
      }
      if (e.id === 'e_jizpi') {
        return {
          ...e,
          period: 'Higher Education',
          role: 'Bachelor in Transport Logistics',
          company: 'Jizzakh Polytechnic Institute',
          location: 'Jizzakh, Uzbekistan',
          description: 'Earned a Bachelor degree in Transport Logistics at Jizzakh Polytechnic Institute.',
        };
      }
      return e;
    }),
  };
}


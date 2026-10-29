export interface MetricItem {
  id: string;
  value: string;
  label: string;
  context: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  deliverables: string[];
  technologies: string[];
}

export interface SkillGroup {
  id: string;
  category: string;
  items: string[];
}

export type ProjectCategory = 'Veb-loyihalar' | 'Foydali dasturlar' | 'Ochiq bilim va Media';

export interface ProjectItem {
  id: string;
  title: string;
  category: ProjectCategory;
  year: string;
  client: string;
  role: string;
  featured: boolean;
  summary: string;
  challenge: string;
  solution: string;
  impactMetric: string;
  technologies: string[];
  imageUrl: string;
  liveUrl: string;
  repoUrl?: string;
}

export interface ExperienceItem {
  id: string;
  period: string;
  role: string;
  company: string;
  location: string;
  type: 'Faoliyat' | 'Ta\'lim';
  description: string;
  achievements: string[];
  technologies: string[];
}

export type BlogCategory =
  | 'Dasturlash va IT'
  | 'Astronomiya va Fan'
  | "O'zbek tili va Imlo"
  | 'Shaxsiy fikrlar';

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  category: BlogCategory;
  publishedAt: string; // YYYY-MM-DD
  readTime: string;
  featured: boolean;
  published: boolean;
  excerpt: string;
  content: string;
  tags: string[];
  imageUrl: string;
}

export interface ProfileData {
  personal: {
    fullName: string;
    role: string;
    kicker: string;
    headline: string;
    shortBio: string;
    detailedBio: string;
    location: string;
    availability: string;
    email: string;
    phone: string;
    telegram: string;
    github: string;
    linkedin: string;
    website: string;
    youtube: string;
    wikipedia: string;
    commons: string;
    taplink: string;
    etiquetteNote: string;
    heroImageUrl: string;
    yearsOfExperience: string;
  };
  metrics: MetricItem[];
  services: ServiceItem[];
  skillGroups: SkillGroup[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  blogPosts: BlogPostItem[];
}

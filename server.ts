import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type AlphabetMode = 'new_2026' | 'classic';

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

interface ChatRequestBody {
  messages?: ChatTurn[];
  roleId?: 'portfolio_guide' | 'tech_advisor' | 'astronomy_linguistics';
  modelMode?: 'general' | 'fast' | 'complex';
  alphabetMode?: AlphabetMode;
  profileSummary?: string;
}

interface BlogAssistRequestBody {
  mode?: 'full_draft' | 'metadata_only';
  topic?: string;
  category?: string;
  existingContent?: string;
  alphabetMode?: AlphabetMode;
}

interface TtsRequestBody {
  text?: string;
  voiceName?: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
}

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

function isUrlOrEmail(token: string): boolean {
  if (!token) return false;
  if (
    token.startsWith('http://') ||
    token.startsWith('https://') ||
    token.startsWith('mailto:') ||
    (token.includes('@') && token.includes('.'))
  ) {
    return true;
  }
  return /\b(?:solaris3d\.uz|tilimlo\.uz|taplink\.cc|github\.com|github\.io|wikipedia\.org|wikimedia\.org|youtube\.com)\b/i.test(
    token
  );
}

function transformPlainSegment(segment: string, mode: AlphabetMode): string {
  if (!segment) return segment;
  if (mode === 'classic') {
    return segment
      .replace(/Ö/g, "O'")
      .replace(/ö/g, "o'")
      .replace(/Ğ/g, "G'")
      .replace(/ğ/g, "g'")
      .replace(/Ş/g, 'Sh')
      .replace(/ş/g, 'sh')
      .replace(/Ç/g, 'Ch')
      .replace(/ç/g, 'ch');
  }

  const parts = segment.split(/(\s+)/);
  return parts
    .map((part) => {
      if (/^\s+$/.test(part) || isUrlOrEmail(part)) return part;
      const cleanAlpha = part.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (PROTECTED_TECH_WORDS.has(cleanAlpha)) return part;

      return part
        .replace(/O(?:ʻ|ʼ|’|‘|'|`)/g, 'Ö')
        .replace(/o(?:ʻ|ʼ|’|‘|'|`)/g, 'ö')
        .replace(/G(?:ʻ|ʼ|’|‘|'|`)/g, 'Ğ')
        .replace(/g(?:ʻ|ʼ|’|‘|'|`)/g, 'ğ')
        .replace(/([A-Za-zÖöĞğ])['`‘ʻʼ]([A-Za-zÖöĞğ])/g, '$1’$2')
        .replace(/SH/g, 'Ş')
        .replace(/Sh/g, 'Ş')
        .replace(/sh/g, 'ş')
        .replace(/CH/g, 'Ç')
        .replace(/Ch/g, 'Ç')
        .replace(/ch/g, 'ç');
    })
    .join('');
}

function normalizeServerText(text: string, mode: AlphabetMode): string {
  if (!text) return text;
  if (text.includes('`')) {
    return text
      .split(/(```[\s\S]*?```|`[^`\n]+`)/g)
      .map((chunk) => {
        if (chunk.startsWith('`') && chunk.endsWith('`')) {
          return chunk;
        }
        return transformPlainSegment(chunk, mode);
      })
      .join('');
  }
  return transformPlainSegment(text, mode);
}

const NEW_UZBEK_ALPHABET_2026_SYSTEM_GUIDE = `
# ARCHITECTURE & SYSTEM PROMPT: NEW UZBEK LATIN ALPHABET (2026)
Objective: Process, generate, and transliterate Uzbek text using the newly reformed Uzbek Latin alphabet (28 letters + 1 apostrophe ’):
- Oʻ / oʻ / O' / o' -> Ö / ö
- Gʻ / gʻ / G' / g' -> Ğ / ğ
- Sh / sh -> Ş / ş
- Ch / ch -> Ç / ç
- Preserve the apostrophe ’ (tutuq belgisi, U+2019) strictly for glottal stops in words like ma’no, ta’lim, ma’lumot, e’tibor.
- Do NOT alter URLs, email addresses, or English technical terms (e.g., GitHub, TypeScript, Tailwind, React, Python).
`;

const ROLE_INSTRUCTIONS: Record<string, string> = {
  portfolio_guide: `Siz Solijon Solayevning shaxsiy raqamli vizitka, IT portfolio va blog saytidagi rasmiy virtual yordamchisiz.
Vazifangiz — sayt mehmonlariga Solijon Solayevning faoliyati, loyihalari, blog maqolalari va bog'lanish tartibi haqida kamtar, samimiy, aniq va o'zbek tilida ma'lumot berish.

Solijon Solayev haqida asosiy faktlar:
- Ism-sharifi: Solijon Solayev (2003-yilda Xorazm viloyati Yangiariq tumanida tug'ilgan).
- Yo'nalishi: Frontend veb-dasturlash (HTML5, CSS3, JavaScript, TypeScript, React, Tailwind CSS), foydali ochiq manbali dasturlar (Python, Shell) hamda O'zbekcha Vikipediya va YouTube'da erkin bilim ulashish.
- Asosiy jonli veb-loyihalari:
  1. Solaris 3D (https://solaris3d.uz) — Quyosh tizimi, sayyoralar, yulduzlar va kosmik hodisalarni 3D formatda interaktiv o'rganishga mo'ljallangan o'zbekcha astronomik veb-observatoriya.
  2. Tilimlo.uz (https://tilimlo.uz) — O'zbek tilida to'g'ri yozish, imlo qoidalari va savodxonlikni oshirishga bag'ishlangan ma'rifiy veb-loyiha.
  3. GitHub'dagi ochiq manbali dasturlari (https://github.com/SolijonSolayev):
     - usb-formatter: fleshka va USB xotira qurilmalarini Linux, Windows va macOS'da xavfsiz formatlash vositasi.
     - AqlliTozalash: macOS, Linux va Windows tizimlarida vaqtinchalik va keraksiz kesh fayllarni tozalovchi skriptlar.
     - kvadrat-tenglamalar: matematik kvadrat tenglamalarni qadam-baqadam yechish veb-vositasi.
     - Delote-Beauty, sayohat-uz va solijonsolayev.github.io frontend loyihalari.
- Erkin ensiklopediya va media faoliyati:
  - O'zbekcha Vikipediya (uz.wikipedia.org/wiki/Foydalanuvchi:Solijon_Solayev) va Vikiombor (Wikimedia Commons) faoli.
  - YouTube (@Solijon_Solayev) va Telegram'dagi «Fikr qilamiz» blogi muallifi.
- Bog'lanish qoidasi (Taplink — taplink.cc/solijon_solayev):
  - Murojaat qilganda faqat "Salom" deb yozib kutmasdan, savol yoki taklifni bitta to'liq va tushunarli xabarda yozib qoldirish so'raladi.`,

  tech_advisor: `Siz Solijon Solayevning vizitka saytidagi IT va Dasturlash bo'yicha yordamchi maslahatchisiz.
Foydalanuvchilarga Frontend veb-dasturlash (HTML, CSS, JavaScript, TypeScript, React, Tailwind CSS), Python yordamchi dasturlari, tizimni optimallashtirish (Solijonning AqlliTozalash va usb-formatter loyihalari misolida) hamda GitHub bilan ishlash bo'yicha sodda, amaliy va o'zbek tilida tushunarli maslahatlar berasiz.`,

  astronomy_linguistics: `Siz Solijon Solayevning "Solaris 3D" (solaris3d.uz) va "Tilimlo.uz" (tilimlo.uz) hamda Vikipediya loyihalaridan ilhomlangan Ilmiy-ma'rifiy va O'zbek tili imlosi yordamchisisiz.
Foydalanuvchilarga Quyosh tizimi, sayyoralar va astronomiyaga oid qiziqarli ilmiy ma'lumotlarni hamda o'zbek tili imlo qoidalari, jumladan 2026-yilgi yangilangan o'zbek lotin alifbosi (Ö, Ğ, Ş, Ç) va amaldagi alifbo qoidalari bo'yicha savollarga aniq javob berasiz.`,
};

function resolveModelName(modelMode?: string): string {
  if (modelMode === 'fast') {
    return 'gemini-3.1-flash-lite-preview';
  }
  if (modelMode === 'complex') {
    return 'gemini-4-argon';
  }
  return 'gemini-3.8-flash';
}

// In-memory 5-minute cache for external GitHub, Wikipedia & Wikimedia Commons APIs
let cachedLiveActivity: { timestamp: number; data: unknown } | null = null;
const LIVE_CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchExternalLiveActivity() {
  if (cachedLiveActivity && Date.now() - cachedLiveActivity.timestamp < LIVE_CACHE_TTL_MS) {
    return cachedLiveActivity.data;
  }

  const headers = {
    'User-Agent': 'SolijonSolayevPortfolio/2.0 (https://solijonsolayev.github.io; solijonsolayev2003@gmail.com)',
    Accept: 'application/json',
  };

  const [ghUserRes, ghReposRes, wikiRes, commonsRes] = await Promise.allSettled([
    fetch('https://api.github.com/users/SolijonSolayev', { headers }),
    fetch('https://api.github.com/users/SolijonSolayev/repos?sort=updated&per_page=8', { headers }),
    fetch(
      'https://uz.wikipedia.org/w/api.php?action=query&list=users|usercontribs&ususers=Solijon_Solayev&usprop=editcount|registration&ucuser=Solijon_Solayev&uclimit=6&ucprop=title|timestamp|comment|sizediff&format=json',
      { headers }
    ),
    fetch(
      'https://commons.wikimedia.org/w/api.php?action=query&generator=allimages&gaiuser=Solijon_Solayev&gaisort=timestamp&gaidir=descending&gailimit=50&prop=imageinfo&iiprop=url|timestamp|dimensions&iiurlwidth=640&format=json',
      { headers }
    ),
  ]);

  let githubUser: Record<string, unknown> | null = null;
  if (ghUserRes.status === 'fulfilled' && ghUserRes.value.ok) {
    githubUser = (await ghUserRes.value.json()) as Record<string, unknown>;
  }

  let githubRepos: Record<string, unknown>[] = [];
  if (ghReposRes.status === 'fulfilled' && ghReposRes.value.ok) {
    const rawRepos = await ghReposRes.value.json();
    if (Array.isArray(rawRepos)) {
      githubRepos = rawRepos
        .filter((r) => !r.fork)
        .slice(0, 6)
        .map((r, idx) => ({
          id: r.id ?? idx + 1,
          name: r.name || `repo-${idx + 1}`,
          description: r.description || '',
          url: r.html_url || `https://github.com/SolijonSolayev/${r.name || ''}`,
          htmlUrl: r.html_url || `https://github.com/SolijonSolayev/${r.name || ''}`,
          homepage: r.homepage || '',
          language: r.language || 'Web / Code',
          stars: r.stargazers_count || 0,
          forks: r.forks_count || 0,
          updatedAt: r.updated_at || new Date().toISOString(),
        }));
    }
  }

  let wikiProfile: { editCount: number; registration: string } = {
    editCount: 250,
    registration: '2022',
  };
  let wikiContribs: Record<string, unknown>[] = [];
  if (wikiRes.status === 'fulfilled' && wikiRes.value.ok) {
    const wikiJson = (await wikiRes.value.json()) as {
      query?: {
        users?: Array<{ editcount?: number; registration?: string }>;
        usercontribs?: Array<{
          pageid?: number;
          revid?: number;
          title?: string;
          timestamp?: string;
          comment?: string;
          sizediff?: number;
        }>;
      };
    };
    const u = wikiJson.query?.users?.[0];
    if (u && typeof u.editcount === 'number') {
      wikiProfile = {
        editCount: u.editcount,
        registration: u.registration ? u.registration.slice(0, 4) : '2022',
      };
    }
    if (Array.isArray(wikiJson.query?.usercontribs)) {
      wikiContribs = wikiJson.query.usercontribs.map((c, idx) => {
        const resolvedRevId = c.revid ?? c.pageid ?? idx + 1000;
        const resolvedSizeDiff = typeof c.sizediff === 'number' ? c.sizediff : 0;
        return {
          revid: resolvedRevId,
          revId: resolvedRevId,
          title: c.title || '',
          timestamp: c.timestamp || '',
          comment: c.comment || 'Maqola tahriri va boyitish',
          sizediff: resolvedSizeDiff,
          sizeDiff: resolvedSizeDiff,
          url: `https://uz.wikipedia.org/wiki/${encodeURIComponent(
            (c.title || '').replace(/ /g, '_')
          )}`,
        };
      });
    }
  }

  let commonsPhotos: Record<string, unknown>[] = [];
  if (commonsRes.status === 'fulfilled' && commonsRes.value.ok) {
    const commonsJson = (await commonsRes.value.json()) as {
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
    commonsPhotos = Object.values(pagesObj)
      .map((page, idx) => {
        const info = page.imageinfo?.[0];
        if (!info) return null;
        const cleanedTitle = (page.title || `Commons Photo ${idx + 1}`)
          .replace(/^File:/i, '')
          .replace(/\.[^.]+$/, '');
        return {
          id: String(page.pageid || page.title || idx),
          title: page.title || cleanedTitle,
          cleanTitle: cleanedTitle,
          thumbUrl: info.thumburl || info.url || '',
          fullUrl: info.url || info.thumburl || '',
          descriptionUrl:
            info.descriptionurl ||
            `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title || '')}`,
          timestamp: info.timestamp || '',
          width: info.width || 0,
          height: info.height || 0,
          dimensions:
            info.width && info.height ? `${info.width}×${info.height}` : '',
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item && item.thumbUrl))
      .slice(0, 50);
  }

  const payload = {
    fetchedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    github: {
      username: 'SolijonSolayev',
      profileUrl: 'https://github.com/SolijonSolayev',
      publicRepos: typeof githubUser?.public_repos === 'number' ? githubUser.public_repos : 11,
      followers: typeof githubUser?.followers === 'number' ? githubUser.followers : 15,
      repos: githubRepos,
    },
    wikipedia: {
      username: 'Solijon_Solayev',
      profileUrl: 'https://uz.wikipedia.org/wiki/Foydalanuvchi:Solijon_Solayev',
      editCount: wikiProfile.editCount,
      registrationYear: wikiProfile.registration,
      registration: wikiProfile.registration,
      contributions: wikiContribs,
    },
    commons: {
      username: 'Solijon_Solayev',
      profileUrl: 'https://commons.wikimedia.org/wiki/User:Solijon_Solayev',
      photos: commonsPhotos,
    },
  };

  cachedLiveActivity = {
    timestamp: Date.now(),
    data: payload,
  };
  return payload;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // 1. Live GitHub, Wikipedia & Wikimedia Commons API Endpoint
  app.get('/api/live-activity', async (_req, res) => {
    try {
      const data = await fetchExternalLiveActivity();
      res.json(data);
    } catch (error) {
      console.error('Live activity error:', error);
      res.status(500).json({ error: "Jonli ma'lumotlarni yuklashda xatolik yuz berdi." });
    }
  });

  // 2. AI Blog Assistant Endpoint (Admin Panel Drafting & Metadata Generation)
  app.post('/api/blog-ai-assist', async (req, res) => {
    const body = (req.body || {}) as BlogAssistRequestBody;
    const alphabetMode: AlphabetMode = body.alphabetMode === 'classic' ? 'classic' : 'new_2026';

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({
          error: normalizeServerText(
            "GEMINI_API_KEY topilmadi. Iltimos, Settings > Secrets bo'limida API kalitni tekshiring.",
            alphabetMode
          ),
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const mode = body.mode || 'full_draft';
      const topic = (body.topic || '').trim();
      const category = (body.category || 'Dasturlash va IT').trim();
      const existingContent = (body.existingContent || '').trim();

      const prompt =
        mode === 'metadata_only'
          ? `Quyidagi blog maqolasi uchun jozibali sarlavha (title), qisqacha anons (excerpt, 1-2 jumla), o'qish vaqti (readTime, masalan "4 daqiqa") va 4-5 ta teglar (tags) shakllantirib ber.\n\nMaqola matni yoki mavzusi:\n${
              existingContent || topic
            }`
          : `Solijon Solayevning shaxsiy IT va ilmiy-ma'rifiy blogi uchun "${
              topic || category
            }" mavzusida ("${category}" bo'limi) chuqur, foydali va professional blog maqola yozib ber.
Maqola tarkibida:
- Kirish qismi
- "## " va "### " bilan ajratilgan mantiqiy bo'limlar
- Zarur bo'lsa kod bloki (\`\`\`typescript yoki \`\`\`python)
- "> " bilan ajratilgan muhim xulosa yoki iqtibos
- "- " bilan ro'yxat bandlari bo'lsin.`;

      const systemInstruction = `Siz Solijon Solayevning (Solaris 3D — solaris3d.uz, Tilimlo.uz muallifi, Frontend dasturchi va O'zbekcha Vikipediya faoli) shaxsiy blog muharririsiz. Maqolalarni o'zbek tilida, ravon, ilmiy-ommabop va texnik jihatdan aniq uslubda yozasiz.\n${
        alphabetMode === 'new_2026' ? NEW_UZBEK_ALPHABET_2026_SYSTEM_GUIDE : ''
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'Blog article headline in Uzbek.',
              },
              excerpt: {
                type: Type.STRING,
                description: 'Concise 1-2 sentence article summary/excerpt in Uzbek.',
              },
              readTime: {
                type: Type.STRING,
                description: 'Estimated reading time, e.g. "5 daqiqa".',
              },
              content: {
                type: Type.STRING,
                description: 'Full Markdown article content with ## headings, lists, quotes, and code blocks.',
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of 4-5 relevant tags.',
              },
            },
            required: ['title', 'excerpt', 'readTime', 'content', 'tags'],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      res.json({
        title: normalizeServerText(parsed.title || topic, alphabetMode),
        excerpt: normalizeServerText(parsed.excerpt || '', alphabetMode),
        readTime: normalizeServerText(parsed.readTime || '4 daqiqa', alphabetMode),
        content: normalizeServerText(parsed.content || existingContent, alphabetMode),
        tags: Array.isArray(parsed.tags)
          ? parsed.tags.map((t: string) => normalizeServerText(String(t), alphabetMode))
          : ['IT', 'Blog'],
      });
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      console.error('Blog AI assist error:', errMessage);
      res.status(500).json({
        error: normalizeServerText(
          "AI yordamida maqola tayyorlashda xatolik yuz berdi. Qayta urinib ko'ring.",
          alphabetMode
        ),
      });
    }
  });

  // 3. Gemini Text-to-Speech (TTS) Endpoint for Article Audio Reading
  app.post('/api/tts', async (req, res) => {
    const body = (req.body || {}) as TtsRequestBody;
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: 'GEMINI_API_KEY topilmadi.' });
        return;
      }

      const rawText = (body.text || '').trim();
      if (!rawText) {
        res.status(400).json({ error: "O'qish uchun matn bo'sh." });
        return;
      }

      // Clean markdown formatting and limit length for crisp low-latency TTS
      const cleanSpeechText = rawText
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[#>*_~]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 1800);

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const voiceName = body.voiceName || 'Kore';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanSpeechText,
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        res.status(500).json({ error: 'Audio oqimi shakllanmadi.' });
        return;
      }

      res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      console.error('Gemini TTS error:', errMessage);
      res.status(500).json({ error: 'Maqolani ovozga aylantirishda xatolik yuz berdi.' });
    }
  });

  // 4. Multi-Turn Portfolio Chatbot Endpoint
  app.post('/api/chat', async (req, res) => {
    const body = (req.body || {}) as ChatRequestBody;
    const alphabetMode: AlphabetMode = body.alphabetMode === 'classic' ? 'classic' : 'new_2026';

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({
          error: normalizeServerText(
            "GEMINI_API_KEY topilmadi. Iltimos, Settings > Secrets bo'limida API kalitni tekshiring.",
            alphabetMode
          ),
        });
        return;
      }

      const rawMessages = Array.isArray(body.messages) ? body.messages : [];
      const roleId =
        body.roleId && ROLE_INSTRUCTIONS[body.roleId] ? body.roleId : 'portfolio_guide';
      const modelMode = body.modelMode || 'general';

      if (rawMessages.length === 0) {
        res.status(400).json({
          error: normalizeServerText(
            "Xabarlar ro'yxati bo'sh bo'lishi mumkin emas.",
            alphabetMode
          ),
        });
        return;
      }

      const contents = rawMessages
        .filter((m) => m && typeof m.text === 'string' && m.text.trim().length > 0)
        .map((m) => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.text.trim() }],
        }));

      let systemInstruction = ROLE_INSTRUCTIONS[roleId];
      if (alphabetMode === 'new_2026') {
        systemInstruction += `\n\n${NEW_UZBEK_ALPHABET_2026_SYSTEM_GUIDE}\nMUHIM KO'RSATMA: Foydalanuvchi qaysi alifboda yozishidan qat'i nazar, barcha javoblaringizni 2026-yilgi YANGILANGAN ÖZBEK LOTIN ALIFBOSIDA (Ö ö, Ğ ğ, Ş ş, Ç ç harflari bilan, masalan: Özbekiston, dasturçi, boğlaniş, oçiq, ma’lumot) yozing!`;
      } else {
        systemInstruction += `\n\nMUHIM KO'RSATMA: Foydalanuvchi qaysi alifboda (jumladan yangi Ö, Ğ, Ş, Ç alifbosida yoki amaldagi O', G', Sh, Ch alifbosida) yozishidan qat'i nazar, uni to'liq tushuning va javoblaringizni amaldagi o'zbek lotin alifbosida (O', G', Sh, Ch) yozing.`;
      }

      if (body.profileSummary && typeof body.profileSummary === 'string') {
        systemInstruction += `\n\nSaytdagi joriy ma'lumotlar:\n${body.profileSummary}`;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const primaryModel = resolveModelName(modelMode);
      let usedModel = primaryModel;
      let responseText = '';

      try {
        const response = await ai.models.generateContent({
          model: primaryModel,
          contents,
          config: {
            systemInstruction,
          },
        });
        responseText = response.text || '';
      } catch (primaryErr: unknown) {
        if (primaryModel !== 'gemini-3.8-flash') {
          usedModel = 'gemini-3.8-flash';
          const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents,
            config: {
              systemInstruction,
            },
          });
          responseText = fallbackResponse.text || '';
        } else {
          throw primaryErr;
        }
      }

      const finalReply =
        normalizeServerText(responseText.trim(), alphabetMode) ||
        normalizeServerText(
          "Kechirasiz, javob shakllantirishda qisqa uzilish yuz berdi. Savolingizni qayta yozib ko'ring.",
          alphabetMode
        );

      res.json({
        reply: finalReply,
        model: usedModel,
      });
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      console.error('Gemini chat API error:', errMessage);

      if (
        errMessage.includes('403') ||
        errMessage.includes('PERMISSION_DENIED') ||
        errMessage.includes('API_KEY_INVALID')
      ) {
        res.status(403).json({
          error: normalizeServerText(
            "Gemini API kalitida ruxsat xatosi (403/400). Iltimos, AI Studio'ning Settings > Secrets bo'limida API kalitni tekshiring.",
            alphabetMode
          ),
        });
        return;
      }

      if (errMessage.includes('429') || errMessage.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({
          error: normalizeServerText(
            "So'rovlar limiti tugadi (429). Bir necha soniyadan so'ng qayta urinib ko'ring yoki Settings > Secrets bo'limida billing yoqilgan kalitni tanlang.",
            alphabetMode
          ),
        });
        return;
      }

      res.status(500).json({
        error: normalizeServerText(
          "Serverda Gemini bilan bog'lanishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
          alphabetMode
        ),
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

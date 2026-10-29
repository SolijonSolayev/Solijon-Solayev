# Solijon Solayev | Shaxsiy sayt va portfolio

Bu loyiha Solijon Solayevning shaxsiy veb-sayti, portfolio va blogi uchun yaratilgan. Loyihada zamonaviy va jozibali UI, dinamik kontent, AI-texnologiyalari bilan ishlaydigan interaktiv komponentlar va GitHub, Wikipedia, Wikimedia Commons kabi manbalardan real-vaqt ma’lumotlar birlashtirilgan.

Loyiha quyidagilarni taqdim etadi:
- shaxsiy brand va professional profil
- loyihalar va portfolio ko’rsatkichi
- blog maqolalari va maqola taqdimoti
- AI yordamchi chat va blog draft generator
- ikki xil o’zbek lotin alifbosini qo’llab-quvvatlash
- jonli ekotizim va faoliyatni ko’rsatish
- bog’lanish va murojaat uchun qulay interfeys

## Loyihaning maqsadi

Ushbu sayt Solijon Solayevning:
- professional faoliyatini namoyish etish
- yaratilgan loyihalarni ko’rsatish
- blog va maqola yozish faoliyatini rivojlantirish
- o’zbek tilidagi kontentni zamonaviy texnologiyalar bilan taqdim etish
- investorlar, hamkorlar va mijozlar uchun ishonchli digital profil yaratish

## Asosiy xususiyatlar

- responsiv va zamonaviy dizayn
- quyuq rangli, professional UI/UX
- React + TypeScript bilan yaratilgan frontend
- Express orqali ishlaydigan backend API
- Gemini AI yordamida:
  - chat bot
  - blog maqola yozish
  - matnni ovozga aylantirish (TTS)
- GitHub, Wikipedia va Wikimedia Commons API integratsiyasi
- o’zbek tilining turli lotin alifbosi variantlari uchun qo’llab-quvvatlash
- admin paneli va blogni boshqarish imkoniyati
- aloqa formasi va rasmiy profil havolalari

## Texnologiyalar

Frontend:
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion / Motion
- Lucide React

Backend:
- Express
- TypeScript
- dotenv
- Google GenAI SDK

Qo’shimcha:
- Firebase
- ESLint
- Bun / npm va Node.js

## Loyihaning tuzilishi

```bash
.
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
├── firestore.rules
├── firebase-applet-config.json
├── firebase-blueprint.json
├── metadata.json
├── public/
│   └── statik fayllar va rasmlar
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   ├── data/
│   ├── hooks/
│   ├── styles/
│   └── types/
├── security_spec.md
├── DRAFT_firestore.rules
├── bun.lock
├── eslint.config.js
└── README.md
```

## Loyiha ishga tushirish

### Talablar

- Node.js 18+
- npm yoki bun
- Git

### Dependencylarni o’rnatish

```bash
npm install
```

yoki

```bash
bun install
```

### Environment variables

`.env.example` faylidan nusxa oling:

```bash
cp .env.example .env
```

So’ngra quyidagi o’zgaruvchilarni to’ldiring:

```env
GEMINI_API_KEY="your_google_gemini_api_key"
APP_URL="http://localhost:3000"
```

> AI xususiyatlari ishlashi uchun `GEMINI_API_KEY` talab qilinadi. Agar bu kalit bo’lmasa chat, blog generator va TTS xizmatlari ishlamaydi.

## Ishga tushirish skriptlari

### Development režim

```bash
npm run dev
```

Bu buyruq frontend va backendni birga ishga tushiradi.

### Production build

```bash
npm run build
```

### Production preview

```bash
npm run preview
```

### Lint tekshiruvi

```bash
npm run lint
```

### Tozalash

```bash
npm run clean
```

## Backend API

Loyihada Express server mavjud bo’lib, quyidagi endpointlar ishlaydi:

- `/api/live-activity` — GitHub, Wikipedia va Wikimedia Commons ma’lumotlarini olib beradi
- `/api/blog-ai-assist` — maqola sarlavhasi, anonsi, teglar va tayyor draft yaratadi
- `/api/tts` — matnni ovozga aylantirish (TTS)
- `/api/chat` — portfolio bo’yicha AI chat funksiyasi

## Loyiha ishlash prinsipi

### Frontend
React va Vite orqali yaratilgan frontend foydalanuvchiga portfolio, blog, loyihalar va kontaklar sahifasini taqdim etadi.

### Backend
Express server API ni boshqaradi va Gemini API bilan bog’lanib AI funksiyalarini ta’minlaydi.

### AI funksiyalari
Google Gemini yordamida loyiha:
- foydalanuvchilarga portfolio haqida javob beradi
- maqolalar yozadi
- meta ma’lumotlarni avtomatik yaratadi
- matnni ovozga aylantiradi

## Lokal ishlab chiqish

Loyihani ishga tushirish uchun:

```bash
npm run dev
```

Keyin brauzerda quyidagi manzilga kiring:

```bash
http://localhost:3000
```

## Deploy (joylashtirish)

Loyiha Node.js bilan ishlaydigan muhitda, shuningdek static frontend hosting va backend serverlarida joylashtirilishi mumkin.

Mumkin bo’lgan deploy variantlari:
- Vercel
- Netlify
- Firebase Hosting
- Google Cloud
- VPS yoki Docker-based server

## Muallif

Solijon Solayev

## Litsenziya



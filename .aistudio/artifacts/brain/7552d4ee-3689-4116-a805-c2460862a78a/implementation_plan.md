# Yangilangan Özbek Alifbosi (2026 — Ö, Ğ, Ş, Ç) va Ikki Alifboni Qöllab-Quvvatlash Rejasi

Ushbu yangilanishda siz yuborgan **«New Uzbek Latin Alphabet (2026)»** yo'riqnomasi asosida saytning barcha matnlari standart holatda **Yangilangan özbek alifbosida (`Ö ö`, `Ğ ğ`, `Ş ş`, `Ç ç`)** aks etadi hamda foydalanuvchilar bir tugma orqali **Yangilangan alifbo (`Ö, Ğ, Ş, Ç`)** va **Amaldagi alifbo (`Oʻ, Gʻ, Sh, Ch`)** o'rtasida erkin almashishlari mumkin bo'ladi.

## User Review & Critical Decisions

> [!IMPORTANT]
> Izohingizga binoan ortiqcha alifbo konvertori oynasi rejadan olib tashlandi. Saytda faqat toza ikki alifbo tizimi (`Ö, Ğ, Ş, Ç` ↔ `Oʻ, Gʻ, Sh, Ch`) va Gemini AI chatbot integratsiyasi ishlaydi. Tasdiqlash uchun **"Proceed"** tugmasini bosing.

- **Ikki alifboni to'liq qo'llab-quvvatlash (Default: Yangilangan 2026 Alifbosi)**:
  - Sayt ochilganda barcha bo'limlar (**Hero**, **Ko'rsatkichlar**, **Yo'nalishlar**, **Loyihalar**, **Faoliyat**, **Bog'lanish**, **Raqamli Vizitka QR**, **Admin Panel** va **AI Chatbot**) standart holatda **Yangilangan 2026 özbek lotin alifbosida (`Ö, Ğ, Ş, Ç`)** ko'rinadi.
  - Yuqori boshqaruv qatorida ixcham **Alifbo tanlagich (`Ö Ğ Ş Ç` / `Oʻ Gʻ Sh Ch`)** joylashadi va tanlangan holat xotirada (`localStorage`) saqlanadi.
- **2026 Alifbo Qoidalari va URL/Terminlar Himoyasi**:
  - `O'` / `Oʻ` / `O‘` / `O’` → **Ö / ö**
  - `G'` / `Gʻ` / `G‘` / `G’` → **Ğ / ğ**
  - `Sh` / `SH` / `sh` → **Ş / ş**
  - `Ch` / `CH` / `ch` → **Ç / ç**
  - **Tutuq belgisi (`’`) himoyasi**: *ta’lim*, *ma’no*, *ma’rifiy*, *e’tibor*, *me’yor* kabi so'zlardagi tutuq belgisi (`’`) saqlab qolinadi.
  - **Texnik atamalar va URL himoyasi**: Havolalar (`https://...`), elektron pochta (`solijonsolayev2003@gmail.com`) hamda xalqaro IT atamalar (`GitHub`, `TypeScript`, `Tailwind`, `Batchfile`, `Chrome`, `Tech`, `Search`) buzilmasligi uchun maxsus filtrdan o'tkaziladi.
- **Ikki Alifboli Gemini AI Chatbot**:
  - **Gemini AI Chatbot** siz yuborgan yo'riqnoma asosida har ikkala alifboda yozilgan savollarni tushunadi va foydalanuvchi tanlagan alifboda (`Ö, Ğ, Ş, Ç` yoki `Oʻ, Gʻ, Sh, Ch`) javob qaytaradi.

---

## 1. Overview & Core Concept

- **Nima qiladi**: Saytdagi barcha statik va dinamik (Firestore/Admin paneldan keladigan) matnlarni real vaqtda **Yangilangan 2026 özbek alifbosi (`Ö, Ğ, Ş, Ç`)** hamda **Amaldagi alifbo (`Oʻ, Gʻ, Sh, Ch`)** o'rtasida xatosiz ko'rsatadi.
- **Asosiy afzalligi**: Admin panelda ma'lumotlarni qaysi alifboda kiritishingizdan qat'i nazar, sayt ularni avtomatik ravishda foydalanuvchi tanlagan alifboga moslab chiqaradi; ortiqcha vidjetlar bilan sahifa yuklanmaydi.

---

## 2. User Experience & Visual Design

- **Asosiy Foydalanuvchi Oqimlari**:
  1. **Alifboni almashtirish**: Sahifa tepasidagi ko'rsatkich qatorida ixcham `Ö Ğ Ş Ç | Oʻ Gʻ Sh Ch` almashtirgich tugmasi orqali bir zumda butun sayt matnlari (sarlavhalar, loyihalar tavsifi, tugmalar, formalar, modallar va chatbot) tanlangan alifboga o'tadi.
  2. **Ikki alifboli Gemini AI Yordamchi**: Chatbot tanlangan alifbo rejimini avtomatik qabul qiladi va javoblarni `Özbekiston`, `dasturçi`, `boğlaniş`, `oçiq manbali` kabi to'g'ri yangi imlo qoidasi (yoki amaldagi alifbo tanlansa, `Oʻzbekiston`, `dasturchi`, `bogʻlanish`) asosida yozadi.
- **Vizual Uslub va Tema**:
  - Mavjud qorong'u texnologik dizayn (`#050505` asosiy fon, `#0F0F12` kartalar, `#27272A` chegaralar va `#2563EB` kobalt ko'k aksent) o'zgarishsiz saqlanadi.

---

## 3. Key Product Decisions & Trade-Offs

- **1-Qaror: Dinamik ikki tomonlama transliteratsiya va Kontekst himoyasi**
  - *Tanlangan yondashuv*: URL, email, kod va inglizcha IT atamalarni (`GitHub`, `React`, `Tailwind`, `Chrome`, `Chart`, `Shell`, `Batchfile`) himoyalovchi aqlli lingvistik konvertatsiya funksiyasi ishlatiladi.
  - *Sabab*: Oddiy RegEx ishlatilsa, `https://solijonsolayev.github.io` yoki `Batchfile` kabi so'zlar buzilib ketishi mumkin; kontekstli filtr esa faqat o'zbekcha matnlarni toza o'giradi.
- **2-Qaror: Serverdagi Gemini AI uchun 2026-yilgi Alifbo System Prompti**
  - *Tanlangan yondashuv*: Siz yuborgan `AI_New_Uzbek_Alphabet_Guide` hujjatidagi barcha transliteratsiya qoidalari va misollar `/api/chat` server yo'riqnomasiga (`systemInstruction`) kiritiladi.
  - *Sabab*: Chatbot tanlangan alifbo rejimiga qarab javoblarni haqiqiy 2026-yilgi özbek alifbosi standartida yoki amaldagi lotin alifbosida yaratadi.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   Uzbek Alphabet Engine (2026 Standard)                    │
│  ┌──────────────────────────────────┐  ┌────────────────────────────────┐  │
│  │ New Latin (2026): Ö ö, Ğ ğ, Ş, Ç │◄─►│ Classic Latin: Oʻ, Gʻ, Sh, Ch │  │
│  └──────────────────────────────────┘  └────────────────────────────────┘  │
│         ▲  (Protects URLs, Emails, Code & Glottal Apostrophe ’)            │
└─────────┼──────────────────────────────────────────────────────┬───────────┘
          │                                                      │
          ▼                                                      ▼
┌─────────────────────────────────────────┐    ┌─────────────────────────────┐
│        Frontend Views & Modals          │    │   Server-Side Gemini API    │
├─────────────────────────────────────────┤    ├─────────────────────────────┤
│ ├─ Alphabet Switcher (ÖĞŞÇ / OʻGʻShCh)  │    │ ├─ /api/chat Route          │
│ ├─ Dynamic ProfileData Transformation   │    │ ├─ 2026 Alphabet System     │
│ ├─ Portfolio, Lightbox, Digital Card    │    │ │  Prompt & Few-Shot Guide  │
│ └─ Admin Panel & vCard (.vcf) Export    │    │ └─ Dual-Alphabet Responses  │
└─────────────────────────────────────────┘    └─────────────────────────────┘
```

- **Data Model & State**:
  - `AlphabetMode`: `'new_2026' | 'classic'` (standart qiymati `'new_2026'`, `localStorage` orqali saqlanadi).
  - `formatUzbekText(text, mode)` va `localizeProfileData(profile, mode)`: Barcha UI va profil ma'lumotlarini (jumladan Firestore'dan kelgan yangilanishlarni) tanlangan alifbo rejimiga moslab beradi.

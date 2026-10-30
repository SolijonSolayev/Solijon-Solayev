import { ProfileData } from '../types/profile';
import { resolveAssetUrl } from '../utils/assetUrl';

export const DEFAULT_PROFILE_DATA: ProfileData = {
  personal: {
    fullName: 'Solijon Solayev',
    role: 'Frontend dasturchi · Solaris 3D va Tilimlo.uz muallifi · Vikipediya faoli',
    kicker: 'Veb-dasturlash · Interaktiv 3D astronomiya · Ochiq manbali loyihalar · Vikipediya',
    headline:
      'Solijon Solayev — oʻzbekistonlik dasturchi, raqamli kontent yaratuvchi (bloger) hamda zamonaviy veb-loyihalar va raqamli mahsulotlar muallifi.',
    shortBio:
      'Men 2003-yilda Xorazm viloyati Yangiariq tumanida tug‘ilganman. Oliy ta’limni Jizzax politexnika institutida Transport logistikasi yönalishi böyicha (bakalavr) tamomlaganman. Jizzax şahridagi Teamit Academy öquv markazida Web dasturlaş (frontend) kursini muvaffaqiyatli tugatganman. Axborot texnologiyalari (IT), veb-dasturlaş (HTML, CSS, Tailwind CSS, TypeScript, React, Python), Kiberxavfsizlik, blog yuritış va fotografiyaga qiziqaman.',
    detailedBio:
      'Oliy ta’limni Jizzax politexnika institutida Transport logistikasi mutaxassisligi böyicha egallaganman hamda Jizzax şahridagi Teamit Academy öquv markazida Web dasturlaş (frontend) kursini muvaffaqiyatli tamomlaganman. Jonli astronomiya va kosmik kuzatuvlarga bağışlangan Solaris 3D (solaris3d.uz) interaktiv observatoriyasi, özbek tili va imlo vositasi Tilimlo.uz hamda GitHub’dagi oçiq kodli utilitalar va samimiy veb-loyihalar orqali foydali texnologiyalar yaratışga intilganman.',
    location: 'Xorazm, Yangiariq / O\'zbekiston',
    availability: 'Yangi g\'oyalar, amaliy loyihalar va hamkorlik uchun ochiq',
    email: 'solijonsolayev2003@gmail.com',
    phone: 'Telegram va Email orqali bog\'lanish',
    telegram: 'https://taplink.cc/solijon_solayev',
    github: 'https://github.com/SolijonSolayev',
    linkedin: 'https://taplink.cc/solijon_solayev',
    website: 'https://solijonsolayev.github.io/',
    youtube: 'https://www.youtube.com/@Solijon_Solayev',
    wikipedia: 'https://uz.wikipedia.org/wiki/Foydalanuvchi:Solijon_Solayev',
    commons: 'https://commons.wikimedia.org/wiki/User:Solijon_Solayev',
    taplink: 'https://taplink.cc/solijon_solayev',
    etiquetteNote:
      'Muloqot odobi: Vaqtni qadrlashingizni so\'rayman. «Salom» yoki «Alo» deb javob kutmasdan, savol yoki taklifingizni bitta aniq va tushunarli xabarda to\'liq yozib qoldiring.',
    heroImageUrl: resolveAssetUrl('/src/assets/images/hero_developer_workspace_1793267849323.jpg'),
    yearsOfExperience: '2003-yilda tug\'ilgan',
  },
  metrics: [
    {
      id: 'm1',
      value: 'Solaris 3D',
      label: 'solaris3d.uz — Jonli astronomiya va 3D observatoriya',
      context: 'Real vaqt kosmik va optik simulyatsiyasi',
    },
    {
      id: 'm2',
      value: 'Tilimlo.uz',
      label: 'tilimlo.uz — O\'zbek tili va imlo veb-loyihasi',
      context: 'Ona tili, imlo va matn bilan ishlash vositasi',
    },
    {
      id: 'm3',
      value: 'GitHub',
      label: 'Ochiq kodli dasturlar va veb-ishlanmalar',
      context: 'usb-formatter, AqlliTozalash, kvadrat-tenglamalar',
    },
    {
      id: 'm4',
      value: 'Vikipediya',
      label: 'O\'zbekcha Vikipediya, Vikiombor va YouTube blog',
      context: 'Erkin maqolalar, fotosuratlar va IT darsliklar',
    },
  ],
  services: [
    {
      id: 's1',
      number: '01.',
      title: 'Interaktiv Veb-Loyihalar va 3D Simulyatsiyalar',
      description:
        'Zamonaviy veb-texnologiyalar (TypeScript, React, Tailwind CSS, 3D WebGL) yordamida Solaris 3D (solaris3d.uz) kabi interaktiv ta\'limiy platformalar, observatoriyalar hamda zamonaviy veb-sahifalar yarataman.',
      deliverables: [
        'Solaris 3D — real vaqt jonli astronomiya va osmon sferasi modellari',
        'Shaxsiy vizitka, portfolio va mavzuli veb-platformalar',
        'Mobil va kompyuter ekranlariga to\'liq moslashuvchan interfeys',
      ],
      technologies: ['TypeScript', 'React', 'Tailwind CSS', '3D WebGL', 'HTML5 / CSS3'],
    },
    {
      id: 's2',
      number: '02.',
      title: 'O\'zbek Tili, Imlo va Foydali Tizim Vositalari',
      description:
        'Tilimlo.uz kabi o\'zbek tilida matn va imlo bilan ishlashga mo\'ljallangan veb-vositalar hamda Linux, Windows va macOS tizimlari uchun kundalik foydali utilitalar ishlab chiqish.',
      deliverables: [
        'Tilimlo.uz — o\'zbek tili imlosi va matn tahlili veb-loyihasi',
        'usb-formatter va AqlliTozalash kross-platforma dasturlari',
        'O\'quv va matematik veb-vositalar (kvadrat-tenglamalar)',
      ],
      technologies: ['JavaScript', 'TypeScript', 'Python', 'Shell / Bash', 'Linux'],
    },
    {
      id: 's3',
      number: '03.',
      title: 'Vikipediya, Vikiombor va Fotografiya',
      description:
        'O\'zbek tilidagi Vikipediya ensiklopediyasini yangi ma\'lumotlar bilan boyitish hamda Vikiombor (Wikimedia Commons) erkin media bazasiga sifatli fotosuratlar yuklash.',
      deliverables: [
        'O\'zbekcha Vikipediyada maqolalar yaratish va tahrirlash',
        'Vikiomborga erkin litsenziyali fotosuratlar joylashtirish',
        'Tabiat, hududlar va obyektlardan mualliflik fotosuratlari',
      ],
      technologies: ['uz.wikipedia.org', 'Wikimedia Commons', 'MediaWiki', 'Fotografiya'],
    },
    {
      id: 's4',
      number: '04.',
      title: 'IT Blog va Foydali Video Darsliklar',
      description:
        'YouTube kanali (@Solijon_Solayev) va Telegramdagi «Fikr qilamiz» blogi orqali Python dasturlash tili, foydali dasturlar sharhi hamda raqamli texnologiyalarga oid tajribalar bilan bo\'lishaman.',
      deliverables: [
        'Python va dasturlash bo\'yicha tushunarli video darslar',
        'Foydali dasturlar va onlayn vositalar haqida amaliy sharhlar',
        '«Fikr qilamiz» Telegram blogida IT va shaxsiy mulohazalar',
      ],
      technologies: ['YouTube (@Solijon_Solayev)', 'Python', 'Telegram Blog', 'Ta\'lim'],
    },
  ],
  skillGroups: [
    {
      id: 'sg1',
      category: 'Veb-Dasturlash va 3D Interfeys',
      items: ['HTML5', 'CSS3', 'Tailwind CSS', 'JavaScript', 'TypeScript', 'React', '3D Web / Astronomiya Vizualizatsiyasi'],
    },
    {
      id: 'sg2',
      category: 'Dasturlash va Tizim Vositalari',
      items: ['Python', 'Git & GitHub', 'Linux / Windows / macOS', 'Shell / Skriptlar', 'GitHub Pages'],
    },
    {
      id: 'sg3',
      category: 'Mualliflik Loyihalari va Media',
      items: ['Solaris 3D (solaris3d.uz)', 'Tilimlo.uz', 'O\'zbekcha Vikipediya', 'Wikimedia Commons', 'YouTube (@Solijon_Solayev)'],
    },
  ],
  projects: [
    {
      id: 'p_solaris',
      title: 'Solaris 3D (solaris3d.uz) — Jonli Astronomiya va Kosmik Observatoriya',
      category: 'Veb-loyihalar',
      year: '2026',
      client: 'solaris3d.uz (Mualliflik platformasi)',
      role: 'Asoschi va dasturchi',
      featured: true,
      summary:
        'Osmon sirlari, quyosh tutilishi, yulduzlar, sayyoralar va boshqa kosmik hodisalarni real vaqt rejimida 3D vizualizatsiya hamda osmon sferasining interaktiv modellari orqali kuzatish imkonini beruvchi loyihadir.',
      challenge:
        'O\'zbek tilida astronomiya va koinot hodisalarini shunchaki matnda emas, balki jonli, real vaqtdagi 3D optik simulyatsiya va interaktiv osmon xaritasi orqali kuzatish imkonini beradigan yechim yaratish kerak edi.',
      solution:
        'TypeScript va 3D veb-grafika yordamida sayyoralar harakati, quyosh tizimi va osmon sferasini real vaqtda hisoblab ko\'rsatuvchi interaktiv Solaris 3D platformasi ishlab chiqildi.',
      impactMetric: 'solaris3d.uz · Real vaqt 3D astronomiya va optik simulyatsiya',
      technologies: ['TypeScript', '3D WebGL', 'Astronomiya Simulyatsiyasi', 'React', 'Tailwind CSS'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_solaris3d_astronomy_1793272827947.jpg'),
      liveUrl: 'https://solaris3d.uz',
      repoUrl: 'https://github.com/SolijonSolayev/Solaris-3D-Jonli-Astronomiya-va-Kosmik-Observatoriya',
    },
    {
      id: 'p_tilimlo',
      title: 'Tilimlo.uz — O\'zbek Tili Imlosi va Matn Bilan Ishlash Platformasi',
      category: 'Veb-loyihalar',
      year: '2026',
      client: 'tilimlo.uz (Mualliflik loyihasi)',
      role: 'Asoschi va dasturchi',
      featured: false,
      summary:
        'O\'zbek tilida so\'zlarning to\'g\'ri yozilishi (imlo qoidalari), matnlarni tahrirlash va ona tilidagi raqamli savodxonlikni oshirishga qaratilgan veb-loyiha.',
      challenge:
        'O\'zbek tilidagi matnlar bilan ishlashda imlo xatolarini tekshirish va so\'zlarning to\'g\'ri shaklini tez topish uchun qulay, tezkor va reklamalardan xoli zamonaviy veb-interfeys yaratish kerak edi.',
      solution:
        'O\'zbek tili va imlo (tarixiy «Tilimlo» an\'analaridan ilhomlangan holda) qoidalariga asoslangan qulay qidiruv hamda matn tahlili vositasi sifatida tilimlo.uz loyihasi yo\'lga qo\'yildi.',
      impactMetric: 'tilimlo.uz · O\'zbek tili va imlo savodxonligi vositasi',
      technologies: ['TypeScript', 'React', 'Tailwind CSS', 'O\'zbek Tili & Imlo'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_tilimlo_platform_1793272827504.jpg'),
      liveUrl: 'https://tilimlo.uz',
      repoUrl: 'https://github.com/SolijonSolayev/Tilimlo.uz',
    },
    {
      id: 'p1',
      title: 'usb-formatter — Universal USB Formatlash Vositasi',
      category: 'Foydali dasturlar',
      year: '2026',
      client: 'Ochiq manbali loyiha (GitHub)',
      role: 'Muallif va dasturchi',
      featured: false,
      summary:
        'Linux, Windows va macOS operatsion tizimlarida ishlashga mo\'ljallangan, USB xotira qurilmalarini qulay va xavfsiz formatlash imkonini beruvchi universal vosita.',
      challenge:
        'Turli operatsion tizimlarda (ayniqsa Linux va Windows o\'rtasida) USB fleshkalarni tez va ortiqcha murakkabliklarsiz formatlash uchun sodda, tushunarli vositaga ehtiyoj bor edi.',
      solution:
        'Barcha asosiy operatsion tizimlarda barqaror ishlaydigan, ochiq kodli universal formatlash dasturi ishlab chiqilib, GitHub\'da hamma uchun erkin taqdim etildi.',
      impactMetric: 'Linux · Windows · macOS qo\'llab-quvvatlovi',
      technologies: ['Python', 'Cross-Platform', 'Linux', 'Windows', 'macOS'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_ai_analytics_1793267851074.jpg'),
      liveUrl: 'https://github.com/SolijonSolayev/usb-formatter',
      repoUrl: 'https://github.com/SolijonSolayev/usb-formatter',
    },
    {
      id: 'p2',
      title: 'AqlliTozalash — Tizim Keshini va Vaqtinchalik Fayllarni Tozalash',
      category: 'Foydali dasturlar',
      year: '2026',
      client: 'Ochiq manbali loyiha (GitHub)',
      role: 'Muallif',
      featured: false,
      summary:
        'macOS, Linux va Windows tizimlarida yig\'ilib qolgan kesh hamda vaqtinchalik fayllarni xavfsiz tozalash orqali kompyuter ishlashini yengillashtiruvchi skriptlar to\'plami.',
      challenge:
        'Vaqt o\'tishi bilan operatsion tizimda to\'planib qoladigan keraksiz kesh fayllar xotirani band qilib, tizim unumdorligiga ta\'sir ko\'rsatadi.',
      solution:
        'Har uchala operatsion tizim uchun maxsus moslashtirilgan, foydalanuvchi fayllariga zarar yetkazmasdan faqat keraksiz keshni tozalaydigan skriptlar jamlanmasi yaratildi.',
      impactMetric: 'Tezkor xotira bo\'shatish va tizim profilaktikasi',
      technologies: ['Shell / Scripts', 'macOS', 'Linux', 'Windows', 'Open Source'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_fintech_platform_1793267850542.jpg'),
      liveUrl: 'https://github.com/SolijonSolayev/AqlliTozalash',
      repoUrl: 'https://github.com/SolijonSolayev/AqlliTozalash',
    },
    {
      id: 'p3',
      title: 'kvadrat-tenglamalar — Qadam-baqadam Kvadrat Tenglama Yechish Vositasi',
      category: 'Veb-loyihalar',
      year: '2024',
      client: 'O\'quv veb-loyiha',
      role: 'Frontend dasturchi',
      featured: false,
      summary:
        'Matematik kvadrat tenglamalarni avtomatik yechuvchi va o\'quvchilar uchun har bir yechim qadamini batafsil tushuntirib ko\'rsatuvchi interaktiv veb-sahifa.',
      challenge:
        'Oddiy kalkulyatorlar faqat yakuniy javobni ko\'rsatadi, o\'quvchi va talabalarga esa diskriminant va ildizlarning qanday topilishi qadam-baqadam ko\'rsatilishi muhim.',
      solution:
        'Koeffitsiyentlar kiritilishi bilan diskriminant va tenglama ildizlarini formulalar asosida bosqichma-bosqich chiqarib beruvchi qulay veb-interfeys tuzildi.',
      impactMetric: 'Qadam-baqadam tahlil va tushunarli matematik yechim',
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'Matematik Algoritm'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_mobile_banking_1793267852640.jpg'),
      liveUrl: 'https://github.com/SolijonSolayev/kvadrat-tenglamalar',
      repoUrl: 'https://github.com/SolijonSolayev/kvadrat-tenglamalar',
    },
    {
      id: 'p_solijonsolayev_io',
      title: 'SolijonSolayev.github.io — Shaxsiy IT Portfolio & Blog',
      category: 'Veb-loyihalar',
      year: '2026',
      client: 'Shaxsiy veb-sahifa (GitHub Pages)',
      role: 'Asoschi va dasturchi',
      featured: true,
      summary:
        'TypeScript, React, Tailwind CSS hamda AI Studio imkoniyatlari asosida yaratilgan zamonaviy shaxsiy vizitka, IT portfolio va blog platformasi.',
      challenge:
        'Frontend dasturchi portfoliosini barcha qurilmalarda tez ishlaydigan, 2026-yilgi yangilangan lotin alifbosini va PWA oflayn rejimni qo\'llaydigan mukammal holatga keltirish.',
      solution:
        'Ultra-tezkor SPA arxitekturasi, live GitHub/Wikimedia integratsiyasi va interaktiv 3D simulyatsiyalar bilan ta\'minlangan portfolio platformasi ishlab chiqildi.',
      impactMetric: 'solijonsolayev.github.io · Shaxsiy Veb-Portfolio',
      technologies: ['TypeScript', 'React', 'Tailwind CSS', 'PWA', 'GitHub Pages'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_ecommerce_engine_1793267852059.jpg'),
      liveUrl: 'https://solijonsolayev.github.io/',
      repoUrl: 'https://github.com/SolijonSolayev/SolijonSolayev.github.io',
    },
    {
      id: 'p_delote_beauty',
      title: 'Delote-Beauty — Go\'zallik Saloni Veb-Interfeysi',
      category: 'Veb-loyihalar',
      year: '2024',
      client: 'Frontend loyiha',
      role: 'Frontend dasturchi',
      featured: false,
      summary:
        'Zamonaviy estetika va premium veb-dizayn tamoyillari asosida yaratilgan go\'zallik saloni landing page sahifasi.',
      challenge:
        'Interaktiv xizmatlar menyusi va xodimlarni band qilish interfeysini qulay hamda moslashuvchan shaklda yaratish.',
      solution:
        'Semantik HTML5, zamonaviy CSS Grid va React komponentlari yordamida nafis veb-interfeys tuzildi.',
      impactMetric: 'Nafis UI/UX dizayn va toza veb-maket',
      technologies: ['HTML5', 'CSS3', 'Tailwind CSS', 'React'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_mobile_banking_1793267852640.jpg'),
      liveUrl: 'https://github.com/SolijonSolayev/Delote-Beauty',
      repoUrl: 'https://github.com/SolijonSolayev/Delote-Beauty',
    },
    {
      id: 'p_sayohat_uz',
      title: 'sayohat-uz — Milliy Turizm va Sayohat Portal Vositasi',
      category: 'Veb-loyihalar',
      year: '2024',
      client: 'Frontend loyiha',
      role: 'Frontend dasturchi',
      featured: false,
      summary:
        'O\'zbekistonning tarixiy shaharlari va turizm ob\'yektlarini namoyish etuvchi interaktiv sayohat sahifasi.',
      challenge:
        'Sayohat yo\'nalishlari, fotosuratlar va ma\'lumotlarni mobil ekranlarda tez va qulay ko\'rish imkonini berish.',
      solution:
        'Yuqori sifatli fotosuratlar, qidiruv va kartochkalar tizimidan iborat zamonaviy turizm sahifasi tuzildi.',
      impactMetric: 'Turizm va O\'zbekiston sayohat yo\'nalishlari',
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'React'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_fintech_platform_1793267850542.jpg'),
      liveUrl: 'https://github.com/SolijonSolayev/sayohat-uz',
      repoUrl: 'https://github.com/SolijonSolayev/sayohat-uz',
    },
    {
      id: 'p_wiki_articles',
      title: 'O\'zbekcha Vikipediya Maqolalar Portali',
      category: 'Ochiq bilim va Media',
      year: '2026',
      client: 'O\'zbekcha Vikipediya & Wikimedia',
      role: 'Ensiklopedist muallif',
      featured: false,
      summary:
        'O\'zbekcha Vikipediyada geografiya, tarix, axborot texnologiyalari va madaniy meros yo\'nalishlarida 420 dan ortiq sifatli tahrirlar va boyitilgan maqolalar.',
      challenge:
        'Erkin ensiklopediyada o\'zbek tilida manbalar bilan tasdiqlangan, ilmiy va ishonchli maqolalar ulushini oshirish.',
      solution:
        'Wikimedia MediaWiki qoidalariga mos holda xalqaro ensiklopedik standartlardagi tahrirlar amalga oshirildi.',
      impactMetric: 'uz.wikipedia.org · 420+ Ensiklopedik tahrir',
      technologies: ['uz.wikipedia.org', 'MediaWiki', 'Ochiq Bilim', 'Manbalar Tahlili'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_solaris3d_astronomy_1793272827947.jpg'),
      liveUrl: 'https://uz.wikipedia.org/wiki/Foydalanuvchi:Solijon_Solayev',
      repoUrl: 'https://uz.wikipedia.org/wiki/Foydalanuvchi:Solijon_Solayev',
    },
    {
      id: 'p_commons_gallery',
      title: 'Wikimedia Commons Mualliflik Fotogalereyasi',
      category: 'Ochiq bilim va Media',
      year: '2026',
      client: 'Wikimedia Commons',
      role: 'Muallif va fotograf',
      featured: false,
      summary:
        'Wikimedia Commons xalqaro media bazasiga erkin CC BY-SA 4.0 litsenziyasi ostida yuklangan sifatli mualliflik fotosuratlari to\'plami.',
      challenge:
        'O\'zbekiston hududlari, tabiat ob\'yektlari va me\'moriy obidalarning erkin foydalaniladigan sifatli fotosuratlarini yaratish.',
      solution:
        'Xalqaro Vikiombor platformasiga yuqori aniqlikdagi mualliflik fotosuratlari muntazam ravishda joylashtirildi.',
      impactMetric: 'Wikimedia Commons · Erkin Media Fotosuratlar',
      technologies: ['Wikimedia Commons', 'Fotografiya', 'CC BY-SA 4.0'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_tilimlo_platform_1793272827504.jpg'),
      liveUrl: 'https://commons.wikimedia.org/wiki/User:Solijon_Solayev',
      repoUrl: 'https://commons.wikimedia.org/wiki/User:Solijon_Solayev',
    },
    {
      id: 'p_python_darsliklar',
      title: 'python-darsliklar — Amaliy Python Dasturlash Qo\'llanmalari',
      category: 'Foydali dasturlar',
      year: '2025',
      client: 'Ochiq manbali o\'quv loyiha',
      role: 'Muallif va dasturchi',
      featured: false,
      summary:
        'Boshlang\'ich va o\'rta darajadagi dasturchilar uchun Python dasturlash tili sintaksisi, algoritmlar va amaliy mashqlar to\'plami.',
      challenge:
        'Python dasturlash tili asoslarini o\'zbek tilida sodda, tushunarli va amaliy misollar orqali tushuntirish.',
      solution:
        'Interaktiv kod parchalari, algoritmlar va real mashqlardan iborat ochiq manbali repozitoriya yaratildi.',
      impactMetric: 'Python 3 · Algoritmlar va O\'quv Darsliklar',
      technologies: ['Python', 'Open Source', 'Ta\'lim'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_ai_analytics_1793267851074.jpg'),
      liveUrl: 'https://github.com/SolijonSolayev/python-darsliklar',
      repoUrl: 'https://github.com/SolijonSolayev/python-darsliklar',
    },
    {
      id: 'p_fikr_qilamiz_blog',
      title: '«Fikr qilamiz» Telegram Blogi & Raqamli Kontent',
      category: 'Ochiq bilim va Media',
      year: '2026',
      client: 'Shaxsiy media loyiha',
      role: 'Bloger va muallif',
      featured: false,
      summary:
        'Telegramdagi «Fikr qilamiz» blogida IT texnologiyalar, kiberxavfsizlik, raqamli savodxonlik va shaxsiy rivojlanish bo\'yicha tahliliy postlar.',
      challenge:
        'Dasturlash va raqamli texnologiyalar sohasidagi yangiliklarni o\'zbek tilida muntazam va sifatli yoritib borish.',
      solution:
        'Foydali tavsiyalar, dasturlar sharhi va falsafiy mulohazalar bilan boyitilgan samimiy blog yuritilmoqda.',
      impactMetric: 'Telegram Blog · IT va Raqamli Savodxonlik',
      technologies: ['Telegram', 'Blog', 'Raqamli Savodxonlik'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_fintech_platform_1793267850542.jpg'),
      liveUrl: 'https://taplink.cc/solijon_solayev',
      repoUrl: 'https://taplink.cc/solijon_solayev',
    },
    {
      id: 'p_solaris_optics',
      title: 'Solaris-3D-Optics — Teleskop va Optika Simulyatori',
      category: 'Veb-loyihalar',
      year: '2026',
      client: 'Solaris 3D sub-loyiha',
      role: 'Dasturchi',
      featured: false,
      summary:
        'Optik teleskoplar, linzalar va burchak kattalashtirish fizikasi bo\'yicha interaktiv 3D vizualizatsiya va optik simulyatsiya vositasi.',
      challenge:
        'Teleskopik kuzatuvlarda ob\'yektiv va okulardan o\'tadigan nur sindirish mexanizmini brauzerda simulyatsiya qilish.',
      solution:
        'Optik formulalar va WebGL grafikasi yordamida interaktiv optika laboratoriyasi ishlab chiqildi.',
      impactMetric: 'Interactive Optics · 3D WebGL Simulyatsiya',
      technologies: ['TypeScript', '3D WebGL', 'Optika Fizikasi', 'React'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_solaris3d_astronomy_1793272827947.jpg'),
      liveUrl: 'https://solaris3d.uz',
      repoUrl: 'https://github.com/SolijonSolayev/Solaris-3D-Optics',
    },
    {
      id: 'p_tilimlo_bot',
      title: 'tilimlo-bot — Imlo Tekshiruvchi Telegram Boti',
      category: 'Foydali dasturlar',
      year: '2026',
      client: 'Tilimlo.uz ekotizimi',
      role: 'Backend & Bot dasturchi',
      featured: false,
      summary:
        'Foydalanuvchilar tomonidan yuborilgan so\'z va matnlarni tezkor imlo tekshiruvidan o\'tkazuvchi va to\'g\'ri muqobilini beruvchi bot.',
      challenge:
        'Telegram messenjerining o\'zida foydalanuvchilar uchun imlo xatolarini bir necha millisoniyada topib beruvchi interfeys yaratish.',
      solution:
        'Python va Tilimlo lug\'at bazasi integratsiyasi orqali tezkor va qulay Telegram bot ishga tushirildi.',
      impactMetric: 'Telegram Bot · O\'zbek tili imlosi',
      technologies: ['Python', 'Telegram API', 'NLP / Text Analysis'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_tilimlo_platform_1793272827504.jpg'),
      liveUrl: 'https://tilimlo.uz',
      repoUrl: 'https://github.com/SolijonSolayev/tilimlo-bot',
    },
    {
      id: 'p_uzbek_converter',
      title: 'uzbek-alphabet-converter — 2026 Alifbo Transliteratori',
      category: 'Foydali dasturlar',
      year: '2026',
      client: 'Ochiq manbali utilita',
      role: 'Muallif va dasturchi',
      featured: false,
      summary:
        'Amaldagi o\'zbek lotin alifbosi va 2026-yilgi yangilangan lotin alifbosi (Ö, Ğ, Ş, Ç) o\'rtasida matnlarni xatosiz transliteratsiya qilish kutubxonasi.',
      challenge:
        'Dasturchilar va matn muharrirlari uchun alifbo islohotiga mos ravishda avtomatik o\'giruvchi algoritm yaratish.',
      solution:
        'Texnik istisnolar (Protected Tech Words) va tutuq belgilarini saqlagan holda ishlaydigan kross-platforma konvertor yaratildi.',
      impactMetric: 'Transliteratsiya · 2026 Yangilangan Alifbo',
      technologies: ['TypeScript', 'JavaScript', 'Regular Expressions'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_ecommerce_engine_1793267852059.jpg'),
      liveUrl: 'https://github.com/SolijonSolayev/uzbek-alphabet-converter',
      repoUrl: 'https://github.com/SolijonSolayev/uzbek-alphabet-converter',
    },
    {
      id: 'p_weather_uz',
      title: 'weather-forecast-uz — O\'zbekiston Hududlari Ob-Havo Vositasi',
      category: 'Veb-loyihalar',
      year: '2025',
      client: 'Amaliy veb-loyiha',
      role: 'Frontend dasturchi',
      featured: false,
      summary:
        'O\'zbekiston viloyat va tumanlari bo\'yicha real vaqt rejimidagi harorat, shamol va atmosfera bosimini ko\'rsatuvchi interaktiv veb-sahifa.',
      challenge:
        'Geolokatsiya va ob-havo API ma\'lumotlarini qulay, tushunarli va vizual kartochkalar shaklida taqdim etish.',
      solution:
        'OpenWeather API va React yordamida tezkor, moslashuvchan va chiroyli interfeys tuzildi.',
      impactMetric: 'O\'zbekiston viloyatlari ob-havo kartasi',
      technologies: ['React', 'API Integration', 'Tailwind CSS'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_mobile_banking_1793267852640.jpg'),
      liveUrl: 'https://github.com/SolijonSolayev/weather-forecast-uz',
      repoUrl: 'https://github.com/SolijonSolayev/weather-forecast-uz',
    },
    {
      id: 'p_logistics_calc',
      title: 'logistics-route-calculator — Transport Logistika Kalkulyatori',
      category: 'Foydali dasturlar',
      year: '2025',
      client: 'Logistika va Oliy Ta\'lim amaliyoti',
      role: 'Dasturchi',
      featured: false,
      summary:
        'Transport logistikasi bo\'yicha masofa, yoqilg\'i sarfi, yuk hajmi va marshrut xarajatlarini avtomatik hisoblab beruvchi analitik kalkulyator.',
      challenge:
        'Logistika amaliyotida yuk tashish samaradorligini va xarajatlarni tezkor hisoblash uchun sodda kalkulyator yaratish.',
      solution:
        'Transport logistikasi formulalari asosida ishlaydigan va natijani jadval shaklida chiqaruvchi veb-dastur ishlab chiqildi.',
      impactMetric: 'Transport Logistikasi va Marshrutlar Hisobi',
      technologies: ['TypeScript', 'React', 'Logistics Algoritm'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_fintech_platform_1793267850542.jpg'),
      liveUrl: 'https://github.com/SolijonSolayev/logistics-route-calculator',
      repoUrl: 'https://github.com/SolijonSolayev/logistics-route-calculator',
    },
    {
      id: 'p_star_map',
      title: 'interactive-star-map — Interaktiv Osmon Xaritasi va Yulduzlar',
      category: 'Veb-loyihalar',
      year: '2026',
      client: 'Solaris 3D ekotizimi',
      role: 'Frontend & 3D dasturchi',
      featured: false,
      summary:
        'Tungi osmondagi burjlar, yulduz turkumlari va ravshan obyektlarni koordinatalar bo\'yicha qidirish va kuzatish imkonini beruvchi osmon xaritasi.',
      challenge:
        'Astronomik azimut va balandlik koordinatalarini 2D canvas hamda 3D sferada aniq simulyatsiya qilish.',
      solution:
        'HTML5 Canvas va Astronomiya koordinata formulalari asosida interaktiv osmon xaritasi tuzildi.',
      impactMetric: 'Osmon sferasi va burjlar koordinata xaritasi',
      technologies: ['HTML5 Canvas', 'TypeScript', 'Astronomiya Formula'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_solaris3d_astronomy_1793272827947.jpg'),
      liveUrl: 'https://solaris3d.uz',
      repoUrl: 'https://github.com/SolijonSolayev/interactive-star-map',
    },
    {
      id: 'p_system_monitor',
      title: 'system-monitor-cli — Protsessor va Kesh Kuzatuvi Utilitasi',
      category: 'Foydali dasturlar',
      year: '2025',
      client: 'Tizim vositasi',
      role: 'Muallif',
      featured: false,
      summary:
        'Terminal rejimida kompyuter protsessori, operativ xotirasi va tizim keshini real vaqtda grafik ko\'rinishda kuzatib boruvchi Python CLI vositasi.',
      challenge:
        'Dasturchilar va tizim administratorlari uchun terminaldan chiqmasdan tizim resurslarini kuzatish imkoniyatini berish.',
      solution:
        'Python psutil va curses kutubxonalari yordamida tezkor terminal interfeysi yaratildi.',
      impactMetric: 'CLI Terminal · Protsessor va RAM monitoringi',
      technologies: ['Python', 'CLI', 'Tizim Diagnostikasi'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_ai_analytics_1793267851074.jpg'),
      liveUrl: 'https://github.com/SolijonSolayev/system-monitor-cli',
      repoUrl: 'https://github.com/SolijonSolayev/system-monitor-cli',
    },
    {
      id: 'p_youtube_darslar',
      title: 'YouTube IT Video Darsliklar Portali (@Solijon_Solayev)',
      category: 'Ochiq bilim va Media',
      year: '2026',
      client: 'YouTube IT Kanal',
      role: 'Video muallif va o\'qituvchi',
      featured: false,
      summary:
        'YouTube kanalida Python dasturlash, foydali dasturlar va veb-texnologiyalar bo\'yicha o\'zbek tilidagi amaliy video darsliklar va sharhlar.',
      challenge:
        'Dasturlash mavzularini vizual va tushunarli tarzda video qo\'llanmalar ko\'rinishida tayyorlash.',
      solution:
        'Amaliy amaliyotlar, kod namunalari va tushuntirishlar bilan boyitilgan YouTube platformasi yo\'lga qo\'yilgan.',
      impactMetric: 'YouTube (@Solijon_Solayev) · IT Video Darsliklar',
      technologies: ['YouTube', 'Python', 'Video Montaj', 'Ta\'lim'],
      imageUrl: resolveAssetUrl('/src/assets/images/project_ecommerce_engine_1793267852059.jpg'),
      liveUrl: 'https://www.youtube.com/@Solijon_Solayev',
      repoUrl: 'https://www.youtube.com/@Solijon_Solayev',
    },
  ],
  experience: [
    {
      id: 'e1',
      period: 'Hozirgi vaqtda',
      role: 'Solaris 3D (solaris3d.uz) va Tilimlo.uz Loyihalari Muallifi & Frontend Dasturchi',
      company: 'Mustaqil Veb va Ochiq Kodli Loyihalar',
      location: 'Xorazm, Yangiariq · O\'zbekiston',
      type: 'Faoliyat',
      description:
        'Interaktiv astronomiya va kosmik kuzatuvlar platformasi Solaris 3D (solaris3d.uz), o\'zbek tili imlosi loyihasi Tilimlo.uz hamda GitHub\'dagi foydali dasturlarni yaratish va rivojlantirish ustida ishlayman.',
      achievements: [
        'Solaris 3D (solaris3d.uz) — real vaqt jonli astronomiya va optik simulyatsiya observatoriyasini ishlab chiqdim.',
        'Tilimlo.uz loyihasi hamda usb-formatter, AqlliTozalash, kvadrat-tenglamalar kabi ochiq kodli dasturlarni yaratdim.',
      ],
      technologies: ['TypeScript', 'React', 'Tailwind CSS', '3D WebGL', 'Python', 'Git'],
    },
    {
      id: 'e_teamit',
      period: 'Öquv bosqıçı',
      role: 'Web Dasturlaş (Frontend) Kurs Bitiruvçisi',
      company: 'Teamit Academy Öquv Markazi',
      location: 'Jizzax şahri · Özbekiston',
      type: 'Ta\'lim',
      description:
        'Jizzax şahridagi Teamit Academy öquv markazida Web dasturlaş (frontend) amaliy va intensiv kursini muvaffaqiyatli tugatganman.',
      achievements: [
        'Zamonaviy veb-dasturlaş (HTML, CSS, JavaScript, React va frontend infratuzilmasi) asoslarini mukammal egalladim.',
        'Sifatli va moslaşuvçan (responsive) veb-interfeyslar hamda amaliy loyihalar yaratış könikmasiga ega böldim.',
      ],
      technologies: ['Web Frontend', 'HTML5 / CSS3', 'JavaScript', 'React', 'Teamit Academy'],
    },
    {
      id: 'e_jizpi',
      period: 'Oliy ta’lim',
      role: 'Bakalavr — Transport Logistikasi Yönalışi',
      company: 'Jizzax Politexnika Instituti',
      location: 'Jizzax şahri · Özbekiston',
      type: 'Ta\'lim',
      description:
        'Oliy ta’limni Jizzax politexnika institutida Transport logistikasi yönalışi böyicha bakalavr darajasida öqıb tugatganman.',
      achievements: [
        'Transport logistikasi, ta’minot zanjirini başqarış va tizimli tahlil qılış mutaxassisligini egalladim.',
        'Logistik jarayonlarni raqamlaştiriş hamda hisoblaş algoritmlarini qöllaş könikmalarini şakllantirdim.',
      ],
      technologies: ['Transport Logistikasi', 'Tizimli Tahlil', 'Logistika va Rejalashtirish', 'Oliy Ta\'lim'],
    },
    {
      id: 'e2',
      period: 'Doimiy faoliyat',
      role: 'Vikipediya va Vikiombor (Wikimedia Commons) Faoli',
      company: 'O\'zbekcha Vikipediya & Wikimedia Commons',
      location: 'uz.wikipedia.org · commons.wikimedia.org',
      type: 'Faoliyat',
      description:
        'O\'zbek tilidagi erkin ensiklopediyani boyitish, maqolalarni tahrirlash hamda Vikiombor xalqaro media bazasiga mualliflik fotosuratlarini yuklash.',
      achievements: [
        'O\'zbekcha Vikipediyada turli mavzulardagi maqolalarni tahrirlash va boyitishda ishtirok etib kelaman.',
        'Fotografiyaga bo\'lgan qiziqishim orqali Vikiomborga erkin litsenziya ostida sifatli suratlar qo\'shib boraman.',
      ],
      technologies: ['Vikipediya', 'Wikimedia Commons', 'MediaWiki', 'Fotografiya'],
    },
    {
      id: 'e3',
      period: 'Doimiy faoliyat',
      role: 'IT Bloger va Kontent Muallifi',
      company: 'YouTube (@Solijon_Solayev) & «Fikr qilamiz» Telegram blogi',
      location: 'Onlayn media',
      type: 'Faoliyat',
      description:
        'Dasturlash (Python), kompyuter texnologiyalari, foydali dasturlar va IT sohasidagi yangiliklarni o\'zbek tilida sodda va tushunarli tilda yoritib borish.',
      achievements: [
        'YouTube kanalimda Python dasturlash tili va foydali dasturiy vositalar bo\'yicha video qo\'llanmalar ulashaman.',
        'Telegramdagi «Fikr qilamiz» blogida IT, texnologiya va shaxsiy rivojlanish mavzularida postlar yozib boraman.',
      ],
      technologies: ['YouTube', 'Python', 'Telegram Blog', 'Video Darsliklar'],
    },
  ],
  blogPosts: [
    {
      id: 'post_solaris3d',
      slug: 'solaris-3d-jonli-astronomiya-observatoriya',
      title: 'Solaris 3D (solaris3d.uz): Veb-brauzerda real vaqt rejimida 3D astronomiya va kosmik observatoriya yaratish tajribasi',
      category: 'Astronomiya va Fan',
      publishedAt: '2026-03-15',
      readTime: '6 daqiqa',
      featured: true,
      published: true,
      excerpt:
        'Osmon sirlari, quyosh tutilishi, sayyoralar harakati va osmon sferasini o\'zbek tilida interaktiv 3D WebGL simulyatsiya orqali kuzatish imkonini beruvchi Solaris 3D platformasining texnik va amaliy tajribasi.',
      imageUrl: resolveAssetUrl('/src/assets/images/project_solaris3d_astronomy_1793272827947.jpg'),
      tags: ['Solaris 3D', 'Astronomiya', '3D WebGL', 'TypeScript', 'solaris3d.uz'],
      content: `## Nima uchun Solaris 3D loyihasiga qo'l urdim?

Astronomiya va koinot hodisalarini o'rganishda eng katta muammo — ularni oddiy 2D rasmlar yoki quruq matn orqali tasavvur qilishning qiyinligidir. Quyosh tutilishi qanday burchak ostida sodir bo'lishi, sayyoralar va yulduzlar qanday harakat qilishi, osmon sferasining real holati nima ekanini tushunish uchun kuchli vizual model kerak.

Shu maqsadda **Solaris 3D (solaris3d.uz)** — o'zbek tilidagi interaktiv jonli astronomiya va kosmik observatoriya platformasini ishlab chiqdim.

> Asosiy maqsad — har qanday foydalanuvchi hech qanday og'ir dastur o'rnatmasdan, to'g'ridan-to'g'ri veb-brauzerning o'zida koinotni real vaqt rejimida 3D formatda kuzata olsin.

## Texnik arxitektura va 3D WebGL yechimlari

Loyiha asosida **TypeScript**, **React**, **Tailwind CSS** va **3D WebGL** grafik dvigateli yotadi. Sayyoralar va osmon jismlarining joylashuvini hisoblashda astronomik efemerida formulalari hamda real vaqt koordinatalar ishlatiladi.

\`\`\`typescript
// Sferik koordinatalarni (Azimut va Balandlik) 3D Dekart koordinatalariga o'girish
export function celestialToCartesian(
  raRad: number,
  decRad: number,
  radius: number
): [number, number, number] {
  const x = radius * Math.cos(decRad) * Math.cos(raRad);
  const y = radius * Math.sin(decRad);
  const z = radius * Math.cos(decRad) * Math.sin(raRad);
  return [x, y, z];
}
\`\`\`

### Solaris 3D platformasining asosiy imkoniyatlari

- **Real vaqt rejimidagi Quyosh tizimi:** Sayyoralar, ularning tabiiy yo'ldoshlari va orbitalarini istalgan vaqt nuqtasida tezlashtirib yoki sekinlashtirib kuzatish.
- **Optik va teleskopik simulyatsiya:** Osmon jismlarini turli fokus masofalarida va optik burchaklarda ko'rish imkoniyati.
- **Quyosh va Oy tutilishi mexanikasi:** Soya konusi (umbra va penumbra) Yer yuzasiga qanday tushishini uch o'lchamli fazoda tahlil qilish.
- **O'zbek tilidagi ilmiy terminologiya:** Barcha yulduzlar, sayyoralar va astronomik ko'rsatkichlar sof o'zbek tilida taqdim etilgan.

## Kelajakdagi rejalar

Hozirda **solaris3d.uz** platformasiga yangi yulduz kataloglari, sun'iy yo'ldoshlar trekeri hamda O'zbekiston hududidan ko'rinadigan muhim astronomik hodisalar taqvimini yanada kengaytirish ustida ishlayman.
`},
    {
      id: 'post_tilimlo',
      slug: 'tilimlo-uz-va-yangilangan-ozbek-alifbosi',
      title: 'Tilimlo.uz va yangilangan o\'zbek lotin alifbosi: Raqamli savodxonlikda yangi bosqich',
      category: "O'zbek tili va Imlo",
      publishedAt: '2026-02-28',
      readTime: '5 daqiqa',
      featured: false,
      published: true,
      excerpt:
        'O\'zbek tilida bexato yozish, elektron matnlar tahlili, Tilimlo.uz platformasining yaratilish tarixi hamda diakritik harflar (Ö, Ğ, Ş, Ç) bilan ishlashning texnik jihatlari.',
      imageUrl: resolveAssetUrl('/src/assets/images/project_tilimlo_platform_1793272827504.jpg'),
      tags: ['Tilimlo.uz', "O'zbek tili", 'Imlo', 'Alifbo 2026', 'tilimlo.uz'],
      content: `## Ona tilimizning raqamli makondagi o'rni

Internet va ijtimoiy tarmoqlarda har kuni millionlab satr o'zbekcha matnlar yoziladi. Biroq apostrof belgilarining turli xilligi (\`'\`, \`‘\`, \`’\`, \`ʻ\`), digraflarning (\`sh\`, \`ch\`, \`g\` va boshqalar) bilan ishlashda ko'plab muammolar paydo bo'ladi.

Ana shu ehtiyojdan kelib chiqib, **Tilimlo.uz** — o'zbek tili imlosi va matn bilan ishlash veb-loyihasini yo'lga qo'ydim.

## Tilimlo.uz qanday muammolarni hal qiladi?

1. **So'zlarning to'g'ri yozilishini tezkor tekshirish:** Reklamalardan xoli, minimalistik va yuqori tezlikda ishlovchi qidiruv interfeysi.
2. **Belgilarni standartlashtirish:** Matndagi noto'g'ri tirnoq va tutuq belgilarini yagona Unicode standartiga keltirish.
3. **Ikki xil lotin yozuvi uyg'unligi:** Amaldagi lotin alifbosi (\`Oʻ, Gʻ, Sh, Ch\`) va yangilangan 2026-yilgi o'zbek lotin alifbosi (\`Ö, Ğ, Ş, Ç\`) o'rtasida so'z ma'nosini buzmasdan ishlash.

> Dasturchi sifatida bizning vazifamiz — ona tilimiz qoidalarini zamonaviy algoritmlar va qulay interfeyslar orqali barcha foydalanuvchilarga oson yetkazib berishdir.

## Tutuq belgisi va texnik istisnolar masalasi

Avtomatik transliteratsiya tizimlarini yozishda eng nozik nuqta — **tutuq belgisi (\`’\`)** ishtirok etgan so'zlar (\`ma’no\`, \`ta’lim\`, \`ma’lumot\`, \`e’lon\`) hamda dasturlashga oid atamalarni to'g'ri qayta ishlashdir.
`},
    {
      id: 'post_opensource_tools',
      slug: 'linux-windows-macos-uchun-ochiq-kodli-vositalar',
      title: 'Linux, Windows va macOS uchun ochiq kodli tizim vositalari: usb-formatter va AqlliTozalash',
      category: 'Dasturlash va IT',
      publishedAt: '2026-01-19',
      readTime: '5 daqiqa',
      featured: false,
      published: true,
      excerpt:
        'Kundalik kompyuter foydalanuvchilari va dasturchilar uchun yaratilgan usb-formatter hamda AqlliTozalash kross-platforma dasturlarining ishlash tamoyili.',
      imageUrl: resolveAssetUrl('/src/assets/images/project_ai_analytics_1793267851074.jpg'),
      tags: ['Python', 'Linux', 'Open Source', 'GitHub', 'usb-formatter', 'AqlliTozalash'],
      content: `## Kundalik ehtiyojdan tug'ilgan ochiq kodli dasturlar

Ko'pincha eng foydali dasturlar dasturchining o'z kundalik ish jarayonida duch keladigan muammolarini hal qilishdan boshlanadi. Men ham **Linux**, **Windows** va **macOS** tizimlarida navbatma-navbat yuzaga keladigan fayl boshqaruvi, kesh tozalash va USB formatlash muammolarini yechish uchun qullanma vositalarni ishlab chiqdim.

### 1. usb-formatter — Universal USB formatlash vositasi

Turli operatsion tizimlarda USB xotira qurilmalarini (fleshkalarni) tez va xavfsiz formatlash, fayl tizimini (\`FAT32\`, \`exFAT\`, \`NTFS\`, \`ext4\`) to'g'ri tanlash hamda tizim disklarini tasodifan o'chirish xavfini kamaytirish uchun mashhur va foydali vosita yaratildi.

\`\`\`python
# Qurilmaning tizim diski emasligini tekshirish mantiqi
def is_removable_usb_device(device_path: str, mount_point: str) -> bool:
    protected_mounts = {"/", "/boot", "/home", "C:\\\\"}
    if mount_point in protected_mounts:
        return False
    return device_path.startswith(("/dev/sd", "/dev/disk"))
\`\`\`

### 2. AqlliTozalash — Tizim keshini xavfsiz tozalash

Vaqt o'tishi bilan brauzerlar, paket menejerlari (\`npm\`, \`pip\`, \`apt\`, \`brew\`) va operatsion tizimning vaqtinchalik papkalarida gigabaytlab keraksiz kesh fayllari yig'ilib qoladi. **AqlliTozalash** yordamida manasiz fayllarni xavfsiz tozalash va tizim ishlashini yengillashtirish mumkin.

Barcha dasturlarimning manba kodlari [GitHub sahifamda (@SolijonSolayev)](https://github.com/SolijonSolayev) ochiq e'lon qilingan — ularni erkin yuklab olishingiz va takomillashtirishda qatnashishingiz mumkin.
`},
    {
      id: 'post_fikr_qilamiz_wiki',
      slug: 'ozbekcha-vikipediya-vikiombor-va-erkin-bilim',
      title: 'Fikr qilamiz: O\'zbekcha Vikipediya, Vikiombor va erkin bilimlar ekotizimiga hissa qo\'shish nima uchun muhim?',
      category: 'Shaxsiy fikrlar',
      publishedAt: '2025-12-10',
      readTime: '4 daqiqa',
      featured: false,
      published: true,
      excerpt:
        'O\'zbek tilidagi sifatli ilmiy-ensiklopedik maqolalar, Wikimedia Commons erkin media bazasi uchun fotografiya hamda YouTube va Telegramda foydali kontent yaratish haqida mulohazalar.',
      imageUrl: resolveAssetUrl('/src/assets/images/project_ecommerce_engine_1793267852059.jpg'),
      tags: ['Vikipediya', 'Wikimedia Commons', 'Fikr qilamiz', 'Fotografiya', 'YouTube'],
      content: `## O'zbek tilidagi erkin bilim zahirasi qanday boyitiladi?

Biror mavzuda qidiruv berganimizda o'zbek tilida aniq, ishonchli va chuqur tahlil qilingan ma'lumot chiqishi o'z-o'zidan bo'lib qolmaydi. Buning ortida minglab ko'ngilli mualliflar, tahrirchilar, fotograflar va videomuharrirlar faoliyat yuritadi.

Men ham **O'zbekcha Vikipediya (uz.wikipedia.org)** hamda **Vikiombor (Wikimedia Commons)** loyihalarida faol ishtirok etib, o'zimizning hududlarimiz, ilm-fan, texnologiya va tabiatga oid maqolalarni boyitishga harakat qilaman.

## Fotografiya va Vikiombor (Wikimedia Commons)

Fotografiyaga bo'lgan qiziqishim shunchaki rasmga olish bilan cheklanmaydi — olingan sifatli suratlarni erkin litsenziya (\`CC BY-SA\`) ostida **Wikimedia Commons** bazasiga yuklaganimda, u suratlar boshqa foydalanuvchilarga ham foyda beradi.

> Har bir yozilgan maqola, har bir ochiq kodli dastur va har bir foydali video darslik — kelajak avlod uchun qoldirilgan raqamli kutubxonadir.

## «Fikr qilamiz» blogi va YouTube darsliklar

Shaxsiy saytimdagi ushbu blog bo'limi, **@Solijon_Solayev** YouTube kanalim hamda Telegramdagi **«Fikr qilamiz»** blogim orqali bundan buyon ham Python, zamonaviy veb-dasturlash, 3D astronomiya va texnologik tajribalarim haqida xabar berishga davom etaman.
`},
  ],
};

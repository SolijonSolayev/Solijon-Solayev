import { ProfileData } from '../types/profile';
import { resolveAssetUrl } from '../utils/assetUrl';

export const DEFAULT_PROFILE_DATA: ProfileData = {
  personal: {
    fullName: 'Solijon Solayev',
    role: 'Frontend dasturchi · Solaris 3D va Tilimlo.uz muallifi · Vikipediya faoli',
    kicker: 'Veb-dasturlash · Interaktiv 3D astronomiya · Ochiq manbali loyihalar · Vikipediya',
    headline:
      'Solijon Solayev – oʻzbekistonlik yosh kontent kreyter (bloger), dasturchi va elektron mahsulotlar sotuvchisi.',
    shortBio:
      'Men 2003-yilda Xorazm viloyati Yangiariq tumanida tug\'ilganman. Axborot texnologiyalari (IT), veb-dasturlash (HTML, CSS, Tailwind CSS, TypeScript, React, Python), blog yuritish va fotograf[...]
    detailedBio:
      'Jonli astronomiya va kosmik kuzatuvlarga bag\'ishlangan Solaris 3D (solaris3d.uz) interaktiv observatoriyasi, o\'zbek tili va imlo vositasi Tilimlo.uz hamda GitHub\'dagi ochiq kodli utilita[...]
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

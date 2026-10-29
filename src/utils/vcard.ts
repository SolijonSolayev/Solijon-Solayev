import { ProfileData } from '../types/profile';

export function generateVCardString(profile: ProfileData): string {
  const { personal } = profile;
  const nameParts = personal.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN;CHARSET=UTF-8:${personal.fullName}`,
    `N;CHARSET=UTF-8:${lastName};${firstName};;;`,
    `TITLE;CHARSET=UTF-8:${personal.role}`,
    `ORG;CHARSET=UTF-8:${personal.fullName}`,
    `EMAIL;TYPE=PREF,INTERNET:${personal.email}`,
    `URL:${personal.website || 'https://solijonsolayev.github.io/'}`,
    `ADR;TYPE=WORK;CHARSET=UTF-8:;;${personal.location};;;;`,
    `NOTE;CHARSET=UTF-8:${personal.shortBio.replace(/\r?\n/g, ' ')} | Taplink: ${personal.taplink} | GitHub: ${personal.github} | YouTube: ${personal.youtube} | Vikipediya: ${personal.wikipedia}`,
    'END:VCARD',
  ];

  return lines.join('\r\n');
}

export function downloadVCard(profile: ProfileData): void {
  const vcfContent = generateVCardString(profile);
  const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const slug = profile.personal.fullName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  link.href = url;
  link.setAttribute('download', `${slug || 'vizitka'}_contact.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

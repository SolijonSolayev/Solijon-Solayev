const KNOWN_LOCAL_IMAGES = new Set([
  'hero_developer_workspace_1793267849323',
  'project_ai_analytics_1793267851074',
  'project_ecommerce_engine_1793267852059',
  'project_fintech_platform_1793267850542',
  'project_mobile_banking_1793267852640',
  'project_solaris3d_astronomy_1793272827947',
  'project_tilimlo_platform_1793272827504',
]);

/**
 * Resolves local image paths (such as `/src/assets/images/...` or `/images/...`)
 * to high-efficiency WebP static assets in `/images/*.webp` so they can be
 * preloaded directly from `index.html` and work across Vite dev and production builds.
 */
export function resolveAssetUrl(url?: string, fallbackUrl = ''): string {
  const raw = (url || '').trim() || fallbackUrl.trim();
  if (!raw) return '';

  if (
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('data:') ||
    raw.startsWith('blob:')
  ) {
    return raw;
  }

  if (
    raw.startsWith('/src/assets/images/') ||
    raw.startsWith('/images/') ||
    raw.startsWith('/assets/')
  ) {
    const filename = raw.split('/').pop();
    if (filename) {
      const base = filename
        .replace(/-[A-Za-z0-9_-]{6,12}\.(jpg|jpeg|png|webp)$/i, '')
        .replace(/\.(jpg|jpeg|png|webp)$/i, '');
      if (KNOWN_LOCAL_IMAGES.has(base)) {
        return `/images/${base}.webp`;
      }
      return `/images/${filename.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`;
    }
  }

  return raw;
}

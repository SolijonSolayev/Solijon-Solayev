const bundledImages = import.meta.glob<string>(
  '/src/assets/images/*.{jpg,jpeg,png,webp,svg}',
  {
    eager: true,
    import: 'default',
  }
);

const filenameToBundledUrl: Record<string, string> = {};
for (const [fullPath, resolvedUrl] of Object.entries(bundledImages)) {
  const filename = fullPath.split('/').pop();
  if (filename && typeof resolvedUrl === 'string') {
    filenameToBundledUrl[filename] = resolvedUrl;
  }
}

/**
 * Resolves local image paths (such as `/src/assets/images/...` or `/images/...`)
 * so that they work reliably in both Vite dev server and production builds (Vercel / static hosting),
 * even when loaded dynamically from Firestore documents.
 */
export function resolveAssetUrl(url?: string, fallbackUrl = ''): string {
  const raw = (url || '').trim() || fallbackUrl.trim();
  if (!raw) return '';

  // External URLs or data URIs pass through untouched
  if (
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('data:') ||
    raw.startsWith('blob:')
  ) {
    return raw;
  }

  // Check if it matches a known local image filename in src/assets/images
  if (raw.startsWith('/src/assets/images/') || raw.startsWith('/images/')) {
    const filename = raw.split('/').pop();
    if (filename && filenameToBundledUrl[filename]) {
      return filenameToBundledUrl[filename];
    }
    if (filename) {
      return `/images/${filename}`;
    }
  }

  return raw;
}

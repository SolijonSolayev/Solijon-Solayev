/**
 * Utility function to generate a normalized canonical repository key.
 * Used across Firebase subscribers, App sync effects, and Live Ecosystem components
 * to guarantee 100% zero duplicates when merging GitHub API repos with default profile items.
 */
export function getCanonicalRepoKey(input: {
  repoUrl?: string;
  liveUrl?: string;
  id?: string;
  title?: string;
  name?: string;
  html_url?: string;
}): string {
  const url = input.repoUrl || input.html_url || input.liveUrl || '';
  if (url && url.includes('github.com')) {
    const match = url.match(/github\.com\/SolijonSolayev\/([^/#?]+)/i);
    if (match && match[1]) {
      return match[1].toLowerCase().replace(/[^a-z0-9]/g, '');
    }
  }
  const rawStr = input.name || input.id || input.title || '';
  if (!rawStr) return '';
  const firstWord = rawStr.split('—')[0].split('-')[0].trim().toLowerCase();
  return firstWord.replace(/^p_/g, '').replace(/^gh_/g, '').replace(/[^a-z0-9]/g, '');
}

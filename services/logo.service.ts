/**
 * Logo utility service to resolve company logos using clearbit or letter-based SVGs.
 */
export function getCompanyLogoUrl(website: string | undefined, name: string): string {
  if (website) {
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      const hostname = url.hostname.replace('www.', '');
      return `https://logo.clearbit.com/${hostname}`;
    } catch {
      // ignore parsing errors
    }
  }

  // Safe fallback to SVG initials logo
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
    
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23111"/><text x="50%" y="55%" font-family="Geist,Inter,sans-serif" font-weight="bold" font-size="40" fill="%23fff" dominant-baseline="middle" text-anchor="middle">${initials}</text></svg>`;
}

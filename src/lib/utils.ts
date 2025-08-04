// src/lib/utils.ts


// Delay helper—pauses for the given number of milliseconds.
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely parse JSON or return a fallback.
 */
export function safeJsonParse<T = Record<string, unknown>>(
  value: string | object | null | undefined,
  fallback: T
): T {
  if (!value) return fallback;
  if (typeof value === 'object') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch (parseError) {
    console.error('JSON parsing failed:', parseError);
    return fallback;
  }
}

/**
 * Format a number as GBP currency.
 */
export function formatCurrency(amount: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with commas.
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-GB');
}

/**
 * Slugify a string for URLs.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Simple email validator.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncate text with ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}
// src/lib/utils.ts
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

// Utility function to format currency
export function formatCurrency(amount: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Utility function to format numbers with commas
export function formatNumber(num: number): string {
  return num.toLocaleString('en-GB');
}

// Utility function to sanitize strings for URLs
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

// Utility function to validate email addresses
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility function to truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}
import type { CurrencyInfo } from './types';

export function formatMoney(amountGBP: number, currency: CurrencyInfo, rate: number | null): string {
  if (currency.code !== 'GBP' && rate !== null && Number.isFinite(rate) && rate > 0) {
    return `${currency.symbol}${Math.round(amountGBP * rate).toLocaleString('en-GB')}`;
  }
  return `£${amountGBP.toLocaleString('en-GB')}`;
}

export function formatDate(value?: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', opts);
}

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISODate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function daysBetween(a: string, b: string) {
  return Math.round((fromISODate(b).getTime() - fromISODate(a).getTime()) / 86400000) + 1;
}

export const initials = (name?: string, email?: string) =>
  (name?.trim() || email?.trim() || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

import { useQuery } from '@tanstack/react-query';
import { fetchBootstrap } from '@/lib/services';
import { useAuth } from '@/stores/auth';
import { formatMoney } from '@/lib/format';
import type { Bootstrap } from '@/lib/types';

const FALLBACK: Bootstrap = {
  countryCode: 'GB', currency: { code: 'GBP', symbol: '£' }, rate: 1, paymentProvider: 'stripe', siteSettings: null, customer: null,
};

/** Country, currency, exchange rate and payment provider (decided on the server, same as the website). */
export function useBootstrap() {
  const status = useAuth((s) => s.status);
  const userId = useAuth((s) => s.user?.id ?? null);
  const query = useQuery({
    queryKey: ['bootstrap', status === 'authed' ? userId : 'guest'],
    queryFn: () => fetchBootstrap(status === 'authed'),
    enabled: status !== 'loading',
    staleTime: 1000 * 60 * 30,
  });
  const raw = query.data ?? FALLBACK;
  // Never show a profile that belongs to someone other than the person signed in.
  const data = raw.customer && userId && raw.customer._id !== userId ? { ...raw, customer: null } : raw;
  return {
    ...data,
    ready: !!query.data,
    refetch: query.refetch,
    money: (gbp: number) => formatMoney(gbp, data.currency, data.rate),
  };
}

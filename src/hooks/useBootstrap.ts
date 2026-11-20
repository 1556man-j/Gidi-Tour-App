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
  const query = useQuery({
    queryKey: ['bootstrap', status === 'authed'],
    queryFn: () => fetchBootstrap(status === 'authed'),
    enabled: status !== 'loading',
    staleTime: 1000 * 60 * 30,
  });
  const data = query.data ?? FALLBACK;
  return {
    ...data,
    ready: !!query.data,
    refetch: query.refetch,
    money: (gbp: number) => formatMoney(gbp, data.currency, data.rate),
  };
}

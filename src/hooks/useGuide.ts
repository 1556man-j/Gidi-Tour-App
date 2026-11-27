import { useQuery } from '@tanstack/react-query';
import { fetchGuideMe } from '@/lib/guide';
import { useAuth } from '@/stores/auth';
import { usePrefs } from '@/stores/prefs';

/** Is the signed-in person a guide, and has the team approved them yet? */
export function useGuide() {
  const authed = useAuth((s) => s.status === 'authed');
  const uid = useAuth((s) => s.user?.id ?? null);
  const view = usePrefs((s) => s.guideView);
  const q = useQuery({ queryKey: ['guide', uid], queryFn: fetchGuideMe, enabled: authed && !!uid, staleTime: 1000 * 30 });
  const status = q.data?.status ?? 'none';
  return {
    status,
    guide: q.data?.guide ?? null,
    isActive: authed && status === 'active',
    loading: authed && q.isLoading,
    guideMode: authed && status === 'active' && view === 'guide',
    refetch: q.refetch,
  };
}

import { router } from 'expo-router';
import { useCallback } from 'react';
import { useAuth } from '@/stores/auth';

/** Sends guests to the login screen and returns them to `redirectTo` afterwards. */
export function useRequireAuth() {
  const status = useAuth((s) => s.status);
  return useCallback(
    (redirectTo: string): boolean => {
      if (status === 'authed') return true;
      router.push({ pathname: '/login', params: { redirectTo } });
      return false;
    },
    [status]
  );
}

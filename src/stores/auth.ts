import { create } from 'zustand';
import { configureApi } from '@/lib/api';
import { secure } from '@/lib/storage';
import type { SessionUser } from '@/lib/services';

const TOKEN_KEY = 'gidi.token';
const USER_KEY = 'gidi.user';

interface AuthState {
  status: 'loading' | 'guest' | 'authed';
  token: string | null;
  user: SessionUser | null;
  hydrate: () => Promise<void>;
  signIn: (token: string, user: SessionUser) => Promise<void>;
  signOut: () => Promise<void>;
  patchUser: (patch: Partial<SessionUser>) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  status: 'loading',
  token: null,
  user: null,
  async hydrate() {
    const token = await secure.get(TOKEN_KEY);
    const raw = await secure.get(USER_KEY);
    if (token) {
      let user: SessionUser | null = null;
      try { user = raw ? JSON.parse(raw) : null; } catch {}
      set({ token, user, status: 'authed' });
    } else set({ status: 'guest' });
  },
  async signIn(token, user) {
    await secure.set(TOKEN_KEY, token);
    await secure.set(USER_KEY, JSON.stringify(user));
    set({ token, user, status: 'authed' });
  },
  async signOut() {
    await secure.remove(TOKEN_KEY);
    await secure.remove(USER_KEY);
    set({ token: null, user: null, status: 'guest' });
  },
  patchUser(patch) {
    const user = get().user;
    if (!user) return;
    const next = { ...user, ...patch };
    set({ user: next });
    secure.set(USER_KEY, JSON.stringify(next));
  },
}));

configureApi({
  getToken: () => useAuth.getState().token,
  onUnauthorized: () => { useAuth.getState().signOut(); },
});

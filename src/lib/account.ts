import { api } from '@/lib/api';
import { env } from '@/lib/env';

export async function deleteMyAccount(p: { password?: string; confirm: string }): Promise<void> {
  if (env.mock) return;
  await api('/api/account/delete', { body: p });
}

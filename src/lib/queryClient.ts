import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1, refetchOnWindowFocus: false } },
});

// Data that belongs to the signed-in person. It must never be shown to someone else.
const PRIVATE = new Set(['bootstrap', 'entries', 'entry', 'booking-status', 'order-detail', 'order-status', 'chats', 'chat', 'guide']);
const isPrivate = (q: { queryKey: readonly unknown[] }) => PRIVATE.has(String(q.queryKey[0]));

/** Throws away everything cached for the previous person, so the next screen loads fresh data. */
export function dropPrivateData() {
  queryClient.cancelQueries({ predicate: isPrivate });
  queryClient.removeQueries({ predicate: isPrivate });
}

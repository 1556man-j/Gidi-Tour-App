/** Chat between a traveller and their tour guide. Each function maps to one /api/mobile/chat/* endpoint. */
import { api } from './api';
import { env } from './env';

export interface ChatConversation {
  id: string;
  bookingId: string;
  role: 'traveller' | 'guide';
  closed: boolean;
  waitingForGuide: boolean;
  guide: { name: string | null; photoUrl: string | null } | null;
  traveller: { firstName: string | null };
  trip: { tours: string | null; destination: string | null; startDate: string | null; endDate: string | null };
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unread: number;
}

export interface ChatList {
  isGuide: boolean;
  guide: { name: string; photoUrl: string | null } | null;
  trips: ChatConversation[];
  inbox: ChatConversation[];
}

export interface ChatMessage { id: string; mine: boolean; body: string; createdAt: string; read: boolean }

/* ----------------------------------------------------------- mock (no backend) */
const mockConv: ChatConversation = {
  id: 'mock-chat', bookingId: 'bk_demo_1', role: 'traveller', closed: false, waitingForGuide: false,
  guide: { name: 'Tunde Adebayo', photoUrl: null }, traveller: { firstName: 'Ada' },
  trip: { tours: 'Pyramids Without the Crowds', destination: 'Egypt', startDate: '2026-11-14', endDate: '2026-11-16' },
  lastMessageAt: null, lastMessagePreview: null, unread: 0,
};
let mockMessages: ChatMessage[] = [
  { id: 'm1', mine: false, body: 'Hello Ada! I am Tunde, your guide for the Pyramids tour. Ask me anything about the trip.', createdAt: new Date().toISOString(), read: true },
];
const wait = <T,>(v: T, ms = 300) => new Promise<T>((r) => setTimeout(() => r(v), ms));

/* ----------------------------------------------------------------- real calls */
export async function fetchChats(): Promise<ChatList> {
  if (env.mock) return wait({ isGuide: false, guide: null, trips: [mockConv], inbox: [] });
  return api<ChatList>('/api/mobile/chat/conversations');
}

export async function openBookingChat(bookingId: string): Promise<ChatConversation> {
  if (env.mock) return wait(mockConv);
  return (await api<{ conversation: ChatConversation }>(`/api/mobile/chat/booking/${encodeURIComponent(bookingId)}`)).conversation;
}

export async function fetchChatMessages(id: string): Promise<{ conversation: ChatConversation; messages: ChatMessage[] }> {
  if (env.mock) return wait({ conversation: mockConv, messages: mockMessages });
  return api(`/api/mobile/chat/${encodeURIComponent(id)}/messages`);
}

/** Throws ApiError. A message the safety check refuses comes back as status 422 with the reason in `message`. */
export async function sendChatMessage(id: string, body: string): Promise<ChatMessage> {
  if (env.mock) {
    const m: ChatMessage = { id: Math.random().toString(36).slice(2), mine: true, body, createdAt: new Date().toISOString(), read: false };
    mockMessages = [...mockMessages, m];
    return wait(m, 150);
  }
  return (await api<{ message: ChatMessage }>(`/api/mobile/chat/${encodeURIComponent(id)}/messages`, { method: 'POST', body: { body } })).message;
}

export async function reportChatMessage(messageId: string): Promise<void> {
  if (env.mock) return wait(undefined, 200);
  await api(`/api/mobile/chat/messages/${encodeURIComponent(messageId)}/report`, { method: 'POST', body: {} });
}

export const SAFETY_NOTE = 'Pay only through Gidi Tour. Phone numbers, links and requests for money can’t be sent in chat.';

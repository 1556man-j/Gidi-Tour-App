/**
 * Everything the app asks the Gidi Tour backend to do lives here.
 * Each function maps to one endpoint of the existing SvelteKit site, or to one of the small
 * /api/mobile/* endpoints in `backend-patch/`. In mock mode they answer from memory instead.
 */
import { api, ApiError } from './api';
import { env } from './env';
import { mockSettings } from './mock';
import type {
  AccountEntry, Bootstrap, Customer, PaymentProvider, PaymentStatus, StoreOrder, TourBooking,
} from './types';

const wait = <T,>(v: T, ms = 500) => new Promise<T>((r) => setTimeout(() => r(v), ms));
const uid = () => Math.random().toString(36).slice(2, 10);

export interface SessionUser { id: string; email: string; name?: string }
export interface AuthResult { token: string; user: SessionUser }

/* ------------------------------------------------------------------ mock state */
const mockState: {
  customer: Customer;
  entries: AccountEntry[];
  statuses: Record<string, { at: number; status: PaymentStatus }>;
} = {
  customer: {
    _id: 'mock-user', name: 'Ada Okafor', email: 'ada@example.com', provider: 'credentials', nationality: 'Nigeria',
    phoneDialCode: '+234', phoneNumber: '8012345678', address: { city: 'Lagos', country: 'Nigeria' }, avatarUrl: null,
  },
  entries: [
    {
      kind: 'tour', _id: 'bk_demo_1', paymentStatus: 'paid', createdAt: '2026-09-12T10:00:00Z', name: 'Ada Okafor', email: 'ada@example.com',
      destination: 'Egypt', tripType: 'couple', startDate: '2026-11-14', endDate: '2026-11-16', travelers: 2, addOns: ['transfers', 'photo'],
      amountGBP: 370, amountCharged: 370, currency: 'GBP', paymentMethod: 'stripe',
      tours: [{ id: 'pyramids-without-the-crowds', title: 'Pyramids Without the Crowds', price: 185, travelers: 2 }],
    },
    {
      kind: 'store', _id: 'ord_demo_1', paymentStatus: 'paid', createdAt: '2026-08-02T10:00:00Z', name: 'Ada Okafor', email: 'ada@example.com',
      items: [{ id: 'issue-01', category: 'magazine', title: 'Gidi Tour Magazine · Issue 01', price: 0, quantity: 1 }], subtotal: 0, amountGBP: 0, paymentMethod: 'free',
    },
  ],
  statuses: {},
};

/* ------------------------------------------------------------------ app bootstrap */
export async function fetchBootstrap(signedIn: boolean): Promise<Bootstrap> {
  if (env.mock) {
    return wait({
      countryCode: 'GB', currency: { code: 'GBP', symbol: '£' }, rate: 1, paymentProvider: 'stripe' as PaymentProvider,
      siteSettings: mockSettings, customer: signedIn ? mockState.customer : null,
    }, 250);
  }
  return api<Bootstrap>('/api/mobile/bootstrap');
}

export async function fetchMe(): Promise<Customer> {
  if (env.mock) return wait(mockState.customer, 200);
  return (await api<{ customer: Customer }>('/api/mobile/me')).customer;
}

/* ------------------------------------------------------------------ auth */
export async function login(email: string, password: string): Promise<AuthResult> {
  if (env.mock) {
    if (!email || !password) throw new ApiError('Enter your email and password.', 400);
    return wait({ token: 'mock-token', user: { id: 'mock-user', email, name: mockState.customer.name } }, 700);
  }
  return api<AuthResult>('/api/mobile/login', { body: { email, password }, auth: false });
}

export async function loginWithGoogle(idToken: string): Promise<AuthResult> {
  if (env.mock) return wait({ token: 'mock-token', user: { id: 'mock-user', email: mockState.customer.email, name: mockState.customer.name } }, 600);
  return api<AuthResult>('/api/mobile/google', { body: { idToken }, auth: false });
}

export interface SignupPayload {
  name: string; email: string; password: string; nationality: string; phoneDialCode: string; phoneNumber: string;
}
export async function signup(p: SignupPayload): Promise<{ needsVerification: boolean; emailSent: boolean }> {
  if (env.mock) return wait({ needsVerification: true, emailSent: true }, 800);
  const res = await api<{ needsVerification: boolean; emailSent: boolean }>('/api/auth/signup', { body: p, auth: false });
  return res;
}

export async function resendVerification(email: string, password: string): Promise<void> {
  if (env.mock) return wait(undefined, 600);
  await api('/api/auth/verification', { body: { email, password, action: 'resend' }, auth: false });
}

export async function forgotPassword(email: string): Promise<void> {
  if (env.mock) return wait(undefined, 700);
  await api('/api/auth/forgot-password', { body: { email }, auth: false });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  if (env.mock) return wait(undefined, 700);
  await api('/api/auth/reset-password', { body: { token, password }, auth: false });
}

/* ------------------------------------------------------------------ account */
export interface ProfilePayload {
  name: string; nationality: string; dateOfBirth?: string; phoneDialCode: string; phoneNumber: string;
  address: NonNullable<Customer['address']>; emergencyContact: NonNullable<Customer['emergencyContact']>; travelNotes: string;
}
export async function updateProfile(p: ProfilePayload): Promise<void> {
  if (env.mock) {
    mockState.customer = { ...mockState.customer, ...p };
    return wait(undefined, 600);
  }
  await api('/api/account/update-profile', { body: p });
}

export async function uploadAvatar(file: { uri: string; name: string; type: string }): Promise<void> {
  if (env.mock) {
    mockState.customer = { ...mockState.customer, avatarUrl: file.uri };
    return wait(undefined, 600);
  }
  const form = new FormData();
  form.append('avatar', file as unknown as Blob);
  await api('/api/account/avatar', { form });
}

export async function removeAvatar(): Promise<void> {
  if (env.mock) {
    mockState.customer = { ...mockState.customer, avatarUrl: null };
    return wait(undefined, 300);
  }
  await api('/api/account/avatar', { method: 'DELETE' });
}

export async function fetchAccountEntries(): Promise<AccountEntry[]> {
  if (env.mock) return wait([...mockState.entries].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), 400);
  return (await api<{ bookings: AccountEntry[] }>('/api/mobile/bookings')).bookings;
}

export interface EntryDetail {
  booking: TourBooking | null;
  storeOrder: StoreOrder | null;
  downloadLinks: { title: string; url: string }[];
}
export async function fetchEntryDetail(id: string): Promise<EntryDetail> {
  if (env.mock) {
    const e = mockState.entries.find((x) => x._id === id);
    if (!e) throw new ApiError('Booking not found', 404);
    return wait({
      booking: e.kind === 'tour' ? e : null,
      storeOrder: e.kind === 'store' ? e : null,
      downloadLinks: e.kind === 'store' ? e.items.filter((i) => i.category === 'magazine').map((i) => ({ title: i.title, url: 'https://www.giditour.com/store' })) : [],
    }, 350);
  }
  return api<EntryDetail>(`/api/mobile/bookings/${encodeURIComponent(id)}`);
}

export async function sendContact(p: { name: string; email: string; phone?: string; interest?: string; message: string }): Promise<void> {
  if (env.mock) return wait(undefined, 800);
  await api('/api/contact', { body: p, auth: false });
}

/* ------------------------------------------------------------------ tour booking payments */
export interface BookingPayload {
  name: string; email: string; phone: string; travelingFrom: string; notes: string;
  destination: string; tripType: string; startDate: string; endDate: string; flexibleDates: 'yes' | 'no' | '';
  travelers: number; addOns: string[]; customAddOn: string;
  tours: { id: string; travelers: number; image?: string }[];
}
export type PaymentStart =
  | { provider: 'stripe'; clientSecret: string; id: string }
  | { provider: 'dlocal'; redirectUrl: string; id: string };

export async function startBookingPayment(provider: PaymentProvider, p: BookingPayload, totalGBP: number): Promise<PaymentStart> {
  if (env.mock) {
    const id = `bk_${uid()}`;
    mockState.entries.unshift({
      kind: 'tour', _id: id, paymentStatus: 'pending', createdAt: new Date().toISOString(), name: p.name, email: p.email, phone: p.phone,
      destination: p.destination, tripType: p.tripType, startDate: p.startDate, endDate: p.endDate, travelers: p.travelers, addOns: p.addOns,
      amountGBP: totalGBP, paymentMethod: provider, tours: p.tours.map((t) => ({ id: t.id, title: t.id, price: 0, travelers: t.travelers })),
    });
    mockState.statuses[id] = { at: Date.now() + 1200, status: 'paid' };
    return wait({ provider: 'stripe' as const, clientSecret: 'mock_secret', id }, 600);
  }
  if (provider === 'dlocal') {
    const r = await api<{ redirectUrl: string; bookingId: string }>('/api/book/dlocal/init', { body: p });
    return { provider: 'dlocal', redirectUrl: r.redirectUrl, id: r.bookingId };
  }
  const r = await api<{ clientSecret: string; bookingId: string }>('/api/book/stripe/init', { body: p });
  return { provider: 'stripe', clientSecret: r.clientSecret, id: r.bookingId };
}

export interface PaymentStatusResult {
  paymentStatus: PaymentStatus;
  confirmationEmailSent?: boolean;
  amountCharged?: number;
  currency?: string;
}
export async function fetchBookingStatus(id: string): Promise<PaymentStatusResult> {
  if (env.mock) {
    const s = mockState.statuses[id];
    const paid = !s || Date.now() >= s.at;
    if (paid) {
      const e = mockState.entries.find((x) => x._id === id);
      if (e) e.paymentStatus = 'paid';
    }
    return wait({ paymentStatus: paid ? 'paid' : 'pending', confirmationEmailSent: paid }, 300);
  }
  return api<PaymentStatusResult>(`/api/mobile/bookings/${encodeURIComponent(id)}/status`);
}

/* ------------------------------------------------------------------ store payments */
export interface StoreCheckoutPayload {
  name: string; email: string;
  items: { id: string; quantity: number; variant?: string }[];
  shipping?: { address: string; city: string; country: string; postcode: string };
}
export type StoreStart =
  | { provider: 'free'; id: string }
  | { provider: 'stripe'; clientSecret: string; id: string }
  | { provider: 'dlocal'; redirectUrl: string; id: string };

export async function startStoreCheckout(
  provider: PaymentProvider | 'free', p: StoreCheckoutPayload, meta: { subtotalGBP: number; titles: Record<string, { title: string; price: number; category: 'magazine' | 'merchandise' }> }
): Promise<StoreStart> {
  if (env.mock) {
    const id = `ord_${uid()}`;
    mockState.entries.unshift({
      kind: 'store', _id: id, paymentStatus: provider === 'free' ? 'paid' : 'pending', createdAt: new Date().toISOString(), name: p.name, email: p.email,
      items: p.items.map((i) => ({ id: i.id, category: meta.titles[i.id]?.category ?? 'merchandise', title: meta.titles[i.id]?.title ?? i.id, price: meta.titles[i.id]?.price ?? 0, quantity: i.quantity, variant: i.variant })),
      subtotal: meta.subtotalGBP, amountGBP: meta.subtotalGBP, shipping: p.shipping ?? null, paymentMethod: provider,
    });
    mockState.statuses[id] = { at: Date.now() + 1200, status: 'paid' };
    return wait(provider === 'free' ? { provider: 'free' as const, id } : { provider: 'stripe' as const, clientSecret: 'mock_secret', id }, 600);
  }
  if (provider === 'free') {
    const r = await api<{ orderId: string }>('/api/store/checkout/free', { body: p });
    return { provider: 'free', id: r.orderId };
  }
  if (provider === 'dlocal') {
    const r = await api<{ redirectUrl: string; orderId: string }>('/api/store/checkout/dlocal/init', { body: p });
    return { provider: 'dlocal', redirectUrl: r.redirectUrl, id: r.orderId };
  }
  const r = await api<{ clientSecret: string; orderId: string }>('/api/store/checkout/stripe/init', { body: p });
  return { provider: 'stripe', clientSecret: r.clientSecret, id: r.orderId };
}

export async function fetchOrderStatus(id: string): Promise<PaymentStatusResult & { items?: StoreOrder['items']; subtotal?: number; downloadLinks?: { title: string; url: string }[] }> {
  if (env.mock) {
    const s = mockState.statuses[id];
    const paid = !s || Date.now() >= s.at;
    const e = mockState.entries.find((x) => x._id === id);
    if (paid && e) e.paymentStatus = 'paid';
    return wait({ paymentStatus: paid ? 'paid' : 'pending', items: e?.kind === 'store' ? e.items : [], downloadLinks: [] }, 300);
  }
  return api(`/api/mobile/orders/${encodeURIComponent(id)}/status`);
}

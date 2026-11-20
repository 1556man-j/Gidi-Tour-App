import { create } from 'zustand';
import type { Img } from '@/lib/types';

export interface DraftTour {
  slug: string;
  title: string;
  country: string;
  price: number; // GBP pp
  image?: Img;
  travelers: number;
}

interface BookingDraft {
  tours: DraftTour[];
  destination: string;
  tripType: string;
  startDate: string;
  endDate: string;
  flexibleDates: 'yes' | 'no' | '';
  addOns: string[];
  customAddOn: string;
  phone: string;
  travelingFrom: string;
  notes: string;
  addTour: (t: Omit<DraftTour, 'travelers'>, travelers?: number) => void;
  removeTour: (slug: string) => void;
  setTravelers: (slug: string, n: number) => void;
  patch: (p: Partial<Omit<BookingDraft, 'addTour' | 'removeTour' | 'setTravelers' | 'patch' | 'reset'>>) => void;
  reset: () => void;
}

const empty = {
  tours: [] as DraftTour[], destination: '', tripType: '', startDate: '', endDate: '', flexibleDates: '' as const,
  addOns: [] as string[], customAddOn: '', phone: '', travelingFrom: '', notes: '',
};

export const useBookingDraft = create<BookingDraft>((set, get) => ({
  ...empty,
  addTour: (t, travelers = 1) => {
    if (get().tours.some((x) => x.slug === t.slug)) return;
    set((s) => ({ tours: [...s.tours, { ...t, travelers }], destination: s.destination || t.country }));
  },
  removeTour: (slug) => set((s) => ({ tours: s.tours.filter((t) => t.slug !== slug) })),
  setTravelers: (slug, n) => set((s) => ({ tours: s.tours.map((t) => (t.slug === slug ? { ...t, travelers: Math.max(1, Math.min(50, n)) } : t)) })),
  patch: (p) => set(p as object),
  reset: () => set({ ...empty }),
}));

export const draftTotalGBP = (tours: DraftTour[]) =>
  Math.round(tours.reduce((sum, t) => sum + t.price * t.travelers, 0) * 100) / 100;

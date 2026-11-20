import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Img } from '@/lib/types';

export interface CartItem {
  id: string; // product slug
  category: 'magazine' | 'merchandise';
  title: string;
  price: number;
  image?: Img;
  quantity: number;
  variant?: string;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  setQty: (id: string, variant: string | undefined, qty: number) => void;
  remove: (id: string, variant: string | undefined) => void;
  clear: () => void;
}

const same = (a: CartItem, id: string, variant?: string) => a.id === id && (a.variant ?? '') === (variant ?? '');

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => same(i, item.id, item.variant));
          // Magazines are single-copy digital items.
          const max = item.category === 'magazine' ? 1 : 20;
          if (existing) {
            return { items: s.items.map((i) => (i === existing ? { ...i, quantity: Math.min(max, i.quantity + qty) } : i)) };
          }
          return { items: [...s.items, { ...item, quantity: Math.min(max, qty) }] };
        }),
      setQty: (id, variant, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (same(i, id, variant) ? { ...i, quantity: Math.max(0, Math.min(i.category === 'magazine' ? 1 : 20, qty)) } : i))
            .filter((i) => i.quantity > 0),
        })),
      remove: (id, variant) => set((s) => ({ items: s.items.filter((i) => !same(i, id, variant)) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'gidi.cart', storage: createJSONStorage(() => AsyncStorage) }
  )
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => Math.round(items.reduce((n, i) => n + i.price * i.quantity, 0) * 100) / 100;

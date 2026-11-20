import { useCart } from '@/stores/cart';
import { toast } from '@/components/ui/Toast';
import { unitPrice } from '@/lib/store';
import type { StoreProduct } from '@/lib/types';

/** Adds a product to the bag with the right price (free magazines are £0). */
export function addProductToCart(p: StoreProduct, opts: { variant?: string; quantity?: number; silent?: boolean } = {}) {
  useCart.getState().add(
    { id: p.slug.current, category: p.category, title: p.title, price: unitPrice(p), image: p.image, variant: opts.variant },
    p.category === 'magazine' ? 1 : opts.quantity ?? 1
  );
  if (!opts.silent) toast.success(`${p.title} added to your bag`);
}

export const needsVariant = (p: StoreProduct) => p.category === 'merchandise' && !!p.variants?.length;
export const soldOut = (p: StoreProduct) =>
  p.category === 'merchandise' && (p.variants?.length ? p.variants.every((v) => (v.stock ?? 1) <= 0) : (p.stock ?? 1) <= 0);

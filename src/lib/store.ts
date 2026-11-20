import type { StoreProduct } from './types';

// Same rules as the website: only magazines can be free.
export const isFree = (p: Pick<StoreProduct, 'category' | 'isFree'>) => p.category === 'magazine' && p.isFree === true;
export const unitPrice = (p: Pick<StoreProduct, 'category' | 'isFree' | 'price'>) => (isFree(p) ? 0 : Number(p.price ?? 0));

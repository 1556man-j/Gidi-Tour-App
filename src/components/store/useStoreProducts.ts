import { useQuery } from '@tanstack/react-query';
import { getStoreProducts } from '@/lib/content';

export function useStoreProducts() {
  return useQuery({ queryKey: ['store-products'], queryFn: getStoreProducts });
}

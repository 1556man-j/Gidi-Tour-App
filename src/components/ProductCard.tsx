import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useBootstrap } from '@/hooks/useBootstrap';
import { isFree } from '@/lib/store';
import type { StoreProduct } from '@/lib/types';
import { colors, fonts, radius, shadow } from '@/theme';
import { AppImage } from './ui/AppImage';
import { PressableScale } from './ui/PressableScale';
import { Text } from './ui/Text';

export function ProductCard({ product, onAdd, width }: { product: StoreProduct; onAdd?: () => void; width?: number | `${number}%` }) {
  const { money } = useBootstrap();
  const free = isFree(product);
  return (
    <PressableScale onPress={() => router.push(`/store/${product.slug.current}`)} style={[{ width, backgroundColor: colors.white, borderRadius: radius.lg, padding: 10 }, shadow.card]}>
      <View>
        <AppImage img={product.image} width={500} style={{ width: '100%', aspectRatio: product.category === 'magazine' ? 0.78 : 1, borderRadius: radius.md }} />
        {free ? (
          <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: colors.green, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.6 }} color={colors.white}>FREE</Text>
          </View>
        ) : null}
      </View>
      <View style={{ paddingHorizontal: 4, paddingTop: 10, paddingBottom: 4, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text v="bodyStrong" numberOfLines={2} style={{ lineHeight: 19 }}>{product.title}</Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: 16, marginTop: 4 }} color={free ? colors.green : colors.ink}>{free ? 'Free' : money(product.price ?? 0)}</Text>
        </View>
        {onAdd ? (
          <PressableScale onPress={onAdd} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={18} color={colors.cream} />
          </PressableScale>
        ) : null}
      </View>
    </PressableScale>
  );
}

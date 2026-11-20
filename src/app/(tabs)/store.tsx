import { useEffect, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, ShoppingBag } from 'lucide-react-native';
import { CartButton } from '@/components/CartButton';
import { ProductCard } from '@/components/ProductCard';
import { AppImage } from '@/components/ui/AppImage';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Heading } from '@/components/ui/Heading';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { addProductToCart, needsVariant, soldOut } from '@/components/store/addToCart';
import { useStoreProducts } from '@/components/store/useStoreProducts';
import { useBootstrap } from '@/hooks/useBootstrap';
import { isFree } from '@/lib/store';
import { haptic } from '@/lib/haptics';
import { colors, fonts, radius, shadow, springs, TAB_PAD } from '@/theme';

const SEGMENTS = [
  { id: 'all', label: 'All' },
  { id: 'magazine', label: 'Magazines' },
  { id: 'merchandise', label: 'Merch' },
] as const;

function Segmented({ value, onChange }: { value: string; onChange: (v: (typeof SEGMENTS)[number]['id']) => void }) {
  const [w, setW] = useState(0);
  const x = useSharedValue(0);
  const idx = SEGMENTS.findIndex((s) => s.id === value);
  const itemW = w / SEGMENTS.length;
  useEffect(() => { if (itemW) x.value = withSpring(idx * itemW, springs.snappy); }, [idx, itemW, x]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View style={{ backgroundColor: colors.white, borderRadius: radius.pill, padding: 5, borderWidth: 1.5, borderColor: colors.line }} onLayout={(e) => setW(e.nativeEvent.layout.width - 10)}>
      <View style={{ flexDirection: 'row' }}>
        {itemW ? <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: itemW, borderRadius: radius.pill, backgroundColor: colors.ink }, pill]} /> : null}
        {SEGMENTS.map((s) => (
          <PressableScale key={s.id} hapticOnPress={false} scaleTo={0.96} onPress={() => { haptic.select(); onChange(s.id); }} style={{ flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 14 }} color={value === s.id ? colors.cream : colors.ink}>{s.label}</Text>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

export default function StoreTab() {
  const insets = useSafeAreaInsets();
  const { money } = useBootstrap();
  const q = useStoreProducts();
  const [seg, setSeg] = useState<(typeof SEGMENTS)[number]['id']>('all');
  const [refreshing, setRefreshing] = useState(false);
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => { y.value = e.contentOffset.y; });

  const products = q.data ?? [];
  const featured = useMemo(() => products.find((p) => p.category === 'magazine' && p.popular) ?? products.find((p) => p.category === 'magazine'), [products]);
  const list = useMemo(() => products.filter((p) => seg === 'all' || p.category === seg), [products, seg]);

  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(y.value, [0, 300], [0, 40], Extrapolation.CLAMP) },
      { scale: interpolate(y.value, [-120, 0, 300], [1.15, 1, 0.94], Extrapolation.CLAMP) },
    ],
  }));
  const coverStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(y.value, [0, 300], [-6, 2], Extrapolation.CLAMP)}deg` }, { translateY: interpolate(y.value, [0, 300], [0, -22], Extrapolation.CLAMP) }],
  }));

  const quickAdd = (p: (typeof products)[number]) => {
    if (needsVariant(p) || soldOut(p)) { router.push(`/store/${p.slug.current}`); return; }
    addProductToCart(p);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: TAB_PAD, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={colors.green} onRefresh={async () => { setRefreshing(true); await q.refetch(); setRefreshing(false); }} />}
      >
        <Reveal style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text v="caption" color={colors.green}>MAGAZINES & MERCH</Text>
            <Heading before="The Gidi" accent="store" size={34} />
          </View>
          <CartButton />
        </Reveal>

        {q.isLoading ? (
          <View style={{ gap: 16 }}>
            <Skeleton h={230} r={32} />
            <Skeleton h={50} r={999} />
            <View style={{ flexDirection: 'row', gap: 14 }}><Skeleton h={230} r={24} w="48%" /><Skeleton h={230} r={24} w="48%" /></View>
          </View>
        ) : (
          <>
            {featured ? (
              <Reveal index={1}>
                <Animated.View style={[{ height: 236, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.forest, marginBottom: 20 }, shadow.float, heroStyle]}>
                  <PressableScale scaleTo={0.985} onPress={() => router.push(`/store/${featured.slug.current}`)} style={{ flex: 1 }}>
                    <LinearGradient colors={[colors.forest, '#2E4A1B']} style={StyleSheet.absoluteFill} />
                    <View style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(249,131,21,0.25)' }} />
                    <View style={{ flex: 1, flexDirection: 'row', padding: 20, alignItems: 'center' }}>
                      <View style={{ flex: 1, paddingRight: 10, gap: 8 }}>
                        <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: isFree(featured) ? colors.green : colors.orange, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
                          <BookOpen size={12} color={colors.white} />
                          <Text style={{ fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.6 }} color={colors.white}>{isFree(featured) ? 'FREE ISSUE' : money(featured.price ?? 0)}</Text>
                        </View>
                        <Text v="h2" color={colors.cream} numberOfLines={3}>{featured.title}</Text>
                        <Text v="small" color="rgba(247,243,234,0.7)" numberOfLines={2}>{featured.description}</Text>
                        <View style={{ alignSelf: 'flex-start', marginTop: 4, backgroundColor: colors.cream, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 }}>
                          <Text style={{ fontFamily: fonts.semibold, fontSize: 13 }}>{isFree(featured) ? 'Read for free' : 'Get this issue'}</Text>
                        </View>
                      </View>
                      <Animated.View style={[{ width: 112, height: 150, borderRadius: 12, overflow: 'hidden' }, shadow.float, coverStyle]}>
                        <AppImage img={featured.image} width={400} style={{ width: '100%', height: '100%' }} />
                      </Animated.View>
                    </View>
                  </PressableScale>
                </Animated.View>
              </Reveal>
            ) : null}

            <Reveal index={2} style={{ marginBottom: 18 }}><Segmented value={seg} onChange={setSeg} /></Reveal>

            {list.length === 0 ? (
              <EmptyState icon={<ShoppingBag size={38} color={colors.green} />} title="Nothing here yet" body="New issues and merch land regularly. Check back soon." />
            ) : (
              <View key={seg} style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 }}>
                {list.map((p, i) => (
                  <Reveal key={p._id} index={i} style={{ width: '48%' }}>
                    <ProductCard product={p} width="100%" onAdd={() => quickAdd(p)} />
                  </Reveal>
                ))}
              </View>
            )}
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
}

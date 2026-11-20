import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Extrapolation, FadeInUp, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PackageX } from 'lucide-react-native';
import { CartButton } from '@/components/CartButton';
import { addProductToCart, needsVariant, soldOut } from '@/components/store/addToCart';
import { useStoreProducts } from '@/components/store/useStoreProducts';
import { AppImage } from '@/components/ui/AppImage';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { BackButton } from '@/components/ui/Header';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Stepper } from '@/components/ui/Stepper';
import { Text } from '@/components/ui/Text';
import { useBootstrap } from '@/hooks/useBootstrap';
import { formatDate } from '@/lib/format';
import { isFree, unitPrice } from '@/lib/store';
import { colors, fonts, radius, shadow } from '@/theme';

const HERO = 420;

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { money } = useBootstrap();
  const q = useStoreProducts();
  const product = q.data?.find((p) => p.slug.current === slug);
  const [variant, setVariant] = useState<string | undefined>();
  const [qty, setQty] = useState(1);
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => { y.value = e.contentOffset.y; });
  const img = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(y.value, [-HERO, 0, HERO], [-HERO / 2, 0, HERO * 0.4], Extrapolation.CLAMP) },
      { scale: interpolate(y.value, [-HERO, 0], [2, 1], Extrapolation.CLAMP) },
    ],
  }));

  const topBar = (
    <View style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 }}>
      <BackButton />
      <CartButton />
    </View>
  );

  if (q.isLoading) {
    return <View style={{ flex: 1, backgroundColor: colors.cream }}>{topBar}<Skeleton h={HERO} r={0} /><View style={{ padding: 20, gap: 12 }}><Skeleton h={28} w="70%" /><Skeleton h={16} /><Skeleton h={16} w="85%" /></View></View>;
  }
  if (!product) {
    return <View style={{ flex: 1, backgroundColor: colors.cream, justifyContent: 'center' }}>{topBar}<EmptyState icon={<PackageX size={38} color={colors.green} />} title="Product not found" body="This item may have been removed." action="Back to the store" onAction={() => router.replace('/store')} /></View>;
  }

  const free = isFree(product);
  const out = soldOut(product);
  const mag = product.category === 'magazine';
  const needs = needsVariant(product);
  const selectedStock = product.variants?.find((v) => v.label === variant)?.stock;

  const add = () => {
    if (needs && !variant) { import('@/components/ui/Toast').then((m) => m.toast.info('Pick an option first')); return; }
    addProductToCart(product, { variant, quantity: qty });
  };
  const getFree = () => {
    addProductToCart(product, { silent: true });
    router.push('/store/checkout');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      {topBar}
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        <View style={{ height: HERO, overflow: 'hidden', backgroundColor: colors.sand }}>
          <Animated.View style={[StyleSheet.absoluteFill, img]}>
            <AppImage img={product.image} width={1100} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <LinearGradient colors={['rgba(0,0,0,0.25)', 'transparent']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140 }} />
        </View>
        <View style={{ marginTop: -32, backgroundColor: colors.cream, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 22, gap: 14 }}>
          <Reveal>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              <View style={{ backgroundColor: colors.greenSoft, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 }}>
                <Text style={{ fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.6 }} color={colors.greenDeep}>{mag ? 'MAGAZINE' : 'MERCH'}</Text>
              </View>
              {free ? <View style={{ backgroundColor: colors.green, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 }}><Text style={{ fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.6 }} color={colors.white}>FREE</Text></View> : null}
            </View>
            <Text v="h1">{product.title}</Text>
            <Text style={{ fontFamily: fonts.bold, fontSize: 26, letterSpacing: -0.8, marginTop: 8 }} color={free ? colors.green : colors.ink}>{free ? 'Free' : money(unitPrice(product))}</Text>
          </Reveal>
          <Reveal index={1}><Text v="body" color={colors.muted} style={{ fontSize: 16, lineHeight: 25 }}>{product.description}</Text></Reveal>

          {mag ? (
            <Reveal index={2} style={{ flexDirection: 'row', gap: 12 }}>
              {product.issueNumber ? <Meta label="Issue" value={`No. ${product.issueNumber}`} /> : null}
              {product.publishDate ? <Meta label="Published" value={formatDate(product.publishDate, { month: 'short', year: 'numeric' })} /> : null}
              <Meta label="Format" value="Digital PDF" />
            </Reveal>
          ) : null}

          {needs ? (
            <Reveal index={2} style={{ gap: 10 }}>
              <Text v="h3">Choose an option</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {product.variants!.map((v) => {
                  const gone = (v.stock ?? 1) <= 0;
                  return (
                    <View key={v.label} style={{ opacity: gone ? 0.45 : 1 }} pointerEvents={gone ? 'none' : 'auto'}>
                      <Chip label={gone ? `${v.label} · Sold out` : v.label} active={variant === v.label} tone="green" onPress={() => setVariant(v.label)} />
                    </View>
                  );
                })}
              </View>
              {selectedStock !== undefined && selectedStock > 0 && selectedStock <= 5 ? <Text v="small" color={colors.orange}>Only {selectedStock} left</Text> : null}
            </Reveal>
          ) : null}

          {!mag && !out ? (
            <Reveal index={3} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: radius.lg, padding: 16 }}>
              <Text v="h3">Quantity</Text>
              <Stepper value={qty} onChange={setQty} max={20} />
            </Reveal>
          ) : null}
        </View>
      </Animated.ScrollView>

      <Animated.View entering={FadeInUp.delay(250).springify().damping(16)} style={[{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 12, backgroundColor: colors.white, borderRadius: 32, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }, shadow.float]}>
        <View style={{ paddingLeft: 10 }}>
          <Text v="caption" color={colors.muted}>{free ? 'PRICE' : 'TOTAL'}</Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: 22, letterSpacing: -0.6 }}>{free ? 'Free' : money(unitPrice(product) * (mag ? 1 : qty))}</Text>
        </View>
        <View style={{ flex: 1 }}>
          {out ? <Button title="Sold out" disabled onPress={() => {}} /> : free ? <Button title="Get free issue" variant="accent" onPress={getFree} /> : <Button title="Add to bag" onPress={add} />}
        </View>
      </Animated.View>
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: 12 }}>
      <Text v="caption" color={colors.faint}>{label.toUpperCase()}</Text>
      <Text v="bodyStrong" style={{ marginTop: 3 }}>{value}</Text>
    </View>
  );
}

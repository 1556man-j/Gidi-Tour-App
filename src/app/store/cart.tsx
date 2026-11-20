import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag, Trash2, X } from 'lucide-react-native';
import { AppImage } from '@/components/ui/AppImage';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Stepper } from '@/components/ui/Stepper';
import { Text } from '@/components/ui/Text';
import { useBootstrap } from '@/hooks/useBootstrap';
import { cartCount, cartSubtotal, useCart } from '@/stores/cart';
import { colors, fonts, radius, shadow } from '@/theme';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { money } = useBootstrap();
  const { items, setQty, remove } = useCart();
  const subtotal = cartSubtotal(items);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/store'));

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream, paddingTop: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 }}>
        <View>
          <Text v="h1">Your bag</Text>
          {items.length ? <Text v="small" color={colors.muted}>{cartCount(items)} item{cartCount(items) === 1 ? '' : 's'}</Text> : null}
        </View>
        <PressableScale onPress={close} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}><X size={20} color={colors.ink} /></PressableScale>
      </View>

      {items.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState icon={<ShoppingBag size={38} color={colors.green} />} title="Your bag is empty" body="Grab a magazine issue or some Gidi merch to get started." action="Browse the store" onAction={() => { close(); router.navigate('/store'); }} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 220, gap: 12 }} showsVerticalScrollIndicator={false}>
            {items.map((it, i) => (
              <Animated.View key={`${it.id}|${it.variant ?? ''}`} layout={LinearTransition.springify().damping(18)} exiting={FadeOutLeft.duration(240)}>
                <Reveal index={i} style={[{ flexDirection: 'row', gap: 14, backgroundColor: colors.white, borderRadius: radius.lg, padding: 10 }, shadow.card]}>
                  <AppImage img={it.image} width={300} style={{ width: 92, height: 104, borderRadius: radius.md }} />
                  <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text v="bodyStrong" numberOfLines={2}>{it.title}</Text>
                        <Text v="small" color={colors.muted}>{it.variant ?? (it.category === 'magazine' ? 'Digital issue' : 'Merchandise')}</Text>
                      </View>
                      <PressableScale onPress={() => remove(it.id, it.variant)} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}><Trash2 size={17} color={colors.danger} /></PressableScale>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      {it.category === 'magazine' ? <Text v="small" color={colors.muted}>Qty 1</Text> : <Stepper small value={it.quantity} min={1} max={20} onChange={(n) => setQty(it.id, it.variant, n)} />}
                      <Text style={{ fontFamily: fonts.bold, fontSize: 17 }} color={it.price === 0 ? colors.green : colors.ink}>{it.price === 0 ? 'Free' : money(it.price * it.quantity)}</Text>
                    </View>
                  </View>
                </Reveal>
              </Animated.View>
            ))}
          </ScrollView>
          <View style={[{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 12, backgroundColor: colors.white, borderRadius: 32, padding: 18, gap: 12 }, shadow.float]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text v="body" color={colors.muted}>Subtotal</Text>
              <Text style={{ fontFamily: fonts.bold, fontSize: 24, letterSpacing: -0.7 }}>{subtotal === 0 ? 'Free' : money(subtotal)}</Text>
            </View>
            <Button title={subtotal === 0 ? 'Get my free issue' : 'Checkout'} onPress={() => router.push('/store/checkout')} />
            <Button title="Continue shopping" variant="ghost" size="md" onPress={close} />
          </View>
        </>
      )}
    </View>
  );
}

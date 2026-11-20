import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { ShoppingBag } from 'lucide-react-native';
import { cartCount, useCart } from '@/stores/cart';
import { colors, fonts, shadow, springs } from '@/theme';
import { PressableScale } from './ui/PressableScale';

export function CartButton({ dark }: { dark?: boolean }) {
  const count = useCart((s) => cartCount(s.items));
  const b = useSharedValue(1);
  useEffect(() => { b.value = withSequence(withSpring(1.4, springs.snappy), withSpring(1, springs.bouncy)); }, [count, b]);
  const badge = useAnimatedStyle(() => ({ transform: [{ scale: b.value }] }));
  return (
    <PressableScale onPress={() => router.push('/store/cart')} style={[{ width: 46, height: 46, borderRadius: 23, backgroundColor: dark ? colors.ink : colors.white, alignItems: 'center', justifyContent: 'center' }, shadow.card]}>
      <ShoppingBag size={20} color={dark ? colors.cream : colors.ink} />
      {count > 0 ? (
        <Animated.View style={[{ position: 'absolute', top: -2, right: -2, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }, badge]}>
          <Animated.Text style={{ color: colors.white, fontFamily: fonts.bold, fontSize: 11 }}>{count}</Animated.Text>
        </Animated.View>
      ) : <View />}
    </PressableScale>
  );
}

import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Glass } from '@/components/ui/Glass';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';
import { usePrefs } from '@/stores/prefs';
import { colors, springs } from '@/theme';
import { haptic } from '@/lib/haptics';
import { PressableScale } from './ui/PressableScale';

export function SaveButton({ slug, size = 40, dark }: { slug: string; size?: number; dark?: boolean }) {
  const saved = usePrefs((s) => s.saved.includes(slug));
  const toggle = usePrefs((s) => s.toggleSaved);
  const s = useSharedValue(1);
  useEffect(() => { s.value = withSequence(withSpring(1.35, springs.snappy), withSpring(1, springs.bouncy)); }, [saved, s]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <PressableScale
      hapticOnPress={false}
      onPress={() => { const now = toggle(slug); now ? haptic.success() : haptic.light(); }}
      style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
    >
      <Glass intensity={50} tint={dark ? 'dark' : 'light'} style={[StyleSheet.absoluteFill, { backgroundColor: dark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.7)' }]} />
      <Animated.View style={[a, { zIndex: 2 }]}>
        <Heart size={size * 0.48} color={saved ? colors.orange : dark ? colors.white : colors.ink} fill={saved ? colors.orange : 'transparent'} />
      </Animated.View>
    </PressableScale>
  );
}

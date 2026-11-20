import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { Minus, Plus } from 'lucide-react-native';
import { useEffect } from 'react';
import { colors, fonts, springs } from '@/theme';
import { PressableScale } from './PressableScale';

interface Props { value: number; onChange: (n: number) => void; min?: number; max?: number; small?: boolean }

export function Stepper({ value, onChange, min = 1, max = 50, small }: Props) {
  const s = useSharedValue(1);
  useEffect(() => { s.value = withSequence(withSpring(1.25, springs.snappy), withSpring(1, springs.bouncy)); }, [value, s]);
  const numStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const size = small ? 34 : 42;
  const btn = (disabled: boolean) => ({ width: size, height: size, borderRadius: size / 2, backgroundColor: disabled ? colors.sand : colors.white, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center' as const, justifyContent: 'center' as const, opacity: disabled ? 0.5 : 1 });
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <PressableScale onPress={() => value > min && onChange(value - 1)} style={btn(value <= min)}><Minus size={16} color={colors.ink} /></PressableScale>
      <Animated.Text style={[{ minWidth: 26, textAlign: 'center', fontFamily: fonts.bold, fontSize: small ? 16 : 19, color: colors.ink }, numStyle]}>{value}</Animated.Text>
      <PressableScale onPress={() => value < max && onChange(value + 1)} style={btn(value >= max)}><Plus size={16} color={colors.ink} /></PressableScale>
    </View>
  );
}

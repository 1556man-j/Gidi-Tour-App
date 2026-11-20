import { useEffect, type ReactNode } from 'react';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, fonts, radius } from '@/theme';
import { haptic } from '@/lib/haptics';
import { PressableScale } from './PressableScale';

interface Props { label: string; active?: boolean; onPress?: () => void; icon?: ReactNode; tone?: 'green' | 'ink' }

export function Chip({ label, active, onPress, icon, tone = 'ink' }: Props) {
  const p = useSharedValue(active ? 1 : 0);
  useEffect(() => { p.value = withTiming(active ? 1 : 0, { duration: 220 }); }, [active, p]);
  const activeBg = tone === 'green' ? colors.green : colors.ink;
  const bg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], ['#FFFFFF', activeBg]),
    borderColor: interpolateColor(p.value, [0, 1], [colors.line, activeBg]),
  }));
  const txt = useAnimatedStyle(() => ({ color: interpolateColor(p.value, [0, 1], [colors.ink, colors.cream]) }));
  return (
    <PressableScale onPress={() => { haptic.select(); onPress?.(); }} hapticOnPress={false} scaleTo={0.94}>
      <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1.5 }, bg]}>
        {icon}
        <Animated.Text style={[{ fontFamily: fonts.semibold, fontSize: 14, letterSpacing: -0.1 }, txt]}>{label}</Animated.Text>
      </Animated.View>
    </PressableScale>
  );
}

import { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { colors, springs } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Circle that draws itself, then a tick, then pops. */
export function SuccessCheck({ size = 120, color = colors.green }: { size?: number; color?: string }) {
  const circle = useSharedValue(0);
  const tick = useSharedValue(0);
  const pop = useSharedValue(0.6);
  useEffect(() => {
    circle.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
    tick.value = withDelay(500, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }));
    pop.value = withDelay(850, withSpring(1, springs.bouncy));
  }, [circle, tick, pop]);
  const C = 2 * Math.PI * 46;
  const circleProps = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - circle.value) }));
  const tickProps = useAnimatedProps(() => ({ strokeDashoffset: 60 * (1 - tick.value) }));
  const wrap = useAnimatedStyle(() => ({ transform: [{ scale: pop.value > 0.99 ? 1 : 0.6 + 0.4 * (pop.value - 0.6) / 0.4 }] }));
  return (
    <Animated.View style={[{ width: size, height: size }, wrap]}>
      <View style={{ position: 'absolute', inset: 0, borderRadius: size / 2, backgroundColor: colors.greenSoft }} />
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <AnimatedCircle cx="50" cy="50" r="46" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={C} animatedProps={circleProps} rotation="-90" origin="50, 50" />
        <AnimatedPath d="M30 52 L44 66 L71 36" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} animatedProps={tickProps} />
      </Svg>
    </Animated.View>
  );
}

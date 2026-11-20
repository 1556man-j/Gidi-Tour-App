import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';

interface Props {
  children: ReactNode;
  index?: number;
  delay?: number;
  from?: 'bottom' | 'right' | 'top';
  style?: StyleProp<ViewStyle>;
}

const MAX_ANIMATED = 6;

/**
 * Staggered entrance for list items. Only the first few items animate (the rest are off screen anyway),
 * and it is a short fade rather than a spring, so long lists stay smooth on modest phones.
 */
export function Reveal({ children, index = 0, delay = 0, from = 'bottom', style }: Props) {
  if (index >= MAX_ANIMATED) return <Animated.View style={style}>{children}</Animated.View>;
  const base = from === 'right' ? FadeInRight : from === 'top' ? FadeInUp : FadeInDown;
  return (
    <Animated.View entering={base.delay(delay + index * 60).duration(380)} style={style}>
      {children}
    </Animated.View>
  );
}

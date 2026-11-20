import { type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { haptic } from '@/lib/haptics';
import { springs } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  scaleTo?: number;
  hapticOnPress?: boolean;
}

export function PressableScale({ style, children, scaleTo = 0.965, hapticOnPress = true, onPress, onPressIn, onPressOut, ...rest }: Props) {
  const s = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => { s.value = withSpring(scaleTo, springs.snappy); onPressIn?.(e); }}
      onPressOut={(e) => { s.value = withSpring(1, springs.bouncy); onPressOut?.(e); }}
      onPress={(e) => { if (hapticOnPress) haptic.light(); onPress?.(e); }}
      style={[style, anim]}
    >
      {children}
    </AnimatedPressable>
  );
}

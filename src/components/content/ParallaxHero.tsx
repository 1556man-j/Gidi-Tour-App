import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { AppImage } from '@/components/ui/AppImage';
import type { Img } from '@/lib/types';

/** Hero image that scales on overscroll and drifts slower than the page. */
export function ParallaxHero({ scrollY, img, height, children, shade = 0.85 }: { scrollY: SharedValue<number>; img?: Img | string; height: number; children?: ReactNode; shade?: number }) {
  const a = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-height, 0, height], [-height / 2, 0, height * 0.4], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [-height, 0], [2, 1], Extrapolation.CLAMP) },
    ],
  }));
  return (
    <View style={{ height, overflow: 'hidden' }}>
      <Animated.View style={[StyleSheet.absoluteFill, a]}>
        <AppImage img={img} width={1200} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <LinearGradient colors={['rgba(8,14,5,0.35)', 'rgba(8,14,5,0.1)', `rgba(8,14,5,${shade})`]} locations={[0, 0.35, 1]} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

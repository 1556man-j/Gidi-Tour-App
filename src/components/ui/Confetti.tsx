import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { colors } from '@/theme';

const { width: W, height: H } = Dimensions.get('window');
const PALETTE = [colors.green, colors.orange, '#F7C948', '#8BC34A', '#FFFFFF', '#FFB36B'];

function Piece({ i }: { i: number }) {
  const cfg = useMemo(() => ({
    x: Math.random() * W, drift: (Math.random() - 0.5) * 140, delay: Math.random() * 450, dur: 2200 + Math.random() * 1600,
    rot: (Math.random() - 0.5) * 900, w: 6 + Math.random() * 7, h: 10 + Math.random() * 10, color: PALETTE[i % PALETTE.length], round: Math.random() > 0.6,
  }), [i]);
  const p = useSharedValue(0);
  useEffect(() => { p.value = withDelay(cfg.delay, withTiming(1, { duration: cfg.dur, easing: Easing.in(Easing.quad) })); }, [p, cfg]);
  const style = useAnimatedStyle(() => ({
    opacity: p.value < 0.85 ? 1 : (1 - p.value) / 0.15,
    transform: [{ translateY: -40 + p.value * (H * 0.9) }, { translateX: p.value * cfg.drift }, { rotate: `${p.value * cfg.rot}deg` }, { rotateX: `${p.value * 540}deg` }],
  }));
  return <Animated.View style={[{ position: 'absolute', left: cfg.x, top: 0, width: cfg.w, height: cfg.h, backgroundColor: cfg.color, borderRadius: cfg.round ? 10 : 2 }, style]} />;
}

export function Confetti({ count = 46 }: { count?: number }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => <Piece key={i} i={i} />)}
    </View>
  );
}

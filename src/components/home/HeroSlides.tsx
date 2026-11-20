import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AppImage } from '@/components/ui/AppImage';
import type { Img } from '@/lib/types';
import { colors } from '@/theme';

function Slide({ img, active }: { img: Img; active: boolean }) {
  const o = useSharedValue(active ? 1 : 0);
  const z = useSharedValue(1);
  useEffect(() => {
    o.value = withTiming(active ? 1 : 0, { duration: 1100 });
    if (active) z.value = withTiming(1.16, { duration: 7500, easing: Easing.linear });
    else z.value = withTiming(1, { duration: 1100 });
  }, [active, o, z]);
  const st = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ scale: z.value }] }));
  return <Animated.View style={[StyleSheet.absoluteFill, st]}><AppImage img={img} width={1100} style={StyleSheet.absoluteFill} /></Animated.View>;
}

function Dot({ active }: { active: boolean }) {
  const w = useSharedValue(active ? 26 : 7);
  useEffect(() => { w.value = withTiming(active ? 26 : 7, { duration: 300 }); }, [active, w]);
  const st = useAnimatedStyle(() => ({ width: w.value, backgroundColor: active ? colors.orange : 'rgba(255,255,255,0.55)' }));
  return <Animated.View style={[{ height: 7, borderRadius: 4 }, st]} />;
}

/** Auto-advancing crossfade slideshow with a slow zoom. Calls onIndex so labels can follow. */
export function HeroSlides({ images, onIndex }: { images: Img[]; onIndex?: (i: number) => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % images.length), 5200);
    return () => clearInterval(t);
  }, [images.length]);
  useEffect(() => { onIndex?.(i); }, [i, onIndex]);
  return (
    <View style={StyleSheet.absoluteFill}>
      {images.map((img, k) => <Slide key={k} img={img} active={k === i} />)}
      <LinearGradient colors={['rgba(8,14,5,0.55)', 'rgba(8,14,5,0.05)', 'rgba(8,14,5,0.35)', 'rgba(8,14,5,0.92)']} locations={[0, 0.3, 0.6, 1]} style={StyleSheet.absoluteFill} />
    </View>
  );
}

export function SlideDots({ count, index }: { count: number; index: number }) {
  return <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>{Array.from({ length: count }).map((_, k) => <Dot key={k} active={k === index} />)}</View>;
}

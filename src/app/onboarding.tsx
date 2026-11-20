import { useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Extrapolation, FadeInDown, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { usePrefs } from '@/stores/prefs';
import { colors } from '@/theme';

const { width: W } = Dimensions.get('window');
const slides = [
  { img: require('../../assets/images/cairo.jpg'), before: 'Discover places the way', accent: 'locals do.', body: 'Skip the tourist loop. Our guides take you where their families eat, pray and play.' },
  { img: require('../../assets/images/local-life.jpg'), before: 'Eat, listen,', accent: 'wander.', body: 'Markets at sunrise, highlife at midnight. Every tour is built around real culture.' },
  { img: require('../../assets/images/cape-town.jpg'), before: 'Small groups,', accent: 'big stories.', body: 'Friendly groups, local hosts and time to breathe at every stop.' },
  { img: require('../../assets/images/hero.jpg'), before: 'Book in a', accent: 'few taps.', body: 'Pick a tour, choose your dates and pay securely, in your own currency.' },
];

function Slide({ i, x, s }: { i: number; x: { value: number }; s: (typeof slides)[number] }) {
  const img = useAnimatedStyle(() => ({ transform: [{ translateX: interpolate(x.value, [(i - 1) * W, i * W, (i + 1) * W], [-W * 0.35, 0, W * 0.35], Extrapolation.CLAMP) }, { scale: 1.25 }] }));
  const txt = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [(i - 0.6) * W, i * W, (i + 0.6) * W], [0, 1, 0], Extrapolation.CLAMP), transform: [{ translateX: interpolate(x.value, [(i - 1) * W, i * W, (i + 1) * W], [W * 0.25, 0, -W * 0.25], Extrapolation.CLAMP) }] }));
  return (
    <View style={{ width: W, flex: 1, overflow: 'hidden' }}>
      <Animated.View style={[StyleSheet.absoluteFill, img]}><Image source={s.img} style={StyleSheet.absoluteFill} contentFit="cover" /></Animated.View>
      <LinearGradient colors={['rgba(8,14,5,0.25)', 'transparent', 'rgba(8,14,5,0.92)']} locations={[0, 0.4, 0.85]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[{ position: 'absolute', left: 26, right: 26, bottom: 190 }, txt]}>
        <Heading before={s.before} accent={s.accent} size={42} color={colors.white} />
        <Text v="body" color="rgba(255,255,255,0.82)" style={{ marginTop: 14, fontSize: 17, lineHeight: 25 }}>{s.body}</Text>
      </Animated.View>
    </View>
  );
}

function Dot({ i, x }: { i: number; x: { value: number } }) {
  const a = useAnimatedStyle(() => ({ width: interpolate(x.value, [(i - 1) * W, i * W, (i + 1) * W], [8, 30, 8], Extrapolation.CLAMP), opacity: interpolate(x.value, [(i - 1) * W, i * W, (i + 1) * W], [0.4, 1, 0.4], Extrapolation.CLAMP), backgroundColor: i % 2 ? colors.orange : colors.green }));
  return <Animated.View style={[{ height: 8, borderRadius: 4 }, a]} />;
}

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const x = useSharedValue(0);
  const ref = useRef<Animated.ScrollView>(null);
  const [page, setPage] = useState(0);
  const handler = useAnimatedScrollHandler((e) => { x.value = e.contentOffset.x; });
  const finish = () => { usePrefs.getState().setOnboarded(); router.replace('/'); };
  const last = page === slides.length - 1;
  const next = () => (last ? finish() : ref.current?.scrollTo({ x: (page + 1) * W, animated: true }));
  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <Animated.ScrollView ref={ref} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={handler} scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / W))}>
        {slides.map((s, i) => <Slide key={i} i={i} x={x} s={s} />)}
      </Animated.ScrollView>
      <View style={{ position: 'absolute', top: insets.top + 12, left: 22, right: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Image source={require('../../assets/images/logo-mark.png')} style={{ width: 36, height: 39 }} contentFit="contain" />
        {!last ? <PressableScale onPress={finish} style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)' }}><Text v="bodyStrong" color={colors.white}>Skip</Text></PressableScale> : null}
      </View>
      <View style={{ position: 'absolute', left: 26, right: 26, bottom: insets.bottom + 28, gap: 22 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>{slides.map((_, i) => <Dot key={i} i={i} x={x} />)}</View>
        <Animated.View key={last ? 'go' : 'next'} entering={FadeInDown.springify()}>
          <Button title={last ? 'Get started' : 'Next'} variant={last ? 'accent' : 'light'} onPress={next} iconRight={<ArrowRight size={20} color={last ? colors.white : colors.ink} />} />
        </Animated.View>
      </View>
    </View>
  );
}

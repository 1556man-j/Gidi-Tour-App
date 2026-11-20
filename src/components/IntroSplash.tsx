import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { colors, fonts, springs } from '@/theme';

/** The first moment of the app: the mark springs in, a ring pulses, then the screen lifts away. */
export function IntroSplash({ onDone }: { onDone: () => void }) {
  const mark = useSharedValue(0);
  const ring = useSharedValue(0);
  const word = useSharedValue(0);
  const out = useSharedValue(0);

  useEffect(() => {
    mark.value = withSpring(1, { damping: 12, stiffness: 120 });
    ring.value = withDelay(250, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
    word.value = withDelay(500, withTiming(1, { duration: 600 }));
    out.value = withDelay(1700, withTiming(1, { duration: 520, easing: Easing.inOut(Easing.cubic) }, (done) => { if (done) runOnJS(onDone)(); }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const wrap = useAnimatedStyle(() => ({ opacity: 1 - out.value, transform: [{ translateY: -out.value * 60 }, { scale: 1 + out.value * 0.06 }] }));
  const markStyle = useAnimatedStyle(() => ({ opacity: mark.value, transform: [{ scale: 0.5 + mark.value * 0.5 }, { rotate: `${(1 - mark.value) * -12}deg` }] }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: 0.55 * (1 - ring.value), transform: [{ scale: 0.6 + ring.value * 1.6 }] }));
  const wordStyle = useAnimatedStyle(() => ({ opacity: word.value, transform: [{ translateY: (1 - word.value) * 14 }] }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', zIndex: 100 }, wrap]} pointerEvents="none">
      <Animated.View style={[{ position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 3, borderColor: colors.green }, ringStyle]} />
      <Animated.View style={markStyle}>
        <Image source={require('../../assets/images/logo-mark.png')} style={{ width: 112, height: 120 }} contentFit="contain" />
      </Animated.View>
      <Animated.View style={[{ marginTop: 28, alignItems: 'center' }, wordStyle]}>
        <Animated.Text style={{ fontFamily: fonts.bold, fontSize: 30, letterSpacing: -1, color: colors.ink }}>
          Gidi<Animated.Text style={{ color: colors.orange }}>Tour</Animated.Text>
        </Animated.Text>
        <Animated.Text style={{ fontFamily: fonts.serifItalic, fontSize: 18, color: colors.muted, marginTop: 4 }}>travel that feels like coming home</Animated.Text>
      </Animated.View>
      <View />
    </Animated.View>
  );
}

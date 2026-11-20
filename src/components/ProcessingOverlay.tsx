import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { colors } from '@/theme';
import { Text } from './ui/Text';

function Ring({ delay }: { delay: number }) {
  const p = useSharedValue(0);
  useEffect(() => { p.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.cubic) }), -1)); }, [p, delay]);
  const s = useAnimatedStyle(() => ({ opacity: 0.5 * (1 - p.value), transform: [{ scale: 0.5 + p.value * 1.5 }] }));
  return <Animated.View style={[{ position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 2.5, borderColor: colors.green }, s]} />;
}

/** Full-screen "working on it" state used while a payment is being confirmed. */
export function ProcessingOverlay({ visible, title = 'Confirming your payment', body = 'This only takes a moment. Please keep the app open.' }: { visible: boolean; title?: string; body?: string }) {
  if (!visible) return null;
  return (
    <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(250)} style={[StyleSheet.absoluteFill, { backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 32 }]}>
      <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }}>
        <Ring delay={0} /><Ring delay={730} /><Ring delay={1460} />
        <Image source={require('../../assets/images/logo-mark.png')} style={{ width: 62, height: 66 }} contentFit="contain" />
      </View>
      <Text v="h2" center style={{ marginTop: 12 }}>{title}</Text>
      <Text v="body" color={colors.muted} center style={{ marginTop: 8 }}>{body}</Text>
    </Animated.View>
  );
}

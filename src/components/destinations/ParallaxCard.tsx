import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { ArrowUpRight } from 'lucide-react-native';
import { AppImage } from '@/components/ui/AppImage';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import type { Destination } from '@/lib/types';
import { colors, fonts, radius, shadow } from '@/theme';

export const CARD_H = 290;
export const CARD_GAP = 16;

/** Full-width destination card; the photo slides slower than the list for a depth effect. */
export function ParallaxCard({ dest, index, offset, scrollY, viewport }: { dest: Destination; index: number; offset: number; scrollY: SharedValue<number>; viewport: number }) {
  const top = offset + index * (CARD_H + CARD_GAP);
  const img = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [top - viewport, top + CARD_H], [-45, 45], Extrapolation.CLAMP) }, { scale: 1.02 }],
  }));
  return (
    <PressableScale onPress={() => router.push(`/destinations/${dest.slug.current}`)} style={[{ height: CARD_H, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.sand }, shadow.card]}>
      <Animated.View style={[{ position: 'absolute', top: -50, left: 0, right: 0, height: CARD_H + 100 }, img]}>
        <AppImage img={dest.heroImage} width={1000} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <LinearGradient colors={['rgba(8,14,5,0.25)', 'transparent', 'rgba(8,14,5,0.88)']} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
      <View style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}>
        <ArrowUpRight size={20} color={colors.ink} />
      </View>
      <View style={{ position: 'absolute', left: 20, right: 20, bottom: 20 }}>
        {dest.region ? <Text v="caption" color="rgba(255,255,255,0.78)">{dest.region.toUpperCase()}</Text> : null}
        <Text style={{ fontFamily: fonts.bold, fontSize: 36, letterSpacing: -1.3 }} color={colors.white}>{dest.name}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          {dest.priceFrom ? <View style={{ backgroundColor: colors.orange, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999 }}><Text style={{ fontFamily: fonts.semibold, fontSize: 12 }} color={colors.white}>From {dest.priceFrom}</Text></View> : null}
          {dest.bestTime ? <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999 }}><Text style={{ fontFamily: fonts.semibold, fontSize: 12 }} color={colors.white}>Best {dest.bestTime}</Text></View> : null}
        </View>
      </View>
    </PressableScale>
  );
}

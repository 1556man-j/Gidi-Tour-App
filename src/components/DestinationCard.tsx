import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { Destination } from '@/lib/types';
import { colors, fonts, radius, shadow } from '@/theme';
import { AppImage } from './ui/AppImage';
import { PressableScale } from './ui/PressableScale';
import { Text } from './ui/Text';

export function DestinationCard({ dest, width = 210, height = 290, wide }: { dest: Destination; width?: number | `${number}%`; height?: number; wide?: boolean }) {
  return (
    <PressableScale onPress={() => router.push(`/destinations/${dest.slug.current}`)} style={[{ width, height, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.sand }, shadow.card]}>
      <AppImage img={dest.heroImage} width={800} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['transparent', 'rgba(8,14,5,0.85)']} locations={[0.35, 1]} style={StyleSheet.absoluteFill} />
      <View style={{ position: 'absolute', left: 18, right: 18, bottom: 18 }}>
        {dest.region ? <Text v="caption" color="rgba(255,255,255,0.75)">{dest.region.toUpperCase()}</Text> : null}
        <Text style={{ fontFamily: fonts.bold, fontSize: wide ? 34 : 28, letterSpacing: -1 }} color={colors.white}>{dest.name}</Text>
        {dest.priceFrom ? (
          <View style={{ marginTop: 8, alignSelf: 'flex-start', backgroundColor: colors.orange, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 12 }} color={colors.white}>From {dest.priceFrom}</Text>
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

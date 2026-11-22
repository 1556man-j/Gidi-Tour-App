import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Glass } from '@/components/ui/Glass';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, MapPin } from 'lucide-react-native';
import { useBootstrap } from '@/hooks/useBootstrap';
import type { Tour } from '@/lib/types';
import { colors, fonts, radius, shadow } from '@/theme';
import { AppImage } from './ui/AppImage';
import { PressableScale } from './ui/PressableScale';
import { Rating } from './ui/Rating';
import { Text } from './ui/Text';
import { SaveButton } from './SaveButton';

const open = (slug: string) => router.push(`/tours/${slug}`);

/** Tall feature card used in carousels. */
function TourCardBase({ tour, width = 276, height = 380 }: { tour: Tour; width?: number; height?: number }) {
  const { money } = useBootstrap();
  return (
    <PressableScale onPress={() => open(tour.slug.current)} style={[{ width, height, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.sand }, shadow.card]}>
      <AppImage img={tour.image} width={600} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(8,14,5,0.15)', 'transparent', 'rgba(8,14,5,0.88)']} locations={[0, 0.35, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.top}>
        {tour.category ? (
          <View style={styles.pill}>
            <Glass intensity={40} tint="dark" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.25)' }]} />
            <Text style={{ fontFamily: fonts.semibold, fontSize: 12, zIndex: 2 }} color={colors.white}>{tour.category}</Text>
          </View>
        ) : <View />}
        <SaveButton slug={tour.slug.current} dark />
      </View>
      <View style={styles.bottom}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <MapPin size={13} color="rgba(255,255,255,0.8)" />
          <Text v="small" color="rgba(255,255,255,0.85)">{tour.country}</Text>
        </View>
        <Text v="h2" color={colors.white} numberOfLines={2} style={{ marginBottom: 12 }}>{tour.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: 4 }}>
            {tour.duration ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Clock size={13} color="rgba(255,255,255,0.8)" />
                <Text v="small" color="rgba(255,255,255,0.85)">{tour.duration}</Text>
              </View>
            ) : null}
            <Rating value={tour.rating} count={tour.reviewCount} light />
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text v="caption" color="rgba(255,255,255,0.7)">FROM</Text>
            <Text style={{ fontFamily: fonts.bold, fontSize: 22, letterSpacing: -0.6 }} color={colors.white}>{money(tour.price)}</Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

/** Compact horizontal row used in lists and search. */
function TourRowBase({ tour }: { tour: Tour }) {
  const { money } = useBootstrap();
  return (
    <PressableScale onPress={() => open(tour.slug.current)} style={[{ flexDirection: 'row', backgroundColor: colors.white, borderRadius: radius.lg, padding: 10, gap: 14 }, shadow.card]}>
      <AppImage img={tour.image} width={400} style={{ width: 112, height: 124, borderRadius: radius.md }} />
      <View style={{ flex: 1, paddingVertical: 4, justifyContent: 'space-between' }}>
        <View>
          <Text v="caption" color={colors.green}>{tour.country.toUpperCase()}</Text>
          <Text v="h3" numberOfLines={2} style={{ marginTop: 3 }}>{tour.title}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View style={{ gap: 3 }}>
            {tour.duration ? <Text v="small" color={colors.muted}>{tour.duration}</Text> : null}
            <Rating value={tour.rating} count={tour.reviewCount} />
          </View>
          <Text style={{ fontFamily: fonts.bold, fontSize: 18, letterSpacing: -0.4 }}>{money(tour.price)}</Text>
        </View>
      </View>
      <View style={{ position: 'absolute', top: 10, right: 10 }}><SaveButton slug={tour.slug.current} size={34} /></View>
    </PressableScale>
  );
}

export const TourCard = memo(TourCardBase);
export const TourRow = memo(TourRowBase);

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 14, left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pill: { overflow: 'hidden', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  bottom: { position: 'absolute', left: 18, right: 18, bottom: 18 },
});

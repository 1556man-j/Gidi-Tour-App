import { View, useWindowDimensions } from 'react-native';
import { AppImage } from '@/components/ui/AppImage';
import { Reveal } from '@/components/ui/Reveal';
import { Text } from '@/components/ui/Text';
import type { Img } from '@/lib/types';
import { colors, fonts, radius, shadow } from '@/theme';

// Photos from your own assets folder. Swap these file names for any images in assets/images.
const PHOTOS: Img[] = [
  { local: require('../../../assets/images/avatar-7.webp') },
  { local: require('../../../assets/images/avatar-1.webp') },
  { local: require('../../../assets/images/avatar-2.webp') },
  { local: require('../../../assets/images/avatar-3.webp') },
  { local: require('../../../assets/images/avatar-4.webp') },
  { local: require('../../../assets/images/avatar-5.webp') },
  { local: require('../../../assets/images/avatar-6.webp') },
];

const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function Tile({ value, suffix, label, size: base }: { value: number; suffix: string; label: string; size: number }) {
  // Long numbers (12,000) get a smaller size so three tiles always fit side by side, even on small phones.
  const size = fmt(value).length > 4 ? Math.round(base * 0.74) : base;
  return (
    <View style={[{ flex: 1, minWidth: 0, backgroundColor: colors.white, borderRadius: radius.lg, paddingVertical: 16, paddingHorizontal: 12, gap: 6 }, shadow.card]}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: size, letterSpacing: -1 }} color={colors.ink} numberOfLines={1}>{fmt(value)}</Text>
        <Text style={{ fontFamily: fonts.bold, fontSize: size * 0.55 }} color={colors.orange}>{suffix}</Text>
      </View>
      <Text v="small" color={colors.muted} numberOfLines={3} style={{ fontSize: 12, lineHeight: 16 }}>{label}</Text>
    </View>
  );
}

/** Light, editorial stats: one big headline number on a white card with traveller photos, then three small tiles. */
export function StatBand() {
  const { width } = useWindowDimensions();
  const k = Math.min(1.1, Math.max(0.8, width / 390));
  const photo = width < 380 ? 34 : 40;
  return (
    <Reveal style={{ marginHorizontal: 20, gap: 10 }}>
      <View style={[{ backgroundColor: colors.white, borderRadius: radius.xl, padding: 22, overflow: 'hidden' }, shadow.card]}>
        {/* soft decorative glow, top right */}
        <View pointerEvents="none" style={{ position: 'absolute', top: -60, right: -50, width: 190, height: 190, borderRadius: 95, backgroundColor: colors.orangeSoft, opacity: 0.8 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.orange }} />
          <Text v="caption" color={colors.muted} style={{ letterSpacing: 1.2 }}>TRUSTED BY TRAVELLERS</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 10 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: Math.round(56 * k), lineHeight: Math.round(60 * k), letterSpacing: -2.5 }} color={colors.ink}>{fmt(3500)}</Text>
          <Text style={{ fontFamily: fonts.serifItalic, fontSize: Math.round(44 * k) }} color={colors.orange}>+</Text>
        </View>
        <Text v="body" color={colors.muted} style={{ marginTop: 2, fontSize: 15 }}>travellers explored with Gidi</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18 }}>
          {PHOTOS.map((img, i) => (
            <AppImage
              key={i}
              img={img}
              width={160}
              transition={0}
              style={{ width: photo, height: photo, borderRadius: photo / 2, borderWidth: 2.5, borderColor: colors.white, marginLeft: i ? -photo * 0.45 : 0 }}
            />
          ))}
          <View style={{ marginLeft: -photo * 0.28, width: photo, height: photo, borderRadius: photo / 2, borderWidth: 2.5, borderColor: colors.white, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 11 }} color={colors.white}>+</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Tile value={9} suffix="+" label="destinations across Africa & beyond" size={Math.round(28 * k)} />
        <Tile value={24} suffix="hrs" label="typical enquiry response" size={Math.round(28 * k)} />
        <Tile value={12000} suffix="+" label="travellers reached" size={Math.round(28 * k)} />
      </View>
    </Reveal>
  );
}

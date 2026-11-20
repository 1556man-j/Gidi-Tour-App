import { Linking, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { ArrowRight, Compass, MessageCircle, ShieldCheck, Users, BookOpen } from 'lucide-react-native';
import { AppImage } from '@/components/ui/AppImage';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Text } from '@/components/ui/Text';
import { TourCard } from '@/components/TourCard';
import { useCountUp } from '@/hooks/useCountUp';
import type { Img, Tour } from '@/lib/types';
import { colors, fonts, radius, shadow } from '@/theme';

export const CARD_W = 276;
export const CARD_GAP = 16;

export function ScalingTourCard({ tour, index, scrollX }: { tour: Tour; index: number; scrollX: SharedValue<number> }) {
  const W = CARD_W + CARD_GAP;
  const st = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, [(index - 1) * W, index * W, (index + 1) * W], [0.55, 1, 0.55], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(scrollX.value, [(index - 1) * W, index * W, (index + 1) * W], [0.9, 1, 0.9], Extrapolation.CLAMP) }],
  }));
  return <Animated.View style={st}><TourCard tour={tour} width={CARD_W} /></Animated.View>;
}

function Stat({ value, suffix, label, delay, decimals = 0 }: { value: number; suffix: string; label: string; delay: number; decimals?: number }) {
  const v = useCountUp(value, 1500, delay);
  return (
    <View style={{ width: '50%', paddingVertical: 14, paddingHorizontal: 6 }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 38, letterSpacing: -1.5 }} color={colors.cream}>
        {decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-GB')}<Text style={{ fontFamily: fonts.serifItalic, fontSize: 34 }} color={colors.orange}>{suffix}</Text>
      </Text>
      <Text v="small" color="rgba(247,243,234,0.7)" style={{ marginTop: 2 }}>{label}</Text>
    </View>
  );
}

export function StatBand() {
  return (
    <Reveal style={{ marginHorizontal: 20 }}>
      <View style={{ backgroundColor: colors.forest, borderRadius: radius.xl, padding: 18, flexDirection: 'row', flexWrap: 'wrap' }}>
        <Stat value={3500} suffix="+" label="travellers explored with Gidi" delay={0} />
        <Stat value={9} suffix="+" label="destinations across Africa & beyond" delay={150} />
        <Stat value={24} suffix="hrs" label="typical enquiry response" delay={300} />
        <Stat value={12000} suffix="+" label="travellers reached" delay={450} />
      </View>
    </Reveal>
  );
}

const WHY = [
  { Icon: Users, title: 'Local guides, real stories', body: 'Born-and-raised hosts who know which tales are folklore and which are family history.', tint: colors.greenSoft, fg: colors.greenDeep },
  { Icon: Compass, title: 'Small groups, slow days', body: 'Fewer stops, more time at each. No coach-park itineraries.', tint: colors.orangeSoft, fg: '#B25B05' },
  { Icon: ShieldCheck, title: 'Honest, local pricing', body: 'See prices in your own currency and pay securely in the app.', tint: colors.greenSoft, fg: colors.greenDeep },
];

export function WhyGidi() {
  return (
    <View style={{ paddingHorizontal: 20, gap: 12 }}>
      {WHY.map(({ Icon, title, body, tint, fg }, i) => (
        <Reveal key={title} index={i}>
          <View style={[{ flexDirection: 'row', gap: 16, backgroundColor: colors.white, borderRadius: radius.lg, padding: 18 }, shadow.card]}>
            <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: tint, alignItems: 'center', justifyContent: 'center' }}><Icon size={24} color={fg} /></View>
            <View style={{ flex: 1 }}>
              <Text v="h3">{title}</Text>
              <Text v="body" color={colors.muted} style={{ marginTop: 3 }}>{body}</Text>
            </View>
          </View>
        </Reveal>
      ))}
    </View>
  );
}

export function MagazineBanner({ cover }: { cover?: Img }) {
  return (
    <Reveal style={{ marginHorizontal: 20 }}>
      <PressableScale onPress={() => router.push('/store')} style={[{ backgroundColor: colors.forest, borderRadius: radius.xl, padding: 22, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', minHeight: 210 }, shadow.card]}>
        <View style={{ flex: 1, paddingRight: 8, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><BookOpen size={14} color={colors.orange} /><Text v="caption" color={colors.orange}>THE MAGAZINE</Text></View>
          <Text style={{ fontFamily: fonts.bold, fontSize: 26, lineHeight: 29, letterSpacing: -0.9 }} color={colors.cream}>
            Read the road, <Text style={{ fontFamily: fonts.serifItalic, fontSize: 30 }} color={colors.orange}>before you go.</Text>
          </Text>
          <Text v="small" color="rgba(247,243,234,0.7)">Photo essays, city guides and food stories from every issue.</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}><Text v="bodyStrong" color={colors.cream}>Browse the store</Text><ArrowRight size={16} color={colors.cream} /></View>
        </View>
        <View style={{ width: 120, height: 160, transform: [{ rotate: '7deg' }] }}>
          <AppImage img={cover} width={500} style={{ width: 120, height: 160, borderRadius: 14, borderWidth: 3, borderColor: colors.cream }} />
        </View>
      </PressableScale>
    </Reveal>
  );
}

export function TalkCta({ whatsapp }: { whatsapp?: string }) {
  const digits = (whatsapp ?? '').replace(/\D/g, '');
  return (
    <Reveal style={{ marginHorizontal: 20 }}>
      <LinearGradient colors={[colors.green, '#8aa81b', colors.orange]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: radius.xl, padding: 24, gap: 10 }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 28, lineHeight: 31, letterSpacing: -1 }} color={colors.white}>
          Not sure where to start? <Text style={{ fontFamily: fonts.serifItalic, fontSize: 32 }} color={colors.white}>Talk to a local.</Text>
        </Text>
        <Text v="body" color="rgba(255,255,255,0.9)">Tell us what you love and we’ll shape a trip around it, usually within 24 hours.</Text>
        <View style={{ gap: 10, marginTop: 8 }}>
          <Button title="Plan my trip" variant="light" onPress={() => router.push('/contact')} iconRight={<ArrowRight size={18} color={colors.ink} />} />
          {digits ? <Button title="Chat on WhatsApp" variant="dark" onPress={() => Linking.openURL(`https://wa.me/${digits}`)} icon={<MessageCircle size={18} color={colors.cream} />} /> : null}
        </View>
      </LinearGradient>
    </Reveal>
  );
}

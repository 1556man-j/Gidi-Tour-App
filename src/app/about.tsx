import { View } from 'react-native';
import { router } from 'expo-router';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, Download, Users } from 'lucide-react-native';
import { ParallaxHero } from '@/components/content/ParallaxHero';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/Header';
import { AppImage } from '@/components/ui/AppImage';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useCountUp } from '@/hooks/useCountUp';
import type { Img } from '@/lib/types';
import { colors, fonts, radius, shadow } from '@/theme';
import * as WebBrowser from 'expo-web-browser';
import { env } from '@/lib/env';

const hero: Img = { local: require('../../assets/images/hero.jpg') };
const impact: Img = { local: require('../../assets/images/local-life.jpg') };

function Stat({ to, suffix, label, color, i, symbol }: { to: number; suffix?: string; label: string; color: string; i: number; symbol?: string }) {
  const v = useCountUp(to, 1400, i * 120);
  return (
    <View style={[{ width: '48%', backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, gap: 8 }, shadow.card]}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 38, letterSpacing: -1.4 }} color={color}>{symbol ?? `${String(Math.round(v)).padStart(2, '0')}${suffix ?? ''}`}</Text>
      <Text v="small" color={colors.muted}>{label}</Text>
    </View>
  );
}

const PILLARS = [
  [BookOpen, 'Local Immersion', 'We build every trip around the food, culture and people that make a place what it is, not just the landmarks everyone else photographs.'],
  [Users, 'Guides Who Know the Ground', 'Every experience is led by people from the destination itself, the ones who know the shortcuts, the stories, and the best time to show up.'],
] as const;

export default function About() {
  const insets = useSafeAreaInsets();
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => { y.value = e.contentOffset.y; });
  return (
    <Screen>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <ParallaxHero scrollY={y} img={hero} height={440}>
          <View style={{ position: 'absolute', left: 22, right: 22, bottom: 30, gap: 10 }}>
            <Text v="caption" color="rgba(255,255,255,0.8)">WHO WE ARE</Text>
            <Text style={{ fontFamily: fonts.bold, fontSize: 36, lineHeight: 39, letterSpacing: -1.2 }} color={colors.white}>
              Travel should feel like coming home,{' '}
              <Text style={{ fontFamily: fonts.serifItalic, fontSize: 40 }} color={colors.orange}>not just visiting somewhere new.</Text>
            </Text>
          </View>
        </ParallaxHero>
        <View style={{ padding: 20, gap: 14 }}>
          {[['01', 'Our Vision', 'A world where travel brings people closer together, helping every traveler discover new places through culture, connection, food and unforgettable experiences.'],
            ['02', 'Our Mission', 'To create thoughtful travel experiences that go beyond sightseeing and connect travelers with the people, stories, culture and everyday life that make each destination unique.']].map(([n, t, b], i) => (
            <Reveal key={n} index={i}>
              <View style={[{ backgroundColor: colors.white, borderRadius: radius.xl, padding: 22, gap: 10 }, shadow.card]}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: fonts.bold }} color={colors.greenDeep}>{n}</Text></View>
                <Text v="h2">{t}</Text>
                <Text color={colors.muted} style={{ lineHeight: 24 }}>{b}</Text>
              </View>
            </Reveal>
          ))}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 6 }}>
            <Stat i={0} to={9} suffix="+" label="Countries to discover cultures, flavours and stories." color={colors.green} />
            <Stat i={1} to={100} suffix="+" label="Curated experiences beyond the usual tourist spots." color={colors.green} />
            <Stat i={2} to={100} suffix="%" label="Local experiences built around real everyday life." color={colors.green} />
            <Stat i={3} to={0} symbol="∞" label="Stories and memories waiting for your journey." color={colors.orange} />
          </View>

          <Reveal>
            <View style={{ borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.forest, marginTop: 10 }}>
              <AppImage img={impact} style={{ width: '100%', height: 200 }} />
              <View style={{ padding: 22, gap: 10 }}>
                <Text v="caption" color={colors.orange}>OUR IMPACT</Text>
                <Text v="h1" color={colors.cream}>What <Text style={{ fontFamily: fonts.serifItalic, fontSize: 36 }} color={colors.orange}>3500+ travelers</Text> have discovered together.</Text>
                <Text color="rgba(247,243,234,0.72)">Stories, numbers and milestones from a community going beyond the usual highlights.</Text>
                <Button title="Download the report" variant="accent" icon={<Download size={18} color={colors.white} />} onPress={() => WebBrowser.openBrowserAsync(`${env.siteUrl}/files/impact-report-2026.pdf`)} />
              </View>
            </View>
          </Reveal>

          <Reveal><Text v="h2" style={{ marginTop: 14 }}>How <Text style={{ fontFamily: fonts.serifItalic, fontSize: 28 }} color={colors.orange}>Gidi Tour</Text> works</Text></Reveal>
          {PILLARS.map(([Icon, t, b], i) => (
            <Reveal key={t} index={i}>
              <View style={[{ backgroundColor: colors.white, borderRadius: radius.lg, padding: 20, gap: 10 }, shadow.card]}>
                <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }}><Icon size={24} color={colors.green} /></View>
                <Text v="h3">{t}</Text>
                <Text color={colors.muted} style={{ lineHeight: 23 }}>{b}</Text>
                <Text v="caption" color={colors.faint}>PILLAR 0{i + 1}</Text>
              </View>
            </Reveal>
          ))}
          <View style={{ gap: 10, marginTop: 12 }}>
            <Button title="Explore tours" onPress={() => router.push('/tours')} />
            <Button title="Talk to us" variant="outline" onPress={() => router.push('/contact')} />
          </View>
        </View>
      </Animated.ScrollView>
      <View style={{ position: 'absolute', top: insets.top + 8, left: 16 }}><BackButton dark /></View>
    </Screen>
  );
}

import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowUpRight, Briefcase, Clock, MapPin } from 'lucide-react-native';
import { AccordionItem } from '@/components/content/Accordion';
import { ParallaxHero } from '@/components/content/ParallaxHero';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { getOpenPositions } from '@/lib/content';
import type { Img } from '@/lib/types';
import { colors, fonts, radius, shadow } from '@/theme';

const EMAIL = 'support@giditour.com';
const hero: Img = { local: require('../../assets/images/cape-town.jpg') };
const STEPS = [
  ['Send us something real', 'A note about a place that changed how you see things, alongside your CV. We read these before the CV.'],
  ['A conversation, not an interview', "Thirty minutes with someone who'd actually be your teammate. No trick questions, no case study on the spot."],
  ['A small, paid trial', 'A real piece of work, scoped to a few days, done on your own time and compensated whether or not it leads anywhere.'],
  ['An offer in plain terms', 'Clear scope, clear pay, clear start date, sent as a document you can actually read in one sitting.'],
];

export default function Career() {
  const insets = useSafeAreaInsets();
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => { y.value = e.contentOffset.y; });
  const q = useQuery({ queryKey: ['positions'], queryFn: getOpenPositions });
  const [apply, setApply] = useState<string | null>(null);
  const subject = `Application: ${apply ?? ''}`;

  return (
    <Screen>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <ParallaxHero scrollY={y} img={hero} height={460} shade={0.99}>
          <View style={{ position: 'absolute', left: 22, right: 22, bottom: 30, gap: 12 }}>
            <Text v="caption" color="rgba(255,255,255,0.75)">CAREERS AT GIDI TOUR</Text>
            <Text style={{  fontSize: 30, lineHeight: 32 }} color={colors.white}>We hire people who’ve already fallen for a place they didn’t grow up in.</Text>
            <Text color="rgba(255,255,255,0.78)">Gidi Tour is small on purpose. Every person here has designed a route, argued with a supplier, or answered a 2am message from someone stuck at a border.</Text>
          </View>
        </ParallaxHero>

        <View style={{ padding: 20, gap: 16 }}>
          <Reveal>
            <Text style={{ fontFamily: fonts.serifItalic, fontSize: 24, lineHeight: 33 }}>There is no separate “content team” that has never been to the places we write about, and no “ops team” that has never spoken to a traveler.</Text>
          </Reveal>
          <Reveal index={1}><Text color={colors.muted} style={{ lineHeight: 24 }}>Most weeks you'll do work outside the title on your CV. If that sounds like more responsibility than structure, it is. We pay for it accordingly, and we tell you that up front.</Text></Reveal>

          <View style={{ backgroundColor: colors.ink, borderRadius: radius.xl, padding: 18, gap: 12, marginTop: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 4 }}>
              <Text v="h2" color={colors.cream}>Open roles</Text>
              <Text v="small" color="rgba(247,243,234,0.55)">{q.data?.length ?? 0} positions</Text>
            </View>
            {q.isLoading ? [0, 1].map((i) => <Skeleton key={i} h={72} r={24} />) : !q.data?.length ? (
              <EmptyState icon={<Briefcase size={38} color={colors.green} />} title="No open roles right now" body={`Write to ${EMAIL} and tell us what you'd want to work on.`} />
            ) : q.data.map((r, i) => (
              <Reveal key={r._id} index={i}>
                <AccordionItem dark header={
                  <View style={{ gap: 6 }}>
                    <Text v="h3" color={colors.cream}>{r.title}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                      {r.location ? <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}><MapPin size={12} color="rgba(247,243,234,0.6)" /><Text v="small" color="rgba(247,243,234,0.6)">{r.location}</Text></View> : null}
                      {r.commitment ? <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}><Clock size={12} color="rgba(247,243,234,0.6)" /><Text v="small" color="rgba(247,243,234,0.6)">{r.commitment}</Text></View> : null}
                      {r.team ? <Text v="small" color="rgba(247,243,234,0.6)">{r.team}</Text> : null}
                    </View>
                  </View>
                }>
                  <Text color="rgba(247,243,234,0.78)" style={{ lineHeight: 23, marginBottom: 14 }}>{r.summary}</Text>
                  <Button title="Apply for this role" size="md" iconRight={<ArrowUpRight size={18} color={colors.white} />} onPress={() => setApply(r.title)} />
                </AccordionItem>
              </Reveal>
            ))}
          </View>

          <Reveal><Text v="h2" style={{ marginTop: 18 }}>How hiring works</Text></Reveal>
          {STEPS.map(([t, b], i) => (
            <Reveal key={t} index={i}>
              <View style={[{ flexDirection: 'row', gap: 14, backgroundColor: colors.white, borderRadius: radius.lg, padding: 16 }, shadow.card]}>
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: fonts.bold }} color={colors.greenDeep}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1, gap: 4 }}><Text v="h3">{t}</Text><Text color={colors.muted}>{b}</Text></View>
              </View>
            </Reveal>
          ))}
        </View>
      </Animated.ScrollView>
      <View style={{ position: 'absolute', top: insets.top + 8, left: 16 }}><BackButton dark /></View>

      <Sheet visible={apply !== null} onClose={() => setApply(null)} title="Apply">
        <Text v="caption" color={colors.green}>{(apply ?? '').toUpperCase()}</Text>
        <Text color={colors.muted} style={{ marginVertical: 10 }}>Send your application by email. No forms, just a real note.</Text>
        <View style={{ backgroundColor: colors.white, borderRadius: radius.md, padding: 16, gap: 4, marginBottom: 16 }}>
          <Text v="caption" color={colors.muted}>SEND TO</Text>
          <Text v="bodyStrong" color={colors.greenDeep}>{EMAIL}</Text>
          <Text v="caption" color={colors.muted} style={{ marginTop: 8 }}>SUBJECT</Text>
          <Text v="bodyStrong">{subject}</Text>
        </View>
        <Button title="Open email app" onPress={() => Linking.openURL(`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`)} />
      </Sheet>
      <LinearGradient pointerEvents="none" colors={['rgba(0,0,0,0.25)', 'transparent']} style={[StyleSheet.absoluteFill, { height: insets.top + 60 }]} />
    </Screen>
  );
}

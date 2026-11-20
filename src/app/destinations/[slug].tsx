import { useMemo, useState } from 'react';
import { Dimensions, Linking, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Extrapolation, FadeIn, FadeOut, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, CalendarDays, Clock, Compass, Tag, Utensils, Lightbulb, MapPin } from 'lucide-react-native';
import { TourCard } from '@/components/TourCard';
import { AppImage } from '@/components/ui/AppImage';
import { BackButton } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/Heading';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { CartButton } from '@/components/CartButton';
import { useBootstrap } from '@/hooks/useBootstrap';
import { getDestination, getTours } from '@/lib/content';
import { colors, fonts, radius, shadow, springs } from '@/theme';

const { width: SW, height: SH } = Dimensions.get('window');
const HERO = Math.round(SH * 0.5);
const TABS = [
  { id: 'do', label: 'Things to do', Icon: Compass },
  { id: 'food', label: 'Food', Icon: Utensils },
  { id: 'tips', label: 'Travel tips', Icon: Lightbulb },
] as const;

function Fact({ Icon, label, value }: { Icon: typeof Clock; label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, gap: 6 }, shadow.card]}>
      <Icon size={18} color={colors.green} />
      <Text v="caption" color={colors.faint}>{label}</Text>
      <Text v="bodyStrong" numberOfLines={2} style={{ fontFamily: fonts.bold }}>{value}</Text>
    </View>
  );
}

export default function DestinationDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { money } = useBootstrap();
  const { data: dest, isLoading } = useQuery({ queryKey: ['destination', slug], queryFn: () => getDestination(slug!), enabled: !!slug });
  const tours = useQuery({ queryKey: ['tours'], queryFn: getTours });
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('do');
  const [tabW, setTabW] = useState(0);
  const ind = useSharedValue(0);
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => { y.value = e.contentOffset.y; });

  const heroImg = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(y.value, [-200, 0, HERO], [-100, 0, HERO * 0.4], Extrapolation.CLAMP) }, { scale: interpolate(y.value, [-200, 0], [1.4, 1], Extrapolation.CLAMP) }],
  }));
  const heroText = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [0, HERO * 0.5], [1, 0], Extrapolation.CLAMP), transform: [{ translateY: interpolate(y.value, [0, HERO], [0, -30], Extrapolation.CLAMP) }] }));
  const bar = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [HERO - 140, HERO - 80], [0, 1], Extrapolation.CLAMP) }));
  const indStyle = useAnimatedStyle(() => ({ transform: [{ translateX: ind.value }] }));

  const related = useMemo(() => (tours.data ?? []).filter((t) => t.countrySlug === slug), [tours.data, slug]);
  const items = dest ? (tab === 'do' ? dest.thingsToDo?.map((t) => ({ title: t })) : tab === 'food' ? dest.food?.map((f) => ({ title: f.name, sub: f.desc })) : dest.travelTips?.map((t) => ({ title: t }))) ?? [] : [];

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream }}>
        <Skeleton h={HERO} r={0} />
        <View style={{ padding: 20, gap: 14 }}><Skeleton h={28} w="60%" /><Skeleton h={90} r={20} /><Skeleton h={16} /><Skeleton h={16} w="80%" /></View>
        <View style={{ position: 'absolute', top: insets.top + 8, left: 16 }}><BackButton /></View>
      </View>
    );
  }
  if (!dest) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream, justifyContent: 'center' }}>
        <EmptyState icon={<MapPin size={40} color={colors.green} />} title="Destination not found" body="This place may have moved or been removed." action="See all destinations" onAction={() => router.replace('/destinations')} />
        <View style={{ position: 'absolute', top: insets.top + 8, left: 16 }}><BackButton /></View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={{ height: HERO, overflow: 'hidden', backgroundColor: colors.forest }}>
          <Animated.View style={[StyleSheet.absoluteFill, heroImg]}><AppImage img={dest.heroImage} width={1200} style={StyleSheet.absoluteFill} /></Animated.View>
          <LinearGradient colors={['rgba(8,14,5,0.45)', 'transparent', 'rgba(8,14,5,0.9)']} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
          <Animated.View style={[{ position: 'absolute', left: 22, right: 22, bottom: 52 }, heroText]}>
            {dest.region ? <Text v="caption" color={colors.orange}>{dest.region.toUpperCase()}</Text> : null}
            <Text style={{ fontFamily: fonts.bold, fontSize: 52, lineHeight: 54, letterSpacing: -2.2 }} color={colors.white}>{dest.name}</Text>
          </Animated.View>
        </View>

        <View style={{ marginTop: -28, backgroundColor: colors.cream, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 24, gap: 28 }}>
          <Reveal style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20 }}>
            <Fact Icon={CalendarDays} label="BEST TIME" value={dest.bestTime} />
            <Fact Icon={Clock} label="IDEAL STAY" value={dest.duration} />
            <Fact Icon={Tag} label="FROM" value={dest.priceFrom} />
          </Reveal>

          {dest.intro ? <Reveal delay={80} style={{ paddingHorizontal: 20 }}><Text v="body" color="rgba(18,32,13,0.8)" style={{ fontSize: 17, lineHeight: 27 }}>{dest.intro}</Text></Reveal> : null}

          {dest.cities?.length ? (
            <View>
              <SectionHeader before="Cities to" accent="explore" />
              <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={252} decelerationRate="fast" contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                {dest.cities.map((c, i) => (
                  <Reveal key={c.name} index={i} from="right">
                    <View style={[{ width: 240, backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden' }, shadow.card]}>
                      <AppImage img={c.image ?? c.gallery?.[0]} width={600} style={{ width: '100%', height: 150 }} />
                      <View style={{ padding: 14, gap: 4 }}>
                        <Text v="h3">{c.name}</Text>
                        {c.blurb ? <Text v="small" color={colors.muted} numberOfLines={3}>{c.blurb}</Text> : null}
                      </View>
                    </View>
                  </Reveal>
                ))}
              </Animated.ScrollView>
            </View>
          ) : null}

          {(dest.thingsToDo?.length || dest.food?.length || dest.travelTips?.length) ? (
            <View style={{ paddingHorizontal: 20 }}>
              <View onLayout={(e) => setTabW((e.nativeEvent.layout.width) / TABS.length)} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.line }}>
                {TABS.map((t, i) => (
                  <PressableScale key={t.id} hapticOnPress={false} scaleTo={0.97} onPress={() => { setTab(t.id); ind.value = withSpring(i * tabW, springs.snappy); }} style={{ flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 }}>
                    <t.Icon size={18} color={tab === t.id ? colors.greenDeep : colors.faint} />
                    <Text style={{ fontFamily: tab === t.id ? fonts.bold : fonts.medium, fontSize: 13 }} color={tab === t.id ? colors.ink : colors.muted}>{t.label}</Text>
                  </PressableScale>
                ))}
                {tabW ? <Animated.View style={[{ position: 'absolute', bottom: -1.5, left: 0, width: tabW, height: 3, borderRadius: 2, backgroundColor: colors.orange }, indStyle]} /> : null}
              </View>
              <Animated.View key={tab} entering={FadeIn.duration(280)} exiting={FadeOut.duration(120)} style={{ paddingTop: 16, gap: 10 }}>
                {items.length === 0 ? <Text v="body" color={colors.muted}>Nothing here yet. Check back soon.</Text> : items.map((it, i) => (
                  <View key={i} style={[{ flexDirection: 'row', gap: 12, backgroundColor: colors.white, borderRadius: radius.md, padding: 14 }, shadow.card]}>
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: fonts.bold, fontSize: 13 }} color={colors.greenDeep}>{i + 1}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text v="bodyStrong">{it.title}</Text>
                      {'sub' in it && it.sub ? <Text v="small" color={colors.muted} style={{ marginTop: 2 }}>{String(it.sub)}</Text> : null}
                    </View>
                  </View>
                ))}
              </Animated.View>
            </View>
          ) : null}

          {dest.experiences?.length ? (
            <View>
              <SectionHeader before="Signature" accent="experiences" />
              <View style={{ paddingHorizontal: 20, gap: 12 }}>
                {dest.experiences.map((e, i) => {
                  const go = () => (e.tour ? router.push(`/tours/${e.tour.slug.current}`) : e.href ? Linking.openURL(e.href) : undefined);
                  return (
                    <Reveal key={i} index={i}>
                      <PressableScale onPress={go} style={[{ flexDirection: 'row', gap: 14, backgroundColor: colors.white, borderRadius: radius.lg, padding: 10 }, shadow.card]}>
                        <AppImage img={e.image ?? e.tour?.image} width={400} style={{ width: 92, height: 92, borderRadius: radius.md }} />
                        <View style={{ flex: 1, justifyContent: 'center', gap: 3 }}>
                          <Text v="h3" numberOfLines={2}>{e.title}</Text>
                          {e.blurb ? <Text v="small" color={colors.muted} numberOfLines={2}>{e.blurb}</Text> : null}
                          {e.tour ? <Text v="bodyStrong" color={colors.greenDeep}>{money(e.tour.price)} · {e.tour.duration}</Text> : null}
                        </View>
                      </PressableScale>
                    </Reveal>
                  );
                })}
              </View>
            </View>
          ) : null}

          {related.length ? (
            <View>
              <SectionHeader before={`Tours in`} accent={dest.name} />
              <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={292} decelerationRate="fast" contentContainerStyle={{ paddingHorizontal: 20, gap: 16, paddingVertical: 10 }}>
                {related.map((t) => <TourCard key={t._id} tour={t} />)}
              </Animated.ScrollView>
            </View>
          ) : null}

          <Reveal style={{ paddingHorizontal: 20 }}>
            <View style={{ backgroundColor: colors.forest, borderRadius: radius.xl, padding: 24, gap: 12 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 26, lineHeight: 29, letterSpacing: -0.9 }} color={colors.cream}>Plan a trip to <Text style={{ fontFamily: fonts.serifItalic, fontSize: 30 }} color={colors.orange}>{dest.name}</Text></Text>
              <Text v="body" color="rgba(247,243,234,0.75)">Tell our local team what you love and we’ll shape the route.</Text>
              <Button title="Talk to us" variant="accent" onPress={() => router.push({ pathname: '/contact', params: { subject: `Trip to ${dest.name}` } })} iconRight={<ArrowRight size={18} color={colors.white} />} />
            </View>
          </Reveal>
        </View>
      </Animated.ScrollView>

      <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 64, backgroundColor: colors.cream, borderBottomWidth: 1, borderBottomColor: colors.line }, bar]} />
      <View style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} pointerEvents="box-none">
        <BackButton dark />
        <Animated.Text style={[{ fontFamily: fonts.bold, fontSize: 18, color: colors.ink }, bar]}>{dest.name}</Animated.Text>
        <CartButton />
      </View>
    </View>
  );
}
void SW;

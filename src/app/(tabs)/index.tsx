import { useCallback, useMemo, useState } from 'react';
import { Dimensions, RefreshControl, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Animated, { Extrapolation, FadeInDown, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Glass } from '@/components/ui/Glass';
import { Search, Star } from 'lucide-react-native';
import { ArticleCard } from '@/components/ArticleCard';
import { DestinationCard } from '@/components/DestinationCard';
import { ReviewCard } from '@/components/ReviewCard';
import { HeroSlides, SlideDots } from '@/components/home/HeroSlides';
import { CARD_GAP, CARD_W, MagazineBanner, ScalingTourCard, TalkCta, WhyGidi } from '@/components/home/Sections';
import { StatBand } from '@/components/home/StatBand';
import { TopBar } from '@/components/home/TopBar';
import { AppImage } from '@/components/ui/AppImage';
import { Chip } from '@/components/ui/Chip';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Heading';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useBootstrap } from '@/hooks/useBootstrap';
import { getArticles, getDestinations, getLatestReviews, getStoreProducts, getTours } from '@/lib/content';
import type { Img } from '@/lib/types';
import { useAuth } from '@/stores/auth';
import { colors, fonts, radius, TAB_PAD } from '@/theme';

const { height: SH, width: SW } = Dimensions.get('window');
const HERO_H = Math.round(Math.max(SH * 0.62, 480));
const FALLBACK: Img[] = [
  { local: require('../../../assets/images/avatar-7.webp') },
  { local: require('../../../assets/images/avatar-1.webp') },
  { local: require('../../../assets/images/avatar-2.webp') },
  { local: require('../../../assets/images/avatar-3.webp') },
];
const CATEGORIES = ['Safari', 'Cultural', 'City Break', 'Coastal', 'Adventure', 'Art'];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const user = useAuth((s) => s.user);
  const { siteSettings } = useBootstrap();
  const tours = useQuery({ queryKey: ['tours'], queryFn: getTours });
  const dests = useQuery({ queryKey: ['destinations'], queryFn: getDestinations });
  const reviews = useQuery({ queryKey: ['reviews', 'latest'], queryFn: () => getLatestReviews(12) });
  const articles = useQuery({ queryKey: ['articles'], queryFn: getArticles });
  const products = useQuery({ queryKey: ['store-products'], queryFn: getStoreProducts });
  const [refreshing, setRefreshing] = useState(false);
  const [slide, setSlide] = useState(0);
  // Sizes follow the screen width so the hero text and the traveller strip fit small phones as well as big ones.
  const { width: screenW } = useWindowDimensions();
  const k = Math.min(1.1, Math.max(0.8, screenW / 390));
  const compact = screenW < 380;
  const avatar = compact ? 26 : 30;

  const scrollY = useSharedValue(0);
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => { scrollY.value = e.contentOffset.y; });
  const onCarousel = useAnimatedScrollHandler((e) => { scrollX.value = e.contentOffset.x; });

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await qc.refetchQueries();
    setRefreshing(false);
  }, [qc]);

  const heroImages = useMemo(() => {
    const imgs = (dests.data ?? []).map((d) => d.heroImage).filter(Boolean) as Img[];
    return (imgs.length ? imgs.slice(0, 5) : FALLBACK);
  }, [dests.data]);
  // Traveller photos come from your assets folder (the same pictures as the fallback hero slides).
  const avatarImgs = FALLBACK;
  const slideLabel = dests.data?.filter((d) => d.heroImage)[slide]?.name;

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [-200, 0, HERO_H], [-100, 0, HERO_H * 0.45], Extrapolation.CLAMP) }, { scale: interpolate(scrollY.value, [-200, 0], [1.25, 1], Extrapolation.CLAMP) }],
  }));
  const heroContent = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, HERO_H * 0.55], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [0, HERO_H], [0, -40], Extrapolation.CLAMP) }],
  }));

  const popular = useMemo(() => {
    const all = tours.data ?? [];
    const pop = all.filter((t) => t.popular);
    return (pop.length >= 3 ? pop : all).slice(0, 8);
  }, [tours.data]);
  const magazine = products.data?.find((p) => p.category === 'magazine' && p.popular) ?? products.data?.find((p) => p.category === 'magazine');
  const firstName = user?.name?.split(' ')[0];

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <TopBar scrollY={scrollY} />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_PAD + insets.bottom }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.green} progressViewOffset={insets.top + 60} />}
      >
        {/* HERO */}
        <View style={{ height: HERO_H, overflow: 'hidden', backgroundColor: colors.forest }}>
          <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, heroStyle]}>
            <HeroSlides images={heroImages} onIndex={setSlide} />
          </Animated.View>
          <Animated.View style={[{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 22, paddingBottom: 26, gap: 14 }, heroContent]}>
            {firstName ? (
              <Animated.View entering={FadeInDown.delay(150).duration(350)}>
                <Text v="bodyStrong" color="rgba(255,255,255,0.85)">{greeting()}, {firstName} 👋</Text>
              </Animated.View>
            ) : slideLabel ? <Text v="caption" color={colors.orange}>NOW SHOWING · {slideLabel.toUpperCase()}</Text> : null}
            <Animated.View entering={FadeInDown.delay(250).duration(400)}>
              <Text style={{ fontFamily: fonts.bold, fontSize: Math.round(44 * k), lineHeight: Math.round(46 * k), letterSpacing: -1.9 * k }} color={colors.white}>
                Travel that feels like{' '}
                <Text style={{ fontFamily: fonts.serifItalic, fontSize: Math.round(52 * k), letterSpacing: -0.5 }} color={colors.orange}>coming home.</Text>
              </Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(350).duration(400)}>
              <Text v="body" color="rgba(255,255,255,0.85)" style={{ fontSize: compact ? 14.5 : 16, lineHeight: compact ? 21 : 23 }}>
                Go beyond the guidebook. We plan trips around the culture, food and people that make a place unforgettable.
              </Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(450).duration(400)}>
              <PressableScale onPress={() => router.push('/tours')} style={{ height: 58, borderRadius: 29, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' }}>
                <Glass intensity={40} tint="light" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.22)' }} />
                <View style={{ zIndex: 2 }}><Search size={20} color={colors.white} /></View>
                <Text v="bodyStrong" color={colors.white} style={{ flex: 1, fontSize: 16, zIndex: 2 }}>Where to next?</Text>
                <View style={{ backgroundColor: colors.orange, borderRadius: 18, paddingHorizontal: 14, height: 36, alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <Text style={{ fontFamily: fonts.semibold, fontSize: 13 }} color={colors.white}>Explore</Text>
                </View>
              </PressableScale>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(550).duration(400)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              {/* left: traveller photos + rating text. flex:1 + minWidth:0 lets the text wrap instead of pushing the dots off screen */}
              <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: compact ? 8 : 10 }}>
                <View style={{ flexDirection: 'row' }}>
                  {avatarImgs.map((img, i) => (
                    <AppImage
                      key={i}
                      img={img}
                      width={120}
                      transition={0}
                      style={{ width: avatar, height: avatar, borderRadius: avatar / 2, borderWidth: 2, borderColor: colors.forest, marginLeft: i ? -avatar * 0.5 : 0 }}
                    />
                  ))}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', gap: 1 }}>{[0, 1, 2, 3, 4].map((n) => <Star key={n} size={compact ? 10 : 11} color={colors.orange} fill={colors.orange} />)}</View>
                  <Text v="small" color="rgba(255,255,255,0.85)" numberOfLines={2} style={{ fontSize: compact ? 11 : 12, lineHeight: compact ? 15 : 16 }}>3500+ travelers {'\n'}explored with Gidi</Text>
                </View>
              </View>
              <View style={{ flexShrink: 0 }}>
                <SlideDots count={heroImages.length} index={slide} />
              </View>
            </Animated.View>
          </Animated.View>
        </View>

        <View style={{ gap: 36, paddingTop: 26 }}>
          {/* Categories */}
          <Reveal>
            <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
              {CATEGORIES.map((c) => <Chip key={c} label={c} onPress={() => router.push('/tours')} />)}
            </Animated.ScrollView>
          </Reveal>

          {/* Popular */}
          <View>
            <SectionHeader before="Popular" accent="right now" action="See all" onAction={() => router.push('/tours')} />
            {tours.isLoading ? (
              <View style={{ flexDirection: 'row', gap: CARD_GAP, paddingHorizontal: 20 }}><Skeleton w={CARD_W} h={380} r={32} /><Skeleton w={80} h={380} r={32} /></View>
            ) : (
              <Animated.ScrollView horizontal onScroll={onCarousel} scrollEventThrottle={16} showsHorizontalScrollIndicator={false} snapToInterval={CARD_W + CARD_GAP} decelerationRate="fast" contentContainerStyle={{ paddingHorizontal: 20, gap: CARD_GAP, paddingVertical: 14 }}>
                {popular.map((t, i) => <ScalingTourCard key={t._id} tour={t} index={i} scrollX={scrollX} />)}
              </Animated.ScrollView>
            )}
          </View>

          <StatBand />

          {/* Destinations */}
          <View>
            <SectionHeader before="Where" accent="we go" action="All places" onAction={() => router.push('/destinations')} />
            {dests.isLoading ? (
              <View style={{ flexDirection: 'row', gap: 14, paddingHorizontal: 20 }}><Skeleton w={210} h={290} r={32} /><Skeleton w={100} h={290} r={32} /></View>
            ) : (
              <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={224} decelerationRate="fast" contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingVertical: 10 }}>
                {(dests.data ?? []).map((d, i) => <Reveal key={d._id} index={i} from="right"><DestinationCard dest={d} /></Reveal>)}
              </Animated.ScrollView>
            )}
          </View>

          <View>
            <SectionHeader before="Why travel with" accent="Gidi" />
            <WhyGidi />
          </View>

          {/* Reviews */}
          {(reviews.data?.length ?? 0) > 0 ? (
            <View>
              <SectionHeader before="Loved by" accent="travellers" />
              <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={SW * 0.8 + 14} decelerationRate="fast" contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingVertical: 10 }}>
                {reviews.data!.map((r) => <ReviewCard key={r._id} review={r} width={SW * 0.8} />)}
              </Animated.ScrollView>
            </View>
          ) : null}

          {magazine ? <MagazineBanner cover={magazine.image} /> : null}

          {(articles.data?.length ?? 0) > 0 ? (
            <View>
              <SectionHeader before="Stories from" accent="the road" action="Read more" onAction={() => router.push('/stories')} />
              <View style={{ paddingHorizontal: 20, gap: 12 }}>
                {articles.data!.slice(0, 2).map((a, i) => <Reveal key={a._id} index={i}><ArticleCard article={a} /></Reveal>)}
              </View>
            </View>
          ) : null}

          <TalkCta whatsapp={siteSettings?.whatsapp} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

void radius;
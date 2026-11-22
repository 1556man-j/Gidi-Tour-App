import { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, Share, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Extrapolation, FadeInDown, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Clock, Compass, MapPin, Share2, Star, Users } from 'lucide-react-native';
import { getRelatedTours, getReviewsForTour, getTour } from '@/lib/content';
import { useBootstrap } from '@/hooks/useBootstrap';
import { useCountUp } from '@/hooks/useCountUp';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useBookingDraft } from '@/stores/booking';
import { BackButton } from '@/components/ui/Header';
import { AppImage } from '@/components/ui/AppImage';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Heading, SectionHeader } from '@/components/ui/Heading';
import { PressableScale } from '@/components/ui/PressableScale';
import { Rating } from '@/components/ui/Rating';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { ReviewCard } from '@/components/ReviewCard';
import { SaveButton } from '@/components/SaveButton';
import { TourCard } from '@/components/TourCard';
import { colors, fonts, radius, shadow, springs } from '@/theme';
import { haptic } from '@/lib/haptics';

const { width: W } = Dimensions.get('window');
const HERO_H = 440;

function Fact({ icon, label, value, delay }: { icon: React.ReactNode; label: string; value: string; delay: number }) {
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, gap: 8 }, shadow.card]}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <View>
        <Text v="caption" color={colors.faint}>{label}</Text>
        <Text v="bodyStrong" numberOfLines={1} style={{ marginTop: 2 }}>{value}</Text>
      </View>
    </View>
  );
}

function RatingFact({ rating, count }: { rating: number; count: number }) {
  const r = useCountUp(rating, 1100, 300);
  const c = useCountUp(count, 1100, 300);
  return <Fact delay={260} icon={<Star size={17} color={colors.orange} fill={colors.orange} />} label={`${Math.round(c)} REVIEWS`} value={r.toFixed(1)} />;
}

export default function TourDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { money } = useBootstrap();
  const requireAuth = useRequireAuth();
  const addTour = useBookingDraft((s) => s.addTour);
  const { data: tour, isLoading } = useQuery({ queryKey: ['tour', slug], queryFn: () => getTour(slug!), enabled: !!slug });
  // Reviews and related tours load a moment after the main content, so the page responds first.
  const [late, setLate] = useState(false);
  useEffect(() => {
    if (!tour) return;
    let t: ReturnType<typeof setTimeout>;
    t = setTimeout(() => setLate(true), 450);
    return () => clearTimeout(t);
  }, [tour]);
  const { data: reviews } = useQuery({ queryKey: ['reviews', slug], queryFn: () => getReviewsForTour(slug!), enabled: !!slug && late });
  const { data: related } = useQuery({ queryKey: ['related', slug, tour?.countrySlug], queryFn: () => getRelatedTours(tour!.countrySlug, slug!), enabled: !!tour && late });

  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => { y.value = e.contentOffset.y; });
  const [page, setPage] = useState(0);
  const bar = useSharedValue(0);
  useEffect(() => { if (tour) bar.value = withDelay(500, withSpring(1, springs.soft)); }, [tour, bar]);

  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(y.value, [-200, 0, HERO_H], [-100, 0, HERO_H * 0.4], Extrapolation.CLAMP) },
      { scale: interpolate(y.value, [-250, 0], [1.6, 1], Extrapolation.CLAMP) },
    ],
  }));
  const solid = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [HERO_H - 160, HERO_H - 90], [0, 1], Extrapolation.CLAMP) }));
  const barStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - bar.value) * 140 }], opacity: bar.value }));

  const images = tour ? (tour.gallery?.length ? tour.gallery : tour.image ? [tour.image] : []) : [];
  const onPage = useCallback((e: { nativeEvent: { contentOffset: { x: number } } }) => setPage(Math.round(e.nativeEvent.contentOffset.x / W)), []);

  const book = () => {
    if (!tour) return;
    haptic.medium();
    if (!requireAuth('/book')) {
      addTour({ slug: tour.slug.current, title: tour.title, country: tour.country, price: tour.price, image: tour.image });
      return;
    }
    addTour({ slug: tour.slug.current, title: tour.title, country: tour.country, price: tour.price, image: tour.image });
    router.push('/book');
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream }}>
        <Skeleton h={HERO_H} r={0} />
        <View style={{ padding: 20, gap: 12 }}><Skeleton w="40%" h={14} /><Skeleton h={34} /><Skeleton w="70%" h={34} /><Skeleton h={90} r={20} /></View>
        <View style={{ position: 'absolute', top: insets.top + 8, left: 16 }}><BackButton /></View>
      </View>
    );
  }
  if (!tour) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream, justifyContent: 'center' }}>
        <EmptyState icon={<Compass size={40} color={colors.green} />} title="Tour not found" body="This tour may have been removed." action="Browse tours" onAction={() => router.replace('/tours')} />
        <View style={{ position: 'absolute', top: insets.top + 8, left: 16 }}><BackButton /></View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 + insets.bottom }}>
        <View style={{ height: HERO_H, overflow: 'hidden' }}>
          <Animated.View style={[{ height: HERO_H + 80 }, heroStyle]}>
            <FlatList
              data={images}
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              onMomentumScrollEnd={onPage}
              initialNumToRender={1} maxToRenderPerBatch={1} windowSize={3} removeClippedSubviews
              renderItem={({ item }) => <AppImage img={item} width={900} style={{ width: W, height: HERO_H + 80 }} />}
            />
          </Animated.View>
          <LinearGradient pointerEvents="none" colors={['rgba(8,14,5,0.45)', 'transparent', 'rgba(247,243,234,0)']} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
          {images.length > 1 ? (
            <View pointerEvents="none" style={{ position: 'absolute', bottom: 50, alignSelf: 'center', flexDirection: 'row', gap: 6 }}>
              {images.map((_, i) => <View key={i} style={{ width: page === i ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: page === i ? colors.white : 'rgba(255,255,255,0.55)' }} />)}
            </View>
          ) : null}
        </View>

        <View style={{ marginTop: -32, backgroundColor: colors.cream, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 24, paddingHorizontal: 20 }}>
          <Animated.View entering={FadeInDown.springify().damping(18)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} color={colors.green} />
              <Text v="caption" color={colors.green}>{tour.country.toUpperCase()}{tour.category ? ` · ${tour.category.toUpperCase()}` : ''}</Text>
            </View>
            <Text v="h1" style={{ marginTop: 8 }}>{tour.title}</Text>
            <View style={{ marginTop: 10 }}><Rating value={tour.rating} count={tour.reviewCount} size={16} /></View>
          </Animated.View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
            <Fact delay={100} icon={<Clock size={17} color={colors.greenDeep} />} label="DURATION" value={tour.duration ?? 'Flexible'} />
            <Fact delay={180} icon={<Users size={17} color={colors.greenDeep} />} label="GROUP" value={tour.groupSize ?? 'Small group'} />
            <RatingFact rating={tour.rating ?? 0} count={tour.reviewCount ?? 0} />
          </View>

          {tour.summary ? (
            <View style={{ marginTop: 26 }}>
              <Heading before="About this" accent="experience" size={22} />
              <Text v="body" color="rgba(18,32,13,0.8)" style={{ marginTop: 10, fontSize: 16, lineHeight: 26 }}>{tour.summary}</Text>
            </View>
          ) : null}

          {tour.highlights?.length ? (
            <View style={{ marginTop: 28 }}>
              <Heading before="Trip" accent="highlights" size={22} />
              <View style={{ marginTop: 12, gap: 10 }}>
                {tour.highlights.map((h) => (
                  <View key={h} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.md, padding: 14 }}>
                    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' }}><Check size={15} color={colors.white} strokeWidth={3} /></View>
                    <Text v="bodyStrong" style={{ flex: 1 }}>{h}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {tour.includes?.length ? (
            <View style={{ marginTop: 28 }}>
              <Heading before="What's" accent="included" size={22} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {tour.includes.map((inc) => (
                  <View key={inc} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.greenSoft, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 }}>
                    <Check size={14} color={colors.greenDeep} strokeWidth={3} />
                    <Text v="small" color={colors.greenDeep} style={{ fontFamily: fonts.semibold }}>{inc}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {reviews?.length ? (
          <View style={{ marginTop: 32 }}>
            <SectionHeader before="What travellers" accent="say" />
            <FlatList horizontal initialNumToRender={2} windowSize={3} data={reviews} keyExtractor={(r) => r._id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 16 }} renderItem={({ item }) => <ReviewCard review={item} width={W * 0.78} />} />
          </View>
        ) : null}

        {related?.length ? (
          <View style={{ marginTop: 16 }}>
            <SectionHeader before="More in" accent={tour.country} />
            <FlatList horizontal initialNumToRender={2} windowSize={3} data={related} keyExtractor={(r) => r._id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingBottom: 16 }} renderItem={({ item }) => <TourCard tour={item} width={236} height={320} />} />
          </View>
        ) : null}
      </Animated.ScrollView>

      {/* floating header */}
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 64, backgroundColor: colors.cream, borderBottomWidth: 1, borderBottomColor: colors.line }, solid]} />
      <View style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} pointerEvents="box-none">
        <BackButton />
        <Animated.View pointerEvents="none" style={[{ flex: 1, paddingHorizontal: 12 }, solid]}>
          <Text v="h3" center numberOfLines={1}>{tour.title}</Text>
        </Animated.View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <PressableScale onPress={() => Share.share({ message: `${tour.title} on Gidi Tour: https://www.giditour.com/tours/${tour.slug.current}` }).catch(() => {})} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.75)', alignItems: 'center', justifyContent: 'center' }}>
            <Share2 size={18} color={colors.ink} />
          </PressableScale>
          <SaveButton slug={tour.slug.current} />
        </View>
      </View>

      {/* sticky booking bar */}
      <Animated.View style={[{ position: 'absolute', left: 16, right: 16, bottom: Math.max(insets.bottom, 12) }, barStyle]}>
        <View style={[{ backgroundColor: colors.ink, borderRadius: 34, padding: 10, paddingLeft: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, shadow.float]}>
          <View>
            <Text v="caption" color="rgba(247,243,234,0.6)">FROM · PER PERSON</Text>
            <Text style={{ fontFamily: fonts.bold, fontSize: 24, letterSpacing: -0.8 }} color={colors.cream}>{money(tour.price)}</Text>
          </View>
          <Button title="Book this tour" variant="accent" size="md" full={false} onPress={book} />
        </View>
      </Animated.View>
    </View>
  );
}

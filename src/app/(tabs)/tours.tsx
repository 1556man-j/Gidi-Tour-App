import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, TextInput, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowUpDown, Check, Compass, Search, X } from 'lucide-react-native';
import { getTours } from '@/lib/content';
import { TourRow } from '@/components/TourCard';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Heading } from '@/components/ui/Heading';
import { PressableScale } from '@/components/ui/PressableScale';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { CartButton } from '@/components/CartButton';
import { colors, fonts, radius, TAB_PAD } from '@/theme';
import type { Tour } from '@/lib/types';

const SORTS = [
  { id: 'popular', label: 'Popular' },
  { id: 'low', label: 'Price: low to high' },
  { id: 'high', label: 'Price: high to low' },
  { id: 'rating', label: 'Top rated' },
] as const;
type SortId = (typeof SORTS)[number]['id'];

export default function ToursTab() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['tours'], queryFn: getTours });
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [country, setCountry] = useState('All');
  const [sort, setSort] = useState<SortId>('popular');
  const [sortOpen, setSortOpen] = useState(false);

  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => { y.value = e.contentOffset.y; });
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [0, 90], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(y.value, [0, 90], [0, -16], Extrapolation.CLAMP) }, { scale: interpolate(y.value, [0, 90], [1, 0.92], Extrapolation.CLAMP) }],
  }));
  const barStyle = useAnimatedStyle(() => ({ borderBottomColor: `rgba(18,32,13,${interpolate(y.value, [60, 120], [0, 0.09], Extrapolation.CLAMP)})` }));

  const categories = useMemo(() => ['All', ...Array.from(new Set((data ?? []).map((t) => t.category).filter(Boolean) as string[]))], [data]);
  const countries = useMemo(() => ['All', ...Array.from(new Set((data ?? []).map((t) => t.country)))], [data]);

  const list = useMemo(() => {
    let r: Tour[] = (data ?? []).filter((t) => {
      const s = q.trim().toLowerCase();
      return (
        (category === 'All' || t.category === category) &&
        (country === 'All' || t.country === country) &&
        (!s || t.title.toLowerCase().includes(s) || t.country.toLowerCase().includes(s) || (t.summary ?? '').toLowerCase().includes(s))
      );
    });
    r = [...r];
    if (sort === 'low') r.sort((a, b) => a.price - b.price);
    else if (sort === 'high') r.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') r.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else r.sort((a, b) => Number(!!b.popular) - Number(!!a.popular) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    return r;
  }, [data, q, category, country, sort]);


  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Animated.View style={[{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: colors.cream, zIndex: 5, borderBottomWidth: 1 }, barStyle]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Animated.View style={[{ flex: 1 }, titleStyle]}>
            <Text v="caption" color={colors.green}>EXPLORE</Text>
            <Heading before="Find your" accent="next trip" size={30} />
          </Animated.View>
          <CartButton />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 16, height: 52, borderWidth: 1.5, borderColor: colors.line }}>
            <Search size={18} color={colors.muted} />
            <TextInput value={q} onChangeText={setQ} placeholder="Search tours, countries…" placeholderTextColor={colors.faint} returnKeyType="search" style={{ flex: 1, fontFamily: fonts.medium, fontSize: 16, color: colors.ink, outlineStyle: 'none' } as object} />
            {q ? <PressableScale onPress={() => setQ('')} hapticOnPress={false}><X size={18} color={colors.muted} /></PressableScale> : null}
          </View>
          <PressableScale onPress={() => setSortOpen(true)} style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpDown size={20} color={colors.cream} />
          </PressableScale>
        </View>
      </Animated.View>

      <Animated.FlatList
        data={isLoading ? [] : list}
        keyExtractor={(t) => t._id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={5}
        maxToRenderPerBatch={4}
        updateCellsBatchingPeriod={60}
        windowSize={5}
        removeClippedSubviews
        contentContainerStyle={{ paddingBottom: TAB_PAD + insets.bottom, paddingTop: 6, paddingHorizontal: 20, gap: 14 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} tintColor={colors.green} />}
        ListHeaderComponent={
          <View style={{ marginHorizontal: -20 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 6 }}>
              {categories.map((c) => <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />)}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 6 }}>
              {countries.map((c) => <Chip key={c} tone="green" label={c === 'All' ? 'All countries' : c} active={country === c} onPress={() => setCountry(c)} />)}
            </ScrollView>
            {!isLoading && list.length > 0 ? (
              <Text v="small" color={colors.muted} style={{ paddingHorizontal: 20, paddingTop: 12 }}>{list.length} {list.length === 1 ? 'tour' : 'tours'} · {SORTS.find((s) => s.id === sort)?.label}</Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ gap: 14, paddingTop: 12 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={148} r={24} />)}</View>
          ) : (
            <EmptyState icon={<Compass size={40} color={colors.green} />} title="No tours match" body="Try another country or clear your filters." action="Clear filters" onAction={() => { setQ(''); setCategory('All'); setCountry('All'); }} />
          )
        }
        renderItem={({ item }) => <TourRow tour={item} />}
      />

      <Sheet visible={sortOpen} onClose={() => setSortOpen(false)} title="Sort by">
        {SORTS.map((s) => (
          <PressableScale key={s.id} onPress={() => { setSort(s.id); setSortOpen(false); }} scaleTo={0.985} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.line }}>
            <Text v="bodyStrong" color={sort === s.id ? colors.greenDeep : colors.ink}>{s.label}</Text>
            {sort === s.id ? <Check size={20} color={colors.green} /> : null}
          </PressableScale>
        ))}
      </Sheet>
    </View>
  );
}

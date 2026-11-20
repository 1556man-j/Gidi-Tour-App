import { useMemo, useState } from 'react';
import { Dimensions, RefreshControl, TextInput, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Globe2, Search, X } from 'lucide-react-native';
import { CartButton } from '@/components/CartButton';
import { CARD_GAP, CARD_H, ParallaxCard } from '@/components/destinations/ParallaxCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Heading } from '@/components/ui/Heading';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { getDestinations } from '@/lib/content';
import { colors, fonts, radius, TAB_PAD } from '@/theme';

const VIEWPORT = Dimensions.get('window').height;

export default function DestinationsTab() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ['destinations'], queryFn: getDestinations });
  const [q, setQ] = useState('');
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => { y.value = e.contentOffset.y; });
  const list = useMemo(() => (data ?? []).filter((d) => !q.trim() || `${d.name} ${d.region ?? ''}`.toLowerCase().includes(q.trim().toLowerCase())), [data, q]);
  // Height of the header block above the list, used to time each card's parallax.
  const HEADER = insets.top + 8 + 136;

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: TAB_PAD + insets.bottom }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} tintColor={colors.green} />}
      >
        <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, height: HEADER + 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text v="caption" color={colors.green}>DESTINATIONS</Text>
              <Heading before="Where" accent="we go" size={34} />
            </View>
            <CartButton />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 16, height: 52, borderWidth: 1.5, borderColor: colors.line, marginTop: 16 }}>
            <Search size={18} color={colors.muted} />
            <TextInput value={q} onChangeText={setQ} placeholder="Search countries…" placeholderTextColor={colors.faint} style={{ flex: 1, fontFamily: fonts.medium, fontSize: 16, color: colors.ink, outlineStyle: 'none' } as object} />
            {q ? <PressableScale onPress={() => setQ('')} hapticOnPress={false}><X size={18} color={colors.muted} /></PressableScale> : null}
          </View>
        </View>
        <View style={{ paddingHorizontal: 20, gap: CARD_GAP }}>
          {isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} h={CARD_H} r={32} />)
            : list.length === 0 ? <EmptyState icon={<Globe2 size={40} color={colors.green} />} title="No destinations found" body="Try a different search." />
            : list.map((d, i) => (
              <Reveal key={`${q}-${d._id}`} index={i}>
                <ParallaxCard dest={d} index={i} offset={HEADER + 16} scrollY={y} viewport={VIEWPORT} />
              </Reveal>
            ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

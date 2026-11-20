import { useState } from 'react';
import { LayoutChangeEvent, RefreshControl, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ShoppingBag, Ticket } from 'lucide-react-native';
import { Header } from '@/components/ui/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { Text } from '@/components/ui/Text';
import { AppImage } from '@/components/ui/AppImage';
import { useBootstrap } from '@/hooks/useBootstrap';
import { formatDate } from '@/lib/format';
import { fetchAccountEntries } from '@/lib/services';
import { useAuth } from '@/stores/auth';
import { colors, fonts, radius, shadow, springs } from '@/theme';
import type { AccountEntry } from '@/lib/types';
import { Redirect } from 'expo-router';

const tabs = ['All', 'Tours', 'Store'] as const;

function Segmented({ value, onChange }: { value: number; onChange: (i: number) => void }) {
  const [w, setW] = useState(0);
  const x = useSharedValue(0);
  const seg = w / 3;
  const a = useAnimatedStyle(() => ({ transform: [{ translateX: withSpring(value * seg, springs.snappy) }] }));
  void x;
  return (
    <View onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width - 8)} style={{ flexDirection: 'row', backgroundColor: colors.sand, borderRadius: 999, padding: 4 }}>
      {seg ? <Animated.View style={[{ position: 'absolute', left: 4, top: 4, bottom: 4, width: seg, borderRadius: 999, backgroundColor: colors.ink }, a]} /> : null}
      {tabs.map((t, i) => (
        <PressableScale key={t} hapticOnPress={false} onPress={() => onChange(i)} style={{ flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.semibold, fontSize: 14 }} color={value === i ? colors.cream : colors.ink}>{t}</Text>
        </PressableScale>
      ))}
    </View>
  );
}

function Card({ e }: { e: AccountEntry }) {
  const { money } = useBootstrap();
  const tour = e.kind === 'tour';
  const title = tour ? e.tours.map((t) => t.title).join(', ') : e.items.map((i) => i.title).join(', ');
  const img = tour ? e.tours[0]?.image : undefined;
  return (
    <PressableScale onPress={() => router.push(`/account/bookings/${e._id}`)} style={[{ backgroundColor: colors.white, borderRadius: radius.lg, padding: 12, flexDirection: 'row', gap: 14 }, shadow.card]}>
      {img ? <AppImage img={img} width={300} style={{ width: 84, height: 96, borderRadius: radius.md }} /> : (
        <View style={{ width: 84, height: 96, borderRadius: radius.md, backgroundColor: tour ? colors.greenSoft : colors.orangeSoft, alignItems: 'center', justifyContent: 'center' }}>
          {tour ? <Ticket size={30} color={colors.greenDeep} /> : <ShoppingBag size={30} color={colors.orange} />}
        </View>
      )}
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ gap: 4 }}>
          <Text v="caption" color={colors.green}>{tour ? 'TOUR BOOKING' : 'STORE ORDER'}</Text>
          <Text v="h3" numberOfLines={2}>{title}</Text>
          <Text v="small" color={colors.muted}>{tour && e.startDate ? `${formatDate(e.startDate)}${e.endDate && e.endDate !== e.startDate ? ` – ${formatDate(e.endDate)}` : ''}` : formatDate(e.createdAt)}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <StatusPill status={e.paymentStatus} />
          <Text style={{ fontFamily: fonts.bold, fontSize: 17 }}>{e.amountGBP > 0 ? money(e.amountGBP) : 'Free'}</Text>
        </View>
      </View>
    </PressableScale>
  );
}

export default function Bookings() {
  const status = useAuth((s) => s.status);
  const [seg, setSeg] = useState(0);
  const q = useQuery({ queryKey: ['entries'], queryFn: fetchAccountEntries, enabled: status === 'authed' });
  if (status === 'guest') return <Redirect href={{ pathname: '/login', params: { redirectTo: '/account/bookings' } }} />;
  const list = (q.data ?? []).filter((e) => seg === 0 || (seg === 1 ? e.kind === 'tour' : e.kind === 'store'));
  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header title="My bookings" />
      <Animated.ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 60 }} refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => { q.refetch(); }} tintColor={colors.green} />}>
        <Segmented value={seg} onChange={setSeg} />
        {q.isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} h={120} r={24} />) : list.length ? list.map((e, i) => <Reveal key={`${seg}-${e._id}`} index={i}><Card e={e} /></Reveal>) : (
          <EmptyState icon={<Ticket size={40} color={colors.green} />} title="No bookings yet" body="When you book a tour or order from the store, it will show up here." action="Find a tour" onAction={() => router.replace('/tours')} />
        )}
      </Animated.ScrollView>
    </View>
  );
}

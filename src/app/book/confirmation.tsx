import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';
import { Confetti } from '@/components/ui/Confetti';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { SuccessCheck } from '@/components/ui/SuccessCheck';
import { Text } from '@/components/ui/Text';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { useAuth } from '@/stores/auth';
import { useBootstrap } from '@/hooks/useBootstrap';
import { fetchBookingStatus, fetchEntryDetail } from '@/lib/services';
import { formatDate } from '@/lib/format';
import { colors, fonts, radius, shadow } from '@/theme';

export default function BookingConfirmation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const authed = useAuth((s) => s.status === 'authed');
  const { money } = useBootstrap();
  const [gaveUp, setGaveUp] = useState(false);

  const status = useQuery({
    queryKey: ['booking-status', id],
    queryFn: () => fetchBookingStatus(id!),
    enabled: !!id,
    refetchInterval: (q) => (q.state.data?.paymentStatus === 'paid' || q.state.data?.paymentStatus === 'failed' || gaveUp ? false : 2000),
  });
  const paid = status.data?.paymentStatus === 'paid';
  const failed = status.data?.paymentStatus === 'failed';

  useEffect(() => { const t = setTimeout(() => setGaveUp(true), 60000); return () => clearTimeout(t); }, []);

  const detail = useQuery({ queryKey: ['entry', id], queryFn: () => fetchEntryDetail(id!), enabled: !!id && authed && paid });
  const b = detail.data?.booking;

  if (!paid && !failed && !gaveUp) return <ProcessingOverlay visible title="Confirming your booking" body="Waiting for your payment to be confirmed…" />;

  if (failed || (!paid && gaveUp)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream, padding: 28, justifyContent: 'center', gap: 14 }}>
        <Animated.View entering={FadeInDown.springify()} style={{ gap: 12 }}>
          <Heading before={failed ? 'Payment' : 'Still'} accent={failed ? 'didn’t go through' : 'confirming'} size={32} />
          <Text v="body" color={colors.muted}>
            {failed ? 'Your card wasn’t charged. You can try again from your tours.' : 'Your bank is taking a little longer than usual. We’ll email you the moment it’s confirmed. You can also check My bookings.'}
          </Text>
        </Animated.View>
        <Button title={failed ? 'Try again' : 'Check again'} onPress={() => (failed ? router.replace('/tours') : (setGaveUp(false), status.refetch()))} style={{ marginTop: 12 }} />
        <Button title="My bookings" variant="outline" onPress={() => router.replace('/account/bookings')} />
        <Button title="Contact support" variant="ghost" onPress={() => router.push('/contact')} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: insets.top + 56, paddingBottom: insets.bottom + 30, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
        <SuccessCheck />
        <Animated.View entering={FadeInDown.delay(900).springify()} style={{ alignItems: 'center', marginTop: 28, gap: 10 }}>
          <Heading before="You’re" accent="booked!" size={38} />
          <Text v="body" color={colors.muted} center>Pack your curiosity. Our team is already getting things ready for you.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1100).springify()} style={[{ alignSelf: 'stretch', backgroundColor: colors.white, borderRadius: radius.xl, padding: 20, marginTop: 28, gap: 10 }, shadow.card]}>
          <Text v="caption" color={colors.green}>BOOKING REFERENCE</Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: 18 }} numberOfLines={1}>{(id ?? '').slice(0, 18).toUpperCase()}</Text>
          {b ? (
            <>
              <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 4 }} />
              {b.tours.map((t) => (
                <View key={t.id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                  <Text v="bodyStrong" style={{ flex: 1 }} numberOfLines={2}>{t.title}</Text>
                  <Text v="body" color={colors.muted}>{t.travelers} {t.travelers === 1 ? 'guest' : 'guests'}</Text>
                </View>
              ))}
              {b.startDate ? <Text v="body" color={colors.muted}>{formatDate(b.startDate)}{b.endDate && b.endDate !== b.startDate ? ` – ${formatDate(b.endDate)}` : ''}{b.destination ? ` · ${b.destination}` : ''}</Text> : null}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text v="bodyStrong">Total</Text>
                <Text style={{ fontFamily: fonts.bold, fontSize: 18 }}>{money(b.amountGBP)}</Text>
              </View>
            </>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1250).springify()} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.greenSoft, borderRadius: radius.lg, padding: 16, marginTop: 14, alignSelf: 'stretch' }}>
          <Mail size={22} color={colors.greenDeep} />
          <Text v="small" color={colors.greenDeep} style={{ flex: 1, fontFamily: fonts.medium }}>A confirmation email is on its way to you.</Text>
        </Animated.View>

        <View style={{ alignSelf: 'stretch', gap: 10, marginTop: 26 }}>
          {authed ? <Button title="View booking" onPress={() => router.replace(`/account/bookings/${id}`)} /> : null}
          <Button title="Back to home" variant="outline" onPress={() => router.replace('/')} />
        </View>
      </ScrollView>
      <Confetti />
    </View>
  );
}

import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, Download, Mail } from 'lucide-react-native';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import { Heading } from '@/components/ui/Heading';
import { Reveal } from '@/components/ui/Reveal';
import { SuccessCheck } from '@/components/ui/SuccessCheck';
import { Text } from '@/components/ui/Text';
import { pollUntilSettled } from '@/features/payment';
import { useBootstrap } from '@/hooks/useBootstrap';
import { fetchEntryDetail, fetchOrderStatus } from '@/lib/services';
import { useAuth } from '@/stores/auth';
import { colors, fonts, radius, shadow } from '@/theme';

export default function StoreConfirmation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { money } = useBootstrap();
  const authed = useAuth((s) => s.status === 'authed');
  const [state, setState] = useState<'waiting' | 'paid' | 'failed' | 'pending'>('waiting');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    setState('waiting');
    pollUntilSettled(() => fetchOrderStatus(String(id)), { tries: 20 }).then((r) => { if (live) setState(r); });
    return () => { live = false; };
  }, [id, attempt]);

  const order = useQuery({ queryKey: ['order-status', id, state], queryFn: () => fetchOrderStatus(String(id)), enabled: state === 'paid' });
  const detail = useQuery({ queryKey: ['order-detail', id], queryFn: () => fetchEntryDetail(String(id)), enabled: state === 'paid' && authed });

  const items = order.data?.items ?? detail.data?.storeOrder?.items ?? [];
  const total = items.reduce((n, i) => n + i.price * i.quantity, 0);
  const links = detail.data?.downloadLinks ?? [];
  const hasMagazine = items.some((i) => i.category === 'magazine');

  if (state === 'waiting') return <View style={{ flex: 1, backgroundColor: colors.cream }}><ProcessingOverlay visible /></View>;

  if (state !== 'paid') {
    const failed = state === 'failed';
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 }}>
        <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: failed ? colors.dangerSoft : colors.orangeSoft, alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={40} color={failed ? colors.danger : colors.orange} /></View>
        <Text v="h2" center>{failed ? 'Payment didn’t go through' : 'Still confirming…'}</Text>
        <Text v="body" color={colors.muted} center>{failed ? 'You have not been charged for this order. You can try again from your bag.' : 'Your bank is taking a little longer than usual. We’ll email you the moment it clears.'}</Text>
        <View style={{ alignSelf: 'stretch', gap: 10, marginTop: 12 }}>
          {failed ? <Button title="Back to my bag" onPress={() => router.replace('/store/cart')} /> : <Button title="Check again" onPress={() => setAttempt((a) => a + 1)} />}
          <Button title="Contact support" variant="outline" onPress={() => router.push('/contact')} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingTop: insets.top + 56, paddingBottom: insets.bottom + 40, paddingHorizontal: 22, gap: 8 }} showsVerticalScrollIndicator={false}>
        <SuccessCheck />
        <Reveal delay={600} style={{ alignItems: 'center', marginTop: 18 }}>
          <Heading before="Thank" accent="you!" size={38} />
          <Text v="body" color={colors.muted} center style={{ marginTop: 8 }}>
            {hasMagazine ? (authed ? 'Your issue is ready to download below.' : 'Your download links are on their way to your inbox.') : 'Your order is confirmed. We’ll email you the details.'}
          </Text>
        </Reveal>

        <Reveal delay={800} style={[{ alignSelf: 'stretch', backgroundColor: colors.white, borderRadius: radius.xl, padding: 18, marginTop: 20, gap: 12 }, shadow.card]}>
          <Text v="caption" color={colors.green}>ORDER {String(id).slice(-6).toUpperCase()}</Text>
          {items.map((i) => (
            <View key={`${i.id}${i.variant ?? ''}`} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Text v="bodyStrong" style={{ flex: 1 }}>{i.title}{i.variant ? ` · ${i.variant}` : ''} × {i.quantity}</Text>
              <Text v="bodyStrong">{i.price === 0 ? 'Free' : money(i.price * i.quantity)}</Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: colors.line }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text v="body" color={colors.muted}>Total</Text>
            <Text style={{ fontFamily: fonts.bold, fontSize: 20 }}>{total === 0 ? 'Free' : money(total)}</Text>
          </View>
        </Reveal>

        {hasMagazine ? (
          <Reveal delay={950} style={{ alignSelf: 'stretch', gap: 10, marginTop: 6 }}>
            {authed && links.length ? links.map((l) => (
              <Button key={l.url} title={`Download ${l.title}`} variant="accent" icon={<Download size={18} color={colors.white} />} onPress={() => WebBrowser.openBrowserAsync(l.url)} />
            )) : (
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.greenSoft, borderRadius: radius.lg, padding: 14 }}>
                <Mail size={20} color={colors.greenDeep} />
                <Text v="small" color={colors.greenDeep} style={{ flex: 1 }}>Download links were sent to your email. Check spam if you can’t see them.</Text>
              </View>
            )}
          </Reveal>
        ) : null}

        <Reveal delay={1100} style={{ alignSelf: 'stretch', gap: 10, marginTop: 14 }}>
          <Button title="Keep exploring" onPress={() => router.replace('/store')} />
          {authed ? <Button title="View order" variant="outline" onPress={() => router.replace(`/account/bookings/${id}`)} /> : null}
        </Reveal>
      </ScrollView>
      <Confetti />
    </View>
  );
}

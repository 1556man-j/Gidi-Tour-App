import { goBack } from '@/lib/nav';
import { View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import Animated from 'react-native-reanimated';
import { Download, LifeBuoy, MessageCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { Text } from '@/components/ui/Text';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBootstrap } from '@/hooks/useBootstrap';
import { addOnOptions, tripTypes } from '@/lib/data';
import { formatDate } from '@/lib/format';
import { openBookingChat } from '@/lib/chat';
import { fetchEntryDetail } from '@/lib/services';
import { toast } from '@/components/ui/Toast';
import { useAuth } from '@/stores/auth';
import { colors, fonts, radius, shadow } from '@/theme';

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={[{ backgroundColor: colors.white, borderRadius: radius.lg, padding: 18, marginBottom: 14 }, shadow.card]}>
      {title ? <Text v="caption" color={colors.green} style={{ marginBottom: 10 }}>{title.toUpperCase()}</Text> : null}
      {children}
    </View>
  );
}
const Row = ({ k, v }: { k: string; v?: string | number }) => v ? (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, gap: 16 }}>
    <Text v="body" color={colors.muted}>{k}</Text><Text v="bodyStrong" style={{ flexShrink: 1, textAlign: 'right' }}>{v}</Text>
  </View>
) : null;

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const status = useAuth((s) => s.status);
  const { money } = useBootstrap();
  const q = useQuery({ queryKey: ['entry', id], queryFn: () => fetchEntryDetail(id), enabled: status === 'authed' && !!id });
  const chat = useMutation({
    mutationFn: () => openBookingChat(id),
    onSuccess: (c) => router.push(`/messages/${c.id}` as never),
    onError: (e) => toast.error((e as Error).message),
  });
  if (status === 'guest') return <Redirect href={{ pathname: '/login', params: { redirectTo: `/account/bookings/${id}` } }} />;
  const b = q.data?.booking; const o = q.data?.storeOrder;
  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header title="Booking details" />
      <Animated.ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {q.isLoading ? <><Skeleton h={120} r={24} style={{ marginBottom: 14 }} /><Skeleton h={200} r={24} /></> : !b && !o ? (
          <EmptyState icon={<LifeBuoy size={40} color={colors.green} />} title="Booking not found" body="We couldn’t find that booking on your account." action="Back to bookings" onAction={() => goBack('/account/bookings')} />
        ) : (
          <>
            <Reveal>
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StatusPill status={(b ?? o)!.paymentStatus} />
                  <Text v="small" color={colors.muted}>Ref · {(b ?? o)!._id.slice(-8).toUpperCase()}</Text>
                </View>
                <Text style={{ fontFamily: fonts.bold, fontSize: 34, letterSpacing: -1, marginTop: 12 }}>{(b ?? o)!.amountGBP > 0 ? money((b ?? o)!.amountGBP) : 'Free'}</Text>
                <Text v="small" color={colors.muted}>Placed {formatDate((b ?? o)!.createdAt)}</Text>
              </Card>
            </Reveal>
            {b && b.paymentStatus === 'paid' ? (
              <Reveal index={1}>
                <Card>
                  <Text v="bodyStrong">Chat with your guide</Text>
                  <Text v="small" color={colors.muted} style={{ marginTop: 4, marginBottom: 12 }}>Ask about meeting points, timings and what to bring. Payments only happen through Gidi Tour.</Text>
                  <Button title="Message your guide" size="md" loading={chat.isPending} icon={<MessageCircle size={18} color={colors.white} />} onPress={() => chat.mutate()} />
                </Card>
              </Reveal>
            ) : null}
            {b ? (
              <>
                <Reveal index={1}>
                  <Card title="Trip">
                    <Row k="Destination" v={b.destination} />
                    <Row k="Dates" v={b.startDate ? `${formatDate(b.startDate)}${b.endDate && b.endDate !== b.startDate ? ` – ${formatDate(b.endDate)}` : ''}` : undefined} />
                    <Row k="Travellers" v={b.travelers} />
                    <Row k="Trip type" v={tripTypes.find((t) => t.id === b.tripType)?.label ?? b.tripType} />
                    <Row k="Add-ons" v={b.addOns?.length ? b.addOns.map((a) => addOnOptions.find((x) => x.id === a)?.label ?? a).join(', ') : undefined} />
                  </Card>
                </Reveal>
                <Reveal index={2}>
                  <Card title="Tours">
                    {b.tours.map((t) => (
                      <View key={t.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, gap: 12 }}>
                        <View style={{ flex: 1 }}><Text v="bodyStrong">{t.title}</Text><Text v="small" color={colors.muted}>{t.travelers} traveller{t.travelers > 1 ? 's' : ''}</Text></View>
                        {t.price > 0 ? <Text v="bodyStrong">{money(t.price * t.travelers)}</Text> : null}
                      </View>
                    ))}
                  </Card>
                </Reveal>
              </>
            ) : o ? (
              <>
                <Reveal index={1}>
                  <Card title="Items">
                    {o.items.map((i, k) => (
                      <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, gap: 12 }}>
                        <View style={{ flex: 1 }}><Text v="bodyStrong">{i.title}</Text><Text v="small" color={colors.muted}>{[i.variant, `Qty ${i.quantity}`].filter(Boolean).join(' · ')}</Text></View>
                        <Text v="bodyStrong">{i.price > 0 ? money(i.price * i.quantity) : 'Free'}</Text>
                      </View>
                    ))}
                  </Card>
                </Reveal>
                {o.shipping ? <Reveal index={2}><Card title="Shipping to"><Text v="body">{[o.shipping.address, o.shipping.city, o.shipping.postcode, o.shipping.country].join(', ')}</Text></Card></Reveal> : null}
                {q.data?.downloadLinks.length ? (
                  <Reveal index={3}>
                    <Card title="Downloads">
                      <View style={{ gap: 10 }}>
                        {q.data.downloadLinks.map((l) => <Button key={l.url} title={l.title} variant="soft" size="md" icon={<Download size={18} color={colors.greenDeep} />} onPress={() => WebBrowser.openBrowserAsync(l.url)} />)}
                      </View>
                    </Card>
                  </Reveal>
                ) : null}
              </>
            ) : null}
            <Reveal index={4}><Button title="Need help with this booking?" variant="outline" icon={<LifeBuoy size={18} color={colors.ink} />} onPress={() => router.push('/contact')} /></Reveal>
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
}

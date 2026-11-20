import { useMemo, useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Check, CreditCard, Landmark, MapPin, Plus, Search, ShieldCheck, Trash2, Users } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { getTours } from '@/lib/content';
import { addOnOptions, countryDialCodes, tripTypes } from '@/lib/data';
import { daysBetween, formatDate } from '@/lib/format';
import { useBootstrap } from '@/hooks/useBootstrap';
import { draftTotalGBP, useBookingDraft, type DraftTour } from '@/stores/booking';
import { AppImage } from '@/components/ui/AppImage';
import { Calendar } from '@/components/ui/Calendar';
import { Chip } from '@/components/ui/Chip';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/ui/Input';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Select } from '@/components/ui/Select';
import { Sheet } from '@/components/ui/Sheet';
import { Stepper } from '@/components/ui/Stepper';
import { Text } from '@/components/ui/Text';
import { colors, fonts, radius, shadow, springs } from '@/theme';

export type Errors = Record<string, string>;

export function StepTitle({ before, accent, sub }: { before: string; accent: string; sub?: string }) {
  return (
    <View style={{ marginBottom: 18, gap: 6 }}>
      <Heading before={before} accent={accent} size={28} />
      {sub ? <Text v="body" color={colors.muted}>{sub}</Text> : null}
    </View>
  );
}

/* ---------------------------------------------------------------- 1 tours */
export function StepTours({ error }: { error?: string }) {
  const { tours, removeTour, setTravelers, addTour } = useBookingDraft();
  const { money } = useBootstrap();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const { data } = useQuery({ queryKey: ['tours'], queryFn: getTours });
  const list = useMemo(() => (data ?? []).filter((t) => !tours.some((d) => d.slug === t.slug.current) && (t.title + t.country).toLowerCase().includes(q.toLowerCase())), [data, tours, q]);

  return (
    <View>
      <StepTitle before="Your" accent="tours" sub="Choose who’s coming on each experience." />
      {tours.map((t: DraftTour, i) => (
        <Reveal key={t.slug} index={i}>
          <View style={[{ flexDirection: 'row', gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, padding: 10, marginBottom: 12 }, shadow.card]}>
            <AppImage img={t.image} width={300} style={{ width: 86, height: 100, borderRadius: radius.md }} />
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text v="caption" color={colors.green}>{t.country.toUpperCase()}</Text>
                  <Text v="bodyStrong" numberOfLines={2}>{t.title}</Text>
                </View>
                <PressableScale onPress={() => removeTour(t.slug)} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.dangerSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={15} color={colors.danger} />
                </PressableScale>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stepper small value={t.travelers} onChange={(n) => setTravelers(t.slug, n)} />
                <Text style={{ fontFamily: fonts.bold, fontSize: 16 }}>{money(t.price * t.travelers)}</Text>
              </View>
            </View>
          </View>
        </Reveal>
      ))}
      {error ? <Text v="small" color={colors.danger} style={{ marginBottom: 10 }}>{error}</Text> : null}
      <PressableScale onPress={() => setOpen(true)} style={{ height: 58, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.green, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.greenSoft }}>
        <Plus size={18} color={colors.greenDeep} />
        <Text v="bodyStrong" color={colors.greenDeep}>{tours.length ? 'Add another tour' : 'Choose a tour'}</Text>
      </PressableScale>

      <Sheet visible={open} onClose={() => { setOpen(false); setQ(''); }} title="Add a tour" tall>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 16, height: 48, marginBottom: 10, borderWidth: 1.5, borderColor: colors.line }}>
          <Search size={18} color={colors.muted} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search tours" placeholderTextColor={colors.faint} style={{ flex: 1, fontFamily: fonts.medium, fontSize: 16, color: colors.ink, outlineStyle: 'none' } as object} />
        </View>
        <FlatList
          data={list}
          style={{ maxHeight: 440 }}
          keyExtractor={(t) => t._id}
          ListEmptyComponent={<Text v="body" color={colors.muted} center style={{ padding: 24 }}>No more tours to add.</Text>}
          renderItem={({ item }) => (
            <PressableScale onPress={() => { addTour({ slug: item.slug.current, title: item.title, country: item.country, price: item.price, image: item.image }); setOpen(false); setQ(''); }} scaleTo={0.985} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line }}>
              <AppImage img={item.image} width={200} style={{ width: 56, height: 56, borderRadius: 14 }} />
              <View style={{ flex: 1 }}>
                <Text v="bodyStrong" numberOfLines={1}>{item.title}</Text>
                <Text v="small" color={colors.muted}>{item.country} · {money(item.price)} pp</Text>
              </View>
              <Plus size={20} color={colors.green} />
            </PressableScale>
          )}
        />
      </Sheet>
    </View>
  );
}

/* ---------------------------------------------------------------- 2 when & who */
export function StepWhen({ errors }: { errors: Errors }) {
  const d = useBookingDraft();
  return (
    <View>
      <StepTitle before="When &" accent="who" sub="Pick your travel dates and the kind of trip." />
      <Input label="Destination" value={d.destination} onChangeText={(v) => d.patch({ destination: v })} error={errors.destination} left={<MapPin size={18} color={colors.muted} />} />
      <View style={[{ backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, marginBottom: 8 }, shadow.card]}>
        <Calendar start={d.startDate} end={d.endDate} onChange={(s, e) => d.patch({ startDate: s, endDate: e })} />
        {d.startDate ? (
          <Animated.View entering={FadeInDown.springify()} style={{ marginTop: 8, backgroundColor: colors.greenSoft, borderRadius: radius.md, padding: 12 }}>
            <Text v="bodyStrong" color={colors.greenDeep} center>
              {formatDate(d.startDate)}{d.endDate && d.endDate !== d.startDate ? ` → ${formatDate(d.endDate)} · ${daysBetween(d.startDate, d.endDate)} days` : ' · 1 day'}
            </Text>
          </Animated.View>
        ) : null}
      </View>
      {errors.dates ? <Text v="small" color={colors.danger} style={{ marginBottom: 8 }}>{errors.dates}</Text> : null}

      <Text v="h3" style={{ marginTop: 18, marginBottom: 12 }}>Trip type</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {tripTypes.map((t) => {
          const on = d.tripType === t.id;
          return (
            <PressableScale key={t.id} onPress={() => d.patch({ tripType: t.id })} style={{ width: '48%', backgroundColor: on ? colors.ink : colors.white, borderRadius: radius.lg, padding: 16, gap: 8, borderWidth: 1.5, borderColor: on ? colors.ink : colors.line }}>
              <Users size={20} color={on ? colors.orange : colors.green} />
              <View>
                <Text v="bodyStrong" color={on ? colors.cream : colors.ink}>{t.label}</Text>
                <Text v="small" color={on ? 'rgba(247,243,234,0.6)' : colors.muted}>{t.blurb}</Text>
              </View>
            </PressableScale>
          );
        })}
      </View>
      {errors.tripType ? <Text v="small" color={colors.danger} style={{ marginTop: 8 }}>{errors.tripType}</Text> : null}

      <Text v="h3" style={{ marginTop: 22, marginBottom: 12 }}>Flexible with dates?</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Chip label="Yes, a few days either way" active={d.flexibleDates === 'yes'} tone="green" onPress={() => d.patch({ flexibleDates: 'yes' })} />
        <Chip label="No, fixed" active={d.flexibleDates === 'no'} tone="green" onPress={() => d.patch({ flexibleDates: 'no' })} />
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- 3 add-ons */
export function StepAddons() {
  const d = useBookingDraft();
  const toggle = (id: string) => d.patch({ addOns: d.addOns.includes(id) ? d.addOns.filter((a) => a !== id) : [...d.addOns, id] });
  return (
    <View>
      <StepTitle before="Make it" accent="yours" sub="Optional extras our local team can arrange. We’ll follow up with a quote." />
      {addOnOptions.map((o, i) => {
        const on = d.addOns.includes(o.id);
        return (
          <Reveal key={o.id} index={i}>
            <PressableScale onPress={() => toggle(o.id)} style={{ flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: on ? colors.greenSoft : colors.white, borderRadius: radius.lg, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: on ? colors.green : colors.line }}>
              <CheckBox on={on} />
              <View style={{ flex: 1 }}>
                <Text v="bodyStrong">{o.label}</Text>
                <Text v="small" color={colors.muted}>{o.desc}</Text>
              </View>
            </PressableScale>
          </Reveal>
        );
      })}
      {d.addOns.includes('custom') ? (
        <Animated.View entering={FadeInDown.springify()}>
          <Input label="What would you like us to arrange?" multiline value={d.customAddOn} onChangeText={(v) => d.patch({ customAddOn: v })} />
        </Animated.View>
      ) : null}
    </View>
  );
}

function CheckBox({ on }: { on: boolean }) {
  const s = useAnimatedStyle(() => ({ transform: [{ scale: withSpring(on ? 1 : 0, springs.bouncy) }] }));
  return (
    <View style={{ width: 28, height: 28, borderRadius: 9, borderWidth: 2, borderColor: on ? colors.green : colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }}>
      <Animated.View style={[{ width: 28, height: 28, borderRadius: 9, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', position: 'absolute' }, s]}>
        <Check size={16} color={colors.white} strokeWidth={3} />
      </Animated.View>
    </View>
  );
}

/* ---------------------------------------------------------------- 4 details */
export interface Details { name: string; email: string; dial: string; phone: string }
export function StepDetails({ details, setDetails, errors }: { details: Details; setDetails: (d: Details) => void; errors: Errors }) {
  const d = useBookingDraft();
  const set = (p: Partial<Details>) => setDetails({ ...details, ...p });
  return (
    <View>
      <StepTitle before="Your" accent="details" sub="So we know who to send your confirmation to." />
      <Input label="Full name" value={details.name} onChangeText={(v) => set({ name: v })} error={errors.name} autoCapitalize="words" textContentType="name" />
      <Input label="Email" value={details.email} onChangeText={(v) => set({ email: v })} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="emailAddress" />
      <Select label="Phone country code" value={details.dial} options={countryDialCodes.map((c) => ({ label: `${c.name} (${c.dialCode})`, value: `${c.code}`, sub: c.dialCode }))} onChange={(v) => set({ dial: v })} display={(o) => (o ? `${o.sub}  ·  ${o.label.split(' (')[0]}` : '')} />
      <Input label="Phone number" value={details.phone} onChangeText={(v) => set({ phone: v })} error={errors.phone} keyboardType="phone-pad" textContentType="telephoneNumber" />
      <Input label="Travelling from" value={d.travelingFrom} onChangeText={(v) => d.patch({ travelingFrom: v })} left={<MapPin size={18} color={colors.muted} />} />
      <Input label="Anything we should know? (optional)" multiline value={d.notes} onChangeText={(v) => d.patch({ notes: v })} />
    </View>
  );
}

/* ---------------------------------------------------------------- 5 review */
export function StepReview({ details }: { details: Details }) {
  const d = useBookingDraft();
  const { money, paymentProvider, currency } = useBootstrap();
  const total = draftTotalGBP(d.tours);
  const travellers = Math.max(1, ...d.tours.map((t) => t.travelers));
  const row = (k: string, v: string) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 7 }}>
      <Text v="body" color={colors.muted}>{k}</Text>
      <Text v="bodyStrong" style={{ flex: 1, textAlign: 'right' }}>{v}</Text>
    </View>
  );
  return (
    <View>
      <StepTitle before="Review &" accent="pay" sub="One last look before you confirm." />
      <View style={[{ backgroundColor: colors.white, borderRadius: radius.xl, padding: 18 }, shadow.card]}>
        {d.tours.map((t) => (
          <View key={t.slug} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 8 }}>
            <View style={{ flex: 1 }}>
              <Text v="bodyStrong" numberOfLines={2}>{t.title}</Text>
              <Text v="small" color={colors.muted}>{t.travelers} × {money(t.price)}</Text>
            </View>
            <Text style={{ fontFamily: fonts.bold }}>{money(t.price * t.travelers)}</Text>
          </View>
        ))}
        <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 10 }} />
        {row('Dates', d.startDate ? `${formatDate(d.startDate)}${d.endDate !== d.startDate ? ` – ${formatDate(d.endDate)}` : ''}` : '—')}
        {row('Destination', d.destination || '—')}
        {row('Trip type', tripTypes.find((t) => t.id === d.tripType)?.label ?? '—')}
        {row('Largest group', String(travellers))}
        {row('Add-ons', d.addOns.length ? String(d.addOns.length) : 'None')}
        {row('Contact', details.email)}
        <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 10 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text v="h3">Total</Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: 28, letterSpacing: -1 }}>{money(total)}</Text>
        </View>
        {currency.code !== 'GBP' ? <Text v="small" color={colors.muted} style={{ marginTop: 4, textAlign: 'right' }}>Priced in {currency.code} at today’s rate</Text> : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 12, backgroundColor: colors.greenSoft, borderRadius: radius.lg, padding: 16, marginTop: 14, alignItems: 'center' }}>
        {paymentProvider === 'dlocal' ? <Landmark size={22} color={colors.greenDeep} /> : <CreditCard size={22} color={colors.greenDeep} />}
        <Text v="small" color={colors.greenDeep} style={{ flex: 1, fontFamily: fonts.medium }}>
          {paymentProvider === 'dlocal' ? 'Pay in your local currency through dLocal’s secure checkout.' : 'Pay securely with card, Apple Pay or Google Pay.'}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 14, paddingHorizontal: 4 }}>
        <ShieldCheck size={16} color={colors.muted} />
        <Text v="small" color={colors.muted} style={{ flex: 1 }}>
          By paying you agree to our{' '}
          <Text v="small" color={colors.greenDeep} style={{ textDecorationLine: 'underline' }} onPress={() => WebBrowser.openBrowserAsync('https://www.giditour.com/cancellation-refund')}>cancellation & refund policy</Text>.
        </Text>
      </View>
    </View>
  );
}

import { goBack } from '@/lib/nav';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInLeft, FadeInRight, FadeOutLeft, FadeOutRight, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { StepAddons, StepDetails, StepReview, StepTours, StepWhen, type Details, type Errors } from '@/components/booking/Steps';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { openDlocalCheckout, payWithStripe, pollUntilSettled } from '@/features/payment';
import { useBootstrap } from '@/hooks/useBootstrap';
import { ApiError } from '@/lib/api';
import { countryDialCodes } from '@/lib/data';
import { EMAIL_RE } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { imageUrl } from '@/lib/sanity';
import { fetchBookingStatus, startBookingPayment, type BookingPayload } from '@/lib/services';
import { useAuth } from '@/stores/auth';
import { draftTotalGBP, useBookingDraft } from '@/stores/booking';
import { colors, fonts, springs } from '@/theme';

const LABELS = ['Tours', 'Dates', 'Extras', 'Details', 'Pay'];

export default function BookScreen() {
  const insets = useSafeAreaInsets();
  const status = useAuth((s) => s.status);
  const qc = useQueryClient();
  const boot = useBootstrap();
  const d = useBookingDraft();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [confirmClose, setConfirmClose] = useState(false);
  const [paying, setPaying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [details, setDetails] = useState<Details>({ name: '', email: '', dial: 'NG', phone: '' });
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    const c = boot.customer;
    if (!c || prefilled) return;
    const dial = countryDialCodes.find((x) => x.dialCode === c.phoneDialCode)?.code ?? countryDialCodes.find((x) => x.name === c.nationality)?.code ?? 'NG';
    setDetails({ name: c.name ?? '', email: c.email ?? '', dial, phone: c.phoneNumber ?? '' });
    if (!d.travelingFrom) d.patch({ travelingFrom: c.address?.country ?? c.nationality ?? '' });
    setPrefilled(true);
  }, [boot.customer]); // eslint-disable-line react-hooks/exhaustive-deps

  const progress = useAnimatedStyle(() => ({ width: `${((step + 1) / LABELS.length) * 100}%` }));
  const barAnim = useAnimatedStyle(() => ({ width: withSpring(`${((step + 1) / LABELS.length) * 100}%` as never, springs.soft) as never }));
  void progress;

  if (status === 'guest') return <Redirect href={{ pathname: '/login', params: { redirectTo: '/book' } }} />;

  const total = draftTotalGBP(d.tours);

  const validate = (s: number): Errors => {
    const e: Errors = {};
    if (s === 0 && (d.tours.length < 1 || d.tours.length > 20)) e.tours = 'Please select at least one tour to pay for.';
    if (s === 1) {
      if (!d.startDate || !d.endDate || d.endDate < d.startDate) e.dates = 'Please choose your travel dates.';
      if (!d.tripType) e.tripType = 'Choose a trip type.';
      if (!d.destination.trim()) e.destination = 'Where are you going?';
    }
    if (s === 3) {
      if (details.name.trim().length < 2) e.name = 'Please enter your full name.';
      if (!EMAIL_RE.test(details.email.trim())) e.email = 'Please enter a valid email address.';
      if (details.phone.trim() && !/^[\d\s().-]{6,20}$/.test(details.phone.trim())) e.phone = 'Please enter a valid phone number.';
    }
    return e;
  };

  const go = (to: number) => { setDir(to > step ? 1 : -1); setStep(to); };
  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) { haptic.error(); if (e.tours) toast.error(e.tours); return; }
    go(step + 1);
  };
  const back = () => (step === 0 ? requestClose() : go(step - 1));
  const requestClose = () => { if (step > 0 || d.tours.length) setConfirmClose(true); else goBack('/tours'); };

  const pay = async () => {
    if (paying) return;
    for (const s of [0, 1, 3]) {
      const e = validate(s);
      if (Object.keys(e).length) { setErrors(e); go(s); haptic.error(); return; }
    }
    setPaying(true);
    try {
      const dialCode = countryDialCodes.find((c) => c.code === details.dial)?.dialCode ?? '';
      const payload: BookingPayload = {
        name: details.name.trim(), email: details.email.trim().toLowerCase(),
        phone: [dialCode, details.phone.trim()].filter(Boolean).join(' '),
        travelingFrom: d.travelingFrom.trim(), notes: d.notes.trim(),
        destination: d.destination.trim(), tripType: d.tripType, startDate: d.startDate, endDate: d.endDate,
        flexibleDates: d.flexibleDates, travelers: Math.max(1, ...d.tours.map((t) => t.travelers)),
        addOns: d.addOns, customAddOn: d.addOns.includes('custom') ? d.customAddOn.trim() : '',
        tours: d.tours.map((t) => ({ id: t.slug, travelers: t.travelers, image: imageUrl(t.image) })),
      };
      const start = await startBookingPayment(boot.paymentProvider, payload, total);
      let ok = false;
      if (start.provider === 'stripe') {
        const res = await payWithStripe(start.clientSecret, { name: payload.name, email: payload.email });
        if (res.status === 'canceled') { toast.info('Payment cancelled. You have not been charged.'); return; }
        if (res.status === 'failed') { toast.error(res.message || 'Payment failed. Please try again.'); return; }
        ok = true;
      } else {
        await openDlocalCheckout(start.redirectUrl);
        setWaiting(true);
        const r = await pollUntilSettled(() => fetchBookingStatus(start.id), { tries: 20 });
        if (r === 'failed') { toast.error('Your payment did not go through.'); return; }
        ok = true; // pending still lands on the confirmation screen, which keeps checking
      }
      if (ok) {
        haptic.success();
        d.reset();
        qc.invalidateQueries({ queryKey: ['entries'] });
        router.replace({ pathname: '/book/confirmation', params: { id: start.id } });
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) { router.replace({ pathname: '/login', params: { redirectTo: '/book' } }); return; }
      toast.error(err instanceof ApiError ? err.message : 'Could not start your payment. Please try again.');
    } finally {
      setPaying(false);
      setWaiting(false);
    }
  };

  const Entering = dir > 0 ? FadeInRight : FadeInLeft;
  const Exiting = dir > 0 ? FadeOutLeft : FadeOutRight;

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={{ paddingTop: Platform.OS === 'ios' ? 18 : insets.top + 10, paddingHorizontal: 20, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <View>
            <Text v="caption" color={colors.green}>STEP {step + 1} OF {LABELS.length}</Text>
            <Text v="h3">{LABELS[step]}</Text>
          </View>
          <PressableScale onPress={requestClose} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} color={colors.ink} />
          </PressableScale>
        </View>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.sand, overflow: 'hidden' }}>
          <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: colors.green }, barAnim]} />
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Animated.View key={step} entering={Entering.springify().damping(20)} exiting={Exiting.duration(140)}>
            {step === 0 ? <StepTours error={errors.tours} /> : null}
            {step === 1 ? <StepWhen errors={errors} /> : null}
            {step === 2 ? <StepAddons /> : null}
            {step === 3 ? <StepDetails details={details} setDetails={setDetails} errors={errors} /> : null}
            {step === 4 ? <StepReview details={details} /> : null}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), backgroundColor: colors.cream, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {step > 0 ? <Button title="Back" variant="outline" full={false} size="lg" onPress={back} style={{ paddingHorizontal: 22 }} /> : null}
        <View style={{ flex: 1 }}>
          {step < 4 ? (
            <Button title={`Continue · ${boot.money(total)}`} onPress={next} />
          ) : (
            <Button title={`Pay ${boot.money(total)}`} variant="accent" loading={paying} onPress={pay} />
          )}
        </View>
      </View>

      <Sheet visible={confirmClose} onClose={() => setConfirmClose(false)} title="Leave booking?">
        <Text v="body" color={colors.muted} style={{ marginBottom: 18 }}>Your tour choices are saved, but you’ll need to come back to finish paying.</Text>
        <Button title="Keep booking" onPress={() => setConfirmClose(false)} style={{ marginBottom: 10 }} />
        <Button title="Leave" variant="outline" onPress={() => { setConfirmClose(false); goBack('/tours'); }} />
      </Sheet>
      <ProcessingOverlay visible={waiting} />
    </View>
  );
}

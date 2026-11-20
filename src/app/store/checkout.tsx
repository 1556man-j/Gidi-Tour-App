import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard, Gift, Lock, Truck } from 'lucide-react-native';
import { ProcessingOverlay } from '@/components/ProcessingOverlay';
import { AppImage } from '@/components/ui/AppImage';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Reveal } from '@/components/ui/Reveal';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useBootstrap } from '@/hooks/useBootstrap';
import { openDlocalCheckout, payWithStripe, pollUntilSettled } from '@/features/payment';
import { ApiError } from '@/lib/api';
import { EMAIL_RE } from '@/lib/format';
import { fetchOrderStatus, startStoreCheckout } from '@/lib/services';
import { useAuth } from '@/stores/auth';
import { cartSubtotal, useCart } from '@/stores/cart';
import { colors, fonts, radius, shadow } from '@/theme';

type Errors = Record<string, string>;

function Card({ title, icon, children, index }: { title: string; icon: React.ReactNode; children: React.ReactNode; index: number }) {
  return (
    <Reveal index={index} style={[{ backgroundColor: colors.white, borderRadius: radius.xl, padding: 18, marginBottom: 16 }, shadow.card]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
        <Text v="h3">{title}</Text>
      </View>
      {children}
    </Reveal>
  );
}

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { money, paymentProvider, customer } = useBootstrap();
  const authed = useAuth((s) => s.status === 'authed');
  const items = useCart((s) => s.items);
  const subtotal = cartSubtotal(items);
  const hasMerch = items.some((i) => i.category === 'merchandise');
  const allFree = subtotal === 0 && !hasMerch;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postcode, setPostcode] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (customer) {
      setName((v) => v || customer.name || '');
      setEmail((v) => v || customer.email || '');
      setCountry((v) => v || customer.address?.country || '');
      setAddress((v) => v || customer.address?.line1 || '');
      setCity((v) => v || customer.address?.city || '');
      setPostcode((v) => v || customer.address?.postalCode || '');
    }
  }, [customer]);

  if (items.length === 0 && !done.current && !busy) return <Redirect href="/store" />;

  const validate = () => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Please enter your full name.';
    if (!EMAIL_RE.test(email.trim())) e.email = 'Please enter a valid email address.';
    if (hasMerch) {
      if (!address.trim()) e.address = 'Street address is required.';
      if (!city.trim()) e.city = 'City is required.';
      if (!country.trim()) e.country = 'Country is required.';
      if (!postcode.trim()) e.postcode = 'Postcode is required.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const finish = (id: string) => {
    done.current = true;
    useCart.getState().clear();
    router.replace(`/store/confirmation?id=${encodeURIComponent(id)}`);
  };

  const pay = async () => {
    if (busy || !validate()) return;
    setBusy(true);
    try {
      const provider = allFree ? 'free' : paymentProvider;
      const payload = {
        name: name.trim(), email: email.trim().toLowerCase(),
        items: items.map((i) => ({ id: i.id, quantity: i.quantity, variant: i.variant })),
        ...(hasMerch ? { shipping: { address: address.trim(), city: city.trim(), country: country.trim(), postcode: postcode.trim() } } : {}),
      };
      const titles = Object.fromEntries(items.map((i) => [i.id, { title: i.title, price: i.price, category: i.category }]));
      const start = await startStoreCheckout(provider, payload, { subtotalGBP: subtotal, titles });

      if (start.provider === 'free') return finish(start.id);

      if (start.provider === 'stripe') {
        const res = await payWithStripe(start.clientSecret, { name: payload.name, email: payload.email });
        if (res.status === 'canceled') { toast.info('Payment cancelled. Your bag is safe.'); return; }
        if (res.status === 'failed') { toast.error(res.message ?? 'Payment failed. Please try again.'); return; }
        setWaiting(true);
        const r = await pollUntilSettled(() => fetchOrderStatus(start.id), { tries: 8 });
        setWaiting(false);
        if (r === 'failed') { toast.error('Your payment could not be confirmed.'); return; }
        return finish(start.id);
      }

      await openDlocalCheckout(start.redirectUrl);
      setWaiting(true);
      const r = await pollUntilSettled(() => fetchOrderStatus(start.id));
      setWaiting(false);
      if (r === 'failed') toast.error('Your payment did not go through.');
      else finish(start.id);
    } catch (err) {
      setWaiting(false);
      if (err instanceof ApiError) {
        if (err.fieldErrors) setErrors(err.fieldErrors);
        toast.error(err.message);
      } else toast.error('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const note = allFree ? 'No payment needed. We will email your download links.'
    : paymentProvider === 'dlocal' ? 'Pay in your local currency securely via dLocal.'
    : 'Pay securely with card, Apple Pay or Google Pay.';

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <BackButton />
        <Text v="h2">Checkout</Text>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 190 }} showsVerticalScrollIndicator={false}>
        <Card index={0} title="Your details" icon={<Gift size={17} color={colors.greenDeep} />}>
          <Input label="Full name" value={name} onChangeText={setName} error={errors.name} autoComplete="name" />
          <Input label="Email" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          {!authed ? <Text v="small" color={colors.muted}>Checking out as a guest. Sign in anytime to see your orders in the app.</Text> : null}
        </Card>

        {hasMerch ? (
          <Card index={1} title="Shipping" icon={<Truck size={17} color={colors.greenDeep} />}>
            <Input label="Street address" value={address} onChangeText={setAddress} error={errors.address} autoComplete="street-address" />
            <Input label="City" value={city} onChangeText={setCity} error={errors.city} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><Input label="Postcode" value={postcode} onChangeText={setPostcode} error={errors.postcode} autoCapitalize="characters" /></View>
              <View style={{ flex: 1 }}><Input label="Country" value={country} onChangeText={setCountry} error={errors.country} /></View>
            </View>
          </Card>
        ) : null}

        <Card index={2} title="Order summary" icon={<CreditCard size={17} color={colors.greenDeep} />}>
          {items.map((it) => (
            <View key={`${it.id}|${it.variant ?? ''}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <AppImage img={it.image} width={200} style={{ width: 52, height: 58, borderRadius: 12 }} />
              <View style={{ flex: 1 }}>
                <Text v="bodyStrong" numberOfLines={1}>{it.title}</Text>
                <Text v="small" color={colors.muted}>{[it.variant, `Qty ${it.quantity}`].filter(Boolean).join(' · ')}</Text>
              </View>
              <Text v="bodyStrong" color={it.price === 0 ? colors.green : colors.ink}>{it.price === 0 ? 'Free' : money(it.price * it.quantity)}</Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 6 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
            <Text v="body" color={colors.muted}>Total</Text>
            <Text style={{ fontFamily: fonts.bold, fontSize: 26, letterSpacing: -0.8 }}>{subtotal === 0 ? 'Free' : money(subtotal)}</Text>
          </View>
        </Card>

        <Reveal index={3} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingHorizontal: 6 }}>
          <Lock size={16} color={colors.greenDeep} />
          <Text v="small" color={colors.muted} style={{ flex: 1 }}>{note}</Text>
        </Reveal>
      </ScrollView>

      <View style={[{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 12, backgroundColor: colors.white, borderRadius: 32, padding: 12 }, shadow.float]}>
        <Button title={allFree ? 'Get my free issue' : `Pay ${money(subtotal)}`} variant={allFree ? 'accent' : 'primary'} loading={busy && !waiting} onPress={pay} />
      </View>
      <ProcessingOverlay visible={waiting} />
    </View>
  );
}

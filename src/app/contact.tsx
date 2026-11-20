import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/ui/Input';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { Select } from '@/components/ui/Select';
import { SuccessCheck } from '@/components/ui/SuccessCheck';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useBootstrap } from '@/hooks/useBootstrap';
import { ApiError } from '@/lib/api';
import { EMAIL_RE } from '@/lib/format';
import { sendContact } from '@/lib/services';
import { colors, radius, shadow } from '@/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

const INTERESTS = ['Trip enquiry', 'Group / custom tour', 'Partnership', 'Press', 'General'];

function Method({ icon, label, value, onPress }: { icon: React.ReactNode; label: string; value: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} style={[{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderRadius: radius.lg, padding: 14 }, shadow.card]}>
      <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text v="caption" color={colors.muted}>{label}</Text>
        <Text v="bodyStrong" numberOfLines={1}>{value}</Text>
      </View>
    </PressableScale>
  );
}

export default function Contact() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ subject?: string; interest?: string }>();
  const { siteSettings: s, customer } = useBootstrap();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState(params.interest ?? params.subject ?? '');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (customer) { setName((n) => n || customer.name || ''); setEmail((e) => e || customer.email || ''); }
  }, [customer]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Please enter your full name.';
    if (!EMAIL_RE.test(email.trim())) e.email = 'Please enter a valid email address.';
    if (message.trim().length < 10) e.message = 'Message should be at least 10 characters.';
    if (phone.trim() && !/^[+\d][\d\s().-]{6,20}$/.test(phone.trim())) e.phone = 'Please enter a valid phone number, with country code if outside your home country.';
    return e;
  };

  const submit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await sendContact({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, interest: interest || undefined, message: message.trim() });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) { if (err.fieldErrors) setErrors(err.fieldErrors); toast.error(err.message); }
      else toast.error('Could not send your message. Please try again.');
    } finally { setLoading(false); }
  };

  const digits = (s?.whatsapp ?? '').replace(/\D/g, '');
  const reset = () => { setDone(false); setMessage(''); setInterest(''); };

  return (
    <Screen>
      <Header title="Contact" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 14 }}>
          <Reveal><Heading before="Let's plan" accent="something" size={36} /></Reveal>
          <Reveal index={1}><Text color={colors.muted}>Questions about a destination, a custom itinerary, a group trip, or just want to say hello? We usually reply within 24 hours.</Text></Reveal>
          <View style={{ gap: 10, marginTop: 6 }}>
            {digits ? <Reveal index={2}><Method icon={<MessageCircle size={22} color={colors.greenDeep} />} label="WHATSAPP" value={s?.whatsapp ?? ''} onPress={() => Linking.openURL(`https://wa.me/${digits}`)} /></Reveal> : null}
            {s?.email ? <Reveal index={3}><Method icon={<Mail size={22} color={colors.greenDeep} />} label="EMAIL" value={s.email} onPress={() => Linking.openURL(`mailto:${s.email}`)} /></Reveal> : null}
            {s?.phone ? <Reveal index={4}><Method icon={<Phone size={22} color={colors.greenDeep} />} label="PHONE" value={s.phone} onPress={() => Linking.openURL(`tel:${s.phone}`)} /></Reveal> : null}
            {s?.address ? <Reveal index={5}><Method icon={<MapPin size={22} color={colors.greenDeep} />} label="OFFICE" value={s.address} onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(s.address!)}`)} /></Reveal> : null}
          </View>

          <View style={[{ backgroundColor: colors.card, borderRadius: radius.xl, padding: 20, marginTop: 14 }, shadow.card]}>
            {done ? (
              <Animated.View entering={FadeInDown.springify()} style={{ alignItems: 'center', gap: 12, paddingVertical: 24 }}>
                <SuccessCheck size={110} />
                <Text v="h2" center>Message sent!</Text>
                <Text color={colors.muted} center>Thanks {name.split(' ')[0]}, we'll get back to you very soon.</Text>
                <View style={{ alignSelf: 'stretch', marginTop: 8 }}><Button title="Send another" variant="soft" onPress={reset} /></View>
              </Animated.View>
            ) : (
              <>
                <Text v="h2" style={{ marginBottom: 16 }}>Send us a message</Text>
                <Input label="Full name" value={name} onChangeText={setName} error={errors.name} autoCapitalize="words" />
                <Input label="Email" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
                <Input label="Phone (optional)" value={phone} onChangeText={setPhone} error={errors.phone} keyboardType="phone-pad" />
                <Select label="What's it about? (optional)" value={interest} searchable={false} options={INTERESTS.map((i) => ({ label: i, value: i }))} onChange={(v) => setInterest(v)} />
                <Input label="Your message" value={message} onChangeText={setMessage} error={errors.message} multiline />
                <Button title="Send message" onPress={submit} loading={loading} />
              </>
            )}
          </View>

          {s?.socials?.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
              {s.socials.map((so) => (
                <PressableScale key={so.platform} onPress={() => Linking.openURL(so.url)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white, paddingHorizontal: 16, height: 44, borderRadius: 22 }}>
                  <Globe size={16} color={colors.greenDeep} />
                  <Text v="bodyStrong" style={{ textTransform: 'capitalize' }}>{so.platform}</Text>
                </PressableScale>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

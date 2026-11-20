import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInRight, FadeOutLeft, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Check, Eye, EyeOff } from 'lucide-react-native';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PressableScale } from '@/components/ui/PressableScale';
import { Select } from '@/components/ui/Select';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api';
import { countryDialCodes } from '@/lib/data';
import { EMAIL_RE } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { signup } from '@/lib/services';
import { colors, fonts, springs } from '@/theme';

type F = { name: string; email: string; password: string; nationality: string; dial: string; phone: string };
const nations = countryDialCodes.map((c) => ({ label: c.name, value: c.name, sub: c.dialCode }));
const dials = countryDialCodes.map((c) => ({ label: `${c.name} (${c.dialCode})`, value: `${c.code}|${c.dialCode}` }));

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) s++;
  return s;
}

function Bar({ on, color }: { on: boolean; color: string }) {
  const a = useAnimatedStyle(() => ({ flex: withSpring(on ? 1 : 0.35, springs.snappy), backgroundColor: on ? color : colors.line }));
  return <Animated.View style={[{ height: 6, borderRadius: 3 }, a]} />;
}

export default function Signup() {
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<F>({ name: '', email: '', password: '', nationality: '', dial: '', phone: '' });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof F) => (v: string) => { setF((p) => ({ ...p, [k]: v })); if (errs[k]) setErrs((e) => ({ ...e, [k]: '' })); };
  const sc = strength(f.password);
  const scColor = sc <= 1 ? colors.danger : sc === 2 ? colors.orange : colors.green;
  const dialCode = f.dial.split('|')[1] ?? '';

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (f.name.trim().length < 2) e.name = 'Please enter your full name.';
      if (!EMAIL_RE.test(f.email.trim())) e.email = 'Please enter a valid email address.';
      if (f.password.length < 8) e.password = 'Password must be at least 8 characters.';
    }
    if (s === 1) {
      if (!f.nationality) e.nationality = 'Please select your nationality.';
      if (f.phone.trim().length < 6) e.phone = 'Please enter a valid phone number.';
    }
    setErrs(e);
    if (Object.keys(e).length) haptic.error();
    return !Object.keys(e).length;
  };

  const next = async () => {
    if (step < 2) { if (validate(step)) { haptic.select(); setStep(step + 1); } return; }
    setLoading(true);
    try {
      const r = await signup({ name: f.name.trim(), email: f.email.trim().toLowerCase(), password: f.password, nationality: f.nationality, phoneDialCode: dialCode, phoneNumber: f.phone.trim() });
      haptic.success();
      router.replace({ pathname: '/verify-sent', params: { email: f.email.trim().toLowerCase(), emailSent: r.emailSent ? '1' : '0' } });
    } catch (err) {
      const a = err as ApiError;
      if (a.fieldErrors) {
        const m: Record<string, string> = { ...a.fieldErrors };
        if (m.phoneNumber) m.phone = m.phoneNumber;
        setErrs(m);
        setStep(m.name || m.email || m.password ? 0 : 1);
      }
      toast.error(a.message);
      setLoading(false);
    }
  };

  const titles = [{ b: 'Create your', a: 'account.' }, { b: 'A little more', a: 'about you.' }, { b: 'Looks', a: 'good?' }];
  const t = titles[step];
  const row = (k: string, v: string) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line }}>
      <Text v="body" color={colors.muted}>{k}</Text><Text v="bodyStrong">{v}</Text>
    </View>
  );
  const progress = useMemo(() => [0, 1, 2], []);

  return (
    <AuthShell before={t.b} accent={t.a} subtitle={`Step ${step + 1} of 3`} back={step > 0} onBack={step > 0 ? () => setStep(step - 1) : undefined}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>{progress.map((i) => <Bar key={i} on={i <= step} color={colors.green} />)}</View>
      <Animated.View key={step} entering={FadeInRight.springify().damping(18)} exiting={FadeOutLeft.duration(150)}>
        {step === 0 ? (
          <>
            <Input label="Full name" value={f.name} onChangeText={set('name')} error={errs.name} autoComplete="name" textContentType="name" />
            <Input label="Email" value={f.email} onChangeText={set('email')} error={errs.email} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
            <Input label="Password" value={f.password} onChangeText={set('password')} error={errs.password} secureTextEntry={!show} autoCapitalize="none" textContentType="newPassword"
              right={<PressableScale hapticOnPress={false} onPress={() => setShow(!show)} style={{ padding: 6 }}>{show ? <EyeOff size={20} color={colors.muted} /> : <Eye size={20} color={colors.muted} />}</PressableScale>} />
            {f.password ? (
              <View style={{ marginTop: -4, marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>{[1, 2, 3, 4].map((i) => <Bar key={i} on={sc >= i} color={scColor} />)}</View>
                <Text v="small" color={scColor} style={{ marginTop: 6, fontFamily: fonts.semibold }}>{['Too short', 'Weak', 'Okay', 'Good', 'Strong'][sc]}</Text>
              </View>
            ) : null}
          </>
        ) : step === 1 ? (
          <>
            <Select label="Nationality" value={f.nationality} options={nations} onChange={(v, o) => { set('nationality')(v); const c = countryDialCodes.find((x) => x.name === o.value); if (c && !f.dial) set('dial')(`${c.code}|${c.dialCode}`); }} error={errs.nationality} />
            <Select label="Phone country code" value={f.dial} options={dials} onChange={(v) => set('dial')(v)} display={() => (dialCode ? dialCode : '')} />
            <Input label="Phone number" value={f.phone} onChangeText={set('phone')} error={errs.phone} keyboardType="phone-pad" autoComplete="tel" />
          </>
        ) : (
          <View style={{ backgroundColor: colors.white, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 8 }}>
            {row('Name', f.name)}{row('Email', f.email)}{row('Nationality', f.nationality)}{row('Phone', `${dialCode} ${f.phone}`)}
            <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 14, alignItems: 'center' }}>
              <Check size={18} color={colors.green} /><Text v="small" color={colors.muted} style={{ flex: 1 }}>We’ll email you a link to confirm your address before you can sign in.</Text>
            </View>
          </View>
        )}
      </Animated.View>
      <View style={{ height: 20 }} />
      <Button title={step < 2 ? 'Continue' : 'Create account'} loading={loading} onPress={next} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 22 }}>
        <Text v="body" color={colors.muted}>Already have an account?</Text>
        <Link href={{ pathname: '/login', params: redirectTo ? { redirectTo } : {} }}><Text style={{ fontFamily: fonts.bold }} color={colors.orange}>Sign in</Text></Link>
      </View>
    </AuthShell>
  );
}

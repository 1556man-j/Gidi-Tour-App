import { useState } from 'react';
import { View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, MailWarning } from 'lucide-react-native';
import { AuthShell, Banner } from '@/components/auth/AuthShell';
import { GoogleButton, OrDivider } from '@/components/GoogleButton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api';
import { EMAIL_RE } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { login, resendVerification } from '@/lib/services';
import { useAuth } from '@/stores/auth';
import { colors, fonts } from '@/theme';

export default function Login() {
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const signIn = useAuth((s) => s.signIn);
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [formError, setFormError] = useState('');

  const submit = async () => {
    const e: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Enter your password.';
    setErrors(e); setFormError(''); setUnverified(false);
    if (Object.keys(e).length) { haptic.error(); return; }
    setLoading(true);
    try {
      const r = await login(email.trim().toLowerCase(), password);
      await signIn(r.token, r.user);
      qc.invalidateQueries({ queryKey: ['bootstrap'] });
      haptic.success();
      router.replace((redirectTo as never) ?? '/');
    } catch (err) {
      const a = err as ApiError;
      if (a.status === 403 && a.code === 'unverified') setUnverified(true);
      else setFormError(a.message || 'Could not sign you in.');
      haptic.error();
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try { await resendVerification(email.trim().toLowerCase(), password); toast.success('Confirmation email sent. Check your inbox.'); }
    catch (err) { toast.error((err as Error).message); }
    setResending(false);
  };

  return (
    <AuthShell before="Welcome" accent="back." subtitle="Sign in to book tours, track trips and pick up where you left off.">
      {unverified ? (
        <Reveal><Banner tone="warn">
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <MailWarning size={22} color="#B25B05" />
            <Text v="bodyStrong" style={{ flex: 1 }}>Please confirm your email first</Text>
          </View>
          <Text v="small" color={colors.muted}>We sent a link when you signed up. Tap it, then sign in. Can’t find it?</Text>
          <Button title="Resend confirmation email" variant="dark" size="sm" full={false} loading={resending} onPress={resend} />
        </Banner></Reveal>
      ) : null}
      {formError ? <Reveal><Banner tone="error"><Text v="bodyStrong" color={colors.danger}>{formError}</Text></Banner></Reveal> : null}
      <Reveal index={1}>
        <Input label="Email" value={email} onChangeText={setEmail} error={errors.email} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" returnKeyType="next" />
        <Input label="Password" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry={!show} autoCapitalize="none" textContentType="password" returnKeyType="go" onSubmitEditing={submit}
          right={<PressableScale hapticOnPress={false} onPress={() => setShow(!show)} style={{ padding: 6 }}>{show ? <EyeOff size={20} color={colors.muted} /> : <Eye size={20} color={colors.muted} />}</PressableScale>} />
        <View style={{ alignItems: 'flex-end', marginTop: -4, marginBottom: 18 }}>
          <Link href="/forgot-password"><Text v="bodyStrong" color={colors.greenDeep}>Forgot password?</Text></Link>
        </View>
        <Button title="Sign in" loading={loading} onPress={submit} />
      </Reveal>
      <Reveal index={2}>
        <OrDivider />
        <GoogleButton redirectTo={redirectTo} />
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 26 }}>
          <Text v="body" color={colors.muted}>New to Gidi Tour?</Text>
          <Link href={{ pathname: '/signup', params: redirectTo ? { redirectTo } : {} }}><Text style={{ fontFamily: fonts.bold }} color={colors.orange}>Create an account</Text></Link>
        </View>
      </Reveal>
    </AuthShell>
  );
}

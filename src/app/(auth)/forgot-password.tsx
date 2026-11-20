import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MailCheck } from 'lucide-react-native';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Reveal } from '@/components/ui/Reveal';
import { Text } from '@/components/ui/Text';
import { EMAIL_RE } from '@/lib/format';
import { forgotPassword } from '@/lib/services';
import { colors } from '@/theme';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!EMAIL_RE.test(email.trim())) return setErr('Enter a valid email address.');
    setErr(''); setLoading(true);
    try { await forgotPassword(email.trim().toLowerCase()); setSent(true); }
    catch (e) { setErr((e as Error).message); }
    setLoading(false);
  };

  return (
    <AuthShell back before="Forgot your" accent="password?" subtitle="No problem. Enter your email and we’ll send you a link to choose a new one.">
      {sent ? (
        <Animated.View entering={FadeInDown.springify()} style={{ backgroundColor: colors.white, borderRadius: 28, padding: 24, alignItems: 'center', gap: 12 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }}><MailCheck size={32} color={colors.greenDeep} /></View>
          <Text v="h2" center>Check your inbox</Text>
          <Text v="body" color={colors.muted} center>If an account exists for {email.trim()}, a reset link is on its way. It expires in 30 minutes.</Text>
          <Button title="Enter reset code" variant="soft" onPress={() => router.push('/reset-password')} />
          <Button title="Back to sign in" variant="ghost" onPress={() => router.replace('/login')} />
        </Animated.View>
      ) : (
        <Reveal>
          <Input label="Email" value={email} onChangeText={setEmail} error={err} autoCapitalize="none" keyboardType="email-address" autoComplete="email" returnKeyType="go" onSubmitEditing={submit} />
          <Button title="Send reset link" loading={loading} onPress={submit} />
        </Reveal>
      )}
    </AuthShell>
  );
}

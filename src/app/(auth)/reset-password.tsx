import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ShieldCheck } from 'lucide-react-native';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Reveal } from '@/components/ui/Reveal';
import { Text } from '@/components/ui/Text';
import { resetPassword } from '@/lib/services';
import { colors } from '@/theme';

export default function Reset() {
  const params = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(params.token ?? '');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!token.trim()) e.token = 'Paste the code from your reset email.';
    if (pw.length < 8) e.pw = 'Password must be at least 8 characters.';
    if (pw2 !== pw) e.pw2 = 'Passwords do not match.';
    setErrs(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try { await resetPassword(token.trim(), pw); setDone(true); }
    catch (err) { setErrs({ token: (err as Error).message }); }
    setLoading(false);
  };

  return (
    <AuthShell back before="Choose a new" accent="password." subtitle="Pick something at least 8 characters long.">
      {done ? (
        <Animated.View entering={FadeInDown.springify()} style={{ backgroundColor: colors.white, borderRadius: 28, padding: 24, alignItems: 'center', gap: 12 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={32} color={colors.greenDeep} /></View>
          <Text v="h2" center>Password updated</Text>
          <Text v="body" color={colors.muted} center>You can now sign in with your new password.</Text>
          <Button title="Sign in" onPress={() => router.replace('/login')} />
        </Animated.View>
      ) : (
        <Reveal>
          {params.token ? null : <Input label="Reset code (from your email link)" value={token} onChangeText={setToken} error={errs.token} autoCapitalize="none" autoCorrect={false} />}
          {params.token && errs.token ? <Text v="small" color={colors.danger} style={{ marginBottom: 10 }}>{errs.token}</Text> : null}
          <Input label="New password" value={pw} onChangeText={setPw} error={errs.pw} secureTextEntry autoCapitalize="none" textContentType="newPassword" />
          <Input label="Confirm password" value={pw2} onChangeText={setPw2} error={errs.pw2} secureTextEntry autoCapitalize="none" returnKeyType="go" onSubmitEditing={submit} />
          <Button title="Update password" loading={loading} onPress={submit} />
        </Reveal>
      )}
    </AuthShell>
  );
}

import { useState } from 'react';
import { View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { loginWithGoogle } from '@/lib/services';
import { useAuth } from '@/stores/auth';
import { colors } from '@/theme';

export function GIcon() {
  return <Text style={{ fontFamily: 'Geist_800ExtraBold', fontSize: 18 }} color="#4285F4">G</Text>;
}

/** Sends Google's ID token to the website, stores the session, then leaves the sign-in page. */
export function useGoogleFinish(redirectTo?: string) {
  const signIn = useAuth((s) => s.signIn);
  const qc = useQueryClient();
  return async (idToken: string) => {
    const r = await loginWithGoogle(idToken);
    await signIn(r.token, r.user);
    qc.invalidateQueries({ queryKey: ['bootstrap'] });
    router.replace((redirectTo as never) ?? '/');
  };
}

export function MockGoogle({ redirectTo }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false);
  const finish = useGoogleFinish(redirectTo);
  return (
    <Button title="Continue with Google" variant="outline" icon={<GIcon />} loading={loading}
      onPress={async () => { setLoading(true); try { await finish('mock'); } catch (e) { toast.error((e as Error).message); setLoading(false); } }} />
  );
}

export function OrDivider() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
      <Text v="small" color={colors.faint}>or</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
    </View>
  );
}

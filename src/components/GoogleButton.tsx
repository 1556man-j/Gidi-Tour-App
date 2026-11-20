import { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { Text } from '@/components/ui/Text';
import { env } from '@/lib/env';
import { loginWithGoogle } from '@/lib/services';
import { useAuth } from '@/stores/auth';
import { colors } from '@/theme';

WebBrowser.maybeCompleteAuthSession();

function GIcon() {
  return <Text style={{ fontFamily: 'Geist_800ExtraBold', fontSize: 18 }} color="#4285F4">G</Text>;
}

function useFinish(redirectTo?: string) {
  const signIn = useAuth((s) => s.signIn);
  const qc = useQueryClient();
  return async (idToken: string) => {
    const r = await loginWithGoogle(idToken);
    await signIn(r.token, r.user);
    qc.invalidateQueries({ queryKey: ['bootstrap'] });
    router.replace((redirectTo as never) ?? '/');
  };
}

function MockGoogle({ redirectTo }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false);
  const finish = useFinish(redirectTo);
  return (
    <Button title="Continue with Google" variant="outline" icon={<GIcon />} loading={loading}
      onPress={async () => { setLoading(true); try { await finish('mock'); } catch (e) { toast.error((e as Error).message); setLoading(false); } }} />
  );
}

function RealGoogle({ redirectTo }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false);
  const finish = useFinish(redirectTo);
  const [request, response, prompt] = Google.useIdTokenAuthRequest({
    webClientId: env.googleWebClientId || undefined,
    iosClientId: env.googleIosClientId || undefined,
    androidClientId: env.googleAndroidClientId || undefined,
  });
  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const idToken = (response.params as Record<string, string>).id_token;
      if (idToken) finish(idToken).catch((e) => { toast.error((e as Error).message); setLoading(false); });
      else { toast.error('Google did not return a sign-in token.'); setLoading(false); }
    } else setLoading(false);
  }, [response]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Button title="Continue with Google" variant="outline" icon={<GIcon />} loading={loading} disabled={!request}
      onPress={async () => {
        setLoading(true);
        try { await prompt(); } catch (e) {
          toast.error(/BLOCKED/.test(String((e as Error)?.message) + String((e as { code?: string })?.code))
            ? 'Your browser blocked the Google pop-up. Allow pop-ups for this page and try again.'
            : 'Could not open Google sign-in.');
          setLoading(false);
        }
      }} />
  );
}

export function GoogleButton({ redirectTo }: { redirectTo?: string }) {
  if (env.mock) return <MockGoogle redirectTo={redirectTo} />;
  if (!env.googleWebClientId && !env.googleIosClientId && !env.googleAndroidClientId) return null;
  return <RealGoogle redirectTo={redirectTo} />;
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

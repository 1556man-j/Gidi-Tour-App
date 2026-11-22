import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { env } from '@/lib/env';
import { GIcon, MockGoogle, OrDivider, useGoogleFinish } from './googleShared';

WebBrowser.maybeCompleteAuthSession();

function RealGoogle({ redirectTo }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false);
  const finish = useGoogleFinish(redirectTo);
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

export { OrDivider };

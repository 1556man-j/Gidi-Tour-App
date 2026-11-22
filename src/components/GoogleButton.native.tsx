import { useState } from 'react';
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { env } from '@/lib/env';
import { GIcon, MockGoogle, OrDivider, useGoogleFinish } from './googleShared';

let configured = false;
function configure() {
  if (configured) return;
  // webClientId makes Google return an ID token the website can verify (same client as the website's own Google login).
  GoogleSignin.configure({ webClientId: env.googleWebClientId, iosClientId: env.googleIosClientId || undefined });
  configured = true;
}

function NativeGoogle({ redirectTo }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false);
  const finish = useGoogleFinish(redirectTo);
  const press = async () => {
    setLoading(true);
    try {
      configure();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true }).catch(() => true);
      const res = await GoogleSignin.signIn();
      if (res.type !== 'success') { setLoading(false); return; } // the person closed the Google sheet
      const idToken = res.data.idToken;
      if (!idToken) throw new Error('Google did not return a sign-in token.');
      await finish(idToken);
    } catch (e) {
      if (isErrorWithCode(e) && e.code === statusCodes.IN_PROGRESS) return;
      console.warn('[google] sign-in failed', e);
      const msg = (e as Error)?.message ?? '';
      toast.error(/developer|10:|12500/i.test(msg) ? 'Google sign-in is not set up for this build yet.' : msg || 'Could not sign in with Google.');
      setLoading(false);
    }
  };
  return <Button title="Continue with Google" variant="outline" icon={<GIcon />} loading={loading} onPress={press} />;
}

export function GoogleButton({ redirectTo }: { redirectTo?: string }) {
  if (env.mock) return <MockGoogle redirectTo={redirectTo} />;
  if (!env.googleWebClientId) return null;
  return <NativeGoogle redirectTo={redirectTo} />;
}

export { OrDivider };

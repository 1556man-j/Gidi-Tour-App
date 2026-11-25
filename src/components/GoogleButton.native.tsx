import { useState } from 'react';
import { Platform, TurboModuleRegistry } from 'react-native';
import type * as GoogleSigninModule from '@react-native-google-signin/google-signin';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { env } from '@/lib/env';
import { GIcon, MockGoogle, OrDivider, useGoogleFinish } from './googleShared';

// Expo Go doesn't contain the native Google module, so load it lazily and only when it exists (installed APK / dev build).
const hasNative = !!TurboModuleRegistry.get('RNGoogleSignin');
const lib = (): typeof GoogleSigninModule => require('@react-native-google-signin/google-signin');

let configured = false;
function configure() {
  if (configured) return;
  // webClientId makes Google return an ID token the website can verify (same client as the website's own Google login).
  lib().GoogleSignin.configure({ webClientId: env.googleWebClientId, iosClientId: env.googleIosClientId || undefined });
  configured = true;
}

function NativeGoogle({ redirectTo }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false);
  const finish = useGoogleFinish(redirectTo);
  const press = async () => {
    if (Platform.OS === 'ios' && !env.googleIosClientId) { toast.error('Google sign-in is not set up for iPhone yet.'); return; }
    setLoading(true);
    try {
      configure();
      const { GoogleSignin } = lib();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true }).catch(() => true);
      const res = await GoogleSignin.signIn();
      if (res.type !== 'success') { setLoading(false); return; } // the person closed the Google sheet
      const idToken = res.data.idToken;
      if (!idToken) throw new Error('Google did not return a sign-in token.');
      await finish(idToken);
    } catch (e) {
      if (hasNative && lib().isErrorWithCode(e) && e.code === lib().statusCodes.IN_PROGRESS) return;
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
  if (!hasNative) return <Button title="Continue with Google" variant="outline" icon={<GIcon />} onPress={() => toast.error('Google sign-in works in the installed app, not in Expo Go.')} />;
  return <NativeGoogle redirectTo={redirectTo} />;
}

export { OrDivider };

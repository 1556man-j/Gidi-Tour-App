import { useState } from 'react';
import { Platform, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { toast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import type { AuthResult } from '@/lib/services';
import { useAuth } from '@/stores/auth';

/** "Continue with Apple". iPhone only (Apple's rule 4.8 asks for it next to Google). */
export function AppleButton({ redirectTo }: { redirectTo?: string }) {
  const signIn = useAuth((s) => s.signIn);
  const [busy, setBusy] = useState(false);
  if (Platform.OS !== 'ios') return null;

  const press = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const cred = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });
      if (!cred.identityToken) throw new Error('Apple did not return a sign-in token.');
      const fullName = [cred.fullName?.givenName, cred.fullName?.familyName].filter(Boolean).join(' ');
      const r = await api<AuthResult>('/api/mobile/apple', { body: { identityToken: cred.identityToken, fullName }, auth: false });
      await signIn(r.token, r.user);
      router.replace((redirectTo as never) ?? '/');
    } catch (e) {
      // Closing the Apple sheet is not an error.
      if ((e as { code?: string }).code !== 'ERR_REQUEST_CANCELED') toast.error((e as Error).message || 'Apple sign-in failed.');
      setBusy(false);
    }
  };

  return (
    <View style={{ marginTop: 12, opacity: busy ? 0.6 : 1 }}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={28}
        style={{ width: '100%', height: 56 }}
        onPress={press}
      />
    </View>
  );
}

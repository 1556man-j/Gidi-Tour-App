import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Mail } from 'lucide-react-native';
import { AuthShell, Banner } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Reveal } from '@/components/ui/Reveal';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { resendVerification } from '@/lib/services';
import { colors, springs } from '@/theme';

function MailArt() {
  const pop = useSharedValue(0);
  const float = useSharedValue(0);
  const ring = useSharedValue(0);
  useEffect(() => {
    pop.value = withSpring(1, springs.bouncy);
    float.value = withDelay(500, withRepeat(withSequence(withTiming(-8, { duration: 1300, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1300, easing: Easing.inOut(Easing.sin) })), -1));
    ring.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.cubic) }), -1);
  }, [pop, float, ring]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }, { translateY: float.value }] }));
  const r = useAnimatedStyle(() => ({ opacity: 0.45 * (1 - ring.value), transform: [{ scale: 0.7 + ring.value * 0.9 }] }));
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: 150, marginBottom: 8 }}>
      <Animated.View style={[{ position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: colors.green }, r]} />
      <Animated.View style={[{ width: 104, height: 104, borderRadius: 34, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }] }, a]}>
        <Mail size={48} color={colors.white} />
        <View style={{ position: 'absolute', top: -6, right: -6, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.orange, borderWidth: 3, borderColor: colors.cream }} />
      </Animated.View>
    </View>
  );
}

export default function VerifySent() {
  const { email = '', emailSent = '1' } = useLocalSearchParams<{ email?: string; emailSent?: string }>();
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(emailSent === '0');

  const resend = async () => {
    if (!pw) return setErr('Enter your password to resend the email.');
    setErr(''); setLoading(true);
    try { await resendVerification(email, pw); toast.success('Sent! Check your inbox.'); setShowPw(false); setPw(''); }
    catch (e) { setErr((e as Error).message); }
    setLoading(false);
  };

  return (
    <AuthShell logo={false} before="Check your" accent="email." subtitle={emailSent === '0' ? 'Your account is ready, but we couldn’t send the confirmation email just yet.' : `We sent a confirmation link to ${email}. Tap it to activate your account, then sign in.`}>
      <MailArt />
      {emailSent === '0' ? <Banner tone="warn"><Text v="small">Use the button below to send it again.</Text></Banner> : null}
      <Reveal index={1}>
        {showPw ? (
          <>
            <Input label="Password" value={pw} onChangeText={setPw} error={err} secureTextEntry autoCapitalize="none" returnKeyType="go" onSubmitEditing={resend} />
            <Button title="Send confirmation email" loading={loading} onPress={resend} />
          </>
        ) : (
          <Button title="Resend email" variant="soft" onPress={() => setShowPw(true)} />
        )}
        <View style={{ height: 10 }} />
        <Button title="Back to sign in" variant="ghost" onPress={() => router.replace('/login')} />
      </Reveal>
    </AuthShell>
  );
}

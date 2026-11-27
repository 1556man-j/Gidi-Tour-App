import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { TriangleAlert } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useBootstrap } from '@/hooks/useBootstrap';
import { deleteMyAccount } from '@/lib/account';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { useCart } from '@/stores/cart';
import { usePrefs } from '@/stores/prefs';
import { colors, radius } from '@/theme';

export default function DeleteAccount() {
  const status = useAuth((s) => s.status);
  const signOut = useAuth((s) => s.signOut);
  const { customer } = useBootstrap();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  if (status === 'guest') return <Redirect href="/" />;
  const needsPassword = customer?.provider !== 'google';

  const submit = async () => {
    const e: Record<string, string> = {};
    if (confirm.trim() !== 'DELETE') e.confirm = 'Type DELETE to confirm.';
    if (needsPassword && !password) e.password = 'Enter your password.';
    setErrs(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await deleteMyAccount({ confirm: confirm.trim(), password: needsPassword ? password : undefined });
      usePrefs.setState({ saved: [], lastUserId: null, guideView: 'guide' });
      useCart.getState().clear();
      await signOut();
      router.replace('/');
      toast.success('Your account has been deleted.');
    } catch (err) {
      const a = err as ApiError;
      if (a.fieldErrors) setErrs(a.fieldErrors);
      toast.error(a.message);
      setBusy(false);
    }
  };

  const item = (t: string) => <Text v="body" color={colors.muted} style={{ marginBottom: 6 }}>•  {t}</Text>;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Delete account" />
      <Animated.ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: colors.dangerSoft, borderRadius: radius.lg, padding: 18, marginBottom: 20, gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <TriangleAlert size={22} color={colors.danger} />
            <Text v="bodyStrong" color={colors.danger}>This cannot be undone</Text>
          </View>
          <Text v="small" color={colors.muted}>Deleting your account removes your personal data from Gidi Tour.</Text>
        </View>
        {item('Your profile, photo, phone, address and travel notes are deleted.')}
        {item('Your chats with guides are deleted. Guides also lose their guide profile.')}
        {item('Past bookings and orders are kept for accounting, with your name and contact details removed.')}
        {item('If you have an upcoming paid trip, contact us first.')}
        <View style={{ height: 16 }} />
        {needsPassword ? <Input label="Password" value={password} onChangeText={(v) => { setPassword(v); setErrs((x) => ({ ...x, password: '' })); }} error={errs.password} secureTextEntry autoCapitalize="none" /> : null}
        <Input label="Type DELETE to confirm" value={confirm} onChangeText={(v) => { setConfirm(v); setErrs((x) => ({ ...x, confirm: '' })); }} error={errs.confirm} autoCapitalize="characters" autoCorrect={false} />
        <View style={{ height: 8 }} />
        <Button title="Delete my account" variant="dark" loading={busy} disabled={confirm.trim() !== 'DELETE'} onPress={submit} />
        <View style={{ height: 10 }} />
        <Button title="Keep my account" variant="soft" onPress={() => router.back()} />
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

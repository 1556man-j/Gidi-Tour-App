import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import Animated from 'react-native-reanimated';
import { GuideDetails, GuideRules, TourPicker, emptyGuideForm, toApplication, validateGuideDetails, type GuideForm } from '@/components/guide/GuideFields';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useGuide } from '@/hooks/useGuide';
import { ApiError } from '@/lib/api';
import { applyAsGuide } from '@/lib/guide';
import { goBack } from '@/lib/nav';
import { useAuth } from '@/stores/auth';
import { colors } from '@/theme';

export default function BecomeGuide() {
  const status = useAuth((s) => s.status);
  const { status: gs, loading } = useGuide();
  const qc = useQueryClient();
  const [f, setF] = useState<GuideForm>(emptyGuideForm);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  if (status === 'guest') return <Redirect href={{ pathname: '/login', params: { redirectTo: '/become-guide' } }} />;
  if (!loading && (gs === 'pending' || gs === 'active')) return <Redirect href="/account" />;
  const set = <K extends keyof GuideForm>(k: K, v: GuideForm[K]) => { setF((p) => ({ ...p, [k]: v })); setErrs((e) => ({ ...e, [k]: '' })); };

  const submit = async () => {
    const e = validateGuideDetails(f);
    if (!f.accepted) e.accepted = 'Please accept the guide rules to continue.';
    setErrs(e);
    if (Object.keys(e).length) return toast.error('Please fix the highlighted fields.');
    setBusy(true);
    try {
      await applyAsGuide(toApplication(f));
      await qc.invalidateQueries({ queryKey: ['guide'] });
      toast.success('Application sent. We will review it shortly.');
      goBack('/account');
    } catch (err) {
      const a = err as ApiError;
      if (a.fieldErrors) setErrs(a.fieldErrors);
      toast.error(a.message);
    }
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Become a guide" />
      <Animated.ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text v="body" color={colors.muted} style={{ marginBottom: 18 }}>Tell us about you. Our team reviews every application before the guide screens unlock.</Text>
        <GuideDetails f={f} set={set} errs={errs} />
        {f.country ? (
          <View style={{ marginTop: 8 }}>
            <Text v="caption" color={colors.green} style={{ marginBottom: 10, marginLeft: 4 }}>TOURS YOU CAN LEAD IN {f.country.toUpperCase()}</Text>
            <TourPicker country={f.country} value={f.tourSlugs} onChange={(v) => set('tourSlugs', v)} />
          </View>
        ) : null}
        <View style={{ height: 14 }} />
        <GuideRules accepted={f.accepted} onChange={(v) => set('accepted', v)} error={errs.accepted} />
        <View style={{ height: 20 }} />
        <Button title="Send application" loading={busy} onPress={submit} />
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

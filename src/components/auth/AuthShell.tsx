import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, X } from 'lucide-react-native';
import { Heading } from '@/components/ui/Heading';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Text } from '@/components/ui/Text';
import { colors, shadow } from '@/theme';

interface Props {
  before?: string;
  accent: string;
  after?: string;
  subtitle?: string;
  children: ReactNode;
  back?: boolean;
  onBack?: () => void;
  logo?: boolean;
}

/** Shared frame for login / signup / password screens. */
export function AuthShell({ before, accent, after, subtitle, children, back, onBack, logo = true }: Props) {
  const insets = useSafeAreaInsets();
  const close = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32, paddingHorizontal: 22 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <PressableScale onPress={close} style={[{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, shadow.card]}>
            {back ? <ChevronLeft size={22} color={colors.ink} /> : <X size={20} color={colors.ink} />}
          </PressableScale>
          {logo ? <Image source={require('../../../assets/images/logo-mark.png')} style={{ width: 40, height: 43 }} contentFit="contain" /> : null}
        </View>
        <Reveal>
          <Heading before={before} accent={accent} after={after} size={36} />
          {subtitle ? <Text v="body" color={colors.muted} style={{ marginTop: 10, fontSize: 16 }}>{subtitle}</Text> : null}
        </Reveal>
        <View style={{ height: 26 }} />
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Banner({ tone = 'warn', children }: { tone?: 'warn' | 'error' | 'ok'; children: ReactNode }) {
  const bg = tone === 'ok' ? colors.greenSoft : tone === 'error' ? colors.dangerSoft : colors.orangeSoft;
  return <View style={{ backgroundColor: bg, borderRadius: 18, padding: 14, marginBottom: 16, gap: 8 }}>{children}</View>;
}

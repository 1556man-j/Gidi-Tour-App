import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { Glass } from '@/components/ui/Glass';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import type { ReactNode } from 'react';

export function BackButton({ onPress, dark, style }: { onPress?: () => void; dark?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <PressableScale onPress={onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))} style={[styles.round, style]}>
      <Glass intensity={dark ? 40 : 60} tint={dark ? 'dark' : 'light'} style={[StyleSheet.absoluteFill, { zIndex: 0, backgroundColor: dark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.65)' }]} />
      {/* zIndex keeps the arrow above the blur layer (on web the blur is positioned, so it would otherwise paint over the icon). */}
      <View style={{ zIndex: 2, alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
        <ChevronLeft size={22} color={dark ? colors.white : colors.ink} strokeWidth={2.4} />
      </View>
    </PressableScale>
  );
}

/** Simple top bar with a back button, a centred title and an optional right action. */
export function Header({ title, right, onBack, noBack }: { title?: string; right?: ReactNode; onBack?: () => void; noBack?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56 + insets.top }}>
      <View style={{ width: 44 }}>{noBack ? null : <BackButton onPress={onBack} />}</View>
      <Text v="h3" style={{ flex: 1, textAlign: 'center' }} numberOfLines={1}>{title}</Text>
      <View style={{ width: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  round: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});

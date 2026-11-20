import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native';
import { create } from 'zustand';
import { colors, radius, shadow } from '@/theme';
import { haptic } from '@/lib/haptics';
import { Text } from './Text';

interface ToastState {
  id: number;
  message: string | null;
  kind: 'success' | 'error' | 'info';
  show: (message: string, kind?: 'success' | 'error' | 'info') => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  id: 0,
  message: null,
  kind: 'info',
  show: (message, kind = 'info') => {
    if (kind === 'success') haptic.success();
    if (kind === 'error') haptic.error();
    set((s) => ({ message, kind, id: s.id + 1 }));
  },
  hide: () => set({ message: null }),
}));

export const toast = {
  success: (m: string) => useToast.getState().show(m, 'success'),
  error: (m: string) => useToast.getState().show(m, 'error'),
  info: (m: string) => useToast.getState().show(m, 'info'),
};

export function ToastHost() {
  const { message, kind, id, hide } = useToast();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(hide, 3400);
    return () => clearTimeout(t);
  }, [id, message, hide]);
  if (!message) return null;
  const Icon = kind === 'success' ? CheckCircle2 : kind === 'error' ? AlertCircle : Info;
  const tint = kind === 'success' ? '#9BE05A' : kind === 'error' ? '#FF8A75' : colors.orange;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, zIndex: 999 }}>
      <Animated.View
        key={id}
        entering={FadeInUp.springify().damping(16)}
        exiting={FadeOutUp.duration(200)}
        style={[{ backgroundColor: colors.ink, borderRadius: radius.lg, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow.float]}
      >
        <Icon size={22} color={tint} />
        <Text v="bodyStrong" color={colors.cream} style={{ flex: 1 }}>{message}</Text>
      </Animated.View>
    </View>
  );
}

import { useEffect, useState, type ReactNode } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { colors, radius, springs } from '@/theme';
import { Text } from './Text';
import { PressableScale } from './PressableScale';

const H = Dimensions.get('window').height;

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  tall?: boolean;
}

/** Bottom sheet with a springy entrance and a fading backdrop. */
export function Sheet({ visible, onClose, title, children, tall }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const y = useSharedValue(H);
  const fade = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      y.value = withSpring(0, springs.soft);
      fade.value = withTiming(1, { duration: 240 });
    } else if (mounted) {
      fade.value = withTiming(0, { duration: 200 });
      y.value = withTiming(H, { duration: 260 }, (done) => { if (done) runOnJS(setMounted)(false); });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const panel = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const back = useAnimatedStyle(() => ({ opacity: fade.value }));

  if (!mounted) return null;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }, back]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>
        <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
          <Animated.View style={[styles.panel, { paddingBottom: insets.bottom + 16, maxHeight: H * (tall ? 0.9 : 0.8) }, panel]}>
            <View style={styles.grab} />
            {title ? (
              <View style={styles.head}>
                <Text v="h2">{title}</Text>
                <PressableScale onPress={onClose} style={styles.close}><X size={18} color={colors.ink} /></PressableScale>
              </View>
            ) : null}
            {children}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.cream, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: 20, paddingTop: 10 },
  grab: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line, marginBottom: 14 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
});

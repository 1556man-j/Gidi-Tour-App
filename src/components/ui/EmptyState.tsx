import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { colors } from '@/theme';
import { Button } from './Button';
import { Text } from './Text';

export function EmptyState({ icon, title, body, action, onAction }: { icon: ReactNode; title: string; body?: string; action?: string; onAction?: () => void }) {
  const y = useSharedValue(0);
  useEffect(() => { y.value = withRepeat(withTiming(-8, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true); }, [y]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View entering={FadeInDown.springify()} style={{ alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48, gap: 10 }}>
      <Animated.View style={[{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }, a]}>{icon}</Animated.View>
      <Text v="h2" center>{title}</Text>
      {body ? <Text v="body" color={colors.muted} center>{body}</Text> : null}
      {action ? <View style={{ marginTop: 14, alignSelf: 'stretch' }}><Button title={action} onPress={onAction} /></View> : null}
    </Animated.View>
  );
}

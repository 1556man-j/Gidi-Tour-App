import { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import type { Tabs } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { LucideIcon } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptic } from '@/lib/haptics';
import { colors, fonts, shadow, springs } from '@/theme';

export type BottomTabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];
export interface TabDef { name: string; label: string; Icon: LucideIcon }

function TabItem({ active, label, Icon, onPress, badge }: { active: boolean; label: string; Icon: LucideIcon; onPress: () => void; badge?: number }) {
  const p = useSharedValue(active ? 1 : 0);
  useEffect(() => { p.value = withSpring(active ? 1 : 0, springs.snappy); }, [active, p]);
  const icon = useAnimatedStyle(() => ({ transform: [{ translateY: -p.value * 3 }, { scale: 1 + p.value * 0.1 }] }));
  const text = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: (1 - p.value) * 6 }] }));
  return (
    <PressableScale onPress={onPress} hapticOnPress={false} scaleTo={0.9} style={styles.item}>
      <Animated.View style={icon}>
        <Icon size={23} color={active ? colors.white : 'rgba(247,243,234,0.62)'} strokeWidth={active ? 2.4 : 2} />
        {badge ? <View style={styles.badge}><Animated.Text style={{ color: colors.white, fontFamily: fonts.bold, fontSize: 10 }}>{badge}</Animated.Text></View> : null}
      </Animated.View>
      <Animated.Text style={[styles.label, text]}>{label}</Animated.Text>
    </PressableScale>
  );
}

/** The floating pill tab bar used by both the traveller tabs and the guide tabs. */
export function FloatingTabBar({ state, navigateToTab, tabs, badges }: BottomTabBarProps & { tabs: readonly TabDef[]; badges?: Record<string, number | undefined> }) {
  const insets = useSafeAreaInsets();
  const [w, setW] = useState(0);
  const x = useSharedValue(0);
  const itemW = w / tabs.length;
  useEffect(() => { if (itemW) x.value = withSpring(state.index * itemW, springs.snappy); }, [state.index, itemW, x]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width - 16);
  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={[styles.bar, shadow.float]} onLayout={onLayout}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.ink }]} />
        <View style={{ flexDirection: 'row', padding: 8 }}>
          {itemW ? <Animated.View style={[styles.pill, { width: itemW }, pill]} /> : null}
          {state.routes.map((route, i) => {
            const t = tabs.find((x) => x.name === route.name);
            if (!t) return null;
            return (
              <TabItem key={route.key} active={state.index === i} label={t.label} Icon={t.Icon} badge={badges?.[t.name]}
                onPress={() => { haptic.select(); if (state.index !== i) navigateToTab(route.key); }} />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  bar: { width: '100%', borderRadius: 34, overflow: 'hidden' },
  pill: { position: 'absolute', left: 8, top: 8, bottom: 8, borderRadius: 26, backgroundColor: colors.green },
  item: { flex: 1, height: 58, alignItems: 'center', justifyContent: 'center' },
  label: { position: 'absolute', bottom: 7, fontFamily: fonts.semibold, fontSize: 10.5, color: colors.white, letterSpacing: 0.2 },
  badge: { position: 'absolute', top: -6, right: -10, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
});

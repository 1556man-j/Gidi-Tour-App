import { useState, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, LinearTransition, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Minus, Plus } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, shadow, springs } from '@/theme';

/** Card that springs open to reveal its body. Header is any node. */
export function AccordionItem({ header, children, dark, defaultOpen }: { header: ReactNode; children: ReactNode; dark?: boolean; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const rot = useAnimatedStyle(() => ({ transform: [{ rotate: withSpring(open ? '180deg' : '0deg', springs.snappy) }] }));
  return (
    <Animated.View layout={LinearTransition.springify().damping(20).stiffness(170)} style={[{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : colors.white, borderRadius: radius.lg, overflow: 'hidden' }, dark ? null : shadow.card]}>
      <PressableScale onPress={() => setOpen((o) => !o)} scaleTo={0.99} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18 }}>
        <View style={{ flex: 1 }}>{header}</View>
        <Animated.View style={[{ width: 34, height: 34, borderRadius: 17, backgroundColor: open ? colors.green : dark ? 'rgba(255,255,255,0.12)' : colors.greenSoft, alignItems: 'center', justifyContent: 'center' }, rot]}>
          {open ? <Minus size={16} color={colors.white} /> : <Plus size={16} color={dark ? colors.white : colors.greenDeep} />}
        </Animated.View>
      </PressableScale>
      {open ? <Animated.View entering={FadeIn.duration(260)} style={{ paddingHorizontal: 18, paddingBottom: 18 }}>{children}</Animated.View> : null}
    </Animated.View>
  );
}

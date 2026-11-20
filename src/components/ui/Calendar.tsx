import { useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, fonts, springs } from '@/theme';
import { fromISODate, toISODate } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface Props { start?: string; end?: string; onChange: (start: string, end: string) => void; minDate?: Date }

function Day({ iso, label, state, disabled, onPress }: { iso: string; label: number; state: 'none' | 'start' | 'end' | 'mid' | 'single'; disabled: boolean; onPress: () => void }) {
  const selected = state === 'start' || state === 'end' || state === 'single';
  const pop = useAnimatedStyle(() => ({ transform: [{ scale: withSpring(selected ? 1 : 0.6, springs.bouncy) }], opacity: withSpring(selected ? 1 : 0) }));
  const radiusStyle = state === 'start' ? { borderTopLeftRadius: 22, borderBottomLeftRadius: 22 } : state === 'end' ? { borderTopRightRadius: 22, borderBottomRightRadius: 22 } : {};
  return (
    <PressableScale key={iso} onPress={onPress} disabled={disabled} hapticOnPress={false} scaleTo={0.9} style={{ width: `${100 / 7}%`, height: 46, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.28 : 1 }}>
      {state !== 'none' && state !== 'single' ? <View style={[{ position: 'absolute', left: state === 'start' ? '50%' : 0, right: state === 'end' ? '50%' : 0, top: 3, bottom: 3, backgroundColor: colors.greenSoft }, state === 'mid' ? null : null]} /> : null}
      <Animated.View style={[{ position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: colors.green }, pop]} />
      <Text style={{ fontFamily: selected ? fonts.bold : fonts.medium, fontSize: 15 }} color={selected ? colors.white : colors.ink}>{label}</Text>
    </PressableScale>
  );
}

/** Month grid with start/end range selection. */
export function Calendar({ start, end, onChange, minDate }: Props) {
  const today = useMemo(() => { const d = minDate ?? new Date(); d.setHours(0, 0, 0, 0); return d; }, [minDate]);
  const initial = start ? fromISODate(start) : today;
  const [cursor, setCursor] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const lead = (first.getDay() + 6) % 7;
    const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1))] as (Date | null)[];
  }, [cursor]);

  const pick = (d: Date) => {
    haptic.select();
    const iso = toISODate(d);
    if (!start || (start && end && start !== end) || iso < start) onChange(iso, iso);
    else onChange(start, iso);
  };

  const canPrev = cursor > new Date(today.getFullYear(), today.getMonth(), 1);
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <PressableScale disabled={!canPrev} onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', opacity: canPrev ? 1 : 0.35 }}>
          <ChevronLeft size={20} color={colors.ink} />
        </PressableScale>
        <Animated.View key={cursor.toISOString()} entering={FadeIn.duration(250)}>
          <Text v="h3">{cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</Text>
        </Animated.View>
        <PressableScale onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={20} color={colors.ink} />
        </PressableScale>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {DOW.map((d, i) => <Text key={i} v="caption" color={colors.faint} center style={{ width: `${100 / 7}%`, paddingVertical: 8 }}>{d}</Text>)}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {days.map((d, i) => {
          if (!d) return <View key={`e${i}`} style={{ width: `${100 / 7}%`, height: 46 }} />;
          const iso = toISODate(d);
          const single = start && end && start === end && iso === start;
          const state = single ? 'single' : iso === start ? (end && end !== start ? 'start' : 'single') : iso === end ? 'end' : start && end && iso > start && iso < end ? 'mid' : 'none';
          return <Day key={iso} iso={iso} label={d.getDate()} state={state} disabled={d < today} onPress={() => pick(d)} />;
        })}
      </View>
    </View>
  );
}

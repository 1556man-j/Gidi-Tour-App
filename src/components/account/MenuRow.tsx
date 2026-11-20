import type { ReactNode } from 'react';
import { View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { colors, radius, shadow } from '@/theme';

export function MenuGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text v="caption" color={colors.faint} style={{ marginBottom: 10, marginLeft: 6 }}>{title.toUpperCase()}</Text>
      <View style={[{ backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden' }, shadow.card]}>{children}</View>
    </View>
  );
}

export function MenuRow({ icon, label, onPress, last, danger, hint }: { icon: ReactNode; label: string; onPress: () => void; last?: boolean; danger?: boolean; hint?: string }) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.985} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.line }}>
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: danger ? colors.dangerSoft : colors.greenSoft, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <Text v="bodyStrong" style={{ flex: 1 }} color={danger ? colors.danger : colors.ink}>{label}</Text>
      {hint ? <Text v="small" color={colors.muted}>{hint}</Text> : null}
      {!danger ? <ChevronRight size={18} color={colors.faint} /> : null}
    </PressableScale>
  );
}

import { View } from 'react-native';
import { colors, fonts } from '@/theme';
import { Text } from './Text';

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    paid: { bg: colors.greenSoft, fg: colors.greenDeep, label: 'Confirmed' },
    pending: { bg: colors.orangeSoft, fg: '#B25B05', label: 'Awaiting payment' },
    failed: { bg: colors.dangerSoft, fg: colors.danger, label: 'Payment failed' },
    refunded: { bg: colors.sand, fg: colors.muted, label: 'Refunded' },
    review: { bg: colors.orangeSoft, fg: '#B25B05', label: 'In review' },
  };
  const s = map[status] ?? { bg: colors.sand, fg: colors.muted, label: status };
  return (
    <View style={{ backgroundColor: s.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignSelf: 'flex-start' }}>
      <Text style={{ fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.3 }} color={s.fg}>{s.label}</Text>
    </View>
  );
}

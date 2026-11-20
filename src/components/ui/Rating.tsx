import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '@/theme';
import { Text } from './Text';

export function Rating({ value = 0, count, size = 14, light }: { value?: number; count?: number; size?: number; light?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Star size={size} color={colors.orange} fill={colors.orange} />
      <Text v="small" color={light ? colors.white : colors.ink} style={{ fontFamily: 'Geist_600SemiBold' }}>{value ? value.toFixed(1) : 'New'}</Text>
      {count ? <Text v="small" color={light ? 'rgba(255,255,255,0.75)' : colors.muted}>({count})</Text> : null}
    </View>
  );
}

export function StarRow({ value }: { value: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} color={colors.orange} fill={i <= Math.round(value) ? colors.orange : 'transparent'} />
      ))}
    </View>
  );
}

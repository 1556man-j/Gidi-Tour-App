import { View } from 'react-native';
import { Quote } from 'lucide-react-native';
import type { Review } from '@/lib/types';
import { colors, fonts, radius, shadow } from '@/theme';
import { StarRow } from './ui/Rating';
import { Text } from './ui/Text';

export function ReviewCard({ review, width }: { review: Review; width?: number }) {
  return (
    <View style={[{ width, backgroundColor: colors.white, borderRadius: radius.lg, padding: 20, gap: 10 }, shadow.card]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <StarRow value={review.rating} />
        <Quote size={22} color={colors.greenSoft} fill={colors.greenSoft} />
      </View>
      {review.title ? <Text v="h3">{review.title}</Text> : null}
      <Text v="body" color={colors.muted} numberOfLines={5}>{review.comment}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.bold }} color={colors.greenDeep}>{review.name.charAt(0)}</Text>
        </View>
        <View>
          <Text v="bodyStrong">{review.name}</Text>
          {review.location || review.tour ? <Text v="small" color={colors.muted}>{review.location ?? review.tour?.title}</Text> : null}
        </View>
      </View>
    </View>
  );
}

import { View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';
import { Header } from '@/components/ui/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { TourRow } from '@/components/TourCard';
import { getTours } from '@/lib/content';
import { usePrefs } from '@/stores/prefs';
import { colors } from '@/theme';

export default function Saved() {
  const saved = usePrefs((s) => s.saved);
  const { data, isLoading } = useQuery({ queryKey: ['tours'], queryFn: getTours });
  const list = (data ?? []).filter((t) => saved.includes(t.slug.current));
  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header title="Saved tours" />
      <Animated.ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 60 }}>
        {isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} h={148} r={24} />) : list.length ? list.map((t, i) => <Reveal key={t._id} index={i}><TourRow tour={t} /></Reveal>) : (
          <EmptyState icon={<Heart size={40} color={colors.green} />} title="Nothing saved yet" body="Tap the heart on any tour to keep it here for later." action="Browse tours" onAction={() => router.replace('/tours')} />
        )}
      </Animated.ScrollView>
    </View>
  );
}

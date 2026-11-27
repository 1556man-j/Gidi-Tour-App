import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TourPicker } from '@/components/guide/GuideFields';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useGuide } from '@/hooks/useGuide';
import { saveGuideTours } from '@/lib/guide';
import { colors, TAB_PAD } from '@/theme';

export default function GuideTours() {
  const insets = useSafeAreaInsets();
  const { guide } = useGuide();
  const qc = useQueryClient();
  const [sel, setSel] = useState<string[]>([]);
  const [seeded, setSeeded] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (guide && seeded !== guide._id) { setSel(guide.tours.map((t) => t.slug)); setSeeded(guide._id); }
  }, [guide, seeded]);

  const save = async () => {
    setBusy(true);
    try {
      await saveGuideTours(sel);
      await qc.invalidateQueries({ queryKey: ['guide'] });
      toast.success('Your tours are saved');
    } catch (e) { toast.error((e as Error).message); }
    setBusy(false);
  };

  return (
    <Animated.ScrollView style={{ flex: 1, backgroundColor: colors.cream }} showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: TAB_PAD + 20 }}>
      <Text v="caption" color={colors.green}>GUIDE</Text>
      <Text v="h1">My tours</Text>
      <Text v="body" color={colors.muted} style={{ marginTop: 4, marginBottom: 18 }}>Tours in {guide?.country || 'your country'} that you can lead. When someone pays for a ticked tour, you can be matched to them.</Text>
      {guide?.country ? <TourPicker country={guide.country} value={sel} onChange={setSel} /> : null}
      <View style={{ height: 18 }} />
      <Button title="Save tours" loading={busy} onPress={save} />
    </Animated.ScrollView>
  );
}

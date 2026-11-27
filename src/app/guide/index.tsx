import { RefreshControl, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';
import { ChatRow } from '@/components/chat/ChatRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useGuide } from '@/hooks/useGuide';
import { fetchChats } from '@/lib/chat';
import { useAuth } from '@/stores/auth';
import { colors, TAB_PAD } from '@/theme';

export default function GuideInbox() {
  const insets = useSafeAreaInsets();
  const uid = useAuth((s) => s.user?.id ?? null);
  const { guide } = useGuide();
  const q = useQuery({ queryKey: ['chats', uid], queryFn: fetchChats, refetchInterval: 15000 });
  const list = q.data?.inbox ?? [];
  const open = list.filter((c) => !c.closed);
  const ended = list.filter((c) => c.closed);
  return (
    <Animated.ScrollView style={{ flex: 1, backgroundColor: colors.cream }} showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 20, paddingBottom: TAB_PAD + 20, gap: 12 }}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => { q.refetch(); }} tintColor={colors.green} />}>
      <View style={{ marginBottom: 6 }}>
        <Text v="caption" color={colors.green}>GUIDE</Text>
        <Text v="h1">Hi{guide?.name ? `, ${guide.name.split(' ')[0]}` : ''}</Text>
        <Text v="body" color={colors.muted}>Travellers appear here once they have paid for one of your tours.</Text>
      </View>
      {q.isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} h={86} r={24} />) : list.length ? (
        <>
          {open.map((c) => <ChatRow key={c.id} c={c} />)}
          {ended.length ? <Text v="caption" color={colors.faint} style={{ marginTop: 10 }}>ENDED CHATS</Text> : null}
          {ended.map((c) => <ChatRow key={c.id} c={c} />)}
        </>
      ) : (
        <EmptyState icon={<MessageCircle size={40} color={colors.green} />} title="No travellers yet" body="When a traveller pays for one of your tours, their chat shows up here. Check My tours to make sure the right tours are ticked." />
      )}
    </Animated.ScrollView>
  );
}

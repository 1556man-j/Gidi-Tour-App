import { useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated from 'react-native-reanimated';
import { MessageCircle } from 'lucide-react-native';
import { EmptyState } from '@/components/ui/EmptyState';
import { Header } from '@/components/ui/Header';
import { PressableScale } from '@/components/ui/PressableScale';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { ChatRow as Row } from '@/components/chat/ChatRow';
import { fetchChats, type ChatConversation } from '@/lib/chat';
import { useAuth } from '@/stores/auth';
import { colors, radius } from '@/theme';

export default function Messages() {
  const status = useAuth((s) => s.status);
  const uid = useAuth((s) => s.user?.id ?? null);
  const q = useQuery({ queryKey: ['chats', uid], queryFn: fetchChats, enabled: status === 'authed', refetchInterval: 15000 });
  const [seg, setSeg] = useState<'trips' | 'inbox'>('trips');
  if (status === 'guest') return <Redirect href={{ pathname: '/login', params: { redirectTo: '/messages' } }} />;

  const data = q.data;
  const showSeg = !!data?.isGuide;
  const list = showSeg && seg === 'inbox' ? data!.inbox : data?.trips ?? [];
  const unread = (xs: ChatConversation[] = []) => xs.reduce((n, c) => n + c.unread, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header title="Messages" />
      <Animated.ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 12 }}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => { q.refetch(); }} tintColor={colors.green} />}>
        {showSeg ? (
          <View style={{ flexDirection: 'row', backgroundColor: colors.sand, borderRadius: radius.pill, padding: 4, marginBottom: 4 }}>
            {([['trips', 'My trips', unread(data?.trips)], ['inbox', 'Guide inbox', unread(data?.inbox)]] as const).map(([k, label, n]) => (
              <PressableScale key={k} onPress={() => setSeg(k)} scaleTo={0.97}
                style={{ flex: 1, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: seg === k ? colors.white : 'transparent' }}>
                <Text v="bodyStrong" color={seg === k ? colors.ink : colors.muted}>{label}{n ? `  ·  ${n}` : ''}</Text>
              </PressableScale>
            ))}
          </View>
        ) : null}
        {q.isLoading ? [0, 1, 2].map((i) => <Skeleton key={i} h={86} r={24} />) : list.length ? list.map((c) => <Row key={c.id} c={c} />) : (
          <EmptyState icon={<MessageCircle size={40} color={colors.green} />}
            title={showSeg && seg === 'inbox' ? 'No travellers yet' : 'No chats yet'}
            body={showSeg && seg === 'inbox' ? 'When a traveller pays for one of your tours, their chat shows up here.' : 'Once your tour is paid for, you can message your guide here.'} />
        )}
      </Animated.ScrollView>
    </View>
  );
}

import { ActivityIndicator, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Map, MessageCircle, UserRound } from 'lucide-react-native';
import { FloatingTabBar, type TabDef } from '@/components/FloatingTabBar';
import { useGuide } from '@/hooks/useGuide';
import { fetchChats } from '@/lib/chat';
import { useAuth } from '@/stores/auth';
import { useQuery } from '@tanstack/react-query';
import { colors } from '@/theme';

const TABS: readonly TabDef[] = [
  { name: 'index', label: 'Inbox', Icon: MessageCircle },
  { name: 'tours', label: 'My tours', Icon: Map },
  { name: 'profile', label: 'Profile', Icon: UserRound },
];

export default function GuideLayout() {
  const status = useAuth((s) => s.status);
  const uid = useAuth((s) => s.user?.id ?? null);
  const { guideMode, loading } = useGuide();
  const chats = useQuery({ queryKey: ['chats', uid], queryFn: fetchChats, enabled: guideMode, refetchInterval: 20000 });
  const unread = (chats.data?.inbox ?? []).reduce((n, c) => n + c.unread, 0);

  if (status === 'loading' || loading) return <View style={{ flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.green} /></View>;
  if (!guideMode) return <Redirect href="/" />;
  return (
    <Tabs tabBar={(p) => <FloatingTabBar {...p} tabs={TABS} badges={{ index: unread }} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.cream } }}>
      {TABS.map((t) => <Tabs.Screen key={t.name} name={t.name} />)}
    </Tabs>
  );
}

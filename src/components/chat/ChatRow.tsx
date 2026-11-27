import { View } from 'react-native';
import { router } from 'expo-router';
import { Avatar } from '@/components/account/Avatar';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import type { ChatConversation } from '@/lib/chat';
import { formatDate } from '@/lib/format';
import { colors, fonts, radius, shadow } from '@/theme';

function when(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay ? d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : formatDate(iso, { day: 'numeric', month: 'short' });
}

export function ChatRow({ c }: { c: ChatConversation }) {
  const asGuide = c.role === 'guide';
  const title = asGuide ? c.traveller.firstName || 'Traveller' : c.guide?.name || 'Your guide';
  const sub = c.waitingForGuide ? 'We’re assigning your guide' : c.lastMessagePreview || (asGuide ? 'Say hello to your traveller' : 'Say hello to your guide');
  return (
    <PressableScale onPress={() => router.push(`/messages/${c.id}` as never)} scaleTo={0.98}
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderRadius: radius.lg, padding: 14 }, shadow.card]}>
      <Avatar uri={asGuide ? null : c.guide?.photoUrl} name={title} size={52} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <Text v="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>{title}</Text>
          <Text v="caption" color={colors.faint}>{when(c.lastMessageAt)}</Text>
        </View>
        <Text v="small" color={c.unread ? colors.ink : colors.muted} numberOfLines={1} style={{ fontFamily: c.unread ? fonts.semibold : undefined }}>{sub}</Text>
        <Text v="caption" color={colors.faint} numberOfLines={1} style={{ marginTop: 2 }}>{[c.trip.tours, c.closed ? 'Chat ended' : null].filter(Boolean).join(' · ')}</Text>
      </View>
      {c.unread ? (
        <View style={{ minWidth: 22, height: 22, borderRadius: 11, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 11 }} color={colors.white}>{c.unread}</Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

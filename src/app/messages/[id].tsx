import { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { Redirect, useIsFocused, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowUp, ShieldCheck } from 'lucide-react-native';
import { Avatar } from '@/components/account/Avatar';
import { Header } from '@/components/ui/Header';
import { PressableScale } from '@/components/ui/PressableScale';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api';
import { fetchChatMessages, reportChatMessage, sendChatMessage, SAFETY_NOTE, type ChatMessage } from '@/lib/chat';
import { useAuth } from '@/stores/auth';
import { colors, fonts, radius } from '@/theme';

type Data = Awaited<ReturnType<typeof fetchChatMessages>>;
const clock = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

function Bubble({ m, onReport }: { m: ChatMessage; onReport: (m: ChatMessage) => void }) {
  return (
    <View style={{ alignItems: m.mine ? 'flex-end' : 'flex-start', marginVertical: 3 }}>
      <PressableScale scaleTo={0.99} onLongPress={m.mine ? undefined : () => onReport(m)}
        style={{ maxWidth: '82%', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: m.mine ? colors.green : colors.white,
          borderRadius: 20, borderBottomRightRadius: m.mine ? 6 : 20, borderBottomLeftRadius: m.mine ? 20 : 6 }}>
        <Text v="body" color={m.mine ? colors.white : colors.ink}>{m.body}</Text>
        <Text v="caption" color={m.mine ? 'rgba(255,255,255,0.7)' : colors.faint} style={{ alignSelf: 'flex-end', marginTop: 3 }}>{clock(m.createdAt)}{m.mine && m.read ? '  ✓✓' : ''}</Text>
      </PressableScale>
    </View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const status = useAuth((s) => s.status);
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // No live connection: the open chat simply asks for new messages every few seconds.
  const q = useQuery({
    queryKey: ['chat', id], queryFn: () => fetchChatMessages(id), enabled: status === 'authed' && !!id,
    refetchInterval: focused ? 4000 : false, staleTime: 0,
  });

  const send = useMutation({
    mutationFn: (body: string) => sendChatMessage(id, body),
    onSuccess: (m) => {
      setText(''); setNotice(null);
      qc.setQueryData<Data>(['chat', id], (old) => (old ? { ...old, messages: [...old.messages, m] } : old));
      qc.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (e) => {
      // 422 = the safety check refused the message. Keep what they typed so they can edit it.
      if (e instanceof ApiError && e.status === 422) setNotice(e.message);
      else toast.error((e as Error).message);
    },
  });

  const report = useCallback((m: ChatMessage) => {
    Alert.alert('Report this message?', 'Our team will review it. Use this for requests for money, contact details or anything that feels unsafe.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: async () => { try { await reportChatMessage(m.id); toast.success('Thanks, we’ll look into it.'); } catch (e) { toast.error((e as Error).message); } } },
    ]);
  }, []);

  if (status === 'guest') return <Redirect href={{ pathname: '/login', params: { redirectTo: `/messages/${id}` } }} />;

  const conv = q.data?.conversation;
  const asGuide = conv?.role === 'guide';
  const title = asGuide ? conv?.traveller.firstName || 'Traveller' : conv?.guide?.name || 'Your guide';
  const closed = !!conv?.closed;
  const waiting = !!conv?.waitingForGuide;
  const messages = q.data?.messages ?? [];
  const canSend = text.trim().length > 0 && !send.isPending && !closed && !waiting;

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header title={title} right={<Avatar uri={asGuide ? null : conv?.guide?.photoUrl} name={title} size={36} />} />
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginHorizontal: 16, marginBottom: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.greenSoft, borderRadius: radius.md }}>
        <ShieldCheck size={16} color={colors.greenDeep} />
        <Text v="caption" color={colors.greenDeep} style={{ flex: 1 }}>{SAFETY_NOTE}</Text>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {q.isLoading ? (
          <View style={{ padding: 20, gap: 10 }}><Skeleton h={48} w="60%" r={20} /><Skeleton h={48} w="45%" r={20} style={{ alignSelf: 'flex-end' }} /></View>
        ) : (
          <FlatList
            ref={listRef} data={messages} keyExtractor={(m) => m.id}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => <Bubble m={item} onReport={report} />}
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
                <Text v="bodyStrong" center>{waiting ? 'We’re assigning your guide' : 'No messages yet'}</Text>
                <Text v="small" color={colors.muted} center style={{ marginTop: 6 }}>
                  {waiting ? 'You’ll be able to chat here as soon as a guide is assigned to your tour.' : asGuide ? 'Say hello and introduce yourself.' : 'Say hello to your guide and ask anything about your trip.'}
                </Text>
              </View>
            }
          />
        )}
        {notice ? (
          <View style={{ marginHorizontal: 16, marginBottom: 6, padding: 12, backgroundColor: colors.dangerSoft, borderRadius: radius.md }}>
            <Text v="small" color={colors.danger}>{notice}</Text>
          </View>
        ) : null}
        {closed ? (
          <View style={{ padding: 16, paddingBottom: insets.bottom + 16 }}><Text v="small" color={colors.muted} center>This chat has ended.</Text></View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 10 }}>
            <TextInput
              value={text} onChangeText={(t) => { setText(t); if (notice) setNotice(null); }}
              placeholder={waiting ? 'Waiting for a guide…' : 'Write a message'} placeholderTextColor={colors.faint}
              editable={!waiting} multiline maxLength={1000}
              style={{ flex: 1, minHeight: 46, maxHeight: 120, backgroundColor: colors.white, borderRadius: 23, paddingHorizontal: 18, paddingTop: 13, paddingBottom: 13, fontFamily: fonts.regular, fontSize: 15, color: colors.ink }}
            />
            <PressableScale onPress={canSend ? () => send.mutate(text.trim()) : undefined} disabled={!canSend}
              style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: canSend ? colors.green : colors.sand, alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUp size={22} color={canSend ? colors.white : colors.faint} strokeWidth={2.6} />
            </PressableScale>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

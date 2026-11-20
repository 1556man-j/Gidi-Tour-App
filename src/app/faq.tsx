import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { HelpCircle, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccordionItem } from '@/components/content/Accordion';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Header } from '@/components/ui/Header';
import { Heading } from '@/components/ui/Heading';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { getFaqs } from '@/lib/content';
import { colors, fonts, radius } from '@/theme';

export default function Faq() {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const query = useQuery({ queryKey: ['faqs', 'general'], queryFn: () => getFaqs('general') });
  const list = (query.data ?? []).filter((f) => !q.trim() || (f.question + f.answer).toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Screen>
      <Header title="FAQ" />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 12 }}>
        <Reveal><Heading before="Before you" accent="hit submit" size={34} /></Reveal>
        <Reveal index={1}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 16, height: 52, borderWidth: 1.5, borderColor: colors.line, marginVertical: 6 }}>
            <Search size={18} color={colors.muted} />
            <TextInput value={q} onChangeText={setQ} placeholder="Search questions" placeholderTextColor={colors.faint} style={{ flex: 1, fontFamily: fonts.medium, fontSize: 16, color: colors.ink, outlineStyle: 'none' } as object} />
          </View>
        </Reveal>
        {query.isLoading ? [0, 1, 2, 3].map((i) => <Skeleton key={i} h={70} r={24} />) : !list.length ? (
          <EmptyState icon={<HelpCircle size={40} color={colors.green} />} title="No answers found" body="Try different words, or ask us directly." />
        ) : list.map((f, i) => (
          <Reveal key={f._id} index={i}>
            <AccordionItem header={<Text v="h3">{f.question}</Text>}>
              <Text color={colors.muted} style={{ lineHeight: 23 }}>{f.answer}</Text>
            </AccordionItem>
          </Reveal>
        ))}
        <View style={{ backgroundColor: colors.forest, borderRadius: radius.xl, padding: 22, gap: 12, marginTop: 14 }}>
          <Text v="h2" color={colors.cream}>Still have a question?</Text>
          <Text color="rgba(247,243,234,0.7)">Our team replies within a day.</Text>
          <Button title="Talk to us" variant="accent" onPress={() => router.push('/contact')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

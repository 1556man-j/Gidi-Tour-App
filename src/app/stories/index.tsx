import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArticleCard } from '@/components/ArticleCard';
import { Header } from '@/components/ui/Header';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Heading } from '@/components/ui/Heading';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { getArticles } from '@/lib/content';
import { colors } from '@/theme';

export default function Stories() {
  const insets = useSafeAreaInsets();
  const [cat, setCat] = useState('All');
  const q = useQuery({ queryKey: ['articles'], queryFn: getArticles });
  const all = q.data ?? [];
  const cats = useMemo(() => ['All', ...Array.from(new Set(all.map((a) => a.category)))], [all]);
  const list = all.filter((a) => cat === 'All' || a.category === cat);
  const featured = list.find((a) => a.featured) ?? list[0];
  const rest = list.filter((a) => a !== featured);

  return (
    <Screen>
      <Header title="Stories" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => { q.refetch(); }} tintColor={colors.green} />}
        showsVerticalScrollIndicator={false}
      >
        <Reveal><Heading before="Stories from" accent="the road" size={34} /></Reveal>
        <Reveal index={1}><Text color={colors.muted}>Food, culture and the small details that make a trip yours.</Text></Reveal>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
          {cats.map((c) => <Chip key={c} label={c} active={c === cat} onPress={() => setCat(c)} />)}
        </ScrollView>
        {q.isLoading ? (
          <View style={{ gap: 14 }}><Skeleton h={360} r={32} />{[0, 1, 2].map((i) => <Skeleton key={i} h={120} r={24} />)}</View>
        ) : !list.length ? (
          <EmptyState icon={<BookOpen size={40} color={colors.green} />} title="No stories yet" body="New stories are on the way. Check back soon." />
        ) : (
          <View key={cat} style={{ gap: 14 }}>
            {featured ? <Reveal><ArticleCard article={featured} big /></Reveal> : null}
            {rest.map((a, i) => <Reveal key={a._id} index={i + 1}><ArticleCard article={a} /></Reveal>)}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

import { Share, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, Extrapolation, interpolate } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Share2 } from 'lucide-react-native';
import { ArticleCard } from '@/components/ArticleCard';
import { ParallaxHero } from '@/components/content/ParallaxHero';
import { PortableText } from '@/components/PortableText';
import { BackButton, Header } from '@/components/ui/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { getArticle, getArticles } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { colors, fonts } from '@/theme';
import { Glass } from '@/components/ui/Glass';

const HERO = 420;

export default function Story() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => { y.value = e.contentOffset.y; });
  const q = useQuery({ queryKey: ['article', slug], queryFn: () => getArticle(slug!), enabled: !!slug });
  const all = useQuery({ queryKey: ['articles'], queryFn: getArticles });
  const a = q.data;
  const progress = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, interpolate(y.value, [HERO - 100, HERO + 1400], [0, 100], Extrapolation.CLAMP)))}%`,
  }));
  const bar = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [HERO - 140, HERO - 80], [0, 1], Extrapolation.CLAMP) }));

  if (q.isLoading) return <Screen><Header title="" /><View style={{ padding: 20, gap: 14 }}><Skeleton h={300} r={32} /><Skeleton h={28} /><Skeleton h={16} /><Skeleton h={16} w="80%" /></View></Screen>;
  if (!a) return <Screen><Header title="Story" /><EmptyState icon={<Share2 size={36} color={colors.green} />} title="Story not found" body="This story may have moved." /></Screen>;

  const related = (all.data ?? []).filter((x) => x.category === a.category && x._id !== a._id).slice(0, 3);
  return (
    <Screen>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}>
        <ParallaxHero scrollY={y} img={a.image} height={HERO}>
          <View style={{ position: 'absolute', left: 20, right: 20, bottom: 26, gap: 10 }}>
            <View style={{ alignSelf: 'flex-start', backgroundColor: colors.orange, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 }}>
              <Text style={{ fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.6 }} color={colors.white}>{a.category.toUpperCase()}</Text>
            </View>
            <Text v="h1" color={colors.white} style={{ fontSize: 34, lineHeight: 38 }}>{a.title}</Text>
          </View>
        </ParallaxHero>
        <View style={{ padding: 20, gap: 20, marginTop: -22, backgroundColor: colors.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}>
          <Reveal>
            <Text v="small" color={colors.muted}>
              {formatDate(a.date)}{a.readTime ? `  ·  ${a.readTime} min read` : ''}{a.destination ? `  ·  ${a.destination}` : ''}
            </Text>
          </Reveal>
          <Reveal index={1}><Text style={{ fontFamily: fonts.serifItalic, fontSize: 22, lineHeight: 30 }}>{a.excerpt}</Text></Reveal>
          <PortableText blocks={a.body} />
          {related.length ? (
            <View style={{ gap: 12, marginTop: 16 }}>
              <Text v="h2">Keep reading</Text>
              {related.map((r) => <ArticleCard key={r._id} article={r} />)}
            </View>
          ) : null}
        </View>
      </Animated.ScrollView>
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 64 }, bar]} pointerEvents="none">
        <Glass intensity={60} tint="light" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(247,243,234,0.85)' }]} />
        <Animated.View style={[{ position: 'absolute', bottom: 0, left: 0, height: 3, backgroundColor: colors.green }, progress]} />
      </Animated.View>
      <View style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
        <BackButton />
        <PressableScale onPress={() => Share.share({ message: `${a.title}\nhttps://giditour.com/stories/${a.slug.current}` })} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' }}>
          <Share2 size={19} color={colors.ink} />
        </PressableScale>
      </View>
    </Screen>
  );
}

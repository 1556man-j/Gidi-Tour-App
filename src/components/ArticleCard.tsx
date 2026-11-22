import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { Article } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { colors, fonts, radius, shadow } from '@/theme';
import { AppImage } from './ui/AppImage';
import { PressableScale } from './ui/PressableScale';
import { Text } from './ui/Text';

export function ArticleCard({ article, big }: { article: Article; big?: boolean }) {
  const go = () => router.push(`/stories/${article.slug.current}`);
  if (big) {
    return (
      <PressableScale onPress={go} style={[{ height: 360, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.sand }, shadow.card]}>
        <AppImage img={article.image} width={700} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['transparent', 'rgba(8,14,5,0.9)']} locations={[0.25, 1]} style={StyleSheet.absoluteFill} />
        <View style={{ position: 'absolute', left: 20, right: 20, bottom: 20, gap: 8 }}>
          <View style={{ alignSelf: 'flex-start', backgroundColor: colors.orange, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.5 }} color={colors.white}>{article.category.toUpperCase()}</Text>
          </View>
          <Text v="h1" color={colors.white}>{article.title}</Text>
          <Text v="small" color="rgba(255,255,255,0.8)">{formatDate(article.date)}{article.readTime ? ` · ${article.readTime} min read` : ''}</Text>
        </View>
      </PressableScale>
    );
  }
  return (
    <PressableScale onPress={go} style={[{ flexDirection: 'row', gap: 14, backgroundColor: colors.white, borderRadius: radius.lg, padding: 10 }, shadow.card]}>
      <AppImage img={article.image} width={400} style={{ width: 100, height: 100, borderRadius: radius.md }} />
      <View style={{ flex: 1, justifyContent: 'center', gap: 4 }}>
        <Text v="caption" color={colors.green}>{article.category.toUpperCase()}</Text>
        <Text v="h3" numberOfLines={2}>{article.title}</Text>
        <Text v="small" color={colors.muted}>{formatDate(article.date)}{article.readTime ? ` · ${article.readTime} min` : ''}</Text>
      </View>
    </PressableScale>
  );
}

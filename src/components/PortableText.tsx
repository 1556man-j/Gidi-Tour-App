import { View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { colors, fonts, type as t } from '@/theme';
import type { PortableBlock } from '@/lib/types';
import { AppImage } from './ui/AppImage';
import { Text } from './ui/Text';

type Span = NonNullable<PortableBlock['children']>[number];

function Spans({ block, base }: { block: PortableBlock; base: object }) {
  return (
    <Text style={base as never}>
      {(block.children ?? []).map((c: Span, i) => {
        const marks = c.marks ?? [];
        const link = marks.map((m) => block.markDefs?.find((d) => d._key === m && d._type === 'link')).find(Boolean);
        return (
          <Text
            key={i}
            style={{
              fontFamily: marks.includes('strong') ? fonts.bold : marks.includes('em') ? fonts.serifItalic : base && (base as { fontFamily?: string }).fontFamily,
              textDecorationLine: link ? 'underline' : 'none',
            }}
            color={link ? colors.greenDeep : undefined}
            onPress={link?.href ? () => WebBrowser.openBrowserAsync(link.href!) : undefined}
          >
            {c.text}
          </Text>
        );
      })}
    </Text>
  );
}

/** Renders the website's Portable Text article bodies natively. */
export function PortableText({ blocks }: { blocks?: PortableBlock[] }) {
  if (!blocks?.length) return null;
  return (
    <View style={{ gap: 16 }}>
      {blocks.map((b, i) => {
        if (b._type === 'image') return <AppImage key={b._key ?? i} img={{ asset: b.asset! }} width={1000} style={{ width: '100%', aspectRatio: 1.4, borderRadius: 20 }} />;
        if (b._type === 'quote' || b.style === 'blockquote') {
          return (
            <View key={b._key ?? i} style={{ borderLeftWidth: 3, borderLeftColor: colors.orange, paddingLeft: 16 }}>
              <Spans block={b} base={{ ...t.h3, fontFamily: fonts.serifItalic, fontSize: 22, lineHeight: 30, color: colors.ink }} />
            </View>
          );
        }
        if (b._type !== 'block') return null;
        if (b.style === 'h2') return <Spans key={b._key ?? i} block={b} base={{ ...t.h2, color: colors.ink, marginTop: 8 }} />;
        if (b.style === 'h3') return <Spans key={b._key ?? i} block={b} base={{ ...t.h3, color: colors.ink, marginTop: 4 }} />;
        if (b.listItem) {
          return (
            <View key={b._key ?? i} style={{ flexDirection: 'row', gap: 10, paddingLeft: 4 }}>
              <Text color={colors.green}>•</Text>
              <View style={{ flex: 1 }}><Spans block={b} base={{ ...t.body, fontSize: 16, lineHeight: 26, color: colors.ink }} /></View>
            </View>
          );
        }
        return <Spans key={b._key ?? i} block={b} base={{ ...t.body, fontSize: 16, lineHeight: 27, color: 'rgba(18,32,13,0.82)' }} />;
      })}
    </View>
  );
}

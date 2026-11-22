import { StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { colors, type as t } from '@/theme';

type Variant = keyof typeof t;
interface Props extends TextProps {
  v?: Variant;
  color?: string;
  center?: boolean;
  style?: TextStyle | TextStyle[] | (TextStyle | undefined | false)[];
}

/** Android clips custom-font glyphs when lineHeight is unset or tighter than ~1.2x the font size, so enforce a floor. */
function safe(style: TextStyle): TextStyle {
  const size = style.fontSize ?? 14;
  const min = Math.ceil(size * 1.2);
  if (style.lineHeight == null || style.lineHeight < min) return { ...style, lineHeight: min };
  return style;
}

export function Text({ v = 'body', color = colors.ink, center, style, ...rest }: Props) {
  const flat = StyleSheet.flatten([t[v] as TextStyle, { color }, center && { textAlign: 'center' }, style as TextStyle]) as TextStyle;
  return <RNText {...rest} style={safe(flat)} />;
}

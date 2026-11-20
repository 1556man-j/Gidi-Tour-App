import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { colors, type as t } from '@/theme';

type Variant = keyof typeof t;
interface Props extends TextProps {
  v?: Variant;
  color?: string;
  center?: boolean;
  style?: TextStyle | TextStyle[] | (TextStyle | undefined | false)[];
}

export function Text({ v = 'body', color = colors.ink, center, style, ...rest }: Props) {
  return (
    <RNText
      {...rest}
      style={[t[v] as TextStyle, { color }, center && { textAlign: 'center' }, style as TextStyle]}
    />
  );
}

import { type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, fonts, radius } from '@/theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

type Variant = 'primary' | 'accent' | 'dark' | 'soft' | 'outline' | 'ghost' | 'light';
interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  size?: 'md' | 'lg' | 'sm';
  style?: StyleProp<ViewStyle>;
  full?: boolean;
}

const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.green, fg: colors.white },
  accent: { bg: colors.orange, fg: colors.white },
  dark: { bg: colors.ink, fg: colors.cream },
  soft: { bg: colors.greenSoft, fg: colors.greenDeep },
  outline: { bg: 'transparent', fg: colors.ink, border: colors.line },
  ghost: { bg: 'transparent', fg: colors.ink },
  light: { bg: colors.white, fg: colors.ink },
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, icon, iconRight, size = 'lg', style, full = true }: Props) {
  const p = palette[variant];
  const h = size === 'lg' ? 56 : size === 'md' ? 48 : 38;
  return (
    <PressableScale
      onPress={loading || disabled ? undefined : onPress}
      disabled={disabled}
      hapticOnPress={!disabled && !loading}
      style={[
        styles.base,
        { backgroundColor: p.bg, height: h, opacity: disabled ? 0.45 : 1, alignSelf: full ? 'stretch' : 'flex-start', paddingHorizontal: size === 'sm' ? 16 : 24 },
        p.border ? { borderWidth: 1.5, borderColor: p.border } : null,
        style,
      ]}
    >
      {loading ? (
        <Animated.View entering={FadeIn}>
          <ActivityIndicator color={p.fg} />
        </Animated.View>
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={{ fontFamily: fonts.semibold, fontSize: size === 'sm' ? 14 : 16, letterSpacing: -0.2 }} color={p.fg}>{title}</Text>
          {iconRight}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});

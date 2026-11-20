import { forwardRef, useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  FadeInDown, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors, fonts, radius, springs } from '@/theme';
import { Text } from './Text';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  right?: ReactNode;
  left?: ReactNode;
}

export const Input = forwardRef<TextInput, Props>(function Input({ label, error, right, left, value, onFocus, onBlur, multiline, style, ...rest }, ref) {
  const [focused, setFocused] = useState(false);
  const f = useSharedValue(0);
  const filled = useSharedValue(value ? 1 : 0);
  const shake = useSharedValue(0);

  useEffect(() => { filled.value = withSpring(focused || !!value ? 1 : 0, springs.snappy); }, [focused, value, filled]);
  useEffect(() => { if (error) shake.value = withSequence(withTiming(-7, { duration: 55 }), withTiming(7, { duration: 90 }), withTiming(-4, { duration: 80 }), withTiming(0, { duration: 60 })); }, [error, shake]);

  const box = useAnimatedStyle(() => ({
    borderColor: error ? colors.danger : interpolateColor(f.value, [0, 1], [colors.line, colors.green]),
    backgroundColor: interpolateColor(f.value, [0, 1], ['#FFFFFF', '#FFFFFF']),
    transform: [{ translateX: shake.value }],
    shadowOpacity: interpolate(f.value, [0, 1], [0, 0.18]),
  }));
  const lab = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(filled.value, [0, 1], [0, multiline ? -14 : -11]) }, { scale: interpolate(filled.value, [0, 1], [1, 0.76]) }],
  }));

  return (
    <View style={{ marginBottom: 14 }}>
      <Animated.View style={[styles.box, multiline && { minHeight: 110, alignItems: 'flex-start', paddingTop: 22 }, box]}>
        {left}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Animated.View pointerEvents="none" style={[styles.labelWrap, multiline && { top: 0, height: undefined }, lab]}>
            <Text v="body" color={error ? colors.danger : focused ? colors.greenDeep : colors.muted} style={{ fontFamily: fonts.medium }}>{label}</Text>
          </Animated.View>
          <TextInput
            ref={ref as never}
            value={value}
            multiline={multiline}
            placeholderTextColor={colors.faint}
            selectionColor={colors.green}
            onFocus={(e) => { setFocused(true); f.value = withTiming(1, { duration: 180 }); onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); f.value = withTiming(0, { duration: 180 }); onBlur?.(e); }}
            style={[styles.input, multiline && { textAlignVertical: 'top', minHeight: 70 }, style]}
            {...rest}
          />
        </View>
        {right}
      </Animated.View>
      {error ? (
        <Animated.View entering={FadeInDown.duration(220)}>
          <Text v="small" color={colors.danger} style={{ marginTop: 6, marginLeft: 6 }}>{error}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  box: {
    minHeight: 60, borderRadius: radius.md, borderWidth: 1.5, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10,
    shadowColor: colors.green, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  labelWrap: { position: 'absolute', left: 0, top: 0, bottom: 0, justifyContent: 'center', transformOrigin: 'left center' },
  input: { fontFamily: fonts.medium, fontSize: 16, color: colors.ink, paddingTop: 18, paddingBottom: 4, minHeight: 56, outlineStyle: 'none' } as object,
});

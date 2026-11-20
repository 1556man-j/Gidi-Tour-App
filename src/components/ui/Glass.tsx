import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

/**
 * Frosted-glass layer. Real blur is smooth on iPhone but very heavy on many Android phones
 * (it makes lists stutter and can run low-end devices out of memory), so Android gets the same
 * look from a plain translucent colour, which is passed in through `style`.
 */
export function Glass({ intensity = 40, tint = 'light', style }: { intensity?: number; tint?: 'light' | 'dark'; style?: StyleProp<ViewStyle> }) {
  if (Platform.OS === 'android') return <View pointerEvents="none" style={style} />;
  return <BlurView intensity={intensity} tint={tint} style={style} />;
}

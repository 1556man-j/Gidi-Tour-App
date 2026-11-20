import { useEffect } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Compass } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { colors, fonts } from '@/theme';

export default function NotFound() {
  const r = useSharedValue(-18);
  useEffect(() => { r.value = withRepeat(withTiming(18, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true); }, [r]);
  const needle = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return (
    <Screen style={{ alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Animated.View entering={FadeInDown.springify()} style={{ alignItems: 'center', gap: 14 }}>
        <Animated.View style={[{ width: 120, height: 120, borderRadius: 60, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }, needle]}>
          <Compass size={56} color={colors.green} />
        </Animated.View>
        <Text style={{ fontFamily: fonts.serifItalic, fontSize: 64, lineHeight: 70 }} color={colors.orange}>404</Text>
        <Text v="h2" center>Looks like we took a wrong turn</Text>
        <Text color={colors.muted} center>That page doesn't exist, but plenty of great places do.</Text>
        <View style={{ alignSelf: 'stretch', marginTop: 10 }}><Button title="Take me home" onPress={() => router.replace('/')} /></View>
      </Animated.View>
    </Screen>
  );
}

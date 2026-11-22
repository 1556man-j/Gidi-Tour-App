import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User } from 'lucide-react-native';
import { CartButton } from '@/components/CartButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/stores/auth';
import { Avatar } from '@/components/account/Avatar';
import { useBootstrap } from '@/hooks/useBootstrap';
import { colors, fonts } from '@/theme';

export function TopBar({ scrollY }: { scrollY: SharedValue<number> }) {
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const status = useAuth((s) => s.status);
  const { customer } = useBootstrap();
  const bg = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [120, 260], [0, 1], Extrapolation.CLAMP) }));
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.cream, borderBottomWidth: 1, borderBottomColor: colors.line }, bg]} />
      <View style={{ paddingTop: insets.top + 8, paddingBottom: 10, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.cream, borderRadius: 24, paddingLeft: 8, paddingRight: 14, height: 46 }}>
          <Image source={require('../../../assets/images/logo-mark.png')} style={{ width: 24, height: 26 }} contentFit="contain" />
          <Text style={{ fontFamily: fonts.bold, fontSize: 19, letterSpacing: -0.6 }} color={colors.ink}>
            Gidi<Text style={{ fontFamily: fonts.bold, fontSize: 19 }} color={colors.orange}>Tour</Text>
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <CartButton />
          <PressableScale onPress={() => router.push(status === 'authed' ? '/account' : '/login')} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' }}>
            {status === 'authed' ? <Avatar uri={customer?.avatarUrl} name={customer?.name ?? user?.name} email={user?.email} size={46} /> : <User size={20} color={colors.white} />}
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

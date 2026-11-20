import { View } from 'react-native';
import { Image } from 'expo-image';
import { initials } from '@/lib/format';
import { colors, fonts } from '@/theme';
import { Text } from '@/components/ui/Text';

export function Avatar({ uri, name, email, size = 84 }: { uri?: string | null; name?: string; email?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {uri ? <Image source={{ uri }} style={{ width: size, height: size }} contentFit="cover" /> : <Text style={{ fontFamily: fonts.bold, fontSize: size * 0.36 }} color={colors.white}>{initials(name, email)}</Text>}
    </View>
  );
}

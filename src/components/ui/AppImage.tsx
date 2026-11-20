import { Image, type ImageProps } from 'expo-image';
import type { ImageStyle, StyleProp } from 'react-native';
import { imageSource } from '@/lib/sanity';
import type { Img } from '@/lib/types';
import { colors } from '@/theme';

interface Props extends Omit<ImageProps, 'source'> {
  img?: Img | string | null;
  width?: number;
  style?: StyleProp<ImageStyle>;
}

/** A CMS image with a soft fade-in and a warm placeholder colour. */
export function AppImage({ img, width = 900, style, ...rest }: Props) {
  return (
    <Image
      source={imageSource(img, width)}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
      style={[{ backgroundColor: colors.sand }, style as ImageStyle]}
      {...rest}
    />
  );
}

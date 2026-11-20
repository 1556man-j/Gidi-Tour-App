import { Platform } from 'react-native';

export const colors = {
  cream: '#F7F3EA',
  sand: '#EFE8D8',
  card: '#FFFFFF',
  ink: '#12200D',
  forest: '#1B2E12',
  green: '#5C9B19',
  greenDeep: '#3F7410',
  greenSoft: '#E4EFD3',
  orange: '#F98315',
  orangeSoft: '#FDE8D2',
  line: 'rgba(18,32,13,0.09)',
  muted: 'rgba(18,32,13,0.58)',
  faint: 'rgba(18,32,13,0.38)',
  white: '#FFFFFF',
  danger: '#D1432F',
  dangerSoft: '#FBE4DF',
  overlay: 'rgba(12,20,8,0.55)',
};

export const radius = { sm: 12, md: 18, lg: 24, xl: 32, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, huge: 48 };

export const fonts = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
  black: 'Geist_800ExtraBold',
  serif: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
};

export const type = {
  display: { fontFamily: fonts.bold, fontSize: 44, lineHeight: 46, letterSpacing: -1.8 },
  h1: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 36, letterSpacing: -1.1 },
  h2: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 28, letterSpacing: -0.7 },
  h3: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 23, letterSpacing: -0.3 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, letterSpacing: -0.1 },
  bodyStrong: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, letterSpacing: -0.1 },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  caption: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 1.2 },
} as const;

export const springs = {
  snappy: { damping: 18, stiffness: 260, mass: 0.7 },
  soft: { damping: 20, stiffness: 140, mass: 0.9 },
  bouncy: { damping: 11, stiffness: 190, mass: 0.8 },
};

export const shadow = {
  card: Platform.select({
    ios: { shadowColor: '#1B2E12', shadowOpacity: 0.12, shadowRadius: 22, shadowOffset: { width: 0, height: 12 } },
    android: { elevation: 6 },
    default: { boxShadow: '0 12px 28px rgba(27,46,18,0.12)' } as object,
  }) as object,
  float: Platform.select({
    ios: { shadowColor: '#1B2E12', shadowOpacity: 0.22, shadowRadius: 28, shadowOffset: { width: 0, height: 16 } },
    android: { elevation: 12 },
    default: { boxShadow: '0 18px 40px rgba(27,46,18,0.22)' } as object,
  }) as object,
};

export const TAB_BAR_HEIGHT = 74;

/** Bottom padding for scrollable tab screens so content clears the floating tab bar. */
export const TAB_PAD = 124;

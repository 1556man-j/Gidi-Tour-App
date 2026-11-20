import { View } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { colors, fonts } from "@/theme";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

/** Heading with an italic serif accent, e.g. "Popular <i>right now</i>". */
export function Heading({
  before,
  accent,
  after,
  size = 26,
  color = colors.ink,
  accentColor = colors.orange,
}: {
  before?: string;
  accent: string;
  after?: string;
  size?: number;
  color?: string;
  accentColor?: string;
}) {
  return (
    <Text
      style={{
        fontFamily: fonts.bold,
        fontSize: size,
        lineHeight: size * 1.08,
        letterSpacing: -size * 0.03,
      }}
      color={color}
    >
      {before ? `${before} ` : ""}
      <Text
        style={{
          fontFamily: fonts.serifItalic,
          fontSize: size * 1.12,
          letterSpacing: -0.3,
        }}
        color={accentColor}
      >
        {accent}
      </Text>
      {after ? ` ${after}` : ""}
    </Text>
  );
}

export function SectionHeader({
  before,
  accent,
  after,
  action,
  onAction,
  pad = 20,
}: {
  before?: string;
  accent: string;
  after?: string;
  action?: string;
  onAction?: () => void;
  pad?: number;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: pad,
        marginBottom: 14,
        width: '100%',
      }}
    >
      <View style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
        <Heading before={before} accent={accent} after={after} />
      </View>

     {action ? (
  <PressableScale
    onPress={onAction}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
      position: 'relative',
      zIndex: 99,
      gap: 6,
      paddingVertical: 6,
    }}
  >
    <Text v="bodyStrong" color={colors.greenDeep}>
      {action}
    </Text>

    <View style={{ position: 'relative', zIndex: 100 }}>
      <ArrowRight
        size={18}
        color={colors.greenDeep}
        strokeWidth={2.5}
      />
    </View>
  </PressableScale>
) : null}
    </View>
  );
}

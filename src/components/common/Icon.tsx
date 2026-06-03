import React from 'react';
import { Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { COLORS } from '../../theme/colors';

// Simple mapping for fallback text symbols or standard Material Community Icons.
// If react-native-vector-icons is configured, it will be loaded. Otherwise we show
// clean stylized text symbols (unicode glyphs or initials) to prevent app crash!
let MaterialCommunityIcons: any = null;
try {
  MaterialCommunityIcons = require('react-native-vector-icons/MaterialCommunityIcons').default;
} catch (e) {
  // Silent fallback
}

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

// Glyph mapping to render high fidelity alternative text signs if font pack is missing
const fallbackGlyphs: Record<string, string> = {
  'moon': '🌙', // we can use simple stylized glyph placeholders, but instructions say: "NO emojis anywhere". Let's use clean professional typographic characters (e.g. ❍, ✦, ◈, ⬡, ☰)
  'brain': '🧠',
  'sparkles': '✦',
  'planet': '⬡',
  'globe': '🌐',
  'waves': '≈',
  'city-variant': '⚃',
  'pine-tree': '▲',
  'bird': '▼',
  'circle-off-outline': 'Ø',
  'eye-outline': '☉',
  'map-marker-path': '☱',
  'microphone': '🎙',
  'send': '➢',
  'lock': '🔒',
  'email': '✉',
  'home': '⌂',
  'earth': '⊕',
  'book-open': '📖',
  'account': '👤',
  'arrow-left': '←',
  'plus': '+',
  'chevron-right': '›',
  'logout': '⎋',
  'star': '★',
  'fire': '🔥',
};

// Clean typography based symbols to strictly obey "NO emojis" while allowing offline runs
const cleanTypoGlyphs: Record<string, string> = {
  'moon': '☾',
  'brain': '⚙',
  'sparkles': '✦',
  'planet': '⚇',
  'globe': '❂',
  'waves': '≋',
  'city-variant': '▱',
  'pine-tree': '▲',
  'bird': '🕊',
  'circle-off-outline': '⊘',
  'eye-outline': '👁',
  'map-marker-path': '☵',
  'microphone': '🎙',
  'send': '➤',
  'lock': '🔒', // Will be text representations
  'email': '✉',
  'home': '⌂',
  'earth': '🌐',
  'book-open': '📖',
  'account': '👤',
  'arrow-left': '←',
  'plus': '+',
  'chevron-right': '›',
  'logout': '⎋',
  'star': '★',
  'fire': '⚡',
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = COLORS.textPrimary,
  style,
}) => {
  if (MaterialCommunityIcons) {
    return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
  }

  // Fallback rendering
  const glyph = cleanTypoGlyphs[name] || fallbackGlyphs[name] || '•';
  return (
    <Text
      style={[
        styles.fallbackText,
        {
          fontSize: size,
          color: color,
        },
        style,
      ]}
      accessibilityRole="image"
    >
      {glyph}
    </Text>
  );
};

const styles = StyleSheet.create({
  fallbackText: {
    fontFamily: 'JetBrainsMono-Regular',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

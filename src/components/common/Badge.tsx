import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY, FONT_SIZES } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';

interface BadgeProps {
  label: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = COLORS.primary,
  style,
}) => {
  return (
    <View
      style={[
        styles.badge,
        {
          borderColor: color,
          backgroundColor: `${color}15`, // subtle opacity
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';

interface SymbolTagProps {
  symbol: string;
}

export const SymbolTag: React.FC<SymbolTagProps> = ({ symbol }) => {
  return (
    <View style={styles.tag}>
      <Text style={styles.symbolText}>#{symbol}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  symbolText: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 12,
    color: COLORS.secondary,
  },
});

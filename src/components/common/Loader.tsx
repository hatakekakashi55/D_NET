import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY, FONT_SIZES } from '../../theme/typography';
import { SPACING } from '../../theme/spacing';

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  message,
  fullScreen = false,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    zIndex: 999,
  },
  message: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});

import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ViewStyle,
  StyleProp,
  Animated,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY, FONT_SIZES } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  fullWidth = true,
  style,
}) => {
  // Scale animation value for tap feedback (0.97 scale spring effect)
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          button: styles.secondaryButton,
          text: styles.secondaryText,
        };
      case 'ghost':
        return {
          button: styles.ghostButton,
          text: styles.ghostText,
        };
      case 'danger':
        return {
          button: styles.dangerButton,
          text: styles.dangerText,
        };
      case 'primary':
      default:
        return {
          button: styles.primaryButton,
          text: styles.primaryText,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isLoading}
        style={({ pressed }) => [
          styles.buttonBase,
          variantStyles.button,
          disabled && styles.disabledButton,
          pressed && { opacity: 0.9 },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={variant === 'secondary' || variant === 'ghost' ? COLORS.primary : COLORS.textPrimary} />
        ) : (
          <Text style={[styles.textBase, variantStyles.text, disabled && styles.disabledText]}>
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  buttonBase: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  textBase: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
  // Primary
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryText: {
    color: COLORS.textPrimary,
  },
  // Secondary
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryText: {
    color: COLORS.primary,
  },
  // Ghost
  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: COLORS.textSecondary,
  },
  // Danger
  dangerButton: {
    backgroundColor: COLORS.danger,
  },
  dangerText: {
    color: COLORS.textPrimary,
  },
  // Disabled
  disabledButton: {
    backgroundColor: COLORS.border,
    borderColor: 'transparent',
  },
  disabledText: {
    color: COLORS.textMuted,
  },
});

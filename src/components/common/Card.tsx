import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  Pressable,
  Animated,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  glow = false,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
    }).start();
  };

  const cardContent = (
    <View
      style={[
        styles.card,
        glow && styles.glowBorder,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {cardContent}
        </Pressable>
      </Animated.View>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  glowBorder: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});

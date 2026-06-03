import React from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { DreamListItem } from '../../types/dream.types';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatDate';

interface DreamCardProps {
  dream: DreamListItem;
  onPress: () => void;
}

export const DreamCard: React.FC<DreamCardProps> = ({ dream, onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
    }).start();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.container,
          pressed && { opacity: 0.95 },
        ]}
      >
        {/* Left vertical color strip */}
        <View
          style={[
            styles.colorStrip,
            { backgroundColor: dream.realm_color || COLORS.primary },
          ]}
        />

        {/* Content area */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.archetype} numberOfLines={1}>
              {dream.archetype}
            </Text>
            <Text style={styles.date}>
              {formatDate(dream.created_at)}
            </Text>
          </View>
          <Text style={styles.preview} numberOfLines={2}>
            {dream.preview}
          </Text>
        </View>

        {/* Right badge container */}
        <View style={styles.badgeContainer}>
          <Badge label={dream.realm} color={dream.realm_color} />
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  container: {
    height: 80,
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  colorStrip: {
    width: 4,
    height: '100%',
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderBottomLeftRadius: BORDER_RADIUS.md,
  },
  content: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  archetype: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.xs,
  },
  date: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  preview: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  badgeContainer: {
    justifyContent: 'center',
    paddingRight: SPACING.sm,
  },
});

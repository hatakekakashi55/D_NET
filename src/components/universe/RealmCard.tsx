import React from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { Realm } from '../../types/universe.types';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';
import { Icon } from '../common/Icon';

interface RealmCardProps {
  realm: Realm;
  onPress: () => void;
  isActive?: boolean;
}

export const RealmCard: React.FC<RealmCardProps> = ({
  realm,
  onPress,
  isActive = false,
}) => {
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
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.container,
          isActive && styles.activeBorder,
          pressed && { opacity: 0.95 },
        ]}
      >
        <View style={styles.cardBody}>
          <Icon
            name={realm.icon}
            size={32}
            color={realm.color}
            style={styles.icon}
          />
          <Text style={styles.name} numberOfLines={1}>
            {realm.name}
          </Text>
          <Text style={styles.population}>
            {realm.population} dreamers
          </Text>
        </View>
        
        {/* Bottom accent colored border */}
        <View style={[styles.bottomLine, { backgroundColor: realm.color }]} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: SPACING.xs,
  },
  container: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 120,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardBody: {
    padding: SPACING.md,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: SPACING.xs,
  },
  name: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 15,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  population: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  bottomLine: {
    height: 2,
    width: '100%',
  },
  activeBorder: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
});

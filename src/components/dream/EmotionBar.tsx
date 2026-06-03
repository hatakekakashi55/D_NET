import React from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';

interface EmotionBarProps {
  emotion: string;
  percentage: number;
  color: string;
}

export const EmotionBar: React.FC<EmotionBarProps> = ({
  emotion,
  percentage,
  color,
}) => {
  const widthAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: percentage,
      useNativeDriver: false, // width animation requires layout ref (false)
      speed: 12,
      bounciness: 4,
    }).start();
  }, [percentage]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{emotion}</Text>
        <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
      </View>
      
      {/* Background Track */}
      <View style={styles.track}>
        {/* Animated Bar Fill */}
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: animatedWidth,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  label: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  percentage: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 12,
    fontWeight: 'bold',
  },
  track: {
    height: 6,
    backgroundColor: `${COLORS.textMuted}20`,
    borderRadius: BORDER_RADIUS.pill,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.pill,
  },
});

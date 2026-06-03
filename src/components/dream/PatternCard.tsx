import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface PatternCardProps {
  title: string;
  description: string;
  icon: string;
  color?: string;
}

export const PatternCard: React.FC<PatternCardProps> = ({
  title,
  description,
  icon,
  color = COLORS.primary,
}) => {
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Icon name={icon} size={22} color={color} />
        <Text style={[styles.title, { color }]}>{title}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 220,
    marginRight: SPACING.md,
    height: 120,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: 14,
    marginLeft: SPACING.sm,
  },
  description: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});

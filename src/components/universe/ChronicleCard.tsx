import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Chronicle } from '../../types/universe.types';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatDate';

interface ChronicleCardProps {
  chronicle: Chronicle;
  onPress: () => void;
}

export const ChronicleCard: React.FC<ChronicleCardProps> = ({
  chronicle,
  onPress,
}) => {
  return (
    <Card
      onPress={onPress}
      style={[
        styles.container,
        { borderLeftColor: chronicle.realm_color || COLORS.primary },
      ]}
    >
      <View style={styles.header}>
        <Badge label={chronicle.realm_name} color={chronicle.realm_color} />
        <Text style={styles.date}>
          {formatDate(chronicle.generated_date)}
        </Text>
      </View>
      <Text style={styles.story} numberOfLines={2}>
        {chronicle.story}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 3,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  date: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  story: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useDreamStore } from '../../store/dreamStore';
import { DreamAnalysis } from '../../types/dream.types';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';
import { Icon } from '../../components/common/Icon';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmotionBar } from '../../components/dream/EmotionBar';
import { SymbolTag } from '../../components/dream/SymbolTag';
import { getEmotionColor } from '../../utils/dreamHelpers';
import { formatDate } from '../../utils/formatDate';

type DreamDetailRouteProp = RouteProp<RootStackParamList, 'DreamDetail'>;

export const DreamDetailScreen: React.FC = () => {
  const route = useRoute<DreamDetailRouteProp>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { fetchDreamDetail, isLoading, error } = useDreamStore();

  const { dreamId } = route.params;
  const [detail, setDetail] = useState<DreamAnalysis | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      const res = await fetchDreamDetail(dreamId);
      if (res) {
        setDetail(res);
      }
    };
    loadDetail();
  }, [dreamId]);

  if (isLoading || !detail) {
    return <Loader fullScreen message="Entering the dream memory..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="circle-off-outline" size={48} color={COLORS.danger} />
        <Text style={styles.errorText}>Something went wrong</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{formatDate(detail.created_at)}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Realm Badge and Title */}
        <View style={styles.metaRow}>
          <Badge label={detail.realm} color={detail.realm_color} />
          {detail.pattern_note ? (
            <Text style={styles.patternNote}>{detail.pattern_note}</Text>
          ) : null}
        </View>

        <Text style={styles.archetype}>{detail.archetype}</Text>
        <Text style={styles.theme}>{detail.theme}</Text>

        {/* Emotions Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emotion Resonance</Text>
          <View style={styles.card}>
            {Object.entries(detail.emotions).map(([emotion, percentage]) => (
              <EmotionBar
                key={emotion}
                emotion={emotion}
                percentage={percentage}
                color={getEmotionColor(emotion)}
              />
            ))}
          </View>
        </View>

        {/* Symbols tags cloud */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extracted Symbols</Text>
          <View style={styles.symbolsContainer}>
            {detail.symbols.map((symbol) => (
              <SymbolTag key={symbol} symbol={symbol} />
            ))}
          </View>
        </View>

        {/* AI Psychological Insight */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Subconscious Insight</Text>
          <View style={[styles.insightCard, { borderLeftColor: detail.realm_color }]}>
            <Text style={styles.insightText}>
              {detail.insight}
            </Text>
          </View>
        </View>

        {/* Realm exploration CTA */}
        <Pressable
          onPress={() => navigation.navigate('RealmDetail', { realmName: detail.realm })}
          style={({ pressed }) => [
            styles.realmBtn,
            { backgroundColor: detail.realm_color },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={styles.realmBtnText}>Explore {detail.realm}</Text>
          <Icon name="chevron-right" size={20} color={COLORS.textPrimary} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  patternNote: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 12,
    color: COLORS.glow,
    fontStyle: 'italic',
  },
  archetype: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 32,
    color: COLORS.textPrimary,
    lineHeight: 38,
    marginBottom: SPACING.xs,
  },
  theme: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: 14,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  symbolsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  insightCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    padding: SPACING.md,
  },
  insightText: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  realmBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  realmBtnText: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  backBtn: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  backBtnText: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: 14,
    color: COLORS.primary,
  },
});

export default DreamDetailScreen;

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Pressable,
  Modal,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useUniverseStore } from '../../store/universeStore';
import { RealmDetail } from '../../types/universe.types';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY, FONT_SIZES } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';
import { Icon } from '../../components/common/Icon';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmotionBar } from '../../components/dream/EmotionBar';
import { SymbolTag } from '../../components/dream/SymbolTag';
import { getEmotionColor } from '../../utils/dreamHelpers';

type RealmDetailRouteProp = RouteProp<RootStackParamList, 'RealmDetail'>;

export const RealmDetailScreen: React.FC = () => {
  const route = useRoute<RealmDetailRouteProp>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { fetchRealmDetail, isLoading, error } = useUniverseStore();

  const { realmName } = route.params;
  const [detail, setDetail] = useState<RealmDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      const res = await fetchRealmDetail(realmName);
      if (res) {
        setDetail(res);
      }
    };
    loadDetail();
  }, [realmName]);

  if (isLoading || !detail) {
    return <Loader fullScreen message={`Entering ${realmName}...`} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>REALM METADATA</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Realm Hero Title */}
        <View style={styles.heroRow}>
          <Text style={styles.heroTitle}>{detail.name}</Text>
          <Badge label={`${detail.population} dreamers`} color={detail.color} />
        </View>

        {/* Local Dreamer Joins Counters */}
        <View style={styles.joiningStats}>
          <View style={styles.pulseDot} />
          <Text style={styles.joiningText}>
            {detail.today_count} people joined this realm today
          </Text>
        </View>

        {/* User visits stat if applicable */}
        {detail.user_visits > 0 ? (
          <View style={styles.visitPill}>
            <Icon name="star" size={14} color={COLORS.glow} />
            <Text style={styles.visitText}>
              You visited this realm {detail.user_visits} times
            </Text>
          </View>
        ) : null}

        {/* Chronicle snippet block */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Collective Dream</Text>
          <View style={[styles.card, styles.chronicleCard, { borderLeftColor: detail.color }]}>
            <Text style={styles.chronicleText} numberOfLines={3}>
              {detail.chronicle}
            </Text>
            <Pressable
              onPress={() => setModalVisible(true)}
              style={styles.modalLink}
            >
              <Text style={[styles.modalLinkText, { color: detail.color }]}>
                Read full chronicle
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Realm-wide dominant symbols cloud */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Symbols</Text>
          <View style={styles.symbolsContainer}>
            {detail.common_symbols.map((symbol) => (
              <SymbolTag key={symbol} symbol={symbol} />
            ))}
          </View>
        </View>

        {/* Realm-wide emotion statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dominant Emotions</Text>
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
      </ScrollView>

      {/* Chronicle bottom sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Badge label={detail.name} color={detail.color} />
              <Pressable onPress={() => setModalVisible(false)}>
                <Icon name="circle-off-outline" size={24} color={COLORS.textSecondary} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalStory}>{detail.chronicle}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  heroRow: {
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 36,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  joiningStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: SPACING.sm,
  },
  joiningText: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  visitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.glow}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.lg,
  },
  visitText: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 10,
    color: COLORS.glow,
    marginLeft: 4,
    fontWeight: 'bold',
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
  chronicleCard: {
    borderLeftWidth: 4,
  },
  chronicleText: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  modalLink: {
    marginTop: SPACING.sm,
  },
  modalLinkText: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: 14,
  },
  symbolsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // Modal Bottom Sheet Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    maxHeight: '60%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalStory: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
});

export default RealmDetailScreen;

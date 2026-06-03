import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Pressable,
  FlatList,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { TabParamList } from '../../navigation/TabNavigator';
import { useAuthStore } from '../../store/authStore';
import { useDreamStore } from '../../store/dreamStore';
import { useUniverseStore } from '../../store/universeStore';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY, FONT_SIZES } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';
import { Icon } from '../../components/common/Icon';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { DreamCard } from '../../components/dream/DreamCard';
import { PatternCard } from '../../components/dream/PatternCard';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList & TabParamList>>();
  const user = useAuthStore((state) => state.user);
  const { dreams, isLoading, fetchHistory } = useDreamStore();
  const { totalDreamers, dreamsToday, fetchUniverse } = useUniverseStore();

  const [recordedToday, setRecordedToday] = useState(false);
  const [todayDream, setTodayDream] = useState<any>(null);

  // Pulse animation for morning card
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchHistory(1, 10);
    fetchUniverse();
  }, []);

  useEffect(() => {
    // Check if recorded today
    if (dreams.length > 0) {
      const latest = dreams[0];
      const todayStr = new Date().toDateString();
      const latestDateStr = new Date(latest.created_at).toDateString();
      if (todayStr === latestDateStr) {
        setRecordedToday(true);
        setTodayDream(latest);
      } else {
        setRecordedToday(false);
        setTodayDream(null);
      }
    }
  }, [dreams]);

  useEffect(() => {
    if (!recordedToday) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [recordedToday]);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).toUpperCase();
  };

  if (isLoading && dreams.length === 0) {
    return <Loader fullScreen message="Mapping your dreamscape..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Block */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.display_name || 'Dreamer'}
            </Text>
            <Text style={styles.date}>{getFormattedDate()}</Text>
          </View>
          
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            style={styles.profileBtn}
          >
            <Icon name="account" size={24} color={COLORS.textPrimary} />
          </Pressable>
        </View>

        {/* Status Streak Pills */}
        <View style={styles.streakRow}>
          <View style={styles.streakPill}>
            <Icon name="fire" size={16} color={COLORS.primary} style={styles.pillIcon} />
            <Text style={styles.streakText}>
              {dreams.length > 0 ? `${dreams.length} DAY STREAK` : '0 DAY STREAK'}
            </Text>
          </View>
          
          <View style={styles.pulsePill}>
            <View style={styles.pulseDot} />
            <Text style={styles.pulseText}>
              {totalDreamers.toLocaleString()} ACTIVE TONIGHT
            </Text>
          </View>
        </View>

        {/* Morning CTA Card */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          {!recordedToday ? (
            <Card
              onPress={() => navigation.navigate('Record')}
              glow={true}
              style={styles.morningCardCta}
            >
              <View style={styles.morningCardRow}>
                <View style={styles.morningTextCol}>
                  <Text style={styles.morningTitle}>Record Today's Dream</Text>
                  <Text style={styles.morningSubtitle}>
                    Capture your subconscious thoughts before they fade away.
                  </Text>
                </View>
                <View style={styles.recordFabIcon}>
                  <Icon name="microphone" size={28} color={COLORS.textPrimary} />
                </View>
              </View>
            </Card>
          ) : (
            <Card
              onPress={() => navigation.navigate('DreamDetail', { dreamId: todayDream.id })}
              style={styles.morningCardRecorded}
            >
              <Text style={styles.recordedLabel}>TODAY'S RECORDING</Text>
              <View style={styles.recordedRow}>
                <View>
                  <Text style={styles.recordedRealm}>{todayDream?.realm}</Text>
                  <Text style={styles.recordedArchetype}>{todayDream?.archetype}</Text>
                </View>
                <View style={[styles.recordedBadge, { backgroundColor: `${todayDream?.realm_color}20` }]}>
                  <Text style={[styles.recordedBadgeText, { color: todayDream?.realm_color }]}>
                    {todayDream?.top_emotion}
                  </Text>
                </View>
              </View>
            </Card>
          )}
        </Animated.View>

        {/* Subconscious Patterns */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Patterns</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.patternsScroll}
          >
            <PatternCard
              title="Emotional Harmony"
              description="Your dreams are processing wonder and creativity with lower anxiety levels."
              icon="sparkles"
              color={COLORS.secondary}
            />
            <PatternCard
              title="Subconscious Shift"
              description="A higher frequency of water and flying symbols indicates emotional transitions."
              icon="brain"
              color={COLORS.primary}
            />
            <PatternCard
              title="Universal Rhythm"
              description="You are entering the Ocean Realm more frequently this week."
              icon="planet"
              color={COLORS.glow}
            />
          </ScrollView>
        </View>

        {/* Recent Dreams List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Dreams</Text>
          {dreams.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Icon name="moon" size={32} color={COLORS.textMuted} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No dreams recorded yet.</Text>
              <Pressable
                onPress={() => navigation.navigate('Record')}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnText}>Write your first dream</Text>
              </Pressable>
            </Card>
          ) : (
            dreams.slice(0, 3).map((item) => (
              <DreamCard
                key={item.id}
                dream={item}
                onPress={() => navigation.navigate('DreamDetail', { dreamId: item.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 100, // accommodate bottom tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  greeting: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  date: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    borderColor: COLORS.primary,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.pill,
    marginRight: SPACING.sm,
  },
  pillIcon: {
    marginRight: 4,
  },
  streakText: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  pulsePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.pill,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  pulseText: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  morningCardCta: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  morningCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  morningTextCol: {
    flex: 1,
    marginRight: SPACING.md,
  },
  morningTitle: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  morningSubtitle: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  recordFabIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  morningCardRecorded: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  recordedLabel: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  recordedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordedRealm: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  recordedArchetype: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recordedBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  recordedBadgeText: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  patternsScroll: {
    paddingRight: SPACING.lg,
  },
  emptyCard: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  emptyBtn: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  emptyBtnText: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: COLORS.primary,
  },
});

export default HomeScreen;

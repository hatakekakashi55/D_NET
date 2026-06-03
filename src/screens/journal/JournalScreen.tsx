import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useDreamStore } from '../../store/dreamStore';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY, FONT_SIZES } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';
import { Icon } from '../../components/common/Icon';
import { Loader } from '../../components/common/Loader';
import { DreamCard } from '../../components/dream/DreamCard';

const REALM_FILTERS = [
  'All',
  'Ocean Realm',
  'Falling City',
  'Lost Forest',
  'Flying Realm',
  'Void',
  'Being Watched',
  'Shadow Maze',
];

export const JournalScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { dreams, isLoading, fetchHistory } = useDreamStore();
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchHistory(1, 20, activeFilter);
  }, [activeFilter]);

  const handleSelectFilter = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleDreamPress = (id: string) => {
    navigation.navigate('DreamDetail', { dreamId: id });
  };

  if (isLoading && dreams.length === 0) {
    return <Loader fullScreen message="Reading dream scrolls..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Subconscious Journal</Text>
          <Text style={styles.subtitle}>History of your recorded dreams</Text>
        </View>

        {/* Filter bar */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {REALM_FILTERS.map((filter) => (
              <Pressable
                key={filter}
                onPress={() => handleSelectFilter(filter)}
                style={[
                  styles.filterBtn,
                  activeFilter === filter && styles.activeFilterBtn,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter && styles.activeFilterText,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Dream List / Empty State */}
        {dreams.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="moon" size={48} color={COLORS.textMuted} style={{ marginBottom: SPACING.md }} />
            <Text style={styles.emptyTitle}>Journal is empty</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'All'
                ? "Your dream journal is empty. Record your first dream."
                : `No dreams recorded in the ${activeFilter} yet.`}
            </Text>
          </View>
        ) : (
          <FlatList
            data={dreams}
            renderItem={({ item }) => (
              <DreamCard
                dream={item}
                onPress={() => handleDreamPress(item.id)}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  header: {
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 28,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  filtersWrapper: {
    marginBottom: SPACING.lg,
  },
  filtersScroll: {
    paddingRight: SPACING.lg,
  },
  filterBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    marginRight: SPACING.sm,
  },
  activeFilterBtn: {
    backgroundColor: COLORS.primary,
    borderColor: 'transparent',
  },
  filterText: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingBottom: 100, // accommodate bottom tab bar
  },
  emptyContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default JournalScreen;

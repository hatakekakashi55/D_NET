import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useUniverseStore } from '../../store/universeStore';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY, FONT_SIZES } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';
import { Loader } from '../../components/common/Loader';
import { RealmCard } from '../../components/universe/RealmCard';
import { UniverseGlobe } from '../../components/universe/UniverseGlobe';

export const UniverseScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {
    realms,
    totalDreamers,
    dreamsToday,
    mostCommonSymbol,
    isLoading,
    fetchUniverse,
  } = useUniverseStore();

  useEffect(() => {
    fetchUniverse();
  }, []);

  const renderHeader = () => {
    return (
      <View>
        {/* Animated Globe Canvas */}
        <UniverseGlobe />

        {/* Global Statistics Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{totalDreamers.toLocaleString()}</Text>
            <Text style={styles.statLbl}>DREAMERS</Text>
          </View>
          <View style={styles.statColDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{dreamsToday.toLocaleString()}</Text>
            <Text style={styles.statLbl}>DREAMING TODAY</Text>
          </View>
          <View style={styles.statColDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>#{mostCommonSymbol}</Text>
            <Text style={styles.statLbl}>TOP SYMBOL</Text>
          </View>
        </View>

        <Text style={styles.gridTitle}>Active realms</Text>
      </View>
    );
  };

  if (isLoading && realms.length === 0) {
    return <Loader fullScreen message="Expanding dream realms..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dream Universe</Text>
        </View>

        {/* 2-column grid of realms */}
        <FlatList
          data={realms}
          renderItem={({ item }) => (
            <RealmCard
              realm={item}
              onPress={() => navigation.navigate('RealmDetail', { realmName: item.name })}
            />
          )}
          keyExtractor={(item) => item.name}
          numColumns={2}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
  },
  title: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 28,
    color: COLORS.textPrimary,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    marginVertical: SPACING.lg,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  statLbl: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statColDivider: {
    height: 32,
    width: 1,
    backgroundColor: COLORS.border,
  },
  gridTitle: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  listContent: {
    paddingBottom: 100, // accommodate bottom tab bar
  },
});

export default UniverseScreen;

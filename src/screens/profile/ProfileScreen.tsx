import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuthStore } from '../../store/authStore';
import { useDreamStore } from '../../store/dreamStore';
import { dreamService } from '../../services/dreamService';
import { ProfileData } from '../../types/user.types';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY, FONT_SIZES } from '../../theme/typography';
import { BORDER_RADIUS, SPACING } from '../../theme/spacing';
import { Icon } from '../../components/common/Icon';
import { Loader } from '../../components/common/Loader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { signOut } = useAuthStore();
  const resetDreamStore = useDreamStore((state) => state.resetStore);
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await dreamService.getProfilePatterns();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load user profile metrics:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    resetDreamStore();
  };

  const getInitials = (name = 'Dreamer') => {
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading || !profile) {
    return <Loader fullScreen message="Reading your dream constellation..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>YOUR PROFILE</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar block */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(profile.display_name)}</Text>
          </View>
          <Text style={styles.name}>{profile.display_name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statVal}>{profile.stats.total_dreams}</Text>
              <Text style={styles.statLbl}>Total Dreams</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statVal}>{profile.stats.longest_streak}</Text>
              <Text style={styles.statLbl}>Longest Streak</Text>
            </Card>
          </View>
          
          <View style={styles.gridRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statVal}>{profile.stats.realms_visited}</Text>
              <Text style={styles.statLbl}>Realms Visited</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statVal}>{profile.stats.days_active}</Text>
              <Text style={styles.statLbl}>Days Active</Text>
            </Card>
          </View>
        </View>

        {/* Most Visited Realm Card */}
        {profile.most_visited_realm ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Most Visited Realm</Text>
            <Card
              onPress={() => navigation.navigate('RealmDetail', { realmName: profile.most_visited_realm! })}
              glow={true}
              style={styles.realmCard}
            >
              <View style={styles.realmRow}>
                <View style={styles.realmInfo}>
                  <Icon name="planet" size={24} color={COLORS.secondary} />
                  <Text style={styles.realmName}>{profile.most_visited_realm}</Text>
                </View>
                <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
              </View>
            </Card>
          </View>
        ) : null}

        {/* My Patterns */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subconscious Profile</Text>
          <Card style={styles.patternsCard}>
            <Text style={styles.patternsText}>
              {profile.pattern_analysis || "Record more dreams to let D-NET AI analyze your patterns."}
            </Text>
          </Card>
        </View>

        {/* Sign Out Button */}
        <Button
          label="Sign Out"
          onPress={handleSignOut}
          variant="ghost"
          style={styles.signOutBtn}
        />
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 32,
    color: COLORS.textPrimary,
  },
  name: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  email: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  grid: {
    marginBottom: SPACING.lg,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statVal: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLbl: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
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
  realmCard: {
    padding: SPACING.md,
  },
  realmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  realmInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  realmName: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  patternsCard: {
    padding: SPACING.md,
  },
  patternsText: {
    fontFamily: TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  signOutBtn: {
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

export default ProfileScreen;

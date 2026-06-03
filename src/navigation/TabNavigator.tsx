import React from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import UniverseScreen from '../screens/universe/UniverseScreen';
import RecordDreamScreen from '../screens/record/RecordDreamScreen';
import ChronicleScreen from '../screens/chronicle/ChronicleScreen';
import JournalScreen from '../screens/journal/JournalScreen';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { BORDER_RADIUS, SPACING } from '../theme/spacing';
import { Icon } from '../components/common/Icon';

export type TabParamList = {
  Home: undefined;
  Universe: undefined;
  Record: undefined;
  Chronicle: undefined;
  Journal: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Custom center raised button for Record FAB style
const CustomTabBarButton = ({ children, onPress }: any) => (
  <Pressable
    onPress={onPress}
    style={styles.customButtonWrapper}
  >
    <View style={styles.customButtonInner}>
      {children}
    </View>
  </Pressable>
);

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ color, focused }) => {
          let iconName = 'home';
          
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Universe') {
            iconName = 'earth';
          } else if (route.name === 'Record') {
            iconName = 'microphone';
          } else if (route.name === 'Chronicle') {
            iconName = 'book-open';
          } else if (route.name === 'Journal') {
            iconName = 'account'; // account represents journal profile history lists
          }

          const isActive = focused;

          return (
            <View style={styles.iconContainer}>
              <Icon name={iconName} size={24} color={color} />
              {isActive && (
                <Text style={[styles.activeLabel, { color: COLORS.primary }]}>
                  {route.name}
                </Text>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Universe" component={UniverseScreen} />
      <Tab.Screen
        name="Record"
        component={RecordDreamScreen}
        options={{
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
          tabBarIcon: () => (
            <Icon name="microphone" size={26} color={COLORS.textPrimary} />
          ),
        }}
      />
      <Tab.Screen name="Chronicle" component={ChronicleScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.lg,
    right: SPACING.lg,
    height: 64,
    backgroundColor: 'rgba(14, 14, 30, 0.85)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    top: Platform.OS === 'ios' ? 6 : 0,
  },
  activeLabel: {
    fontFamily: TYPOGRAPHY.bodyMedium,
    fontSize: 9,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  customButtonWrapper: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  customButtonInner: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import DreamDetailScreen from '../screens/journal/DreamDetailScreen';
import RealmDetailScreen from '../screens/universe/RealmDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { useAuthStore } from '../store/authStore';
import { Loader } from '../components/common/Loader';

export type RootStackParamList = {
  AuthFlow: undefined;
  MainFlow: undefined;
  DreamDetail: { dreamId: string };
  RealmDetail: { realmName: string };
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return <Loader fullScreen message="Loading subconscious realm..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#08080F' },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="AuthFlow" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="MainFlow" component={TabNavigator} />
            <Stack.Screen name="DreamDetail" component={DreamDetailScreen} />
            <Stack.Screen name="RealmDetail" component={RealmDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default AppNavigator;

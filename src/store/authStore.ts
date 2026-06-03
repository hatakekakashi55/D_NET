import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  user: { id: string; email: string; display_name?: string } | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  
  setSession: (token: string | null, user: any | null) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isOnboarded: false,
  isLoading: true,

  setSession: async (token, user) => {
    try {
      if (token) {
        await AsyncStorage.setItem('dnet_token', token);
        await AsyncStorage.setItem('dnet_user', JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem('dnet_token');
        await AsyncStorage.removeItem('dnet_user');
      }
      set({ token, user, isAuthenticated: !!token });
    } catch (e) {
      // In-memory fallback
      set({ token, user, isAuthenticated: !!token });
    }
  },

  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem('dnet_onboarded', 'true');
      set({ isOnboarded: true });
    } catch (e) {
      set({ isOnboarded: true });
    }
  },

  signOut: async () => {
    try {
      await AsyncStorage.removeItem('dnet_token');
      await AsyncStorage.removeItem('dnet_user');
      set({ token: null, user: null, isAuthenticated: false });
    } catch (e) {
      set({ token: null, user: null, isAuthenticated: false });
    }
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('dnet_token');
      const userStr = await AsyncStorage.getItem('dnet_user');
      const onboarded = await AsyncStorage.getItem('dnet_onboarded');
      
      const user = userStr ? JSON.parse(userStr) : null;
      set({
        token,
        user,
        isAuthenticated: !!token,
        isOnboarded: onboarded === 'true',
        isLoading: false,
      });
    } catch (e) {
      set({ isLoading: false });
    }
  },
}));

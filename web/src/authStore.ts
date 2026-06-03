import { create } from 'zustand';
import type { User } from './types';
import { supabase } from './supabaseClient';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;
  mockSignIn: (email: string, password: string) => Promise<void>;
  mockSignUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { display_name?: string, bio?: string, avatar_url?: string, website?: string, location?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const userObj: User = {
          id: session.user.id,
          email: session.user.email || '',
          display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Dreamer',
          created_at: session.user.created_at,
          bio: session.user.user_metadata?.bio || '',
          avatar_url: session.user.user_metadata?.avatar_url || '',
          website: session.user.user_metadata?.website || '',
          location: session.user.user_metadata?.location || ''
        };
        localStorage.setItem('dnet_token', session.access_token);
        localStorage.setItem('dnet_user', JSON.stringify(userObj));
        set({
          token: session.access_token,
          user: userObj,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem('dnet_token');
        localStorage.removeItem('dnet_user');
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      console.error("Auth init failed:", err);
      set({ isLoading: false });
    }

    // Subscribe to auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const userObj: User = {
          id: session.user.id,
          email: session.user.email || '',
          display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Dreamer',
          created_at: session.user.created_at,
          bio: session.user.user_metadata?.bio || '',
          avatar_url: session.user.user_metadata?.avatar_url || '',
          website: session.user.user_metadata?.website || '',
          location: session.user.user_metadata?.location || ''
        };
        localStorage.setItem('dnet_token', session.access_token);
        localStorage.setItem('dnet_user', JSON.stringify(userObj));
        set({
          token: session.access_token,
          user: userObj,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem('dnet_token');
        localStorage.removeItem('dnet_user');
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      }
    });
  },

  mockSignIn: async (emailInput: string, passwordInput: string) => {
    const isWayneDefault = emailInput.toLowerCase().trim() === 'wayne' && passwordInput === '123';
    const normEmail = isWayneDefault ? 'wayne@dnet.io' : (emailInput.includes('@') ? emailInput : `${emailInput}@dnet.io`);
    const normPassword = isWayneDefault ? '123000' : (passwordInput.length < 6 ? passwordInput.padEnd(6, '0') : passwordInput);

    // Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normEmail,
      password: normPassword,
    });

    if (error) {
      // Auto-create user if they don't exist yet
      if (error.message.includes("Invalid login credentials") || error.status === 400) {
        try {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: normEmail,
            password: normPassword,
            options: {
              data: {
                display_name: normEmail.split('@')[0],
                bio: 'Explore and sync your dreams.',
                avatar_color: '#8B8BF5'
              }
            }
          });
          if (signUpError) throw signUpError;
          if (signUpData.session) {
            const userObj: User = {
              id: signUpData.session.user.id,
              email: signUpData.session.user.email || '',
              display_name: signUpData.session.user.user_metadata?.display_name || signUpData.session.user.email?.split('@')[0] || 'Dreamer',
              created_at: signUpData.session.user.created_at,
              bio: signUpData.session.user.user_metadata?.bio || '',
              avatar_url: signUpData.session.user.user_metadata?.avatar_url || '',
              website: signUpData.session.user.user_metadata?.website || '',
              location: signUpData.session.user.user_metadata?.location || ''
            };
            localStorage.setItem('dnet_token', signUpData.session.access_token);
            localStorage.setItem('dnet_user', JSON.stringify(userObj));
            set({
              token: signUpData.session.access_token,
              user: userObj,
              isAuthenticated: true,
            });
            return;
          }
        } catch (signupErr: any) {
          if (signupErr.status === 429 || signupErr.message?.includes("rate limit") || signupErr.message?.includes("Too Many Requests")) {
            throw new Error("Supabase signup limit reached (Too Many Requests). Please disable 'Confirm email' and increase signup rate limits in your Supabase Dashboard under Project Settings -> Auth.");
          }
          throw new Error(signupErr.message || "Failed to auto-register account");
        }
      }
      if (error.status === 429 || error.message?.includes("rate limit") || error.message?.includes("Too Many Requests")) {
        throw new Error("Supabase signin limit reached (Too Many Requests). Please disable 'Confirm email' and increase rate limits in your Supabase Dashboard under Project Settings -> Auth.");
      }
      throw error;
    }

    if (data.session) {
      const userObj: User = {
        id: data.session.user.id,
        email: data.session.user.email || '',
        display_name: data.session.user.user_metadata?.display_name || data.session.user.email?.split('@')[0] || 'Dreamer',
        created_at: data.session.user.created_at,
        bio: data.session.user.user_metadata?.bio || '',
        avatar_url: data.session.user.user_metadata?.avatar_url || '',
        website: data.session.user.user_metadata?.website || '',
        location: data.session.user.user_metadata?.location || ''
      };
      localStorage.setItem('dnet_token', data.session.access_token);
      localStorage.setItem('dnet_user', JSON.stringify(userObj));
      set({
        token: data.session.access_token,
        user: userObj,
        isAuthenticated: true,
      });
    }
  },

  mockSignUp: async (emailInput: string, passwordInput: string) => {
    const normEmail = emailInput.includes('@') ? emailInput : `${emailInput}@dnet.io`;
    const normPassword = passwordInput.length < 6 ? passwordInput.padEnd(6, '0') : passwordInput;

    const { data, error } = await supabase.auth.signUp({
      email: normEmail,
      password: normPassword,
      options: {
        data: {
          display_name: normEmail.split('@')[0],
          bio: 'Explore and sync your dreams.'
        }
      }
    });
    if (error) throw error;
    if (data.session) {
      const userObj: User = {
        id: data.session.user.id,
        email: data.session.user.email || '',
        display_name: data.session.user.user_metadata?.display_name || data.session.user.email?.split('@')[0] || 'Dreamer',
        created_at: data.session.user.created_at,
        bio: data.session.user.user_metadata?.bio || '',
        avatar_url: data.session.user.user_metadata?.avatar_url || '',
        website: data.session.user.user_metadata?.website || '',
        location: data.session.user.user_metadata?.location || ''
      };
      localStorage.setItem('dnet_token', data.session.access_token);
      localStorage.setItem('dnet_user', JSON.stringify(userObj));
      set({
        token: data.session.access_token,
        user: userObj,
        isAuthenticated: true,
      });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('dnet_token');
    localStorage.removeItem('dnet_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateProfile: async (updates) => {
    const currentUserObj = useAuthStore.getState().user;
    if (!currentUserObj) return;

    // Update auth metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: updates
    });
    if (authError) {
      console.error("Failed to update user auth metadata:", authError);
    }

    // Update profiles table in database
    const { error: dbError } = await supabase.from('profiles').upsert({
      id: currentUserObj.id,
      ...updates
    });
    if (dbError) {
      console.error("Failed to update user profile table:", dbError);
    }

    set((state) => {
      if (!state.user) return {};
      const updatedUser: User = {
        ...state.user,
        ...updates
      };
      localStorage.setItem('dnet_user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
}));

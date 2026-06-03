import { supabase } from './supabase';
import api from './api';

// Create a mock token for local fallback testing
const createMockJwt = (email: string) => {
  return "mock-token-for-dev";
};

export const authService = {
  signIn: async (email: string, password: string) => {
    if (!supabase) {
      // Offline/No-key dev fallback mode
      console.warn("Supabase not configured, logging in with mock credentials.");
      const mockToken = createMockJwt(email);
      
      // Auto-validate via backend to initialize profile
      try {
        await api.post('/api/auth/verify', { token: mockToken });
      } catch (err) {
        console.error("Backend auth verify failed:", err);
      }
      
      return {
        user: { id: 'dev-user-uuid', email },
        session: { access_token: mockToken },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    if (data?.session) {
      // Validate and verify against FastAPI backend
      try {
        await api.post('/api/auth/verify', { token: data.session.access_token });
      } catch (err) {
        console.error("FastAPI Backend auth verification warning:", err);
      }
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  },

  signUp: async (email: string, password: string) => {
    if (!supabase) {
      // Offline/No-key dev fallback mode
      console.warn("Supabase not configured, signing up with mock credentials.");
      const mockToken = createMockJwt(email);
      
      return {
        user: { id: 'dev-user-uuid', email },
        session: { access_token: mockToken },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  },

  signOut: async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  },
};

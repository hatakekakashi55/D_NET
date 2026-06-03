import { create } from 'zustand';
import api from './api';
import type { Realm, RealmDetail, Chronicle } from './types';

interface UniverseState {
  realms: Realm[];
  chronicles: Chronicle[];
  totalDreamers: number;
  dreamsToday: number;
  mostCommonSymbol: string;
  isLoading: boolean;
  error: string | null;

  fetchUniverse: () => Promise<void>;
  fetchChronicles: () => Promise<void>;
  fetchRealmDetail: (name: string) => Promise<RealmDetail | null>;
}

export const useUniverseStore = create<UniverseState>((set) => ({
  realms: [],
  chronicles: [],
  totalDreamers: 0,
  dreamsToday: 0,
  mostCommonSymbol: '',
  isLoading: false,
  error: null,

  fetchUniverse: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/universe/realms');
      set({
        realms: res.data.realms || [],
        totalDreamers: res.data.total_dreamers || 0,
        dreamsToday: res.data.dreams_today || 0,
        mostCommonSymbol: res.data.most_common_symbol || '',
        isLoading: false,
      });
    } catch (err: any) {
      console.error('fetchUniverse error:', err);
      set({ isLoading: false, error: 'Failed to load universe data.' });
    }
  },

  fetchChronicles: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/chronicle');
      set({ chronicles: res.data.chronicles || [], isLoading: false });
    } catch (err: any) {
      console.error('fetchChronicles error:', err);
      set({ chronicles: [], isLoading: false, error: 'Failed to load chronicles.' });
    }
  },

  fetchRealmDetail: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/universe/realm/${encodeURIComponent(name)}`);
      set({ isLoading: false });
      return res.data as RealmDetail;
    } catch (err: any) {
      console.error('fetchRealmDetail error:', err);
      set({ isLoading: false, error: 'Failed to load realm details.' });
      return null;
    }
  },
}));

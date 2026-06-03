import { create } from 'zustand';
import { dreamService } from '../services/dreamService';
import { Realm, RealmDetail, Chronicle } from '../types/universe.types';

interface UniverseState {
  realms: Realm[];
  chronicles: Chronicle[];
  activeRealmDetail: RealmDetail | null;
  totalDreamers: number;
  dreamsToday: number;
  mostCommonSymbol: string;
  isLoading: boolean;
  error: string | null;

  fetchUniverse: () => Promise<void>;
  fetchRealmDetail: (name: string) => Promise<RealmDetail | null>;
  fetchChronicles: () => Promise<void>;
  clearError: () => void;
}

export const useUniverseStore = create<UniverseState>((set) => ({
  realms: [],
  chronicles: [],
  activeRealmDetail: null,
  totalDreamers: 4231,
  dreamsToday: 247,
  mostCommonSymbol: 'stars',
  isLoading: false,
  error: null,

  fetchUniverse: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await dreamService.getUniverseRealms();
      set({
        realms: data.realms,
        totalDreamers: data.total_dreamers,
        dreamsToday: data.dreams_today,
        mostCommonSymbol: data.most_common_symbol,
        isLoading: false,
      });
    } catch (e: any) {
      set({ isLoading: false, error: e.message || 'Failed to fetch universe realms.' });
    }
  },

  fetchRealmDetail: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await dreamService.getRealmDetail(name);
      set({ activeRealmDetail: data, isLoading: false });
      return data;
    } catch (e: any) {
      set({ isLoading: false, error: e.message || `Failed to fetch realm detail for ${name}.` });
      return null;
    }
  },

  fetchChronicles: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await dreamService.getChronicles();
      set({ chronicles: data.chronicles, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e.message || 'Failed to fetch chronicles.' });
    }
  },

  clearError: () => set({ error: null }),
}));

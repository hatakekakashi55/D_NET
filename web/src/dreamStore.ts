import { create } from 'zustand';
import api from './api';
import type { DreamListItem, DreamAnalysis } from './types';

interface DreamState {
  dreams: DreamListItem[];
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;

  fetchHistory: () => Promise<void>;
  analyzeNewDream: (text: string) => Promise<DreamAnalysis | null>;
  fetchDreamDetail: (id: string) => Promise<DreamAnalysis | null>;
}

export const useDreamStore = create<DreamState>((set) => ({
  dreams: [],
  isLoading: false,
  isAnalyzing: false,
  error: null,

  fetchHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/dream/history', { params: { page: 1, limit: 30 } });
      set({ dreams: res.data.dreams || [], isLoading: false });
    } catch (err: any) {
      console.error('fetchHistory error:', err);
      set({ isLoading: false, error: err.message });
    }
  },

  analyzeNewDream: async (text: string) => {
    set({ isAnalyzing: true, error: null });
    try {
      const res = await api.post('/api/dream/analyze', { text });
      const analysis: DreamAnalysis = res.data;
      // Prepend to local list
      const listItem: DreamListItem = {
        id: analysis.dream_id,
        archetype: analysis.archetype,
        preview: text.slice(0, 100),
        realm: analysis.realm,
        realm_color: analysis.realm_color,
        top_emotion: Object.entries(analysis.emotions).sort((a, b) => b[1] - a[1])[0]?.[0] || '',
        created_at: analysis.created_at,
      };
      set((state) => ({ dreams: [listItem, ...state.dreams], isAnalyzing: false }));
      return analysis;
    } catch (err: any) {
      console.error('analyzeNewDream error:', err);
      set({ isAnalyzing: false, error: err.message });
      return null;
    }
  },

  fetchDreamDetail: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/dream/${id}`);
      set({ isLoading: false });
      return res.data as DreamAnalysis;
    } catch (err: any) {
      console.error('fetchDreamDetail error:', err);
      set({ isLoading: false, error: err.message });
      return null;
    }
  },
}));

import { create } from 'zustand';
import { dreamService } from '../services/dreamService';
import { DreamAnalysis, DreamListItem } from '../types/dream.types';

interface DreamState {
  dreams: DreamListItem[];
  totalDreams: number;
  currentAnalysis: DreamAnalysis | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  page: number;

  fetchHistory: (page?: number, perPage?: number, realm?: string) => Promise<void>;
  analyzeNewDream: (text: string) => Promise<DreamAnalysis | null>;
  fetchDreamDetail: (id: string) => Promise<DreamAnalysis | null>;
  clearError: () => void;
  resetStore: () => void;
}

export const useDreamStore = create<DreamState>((set, get) => ({
  dreams: [],
  totalDreams: 0,
  currentAnalysis: null,
  isLoading: false,
  isAnalyzing: false,
  error: null,
  page: 1,

  fetchHistory: async (page = 1, perPage = 10, realm = 'All') => {
    set({ isLoading: true, error: null });
    try {
      const response = await dreamService.getDreamHistory(page, perPage, realm);
      set({
        dreams: page === 1 ? response.dreams : [...get().dreams, ...response.dreams],
        totalDreams: response.total,
        page,
        isLoading: false,
      });
    } catch (e: any) {
      set({ isLoading: false, error: e.message || 'Failed to fetch dream history.' });
    }
  },

  analyzeNewDream: async (text: string) => {
    set({ isAnalyzing: true, error: null });
    try {
      const result = await dreamService.analyzeDream(text);
      set({
        currentAnalysis: result,
        isAnalyzing: false,
        // Prepend to history local cache if any
        dreams: [
          {
            id: result.dream_id,
            archetype: result.archetype,
            theme: result.theme,
            realm: result.realm,
            realm_color: result.realm_color,
            top_emotion: Object.keys(result.emotions)[0] || 'mystery',
            top_emotion_pct: Object.values(result.emotions)[0] || 100,
            preview: text.substring(0, 100) + '...',
            created_at: result.created_at,
          },
          ...get().dreams,
        ],
      });
      return result;
    } catch (e: any) {
      set({ isAnalyzing: false, error: e.message || 'Failed to analyze dream.' });
      return null;
    }
  },

  fetchDreamDetail: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await dreamService.getDreamDetail(id);
      set({ isLoading: false });
      return result;
    } catch (e: any) {
      set({ isLoading: false, error: e.message || 'Failed to fetch dream details.' });
      return null;
    }
  },

  clearError: () => set({ error: null }),
  resetStore: () => set({ dreams: [], totalDreams: 0, currentAnalysis: null, error: null }),
}));

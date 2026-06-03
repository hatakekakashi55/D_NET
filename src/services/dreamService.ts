import api from './api';
import { DreamAnalysis, DreamListItem, DreamListResponse } from '../types/dream.types';
import { Realm, RealmDetail, Chronicle } from '../types/universe.types';
import { ProfileData } from '../types/user.types';

export const dreamService = {
  analyzeDream: async (text: string): Promise<DreamAnalysis> => {
    const response = await api.post<DreamAnalysis>('/api/dream/analyze', { text });
    return response.data;
  },

  getDreamHistory: async (page = 1, perPage = 10, realm = 'All'): Promise<DreamListResponse> => {
    const response = await api.get<DreamListResponse>('/api/dream/history', {
      params: { page, per_page: perPage, realm },
    });
    return response.data;
  },

  getDreamDetail: async (id: string): Promise<DreamAnalysis> => {
    const response = await api.get<DreamAnalysis>(`/api/dream/${id}`);
    return response.data;
  },

  getUniverseRealms: async (): Promise<{ realms: Realm[]; total_dreamers: number; dreams_today: number; most_common_symbol: string }> => {
    const response = await api.get('/api/universe/realms');
    return response.data;
  },

  getRealmDetail: async (name: string): Promise<RealmDetail> => {
    const response = await api.get<RealmDetail>(`/api/universe/realm/${name}`);
    return response.data;
  },

  getChronicles: async (): Promise<{ chronicles: Chronicle[]; total: number }> => {
    const response = await api.get('/api/chronicle');
    return response.data;
  },

  getProfilePatterns: async (): Promise<ProfileData> => {
    const response = await api.get<ProfileData>('/api/profile/patterns');
    return response.data;
  },

  getGlobalStats: async (): Promise<{ total_dreamers: number; dreams_today: number; most_common_symbol: string; active_realms: number }> => {
    const response = await api.get('/api/stats/global');
    return response.data;
  },
};

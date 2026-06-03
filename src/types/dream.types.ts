export interface DreamAnalysis {
  dream_id: string;
  symbols: string[];
  emotions: Record<string, number>;
  archetype: string;
  theme: string;
  realm: string;
  realm_color: string;
  insight: string;
  pattern_note: string;
  created_at: string;
}

export interface DreamListItem {
  id: string;
  archetype: string;
  theme: string;
  realm: string;
  realm_color: string;
  top_emotion: string;
  top_emotion_pct: number;
  preview: string;
  created_at: string;
}

export interface DreamListResponse {
  dreams: DreamListItem[];
  total: number;
  page: number;
  per_page: number;
}

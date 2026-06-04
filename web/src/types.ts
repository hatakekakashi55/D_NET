/* ── User Types ── */
export interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
  username?: string;
  pronouns?: string;
  gender?: string;
}

export interface ProfileData {
  display_name: string;
  email: string;
  stats: {
    total_dreams: number;
    longest_streak: number;
    realms_visited: number;
    days_active: number;
  };
  most_visited_realm: string | null;
  pattern_analysis: string | null;
}

/* ── Dream Types ── */
export interface DreamListItem {
  id: string;
  archetype: string;
  preview: string;
  realm: string;
  realm_color: string;
  top_emotion: string;
  created_at: string;
}

export interface DreamAnalysis {
  dream_id: string;
  archetype: string;
  theme: string;
  symbols: string[];
  emotions: Record<string, number>;
  realm: string;
  realm_color: string;
  insight: string;
  pattern_note: string;
  created_at: string;
}

/* ── Universe Types ── */
export interface Realm {
  name: string;
  icon: string;
  color: string;
  population: number;
}

export interface RealmDetail {
  name: string;
  color: string;
  population: number;
  today_count: number;
  user_visits: number;
  chronicle: string;
  common_symbols: string[];
  emotions: Record<string, number>;
}

export interface Chronicle {
  id: string;
  realm_name: string;
  realm_color: string;
  story: string;
  generated_date: string;
}

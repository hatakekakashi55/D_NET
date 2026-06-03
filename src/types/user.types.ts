export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  streak_count: number;
  last_dream_date: string | null;
  total_dreams: number;
  created_at: string;
}

export interface UserStats {
  total_dreams: number;
  longest_streak: number;
  realms_visited: number;
  days_active: number;
}

export interface ProfileData {
  display_name: string;
  email: string;
  stats: UserStats;
  most_visited_realm: string | null;
  pattern_analysis: string;
  streak_count: number;
}

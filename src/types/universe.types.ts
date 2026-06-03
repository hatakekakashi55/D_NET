export interface Realm {
  name: string;
  color: string;
  icon: string;
  population: number;
  today_count: number;
  dominant_emotion: string;
}

export interface RealmDetail {
  name: string;
  color: string;
  icon: string;
  population: number;
  today_count: number;
  dominant_emotion: string;
  chronicle: string;
  common_symbols: string[];
  emotions: Record<string, number>;
  user_visits: number;
}

export interface Chronicle {
  id: string;
  realm_name: string;
  realm_color: string;
  story: string;
  dream_count: number;
  generated_date: string;
}

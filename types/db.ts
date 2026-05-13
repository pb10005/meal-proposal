export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Tables: {
      preferences: {
        Row: {
          user_id: string;
          likes: string[];
          dislikes: string[];
          allergies: string[];
          dietary_restrictions: string[];
          updated_at: string;
        };
        Insert: {
          user_id: string;
          likes?: string[];
          dislikes?: string[];
          allergies?: string[];
          dietary_restrictions?: string[];
        };
        Update: {
          user_id?: string;
          likes?: string[];
          dislikes?: string[];
          allergies?: string[];
          dietary_restrictions?: string[];
        };
        Relationships: [];
      };
      meals_log: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          form: string;
          timing: string | null;
          eaten_at: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          category: string;
          form: string;
          timing?: string | null;
          eaten_at?: string;
        };
        Update: {
          user_id?: string;
          name?: string;
          category?: string;
          form?: string;
          timing?: string | null;
          eaten_at?: string;
        };
        Relationships: [];
      };
      suggestions_log: {
        Row: {
          id: string;
          user_id: string | null;
          input: Record<string, unknown>;
          normalized_input: Record<string, unknown> | null;
          excluded_rules: string[];
          candidates: Record<string, unknown>[];
          accepted_candidate_id: string | null;
          latency_ms: number | null;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          input: Record<string, unknown>;
          normalized_input?: Record<string, unknown> | null;
          excluded_rules?: string[];
          candidates: Record<string, unknown>[];
          accepted_candidate_id?: string | null;
          latency_ms?: number | null;
        };
        Update: {
          user_id?: string | null;
          input?: Record<string, unknown>;
          normalized_input?: Record<string, unknown> | null;
          excluded_rules?: string[];
          candidates?: Record<string, unknown>[];
          accepted_candidate_id?: string | null;
          latency_ms?: number | null;
        };
        Relationships: [];
      };
      events_log: {
        Row: {
          id: string;
          user_id: string | null;
          event_name: string;
          properties: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          event_name: string;
          properties?: Record<string, unknown>;
        };
        Update: {
          user_id?: string | null;
          event_name?: string;
          properties?: Record<string, unknown>;
        };
        Relationships: [];
      };
    };
  };
}

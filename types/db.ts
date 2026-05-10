export interface Database {
  public: {
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
        Insert: Omit<
          Database['public']['Tables']['preferences']['Row'],
          'updated_at'
        >;
        Update: Partial<
          Database['public']['Tables']['preferences']['Insert']
        >;
      };
      meals_log: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          form: string;
          eaten_at: string;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['meals_log']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<
          Database['public']['Tables']['meals_log']['Insert']
        >;
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
        Insert: Omit<
          Database['public']['Tables']['suggestions_log']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<
          Database['public']['Tables']['suggestions_log']['Insert']
        >;
      };
      events_log: {
        Row: {
          id: string;
          user_id: string | null;
          event_name: string;
          properties: Record<string, unknown>;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['events_log']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<
          Database['public']['Tables']['events_log']['Insert']
        >;
      };
    };
  };
}

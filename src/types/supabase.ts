/**
 * Supabase Database Type Definitions
 * Auto-generated types for type-safe database access
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          preferences: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferences?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferences?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          location: string;
          latitude: number;
          longitude: number;
          start_time: string;
          end_time: string | null;
          category: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          location: string;
          latitude: number;
          longitude: number;
          start_time: string;
          end_time?: string | null;
          category: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          location?: string;
          latitude?: number;
          longitude?: number;
          start_time?: string;
          end_time?: string | null;
          category?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_attendees: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: 'going' | 'interested' | 'not_going';
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status: 'going' | 'interested' | 'not_going';
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          status?: 'going' | 'interested' | 'not_going';
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | coder@sonnet-4.5 | Database type definitions | OK |
/* AGENT FOOTER END */

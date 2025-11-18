
export interface ChatSessionRow {
  id: number;
  session_id: string;
  user_ip: Json;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface SessionSummary {
  id: string;
  preview: string;
  last_updated: string;
  hasNewMessage: boolean;
}

export interface ChatMessage {
  author: 'user' | 'bot';
  content: string;
}

// Supabase generated types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chat_sessions: {
        Row: {
          created_at: string
          id: number
          messages: Json
          session_id: string
          updated_at: string
          user_ip: Json | null
        }
        Insert: {
          created_at?: string
          id?: number
          messages: Json
          session_id: string
          updated_at?: string
          user_ip?: Json | null
        }
        Update: {
          created_at?: string
          id?: number
          messages?: Json
          session_id?: string
          updated_at?: string
          user_ip?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

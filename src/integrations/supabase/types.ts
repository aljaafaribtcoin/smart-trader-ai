export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number
          created_at: string
          equity: number
          exchange: string
          free_margin: number
          id: string
          leverage: number
          margin: number
          margin_level: number
          open_trades: number
          today_pnl: number
          total_pnl: number
          updated_at: string
          user_id: string
          win_rate: number
        }
        Insert: {
          balance?: number
          created_at?: string
          equity?: number
          exchange?: string
          free_margin?: number
          id?: string
          leverage?: number
          margin?: number
          margin_level?: number
          open_trades?: number
          today_pnl?: number
          total_pnl?: number
          updated_at?: string
          user_id: string
          win_rate?: number
        }
        Update: {
          balance?: number
          created_at?: string
          equity?: number
          exchange?: string
          free_margin?: number
          id?: string
          leverage?: number
          margin?: number
          margin_level?: number
          open_trades?: number
          today_pnl?: number
          total_pnl?: number
          updated_at?: string
          user_id?: string
          win_rate?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          role: Database["public"]["Enums"]["message_role"]
          user_id: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          role: Database["public"]["Enums"]["message_role"]
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: Database["public"]["Enums"]["message_role"]
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          message_count: number
          preview: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          message_count?: number
          preview?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          message_count?: number
          preview?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      patterns: {
        Row: {
          completed_at: string | null
          confidence: number
          created_at: string
          description: string | null
          detected_at: string
          id: string
          pattern_name: string
          pattern_type: string
          status: string
          stop_loss: number | null
          symbol: string
          target_price: number | null
          timeframe: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          confidence: number
          created_at?: string
          description?: string | null
          detected_at?: string
          id?: string
          pattern_name: string
          pattern_type: string
          status?: string
          stop_loss?: number | null
          symbol: string
          target_price?: number | null
          timeframe: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          confidence?: number
          created_at?: string
          description?: string | null
          detected_at?: string
          id?: string
          pattern_name?: string
          pattern_type?: string
          status?: string
          stop_loss?: number | null
          symbol?: string
          target_price?: number | null
          timeframe?: string
          user_id?: string
        }
        Relationships: []
      }
      take_profits: {
        Row: {
          created_at: string
          hit: boolean
          hit_time: string | null
          id: string
          level: number
          percentage: number
          price: number
          trade_id: string
        }
        Insert: {
          created_at?: string
          hit?: boolean
          hit_time?: string | null
          id?: string
          level: number
          percentage: number
          price: number
          trade_id: string
        }
        Update: {
          created_at?: string
          hit?: boolean
          hit_time?: string | null
          id?: string
          level?: number
          percentage?: number
          price?: number
          trade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "take_profits_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          ai_reason: string | null
          confidence_score: number
          created_at: string
          entry_price: number
          entry_time: string
          entry_zone_max: number | null
          entry_zone_min: number | null
          exit_price: number | null
          exit_time: string | null
          fees: number
          id: string
          leverage: number
          notes: string | null
          pnl: number | null
          pnl_percentage: number | null
          position_size: number
          quantity: number
          risk_reward: number
          status: Database["public"]["Enums"]["trade_status"]
          stop_loss: number
          style: Database["public"]["Enums"]["trade_style"]
          symbol: string
          tags: string[] | null
          type: Database["public"]["Enums"]["trade_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_reason?: string | null
          confidence_score?: number
          created_at?: string
          entry_price: number
          entry_time?: string
          entry_zone_max?: number | null
          entry_zone_min?: number | null
          exit_price?: number | null
          exit_time?: string | null
          fees?: number
          id?: string
          leverage?: number
          notes?: string | null
          pnl?: number | null
          pnl_percentage?: number | null
          position_size: number
          quantity: number
          risk_reward?: number
          status?: Database["public"]["Enums"]["trade_status"]
          stop_loss: number
          style?: Database["public"]["Enums"]["trade_style"]
          symbol: string
          tags?: string[] | null
          type: Database["public"]["Enums"]["trade_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_reason?: string | null
          confidence_score?: number
          created_at?: string
          entry_price?: number
          entry_time?: string
          entry_zone_max?: number | null
          entry_zone_min?: number | null
          exit_price?: number | null
          exit_time?: string | null
          fees?: number
          id?: string
          leverage?: number
          notes?: string | null
          pnl?: number | null
          pnl_percentage?: number | null
          position_size?: number
          quantity?: number
          risk_reward?: number
          status?: Database["public"]["Enums"]["trade_status"]
          stop_loss?: number
          style?: Database["public"]["Enums"]["trade_style"]
          symbol?: string
          tags?: string[] | null
          type?: Database["public"]["Enums"]["trade_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          alert_enabled: boolean
          alert_price: number | null
          change_percentage: number | null
          created_at: string
          id: string
          notes: string | null
          price: number | null
          symbol: string
          timeframe: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_enabled?: boolean
          alert_price?: number | null
          change_percentage?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          price?: number | null
          symbol: string
          timeframe: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_enabled?: boolean
          alert_price?: number | null
          change_percentage?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          price?: number | null
          symbol?: string
          timeframe?: string
          updated_at?: string
          user_id?: string
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
      message_role: "user" | "assistant" | "system"
      trade_status: "open" | "closed" | "pending" | "cancelled"
      trade_style: "scalping" | "day" | "swing" | "position"
      trade_type: "long" | "short"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      message_role: ["user", "assistant", "system"],
      trade_status: ["open", "closed", "pending", "cancelled"],
      trade_style: ["scalping", "day", "swing", "position"],
      trade_type: ["long", "short"],
    },
  },
} as const

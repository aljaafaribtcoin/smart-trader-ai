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
      analysis_results: {
        Row: {
          analysis_data: Json
          bias: string | null
          confidence: number | null
          created_at: string
          id: string
          market_condition: string | null
          symbol: string
          timeframe: string
          user_id: string | null
        }
        Insert: {
          analysis_data: Json
          bias?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          market_condition?: string | null
          symbol: string
          timeframe: string
          user_id?: string | null
        }
        Update: {
          analysis_data?: Json
          bias?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          market_condition?: string | null
          symbol?: string
          timeframe?: string
          user_id?: string | null
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
      data_sync_status: {
        Row: {
          created_at: string
          data_type: string
          error_message: string | null
          id: string
          last_sync_at: string
          metadata: Json | null
          next_sync_at: string | null
          retry_count: number
          source: string
          status: string
          symbol: string
          timeframe: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_type: string
          error_message?: string | null
          id?: string
          last_sync_at?: string
          metadata?: Json | null
          next_sync_at?: string | null
          retry_count?: number
          source?: string
          status?: string
          symbol: string
          timeframe?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_type?: string
          error_message?: string | null
          id?: string
          last_sync_at?: string
          metadata?: Json | null
          next_sync_at?: string | null
          retry_count?: number
          source?: string
          status?: string
          symbol?: string
          timeframe?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      market_candles: {
        Row: {
          close: number
          created_at: string
          high: number
          id: string
          low: number
          open: number
          source: string
          symbol: string
          timeframe: string
          timestamp: string
          volume: number
        }
        Insert: {
          close: number
          created_at?: string
          high: number
          id?: string
          low: number
          open: number
          source?: string
          symbol: string
          timeframe: string
          timestamp: string
          volume: number
        }
        Update: {
          close?: number
          created_at?: string
          high?: number
          id?: string
          low?: number
          open?: number
          source?: string
          symbol?: string
          timeframe?: string
          timestamp?: string
          volume?: number
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          change_24h: number | null
          change_30d: number | null
          change_7d: number | null
          created_at: string
          high_24h: number | null
          id: string
          last_updated: string
          low_24h: number | null
          market_cap: number | null
          price: number
          source: string
          symbol: string
          volume_24h: number | null
        }
        Insert: {
          change_24h?: number | null
          change_30d?: number | null
          change_7d?: number | null
          created_at?: string
          high_24h?: number | null
          id?: string
          last_updated?: string
          low_24h?: number | null
          market_cap?: number | null
          price: number
          source?: string
          symbol: string
          volume_24h?: number | null
        }
        Update: {
          change_24h?: number | null
          change_30d?: number | null
          change_7d?: number | null
          created_at?: string
          high_24h?: number | null
          id?: string
          last_updated?: string
          low_24h?: number | null
          market_cap?: number | null
          price?: number
          source?: string
          symbol?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      market_symbols: {
        Row: {
          circulating_supply: number | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          market_cap: number | null
          max_supply: number | null
          name: string
          rank: number | null
          symbol: string
          total_supply: number | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          circulating_supply?: number | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          market_cap?: number | null
          max_supply?: number | null
          name: string
          rank?: number | null
          symbol: string
          total_supply?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          circulating_supply?: number | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          market_cap?: number | null
          max_supply?: number | null
          name?: string
          rank?: number | null
          symbol?: string
          total_supply?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          read_at?: string | null
          title?: string
          type?: string
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          preferred_language: string | null
          trading_preferences: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          preferred_language?: string | null
          trading_preferences?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          preferred_language?: string | null
          trading_preferences?: Json | null
          updated_at?: string
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
      technical_indicators: {
        Row: {
          atr: number | null
          bb_lower: number | null
          bb_middle: number | null
          bb_upper: number | null
          calculated_at: string
          created_at: string
          ema_20: number | null
          ema_200: number | null
          ema_50: number | null
          id: string
          macd_histogram: number | null
          macd_signal: number | null
          macd_value: number | null
          rsi: number | null
          stochastic_d: number | null
          stochastic_k: number | null
          symbol: string
          timeframe: string
        }
        Insert: {
          atr?: number | null
          bb_lower?: number | null
          bb_middle?: number | null
          bb_upper?: number | null
          calculated_at?: string
          created_at?: string
          ema_20?: number | null
          ema_200?: number | null
          ema_50?: number | null
          id?: string
          macd_histogram?: number | null
          macd_signal?: number | null
          macd_value?: number | null
          rsi?: number | null
          stochastic_d?: number | null
          stochastic_k?: number | null
          symbol: string
          timeframe: string
        }
        Update: {
          atr?: number | null
          bb_lower?: number | null
          bb_middle?: number | null
          bb_upper?: number | null
          calculated_at?: string
          created_at?: string
          ema_20?: number | null
          ema_200?: number | null
          ema_50?: number | null
          id?: string
          macd_histogram?: number | null
          macd_signal?: number | null
          macd_value?: number | null
          rsi?: number | null
          stochastic_d?: number | null
          stochastic_k?: number | null
          symbol?: string
          timeframe?: string
        }
        Relationships: []
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
      trading_signals: {
        Row: {
          alternative_scenario: string | null
          confidence: number | null
          created_at: string
          direction: string
          entry_from: number
          entry_to: number
          id: string
          invalidation_price: number | null
          main_scenario: string
          risk_reward: number
          status: string
          stop_loss: number
          supporting_factors: Json | null
          symbol: string
          tags: string[] | null
          telegram_summary: string | null
          tp1: number
          tp2: number
          tp3: number
          user_id: string | null
        }
        Insert: {
          alternative_scenario?: string | null
          confidence?: number | null
          created_at?: string
          direction: string
          entry_from: number
          entry_to: number
          id?: string
          invalidation_price?: number | null
          main_scenario: string
          risk_reward: number
          status?: string
          stop_loss: number
          supporting_factors?: Json | null
          symbol: string
          tags?: string[] | null
          telegram_summary?: string | null
          tp1: number
          tp2: number
          tp3: number
          user_id?: string | null
        }
        Update: {
          alternative_scenario?: string | null
          confidence?: number | null
          created_at?: string
          direction?: string
          entry_from?: number
          entry_to?: number
          id?: string
          invalidation_price?: number | null
          main_scenario?: string
          risk_reward?: number
          status?: string
          stop_loss?: number
          supporting_factors?: Json | null
          symbol?: string
          tags?: string[] | null
          telegram_summary?: string | null
          tp1?: number
          tp2?: number
          tp3?: number
          user_id?: string | null
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

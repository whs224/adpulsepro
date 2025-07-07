export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ad_accounts: {
        Row: {
          access_token: string
          account_id: string
          account_name: string | null
          connected_at: string
          id: string
          is_active: boolean
          platform: string
          refresh_token: string | null
          token_expires_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          account_id: string
          account_name?: string | null
          connected_at?: string
          id?: string
          is_active?: boolean
          platform: string
          refresh_token?: string | null
          token_expires_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          account_id?: string
          account_name?: string | null
          connected_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_analysis: {
        Row: {
          ai_insights: Json
          created_at: string
          date_range_end: string
          date_range_start: string
          id: string
          raw_data: Json
          recommendations: string[]
          user_id: string
        }
        Insert: {
          ai_insights: Json
          created_at?: string
          date_range_end: string
          date_range_start: string
          id?: string
          raw_data: Json
          recommendations: string[]
          user_id: string
        }
        Update: {
          ai_insights?: Json
          created_at?: string
          date_range_end?: string
          date_range_start?: string
          id?: string
          raw_data?: Json
          recommendations?: string[]
          user_id?: string
        }
        Relationships: []
      }
      campaign_data: {
        Row: {
          ad_account_id: string
          campaign_id: string
          campaign_name: string
          date_range_end: string
          date_range_start: string
          fetched_at: string
          id: string
          metrics: Json
          platform: string
          user_id: string
        }
        Insert: {
          ad_account_id: string
          campaign_id: string
          campaign_name: string
          date_range_end: string
          date_range_start: string
          fetched_at?: string
          id?: string
          metrics: Json
          platform: string
          user_id: string
        }
        Update: {
          ad_account_id?: string
          campaign_id?: string
          campaign_name?: string
          date_range_end?: string
          date_range_start?: string
          fetched_at?: string
          id?: string
          metrics?: Json
          platform?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_data_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_usage_log: {
        Row: {
          created_at: string
          credits_used: number
          id: string
          message_content: string
          team_owner_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          id?: string
          message_content: string
          team_owner_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          id?: string
          message_content?: string
          team_owner_id?: string | null
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
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          invited_at: string
          is_active: boolean
          joined_at: string | null
          member_email: string
          member_user_id: string
          role: string
          team_owner_id: string
        }
        Insert: {
          id?: string
          invited_at?: string
          is_active?: boolean
          joined_at?: string | null
          member_email: string
          member_user_id: string
          role?: string
          team_owner_id: string
        }
        Update: {
          id?: string
          invited_at?: string
          is_active?: boolean
          joined_at?: string | null
          member_email?: string
          member_user_id?: string
          role?: string
          team_owner_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          billing_cycle_end: string
          billing_cycle_start: string
          created_at: string
          id: string
          is_active: boolean
          max_team_members: number
          plan_name: string
          total_credits: number
          updated_at: string
          used_credits: number
          user_id: string
        }
        Insert: {
          billing_cycle_end?: string
          billing_cycle_start?: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_team_members?: number
          plan_name?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id: string
        }
        Update: {
          billing_cycle_end?: string
          billing_cycle_start?: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_team_members?: number
          plan_name?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          business_goals: string | null
          created_at: string
          id: string
          primary_objective: string | null
          selected_kpis: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          business_goals?: string | null
          created_at?: string
          id?: string
          primary_objective?: string | null
          selected_kpis?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          business_goals?: string | null
          created_at?: string
          id?: string
          primary_objective?: string | null
          selected_kpis?: string[]
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
      use_credit: {
        Args: { p_user_id: string; p_message: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

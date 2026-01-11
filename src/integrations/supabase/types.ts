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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          team_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          team_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      costs: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          team_id: string
          type: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          team_id: string
          type: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          team_id?: string
          type?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "costs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          has_cash_flow: boolean
          has_export_excel: boolean
          has_export_pdf: boolean
          has_multi_users: boolean
          has_priority_support: boolean
          has_reports: boolean
          has_stock_management: boolean
          id: string
          max_cost_analyses: number
          max_products: number
          max_users: number
          name: string
          price: number
          type: Database["public"]["Enums"]["plan_type"]
        }
        Insert: {
          created_at?: string
          has_cash_flow?: boolean
          has_export_excel?: boolean
          has_export_pdf?: boolean
          has_multi_users?: boolean
          has_priority_support?: boolean
          has_reports?: boolean
          has_stock_management?: boolean
          id?: string
          max_cost_analyses?: number
          max_products?: number
          max_users?: number
          name: string
          price?: number
          type: Database["public"]["Enums"]["plan_type"]
        }
        Update: {
          created_at?: string
          has_cash_flow?: boolean
          has_export_excel?: boolean
          has_export_pdf?: boolean
          has_multi_users?: boolean
          has_priority_support?: boolean
          has_reports?: boolean
          has_stock_management?: boolean
          id?: string
          max_cost_analyses?: number
          max_products?: number
          max_users?: number
          name?: string
          price?: number
          type?: Database["public"]["Enums"]["plan_type"]
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          color: string | null
          cost_price: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          min_stock: number
          name: string
          quantity: number
          sale_price: number
          size: string | null
          sku: string
          status: string
          team_id: string
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          color?: string | null
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          min_stock?: number
          name: string
          quantity?: number
          sale_price?: number
          size?: string | null
          sku: string
          status?: string
          team_id: string
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          color?: string | null
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          min_stock?: number
          name?: string
          quantity?: number
          sale_price?: number
          size?: string | null
          sku?: string
          status?: string
          team_id?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_document: string | null
          company_name: string | null
          company_segment: string | null
          created_at: string | null
          current_team_id: string | null
          default_currency: string | null
          default_margin: number | null
          full_name: string | null
          id: string
          logo_url: string | null
          monthly_sales_goal: number | null
          onboarding_completed: boolean | null
          public_email: string | null
          updated_at: string | null
        }
        Insert: {
          company_document?: string | null
          company_name?: string | null
          company_segment?: string | null
          created_at?: string | null
          current_team_id?: string | null
          default_currency?: string | null
          default_margin?: number | null
          full_name?: string | null
          id: string
          logo_url?: string | null
          monthly_sales_goal?: number | null
          onboarding_completed?: boolean | null
          public_email?: string | null
          updated_at?: string | null
        }
        Update: {
          company_document?: string | null
          company_name?: string | null
          company_segment?: string | null
          created_at?: string | null
          current_team_id?: string | null
          default_currency?: string | null
          default_margin?: number | null
          full_name?: string | null
          id?: string
          logo_url?: string | null
          monthly_sales_goal?: number | null
          onboarding_completed?: boolean | null
          public_email?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_team_id_fkey"
            columns: ["current_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          reason: string | null
          team_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          reason?: string | null
          team_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          reason?: string | null
          team_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          team_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          team_id: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          team_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_settings: {
        Row: {
          backup_frequency: string | null
          created_at: string
          default_currency: string
          default_margin: number | null
          enable_email_alerts: boolean | null
          enable_notifications: boolean | null
          fiscal_year_start: number | null
          id: string
          low_stock_threshold: number | null
          tax_rate: number | null
          tax_regime: string | null
          team_id: string
          updated_at: string
        }
        Insert: {
          backup_frequency?: string | null
          created_at?: string
          default_currency?: string
          default_margin?: number | null
          enable_email_alerts?: boolean | null
          enable_notifications?: boolean | null
          fiscal_year_start?: number | null
          id?: string
          low_stock_threshold?: number | null
          tax_rate?: number | null
          tax_regime?: string | null
          team_id: string
          updated_at?: string
        }
        Update: {
          backup_frequency?: string | null
          created_at?: string
          default_currency?: string
          default_margin?: number | null
          enable_email_alerts?: boolean | null
          enable_notifications?: boolean | null
          fiscal_year_start?: number | null
          id?: string
          low_stock_threshold?: number | null
          tax_rate?: number | null
          tax_regime?: string | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_settings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          payment_method: string | null
          product_id: string | null
          reference_date: string
          status: string
          team_id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          product_id?: string | null
          reference_date?: string
          status?: string
          team_id: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          product_id?: string | null
          reference_date?: string
          status?: string
          team_id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_password_strength: { Args: { password: string }; Returns: boolean }
      get_team_member_email: {
        Args: { member_user_id: string; requesting_team_id: string }
        Returns: string
      }
      get_user_plan: {
        Args: { p_user_id: string }
        Returns: {
          has_cash_flow: boolean
          has_export_excel: boolean
          has_export_pdf: boolean
          has_multi_users: boolean
          has_priority_support: boolean
          has_reports: boolean
          has_stock_management: boolean
          max_cost_analyses: number
          max_products: number
          max_users: number
          plan_id: string
          plan_name: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          subscription_status: string
        }[]
      }
      get_user_team_role: {
        Args: { p_team_id: string; p_user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_min_role: {
        Args: {
          p_min_role: Database["public"]["Enums"]["app_role"]
          p_team_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_team_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      is_team_owner: {
        Args: { p_team_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "seller" | "viewer"
      plan_type: "free" | "starter" | "professional" | "enterprise"
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
      app_role: ["admin", "manager", "seller", "viewer"],
      plan_type: ["free", "starter", "professional", "enterprise"],
    },
  },
} as const

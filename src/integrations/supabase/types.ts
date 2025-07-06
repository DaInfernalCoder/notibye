export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      churn_events: {
        Row: {
          created_at: string
          customer_email: string
          customer_id: string
          event_data: Json | null
          event_type: string
          id: string
          processed_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_id: string
          event_data?: Json | null
          event_type: string
          id?: string
          processed_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_id?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          processed_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          created_at: string
          id: string
          is_visual: boolean | null
          name: string
          subject: string
          updated_at: string
          user_id: string
          variables: Json | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string
          id?: string
          is_visual?: boolean | null
          name: string
          subject: string
          updated_at?: string
          user_id: string
          variables?: Json | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string
          id?: string
          is_visual?: boolean | null
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      sent_emails: {
        Row: {
          churn_event_id: string | null
          email_content: string
          id: string
          recipient_email: string
          sent_at: string
          subject: string
          usage_summary: Json | null
          user_id: string
        }
        Insert: {
          churn_event_id?: string | null
          email_content: string
          id?: string
          recipient_email: string
          sent_at?: string
          subject: string
          usage_summary?: Json | null
          user_id: string
        }
        Update: {
          churn_event_id?: string | null
          email_content?: string
          id?: string
          recipient_email?: string
          sent_at?: string
          subject?: string
          usage_summary?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sent_emails_churn_event_id_fkey"
            columns: ["churn_event_id"]
            isOneToOne: false
            referencedRelation: "churn_events"
            referencedColumns: ["id"]
          },
        ]
      }
      trigger_conditions: {
        Row: {
          condition_type: string
          created_at: string
          field_name: string | null
          id: string
          logical_operator: string | null
          operator: string
          order_index: number | null
          threshold_unit: string | null
          threshold_value: number | null
          trigger_id: string
        }
        Insert: {
          condition_type: string
          created_at?: string
          field_name?: string | null
          id?: string
          logical_operator?: string | null
          operator: string
          order_index?: number | null
          threshold_unit?: string | null
          threshold_value?: number | null
          trigger_id: string
        }
        Update: {
          condition_type?: string
          created_at?: string
          field_name?: string | null
          id?: string
          logical_operator?: string | null
          operator?: string
          order_index?: number | null
          threshold_unit?: string | null
          threshold_value?: number | null
          trigger_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trigger_conditions_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      trigger_executions: {
        Row: {
          customer_email: string
          customer_id: string | null
          email_sent: boolean | null
          error_message: string | null
          executed_at: string
          execution_data: Json | null
          id: string
          trigger_id: string
        }
        Insert: {
          customer_email: string
          customer_id?: string | null
          email_sent?: boolean | null
          error_message?: string | null
          executed_at?: string
          execution_data?: Json | null
          id?: string
          trigger_id: string
        }
        Update: {
          customer_email?: string
          customer_id?: string | null
          email_sent?: boolean | null
          error_message?: string | null
          executed_at?: string
          execution_data?: Json | null
          id?: string
          trigger_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trigger_executions_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      triggers: {
        Row: {
          created_at: string
          description: string | null
          email_template_id: string | null
          frequency_type: string
          frequency_value: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
          warning_acknowledged: boolean | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          email_template_id?: string | null
          frequency_type: string
          frequency_value?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id: string
          warning_acknowledged?: boolean | null
        }
        Update: {
          created_at?: string
          description?: string | null
          email_template_id?: string | null
          frequency_type?: string
          frequency_value?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
          warning_acknowledged?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "triggers_email_template_id_fkey"
            columns: ["email_template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_analytics: {
        Row: {
          active_days: number | null
          analytics_data: Json | null
          created_at: string
          customer_email: string
          engagement_score: number | null
          id: string
          last_seen: string | null
          most_used_feature: string | null
          period_end: string
          period_start: string
          total_events: number | null
          user_id: string | null
        }
        Insert: {
          active_days?: number | null
          analytics_data?: Json | null
          created_at?: string
          customer_email: string
          engagement_score?: number | null
          id?: string
          last_seen?: string | null
          most_used_feature?: string | null
          period_end: string
          period_start: string
          total_events?: number | null
          user_id?: string | null
        }
        Update: {
          active_days?: number | null
          analytics_data?: Json | null
          created_at?: string
          customer_email?: string
          engagement_score?: number | null
          id?: string
          last_seen?: string | null
          most_used_feature?: string | null
          period_end?: string
          period_start?: string
          total_events?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          additional_config: Json | null
          api_key: string
          created_at: string
          id: string
          is_active: boolean | null
          service_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_config?: Json | null
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          service_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_config?: Json | null
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          service_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          processed: boolean | null
          stripe_event_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          processed?: boolean | null
          stripe_event_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          processed?: boolean | null
          stripe_event_id?: string
          user_id?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

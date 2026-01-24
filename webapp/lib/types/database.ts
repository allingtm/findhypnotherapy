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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      role_audit_log: {
        Row: {
          action: string
          id: string
          ip_address: unknown
          performed_at: string
          performed_by: string | null
          role_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown
          performed_at?: string
          performed_by?: string | null
          role_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown
          performed_at?: string
          performed_by?: string | null
          role_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_audit_log_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      specializations: {
        Row: {
          category: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          created_at: string
          error: string | null
          id: string
          processed: boolean | null
          raw_event: Json | null
          type: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id: string
          processed?: boolean | null
          raw_event?: Json | null
          type: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          processed?: boolean | null
          raw_event?: Json | null
          type?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_name: string | null
          status: string
          stripe_customer_id: string
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string | null
          status: string
          stripe_customer_id: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_name?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      therapist_profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          availability_notes: string | null
          bio: string | null
          booking_url: string | null
          city: string | null
          country: string | null
          created_at: string | null
          credentials: string[] | null
          currency: string | null
          fts: unknown
          id: string
          initial_consultation_fee: number | null
          is_published: boolean | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          meta_description: string | null
          offers_free_consultation: boolean | null
          phone: string | null
          postal_code: string | null
          professional_title: string | null
          published_at: string | null
          session_duration_minutes: number | null
          session_fee: number | null
          session_format: string[] | null
          slug: string | null
          state_province: string | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          availability_notes?: string | null
          bio?: string | null
          booking_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          credentials?: string[] | null
          currency?: string | null
          fts?: unknown
          id?: string
          initial_consultation_fee?: number | null
          is_published?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          offers_free_consultation?: boolean | null
          phone?: string | null
          postal_code?: string | null
          professional_title?: string | null
          published_at?: string | null
          session_duration_minutes?: number | null
          session_fee?: number | null
          session_format?: string[] | null
          slug?: string | null
          state_province?: string | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          availability_notes?: string | null
          bio?: string | null
          booking_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          credentials?: string[] | null
          currency?: string | null
          fts?: unknown
          id?: string
          initial_consultation_fee?: number | null
          is_published?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          offers_free_consultation?: boolean | null
          phone?: string | null
          postal_code?: string | null
          professional_title?: string | null
          published_at?: string | null
          session_duration_minutes?: number | null
          session_fee?: number | null
          session_format?: string[] | null
          slug?: string | null
          state_province?: string | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      therapist_services: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          directory_price: number | null
          display_order: number | null
          duration_minutes: number
          id: string
          includes: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          outcome_focus: string | null
          price: number | null
          price_display_mode: Database['public']['Enums']['price_display_mode']
          price_max: number | null
          price_min: number | null
          service_type: Database['public']['Enums']['service_type']
          session_count: number
          session_count_max: number | null
          session_count_min: number | null
          short_description: string | null
          show_per_session_price: boolean | null
          show_price: boolean | null
          show_session_details: boolean | null
          show_includes: boolean | null
          show_outcome_focus: boolean | null
          sort_priority: number | null
          therapist_profile_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number
          id?: string
          includes?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          outcome_focus?: string | null
          price?: number | null
          price_display_mode?: Database['public']['Enums']['price_display_mode']
          price_max?: number | null
          price_min?: number | null
          service_type?: Database['public']['Enums']['service_type']
          session_count?: number
          session_count_max?: number | null
          session_count_min?: number | null
          short_description?: string | null
          show_per_session_price?: boolean | null
          show_price?: boolean | null
          show_session_details?: boolean | null
          show_includes?: boolean | null
          show_outcome_focus?: boolean | null
          sort_priority?: number | null
          therapist_profile_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number
          id?: string
          includes?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          outcome_focus?: string | null
          price?: number | null
          price_display_mode?: Database['public']['Enums']['price_display_mode']
          price_max?: number | null
          price_min?: number | null
          service_type?: Database['public']['Enums']['service_type']
          session_count?: number
          session_count_max?: number | null
          session_count_min?: number | null
          short_description?: string | null
          show_per_session_price?: boolean | null
          show_price?: boolean | null
          show_session_details?: boolean | null
          show_includes?: boolean | null
          show_outcome_focus?: boolean | null
          sort_priority?: number | null
          therapist_profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_services_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_specializations: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          specialization_id: string
          therapist_profile_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          specialization_id: string
          therapist_profile_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          specialization_id?: string
          therapist_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_specializations_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "specializations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_specializations_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          photo_url: string | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string
          photo_url?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          photo_url?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_profile_slug: {
        Args: { profile_user_id: string; user_name: string }
        Returns: string
      }
      get_user_roles: { Args: never; Returns: string[] }
      has_active_subscription: { Args: never; Returns: boolean }
      has_role: { Args: { role_name: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      search_therapists: {
        Args: {
          search_query?: string
          location_filter?: string
          specialization_slugs?: string[]
          session_format_filter?: string
          page_number?: number
          page_size?: number
        }
        Returns: {
          id: string
          user_id: string
          professional_title: string
          bio: string
          city: string
          state_province: string
          postal_code: string
          country: string
          session_format: string[]
          session_fee: number
          currency: string
          offers_free_consultation: boolean
          slug: string
          is_verified: boolean
          photo_url: string
          name: string
          specializations: Json
          total_count: number
        }[]
      }
    }
    Enums: {
      price_display_mode: 'exact' | 'from' | 'range' | 'contact' | 'free'
      service_type: 'single_session' | 'package' | 'programme' | 'consultation' | 'subscription'
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
      price_display_mode: ['exact', 'from', 'range', 'contact', 'free'] as const,
      service_type: ['single_session', 'package', 'programme', 'consultation', 'subscription'] as const,
    },
  },
} as const

// Convenience type exports
export type ServiceType = Database['public']['Enums']['service_type']
export type PriceDisplayMode = Database['public']['Enums']['price_display_mode']

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
      blocked_visitors: {
        Row: {
          created_at: string | null
          id: string
          member_id: string
          visitor_email: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id: string
          visitor_email: string
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string
          visitor_email?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          confirmed_at: string | null
          created_at: string | null
          duration_minutes: number
          end_time: string
          id: string
          is_verified: boolean | null
          meeting_url: string | null
          reminder_1h_sent_at: string | null
          reminder_24h_sent_at: string | null
          service_terms_snapshot: string | null
          service_id: string | null
          session_format: string | null
          start_time: string
          status: string
          terms_accepted_at: string | null
          terms_id: string | null
          therapist_profile_id: string
          updated_at: string | null
          verification_expires_at: string | null
          verification_token: string | null
          visitor_email: string
          visitor_name: string
          visitor_notes: string | null
          visitor_phone: string | null
          visitor_token: string
        }
        Insert: {
          booking_date: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          duration_minutes: number
          end_time: string
          id?: string
          is_verified?: boolean | null
          meeting_url?: string | null
          reminder_1h_sent_at?: string | null
          reminder_24h_sent_at?: string | null
          service_terms_snapshot?: string | null
          service_id?: string | null
          session_format?: string | null
          start_time: string
          status?: string
          terms_accepted_at?: string | null
          terms_id?: string | null
          therapist_profile_id: string
          updated_at?: string | null
          verification_expires_at?: string | null
          verification_token?: string | null
          visitor_email: string
          visitor_name: string
          visitor_notes?: string | null
          visitor_phone?: string | null
          visitor_token: string
        }
        Update: {
          booking_date?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          duration_minutes?: number
          end_time?: string
          id?: string
          is_verified?: boolean | null
          meeting_url?: string | null
          reminder_1h_sent_at?: string | null
          reminder_24h_sent_at?: string | null
          service_terms_snapshot?: string | null
          service_id?: string | null
          session_format?: string | null
          start_time?: string
          status?: string
          terms_accepted_at?: string | null
          terms_id?: string | null
          therapist_profile_id?: string
          updated_at?: string | null
          verification_expires_at?: string | null
          verification_token?: string | null
          visitor_email?: string
          visitor_name?: string
          visitor_notes?: string | null
          visitor_phone?: string | null
          visitor_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "therapist_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_busy_times: {
        Row: {
          end_time: string
          fetched_at: string | null
          id: string
          provider: string
          start_time: string
          user_id: string
        }
        Insert: {
          end_time: string
          fetched_at?: string | null
          id?: string
          provider: string
          start_time: string
          user_id: string
        }
        Update: {
          end_time?: string
          fetched_at?: string | null
          id?: string
          provider?: string
          start_time?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_oauth_tokens: {
        Row: {
          access_token_encrypted: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          provider: string
          refresh_token_encrypted: string
          scope: string | null
          sync_error: string | null
          token_expires_at: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          provider: string
          refresh_token_encrypted: string
          scope?: string | null
          sync_error?: string | null
          token_expires_at: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          provider?: string
          refresh_token_encrypted?: string
          scope?: string | null
          sync_error?: string | null
          token_expires_at?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      client_invitations: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          expires_at: string
          id: string
          opened_at: string | null
          sent_at: string | null
          service_id: string | null
          token: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          service_id?: string | null
          token: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          service_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_invitations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_invitations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "therapist_services"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          client_id: string
          content: string
          created_at: string
          id: string
          is_private: boolean
          note_type: string
          session_id: string | null
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string
          id?: string
          is_private?: boolean
          note_type: string
          session_id?: string | null
          therapist_profile_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          id?: string
          is_private?: boolean
          note_type?: string
          session_id?: string | null
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "client_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_sessions: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          client_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          end_time: string
          google_event_id: string | null
          id: string
          location: string | null
          meeting_url: string | null
          microsoft_event_id: string | null
          service_id: string | null
          session_date: string
          session_format: string | null
          start_time: string
          status: string
          therapist_notes: string | null
          therapist_profile_id: string
          title: string
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          duration_minutes: number
          end_time: string
          google_event_id?: string | null
          id?: string
          location?: string | null
          meeting_url?: string | null
          microsoft_event_id?: string | null
          service_id?: string | null
          session_date: string
          session_format?: string | null
          start_time: string
          status?: string
          therapist_notes?: string | null
          therapist_profile_id: string
          title: string
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          end_time?: string
          google_event_id?: string | null
          id?: string
          location?: string | null
          meeting_url?: string | null
          microsoft_event_id?: string | null
          service_id?: string | null
          session_date?: string
          session_format?: string | null
          start_time?: string
          status?: string
          therapist_notes?: string | null
          therapist_profile_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_sessions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "therapist_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_sessions_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_terms_acceptance: {
        Row: {
          accepted_at: string
          client_id: string
          id: string
          ip_address: string | null
          terms_id: string
          user_agent: string | null
        }
        Insert: {
          accepted_at?: string
          client_id: string
          id?: string
          ip_address?: string | null
          terms_id: string
          user_agent?: string | null
        }
        Update: {
          accepted_at?: string
          client_id?: string
          id?: string
          ip_address?: string | null
          terms_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_terms_acceptance_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_terms_acceptance_terms_id_fkey"
            columns: ["terms_id"]
            isOneToOne: false
            referencedRelation: "therapist_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          allergies: string | null
          archived_at: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          first_name: string | null
          gp_name: string | null
          gp_practice: string | null
          health_conditions: string | null
          id: string
          last_name: string | null
          medications: string | null
          onboarded_at: string | null
          phone: string | null
          postal_code: string | null
          slug: string
          status: string
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          allergies?: string | null
          archived_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string | null
          gp_name?: string | null
          gp_practice?: string | null
          health_conditions?: string | null
          id?: string
          last_name?: string | null
          medications?: string | null
          onboarded_at?: string | null
          phone?: string | null
          postal_code?: string | null
          slug: string
          status?: string
          therapist_profile_id: string
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          allergies?: string | null
          archived_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string | null
          gp_name?: string | null
          gp_practice?: string | null
          health_conditions?: string | null
          id?: string
          last_name?: string | null
          medications?: string | null
          onboarded_at?: string | null
          phone?: string | null
          postal_code?: string | null
          slug?: string
          status?: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          is_blocked: boolean | null
          is_reported: boolean | null
          is_verified: boolean | null
          member_id: string
          updated_at: string | null
          visitor_email: string
          visitor_name: string
          visitor_token: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          is_blocked?: boolean | null
          is_reported?: boolean | null
          is_verified?: boolean | null
          member_id: string
          updated_at?: string | null
          visitor_email: string
          visitor_name: string
          visitor_token: string
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          is_blocked?: boolean | null
          is_reported?: boolean | null
          is_verified?: boolean | null
          member_id?: string
          updated_at?: string | null
          visitor_email?: string
          visitor_name?: string
          visitor_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_public_users_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verifications: {
        Row: {
          conversation_id: string
          created_at: string | null
          expires_at: string
          id: string
          token: string
          verified_at: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          verified_at?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_verifications_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_type: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      role_audit_log: {
        Row: {
          action: string
          id: string
          ip_address: unknown
          performed_at: string
          performed_by: string | null
          role_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown
          performed_at?: string
          performed_by?: string | null
          role_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown
          performed_at?: string
          performed_by?: string | null
          role_id?: string
          user_agent?: string | null
          user_id?: string | null
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
      therapist_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
          therapist_profile_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
          therapist_profile_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
          therapist_profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_availability_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_availability_overrides: {
        Row: {
          created_at: string | null
          end_time: string | null
          id: string
          is_available: boolean
          override_date: string
          reason: string | null
          start_time: string | null
          therapist_profile_id: string
        }
        Insert: {
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_available: boolean
          override_date: string
          reason?: string | null
          start_time?: string | null
          therapist_profile_id: string
        }
        Update: {
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_available?: boolean
          override_date?: string
          reason?: string | null
          start_time?: string | null
          therapist_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_availability_overrides_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_booking_settings: {
        Row: {
          accepts_online_booking: boolean | null
          buffer_minutes: number | null
          created_at: string | null
          default_video_link: string | null
          google_calendar_connected: boolean | null
          id: string
          max_booking_days_ahead: number | null
          microsoft_calendar_connected: boolean | null
          min_booking_notice_hours: number | null
          requires_approval: boolean | null
          send_therapist_reminders: boolean | null
          send_visitor_reminders: boolean | null
          slot_duration_minutes: number
          therapist_profile_id: string
          timezone: string
          updated_at: string | null
          video_platform_preference: string | null
          zoom_connected: boolean | null
        }
        Insert: {
          accepts_online_booking?: boolean | null
          buffer_minutes?: number | null
          created_at?: string | null
          default_video_link?: string | null
          google_calendar_connected?: boolean | null
          id?: string
          max_booking_days_ahead?: number | null
          microsoft_calendar_connected?: boolean | null
          min_booking_notice_hours?: number | null
          requires_approval?: boolean | null
          send_therapist_reminders?: boolean | null
          send_visitor_reminders?: boolean | null
          slot_duration_minutes?: number
          therapist_profile_id: string
          timezone?: string
          updated_at?: string | null
          video_platform_preference?: string | null
          zoom_connected?: boolean | null
        }
        Update: {
          accepts_online_booking?: boolean | null
          buffer_minutes?: number | null
          created_at?: string | null
          default_video_link?: string | null
          google_calendar_connected?: boolean | null
          id?: string
          max_booking_days_ahead?: number | null
          microsoft_calendar_connected?: boolean | null
          min_booking_notice_hours?: number | null
          requires_approval?: boolean | null
          send_therapist_reminders?: boolean | null
          send_visitor_reminders?: boolean | null
          slot_duration_minutes?: number
          therapist_profile_id?: string
          timezone?: string
          updated_at?: string | null
          video_platform_preference?: string | null
          zoom_connected?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_booking_settings_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: true
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          address_visibility: string | null
          availability_notes: string | null
          banner_url: string | null
          mobile_banner_url: string | null
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
          og_image_url: string | null
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
          address_visibility?: string | null
          availability_notes?: string | null
          banner_url?: string | null
          mobile_banner_url?: string | null
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
          og_image_url?: string | null
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
          address_visibility?: string | null
          availability_notes?: string | null
          banner_url?: string | null
          mobile_banner_url?: string | null
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
          og_image_url?: string | null
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
        Relationships: [
          {
            foreignKeyName: "therapist_profiles_public_users_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          image_url: string | null
          includes: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          onboarding_requirements: Json | null
          outcome_focus: string | null
          price: number | null
          price_display_mode: Database["public"]["Enums"]["price_display_mode"]
          price_max: number | null
          price_min: number | null
          service_type: Database["public"]["Enums"]["service_type"]
          session_count: number
          session_count_max: number | null
          session_count_min: number | null
          short_description: string | null
          show_includes: boolean | null
          show_outcome_focus: boolean | null
          show_per_session_price: boolean | null
          show_price: boolean | null
          show_session_details: boolean | null
          sort_priority: number | null
          terms_content: string | null
          therapist_profile_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          directory_price?: number | null
          display_order?: number | null
          duration_minutes?: number
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          onboarding_requirements?: Json | null
          outcome_focus?: string | null
          price?: number | null
          price_display_mode?: Database["public"]["Enums"]["price_display_mode"]
          price_max?: number | null
          price_min?: number | null
          service_type?: Database["public"]["Enums"]["service_type"]
          session_count?: number
          session_count_max?: number | null
          session_count_min?: number | null
          short_description?: string | null
          show_includes?: boolean | null
          show_outcome_focus?: boolean | null
          show_per_session_price?: boolean | null
          show_price?: boolean | null
          show_session_details?: boolean | null
          sort_priority?: number | null
          terms_content?: string | null
          therapist_profile_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          directory_price?: number | null
          display_order?: number | null
          duration_minutes?: number
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          onboarding_requirements?: Json | null
          outcome_focus?: string | null
          price?: number | null
          price_display_mode?: Database["public"]["Enums"]["price_display_mode"]
          price_max?: number | null
          price_min?: number | null
          service_type?: Database["public"]["Enums"]["service_type"]
          session_count?: number
          session_count_max?: number | null
          session_count_min?: number | null
          short_description?: string | null
          show_includes?: boolean | null
          show_outcome_focus?: boolean | null
          show_per_session_price?: boolean | null
          show_price?: boolean | null
          show_session_details?: boolean | null
          sort_priority?: number | null
          terms_content?: string | null
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
      therapist_terms: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          therapist_profile_id: string
          title: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          therapist_profile_id: string
          title?: string
          version: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          therapist_profile_id?: string
          title?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_terms_therapist_profile_id_fkey"
            columns: ["therapist_profile_id"]
            isOneToOne: false
            referencedRelation: "therapist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_videos: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          fts: unknown
          id: string
          published_at: string | null
          session_format: string[] | null
          slug: string | null
          status: Database["public"]["Enums"]["video_status"] | null
          therapist_profile_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          video_url: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          fts?: unknown
          id?: string
          published_at?: string | null
          session_format?: string[] | null
          slug?: string | null
          status?: Database["public"]["Enums"]["video_status"] | null
          therapist_profile_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          video_url: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          fts?: unknown
          id?: string
          published_at?: string | null
          session_format?: string[] | null
          slug?: string | null
          status?: Database["public"]["Enums"]["video_status"] | null
          therapist_profile_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          video_url?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_videos_therapist_profile_id_fkey"
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
          deleted_at: string | null
          deletion_requested_at: string | null
          email: string
          id: string
          name: string
          photo_url: string | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deletion_requested_at?: string | null
          email: string
          id: string
          name?: string
          photo_url?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deletion_requested_at?: string | null
          email?: string
          id?: string
          name?: string
          photo_url?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      verified_visitor_emails: {
        Row: {
          created_at: string | null
          email: string
          first_verified_at: string
          id: string
          verified_via: string
        }
        Insert: {
          created_at?: string | null
          email: string
          first_verified_at?: string
          id?: string
          verified_via: string
        }
        Update: {
          created_at?: string | null
          email?: string
          first_verified_at?: string
          id?: string
          verified_via?: string
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
      get_user_roles: { Args: Record<PropertyKey, never>; Returns: string[] }
      has_active_subscription: { Args: Record<PropertyKey, never>; Returns: boolean }
      has_role: { Args: { role_name: string }; Returns: boolean }
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      search_therapists: {
        Args: {
          location_filter?: string
          page_number?: number
          page_size?: number
          search_query?: string
          session_format_filter?: string
          specialization_slugs?: string[]
        }
        Returns: {
          bio: string
          city: string
          country: string
          currency: string
          id: string
          is_verified: boolean
          name: string
          offers_free_consultation: boolean
          photo_url: string
          postal_code: string
          professional_title: string
          session_fee: number
          session_format: string[]
          slug: string
          specializations: Json
          state_province: string
          total_count: number
          user_id: string
        }[]
      }
      search_videos: {
        Args: {
          location_filter?: string
          page_number?: number
          page_size?: number
          search_query?: string
          specialization_slug?: string
        }
        Returns: {
          created_at: string
          description: string
          duration_seconds: number
          id: string
          published_at: string
          session_format: string[]
          slug: string
          therapist_city: string
          therapist_country: string
          therapist_name: string
          therapist_photo_url: string
          therapist_profile_id: string
          therapist_session_format: string[]
          therapist_slug: string
          thumbnail_url: string
          title: string
          total_count: number
          video_url: string
        }[]
      }
      send_booking_reminders: { Args: Record<PropertyKey, never>; Returns: undefined }
    }
    Enums: {
      price_display_mode: "exact" | "from" | "range" | "contact" | "free"
      service_type:
        | "single_session"
        | "package"
        | "programme"
        | "consultation"
        | "subscription"
      video_status: "processing" | "published" | "rejected" | "deleted"
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
      price_display_mode: ["exact", "from", "range", "contact", "free"],
      service_type: [
        "single_session",
        "package",
        "programme",
        "consultation",
        "subscription",
      ],
      video_status: ["processing", "published", "rejected", "deleted"],
    },
  },
} as const

// Custom type exports derived from database enums
export type ServiceType = "single_session" | "package" | "programme" | "consultation" | "subscription"
export type PriceDisplayMode = "exact" | "from" | "range" | "contact" | "free"
export type VideoStatus = "processing" | "published" | "rejected" | "deleted"

// Client-related type exports
export type ClientStatus = "invited" | "onboarding" | "active" | "archived"
export type ClientSessionStatus = "scheduled" | "completed" | "cancelled" | "no_show"
export type ClientSessionFormat = "online" | "in-person" | "phone"
export type ClientNoteType = "session_note" | "general_note" | "progress_note"

// Onboarding requirements type for services
export type OnboardingFieldRequirement = "required" | "optional" | "hidden"

export interface OnboardingRequirements {
  phone?: OnboardingFieldRequirement
  address?: OnboardingFieldRequirement
  emergency_contact?: OnboardingFieldRequirement
  health_info?: OnboardingFieldRequirement
  gp_info?: OnboardingFieldRequirement
}

export const DEFAULT_ONBOARDING_REQUIREMENTS: OnboardingRequirements = {
  phone: "required",
  address: "required",
  emergency_contact: "required",
  health_info: "optional",
  gp_info: "optional",
}

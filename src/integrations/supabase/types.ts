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
      admin_emails: {
        Row: {
          attachments: Json | null
          body_html: string | null
          body_text: string | null
          created_at: string
          direction: string
          from_email: string
          from_name: string | null
          id: string
          metadata: Json | null
          parent_email_id: string | null
          read_at: string | null
          replied_at: string | null
          status: string
          subject: string | null
          tags: string[] | null
          thread_id: string | null
          to_email: string
          to_name: string | null
        }
        Insert: {
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          direction?: string
          from_email: string
          from_name?: string | null
          id?: string
          metadata?: Json | null
          parent_email_id?: string | null
          read_at?: string | null
          replied_at?: string | null
          status?: string
          subject?: string | null
          tags?: string[] | null
          thread_id?: string | null
          to_email: string
          to_name?: string | null
        }
        Update: {
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string
          direction?: string
          from_email?: string
          from_name?: string | null
          id?: string
          metadata?: Json | null
          parent_email_id?: string | null
          read_at?: string | null
          replied_at?: string | null
          status?: string
          subject?: string | null
          tags?: string[] | null
          thread_id?: string | null
          to_email?: string
          to_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_emails_parent_email_id_fkey"
            columns: ["parent_email_id"]
            isOneToOne: false
            referencedRelation: "admin_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          category: string
          content_en: string
          content_es: string
          content_it: string
          content_pt: string
          content_zh: string
          created_at: string
          excerpt_en: string
          excerpt_es: string
          excerpt_it: string
          excerpt_pt: string
          excerpt_zh: string
          id: string
          image_url: string | null
          is_published: boolean | null
          published_at: string | null
          read_time: string | null
          slug: string
          title_en: string
          title_es: string
          title_it: string
          title_pt: string
          title_zh: string
          updated_at: string
        }
        Insert: {
          category: string
          content_en: string
          content_es: string
          content_it?: string
          content_pt: string
          content_zh: string
          created_at?: string
          excerpt_en: string
          excerpt_es: string
          excerpt_it?: string
          excerpt_pt: string
          excerpt_zh: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug: string
          title_en: string
          title_es: string
          title_it?: string
          title_pt: string
          title_zh: string
          updated_at?: string
        }
        Update: {
          category?: string
          content_en?: string
          content_es?: string
          content_it?: string
          content_pt?: string
          content_zh?: string
          created_at?: string
          excerpt_en?: string
          excerpt_es?: string
          excerpt_it?: string
          excerpt_pt?: string
          excerpt_zh?: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: string | null
          slug?: string
          title_en?: string
          title_es?: string
          title_it?: string
          title_pt?: string
          title_zh?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          assigned_to: string | null
          channel: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string
          id: string
          latitude: number | null
          lead_level: string | null
          longitude: number | null
          message: string
          name: string
          next_action: string | null
          next_action_date: string | null
          priority: string | null
          status: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          channel?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email: string
          id?: string
          latitude?: number | null
          lead_level?: string | null
          longitude?: number | null
          message: string
          name: string
          next_action?: string | null
          next_action_date?: string | null
          priority?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          channel?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          latitude?: number | null
          lead_level?: string | null
          longitude?: number | null
          message?: string
          name?: string
          next_action?: string | null
          next_action_date?: string | null
          priority?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      document_templates: {
        Row: {
          content_en: string
          content_es: string
          content_it: string
          content_pt: string
          content_zh: string
          created_at: string
          created_by: string | null
          fields: Json | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          content_en: string
          content_es: string
          content_it: string
          content_pt: string
          content_zh: string
          created_at?: string
          created_by?: string | null
          fields?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          content_en?: string
          content_es?: string
          content_it?: string
          content_pt?: string
          content_zh?: string
          created_at?: string
          created_by?: string | null
          fields?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_en: string
          body_es: string
          body_it: string
          body_pt: string
          body_zh: string
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject_en: string
          subject_es: string
          subject_it: string
          subject_pt: string
          subject_zh: string
          updated_at: string
        }
        Insert: {
          body_en: string
          body_es: string
          body_it: string
          body_pt: string
          body_zh: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject_en: string
          subject_es: string
          subject_it: string
          subject_pt: string
          subject_zh: string
          updated_at?: string
        }
        Update: {
          body_en?: string
          body_es?: string
          body_it?: string
          body_pt?: string
          body_zh?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject_en?: string
          subject_es?: string
          subject_it?: string
          subject_pt?: string
          subject_zh?: string
          updated_at?: string
        }
        Relationships: []
      }
      feasibility_studies: {
        Row: {
          administrative_cost: number | null
          annual_ebitda: number | null
          annual_opex: number | null
          annual_revenue: number | null
          collection_model: string | null
          country: string | null
          created_at: string
          created_by: string | null
          daily_capacity_tons: number | null
          depreciation_years: number | null
          discount_rate: number | null
          energy_cost: number | null
          environmental_bonus_per_ton: number | null
          equipment_cost: number | null
          government_royalties_percent: number | null
          id: string
          inflation_rate: number | null
          infrastructure_cost: number | null
          installation_cost: number | null
          irr_percentage: number | null
          labor_cost: number | null
          lead_id: string | null
          lead_type: string | null
          location: string | null
          logistics_cost: number | null
          maintenance_cost: number | null
          notes: string | null
          npv_10_years: number | null
          operating_days_per_year: number | null
          other_capex: number | null
          other_opex: number | null
          payback_months: number | null
          plant_type: string | null
          raw_material_cost: number | null
          rcb_price: number | null
          rcb_yield: number | null
          roi_percentage: number | null
          rubber_granules_price: number | null
          rubber_granules_yield: number | null
          status: string | null
          steel_wire_price: number | null
          steel_wire_yield: number | null
          study_name: string
          tax_rate: number | null
          textile_fiber_price: number | null
          textile_fiber_yield: number | null
          total_investment: number | null
          updated_at: string
          utilization_rate: number | null
          working_capital: number | null
        }
        Insert: {
          administrative_cost?: number | null
          annual_ebitda?: number | null
          annual_opex?: number | null
          annual_revenue?: number | null
          collection_model?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          daily_capacity_tons?: number | null
          depreciation_years?: number | null
          discount_rate?: number | null
          energy_cost?: number | null
          environmental_bonus_per_ton?: number | null
          equipment_cost?: number | null
          government_royalties_percent?: number | null
          id?: string
          inflation_rate?: number | null
          infrastructure_cost?: number | null
          installation_cost?: number | null
          irr_percentage?: number | null
          labor_cost?: number | null
          lead_id?: string | null
          lead_type?: string | null
          location?: string | null
          logistics_cost?: number | null
          maintenance_cost?: number | null
          notes?: string | null
          npv_10_years?: number | null
          operating_days_per_year?: number | null
          other_capex?: number | null
          other_opex?: number | null
          payback_months?: number | null
          plant_type?: string | null
          raw_material_cost?: number | null
          rcb_price?: number | null
          rcb_yield?: number | null
          roi_percentage?: number | null
          rubber_granules_price?: number | null
          rubber_granules_yield?: number | null
          status?: string | null
          steel_wire_price?: number | null
          steel_wire_yield?: number | null
          study_name: string
          tax_rate?: number | null
          textile_fiber_price?: number | null
          textile_fiber_yield?: number | null
          total_investment?: number | null
          updated_at?: string
          utilization_rate?: number | null
          working_capital?: number | null
        }
        Update: {
          administrative_cost?: number | null
          annual_ebitda?: number | null
          annual_opex?: number | null
          annual_revenue?: number | null
          collection_model?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          daily_capacity_tons?: number | null
          depreciation_years?: number | null
          discount_rate?: number | null
          energy_cost?: number | null
          environmental_bonus_per_ton?: number | null
          equipment_cost?: number | null
          government_royalties_percent?: number | null
          id?: string
          inflation_rate?: number | null
          infrastructure_cost?: number | null
          installation_cost?: number | null
          irr_percentage?: number | null
          labor_cost?: number | null
          lead_id?: string | null
          lead_type?: string | null
          location?: string | null
          logistics_cost?: number | null
          maintenance_cost?: number | null
          notes?: string | null
          npv_10_years?: number | null
          operating_days_per_year?: number | null
          other_capex?: number | null
          other_opex?: number | null
          payback_months?: number | null
          plant_type?: string | null
          raw_material_cost?: number | null
          rcb_price?: number | null
          rcb_yield?: number | null
          roi_percentage?: number | null
          rubber_granules_price?: number | null
          rubber_granules_yield?: number | null
          status?: string | null
          steel_wire_price?: number | null
          steel_wire_yield?: number | null
          study_name?: string
          tax_rate?: number | null
          textile_fiber_price?: number | null
          textile_fiber_yield?: number | null
          total_investment?: number | null
          updated_at?: string
          utilization_rate?: number | null
          working_capital?: number | null
        }
        Relationships: []
      }
      generated_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          field_values: Json | null
          file_url: string | null
          generated_by: string | null
          id: string
          is_signed: boolean | null
          language: string | null
          lead_id: string | null
          lead_type: string | null
          sent_at: string | null
          sent_to_email: string | null
          signature_data: Json | null
          signature_hash: string | null
          signature_type: string | null
          signed_at: string | null
          signer_email: string | null
          signer_name: string | null
          template_id: string | null
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          field_values?: Json | null
          file_url?: string | null
          generated_by?: string | null
          id?: string
          is_signed?: boolean | null
          language?: string | null
          lead_id?: string | null
          lead_type?: string | null
          sent_at?: string | null
          sent_to_email?: string | null
          signature_data?: Json | null
          signature_hash?: string | null
          signature_type?: string | null
          signed_at?: string | null
          signer_email?: string | null
          signer_name?: string | null
          template_id?: string | null
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          field_values?: Json | null
          file_url?: string | null
          generated_by?: string | null
          id?: string
          is_signed?: boolean | null
          language?: string | null
          lead_id?: string | null
          lead_type?: string | null
          sent_at?: string | null
          sent_to_email?: string | null
          signature_data?: Json | null
          signature_hash?: string | null
          signature_type?: string | null
          signed_at?: string | null
          signer_email?: string | null
          signer_name?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_stats: {
        Row: {
          display_order: number | null
          id: string
          is_active: boolean | null
          key: string
          label_en: string
          label_es: string
          label_it: string
          label_pt: string
          label_zh: string
          suffix: string | null
          updated_at: string
          updated_by: string | null
          value: number
        }
        Insert: {
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          key: string
          label_en: string
          label_es: string
          label_it?: string
          label_pt: string
          label_zh: string
          suffix?: string | null
          updated_at?: string
          updated_by?: string | null
          value?: number
        }
        Update: {
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          key?: string
          label_en?: string
          label_es?: string
          label_it?: string
          label_pt?: string
          label_zh?: string
          suffix?: string | null
          updated_at?: string
          updated_by?: string | null
          value?: number
        }
        Relationships: []
      }
      lead_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          lead_id: string
          lead_type: string
          notes: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          lead_id: string
          lead_type: string
          notes?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          lead_id?: string
          lead_type?: string
          notes?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      lead_notes: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          note: string
          note_type: string | null
          user_id: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          note: string
          note_type?: string | null
          user_id?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          note?: string
          note_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      loi_documents: {
        Row: {
          company_name: string
          company_type: string
          contact_name: string
          country: string
          created_at: string
          download_count: number | null
          email: string
          estimated_volume: string | null
          expires_at: string
          id: string
          language: string
          last_accessed_at: string | null
          message: string | null
          products_interest: string[]
          registration_id: string | null
          token: string
        }
        Insert: {
          company_name: string
          company_type: string
          contact_name: string
          country: string
          created_at?: string
          download_count?: number | null
          email: string
          estimated_volume?: string | null
          expires_at?: string
          id?: string
          language?: string
          last_accessed_at?: string | null
          message?: string | null
          products_interest: string[]
          registration_id?: string | null
          token: string
        }
        Update: {
          company_name?: string
          company_type?: string
          contact_name?: string
          country?: string
          created_at?: string
          download_count?: number | null
          email?: string
          estimated_volume?: string | null
          expires_at?: string
          id?: string
          language?: string
          last_accessed_at?: string | null
          message?: string | null
          products_interest?: string[]
          registration_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "loi_documents_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "marketplace_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_registrations: {
        Row: {
          assigned_to: string | null
          company_name: string
          company_type: string
          contact_name: string
          country: string
          created_at: string
          email: string
          estimated_volume: string | null
          id: string
          latitude: number | null
          lead_level: string | null
          longitude: number | null
          message: string | null
          next_action: string | null
          next_action_date: string | null
          phone: string | null
          priority: string | null
          products_interest: string[]
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_name: string
          company_type: string
          contact_name: string
          country: string
          created_at?: string
          email: string
          estimated_volume?: string | null
          id?: string
          latitude?: number | null
          lead_level?: string | null
          longitude?: number | null
          message?: string | null
          next_action?: string | null
          next_action_date?: string | null
          phone?: string | null
          priority?: string | null
          products_interest: string[]
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_name?: string
          company_type?: string
          contact_name?: string
          country?: string
          created_at?: string
          email?: string
          estimated_volume?: string | null
          id?: string
          latitude?: number | null
          lead_level?: string | null
          longitude?: number | null
          message?: string | null
          next_action?: string | null
          next_action_date?: string | null
          phone?: string | null
          priority?: string | null
          products_interest?: string[]
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          interests: string[] | null
          is_active: boolean | null
          language: string | null
          name: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          language?: string | null
          name?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          language?: string | null
          name?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notification_webhooks: {
        Row: {
          created_at: string
          created_by: string | null
          events: string[]
          id: string
          is_active: boolean
          name: string
          updated_at: string
          webhook_type: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          webhook_type: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          webhook_type?: string
          webhook_url?: string
        }
        Relationships: []
      }
      otr_conversion_goals: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          month: number
          notes: string | null
          target_conversions: number
          target_leads: number
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          month: number
          notes?: string | null
          target_conversions?: number
          target_leads?: number
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          month?: number
          notes?: string | null
          target_conversions?: number
          target_leads?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      partner_profiles: {
        Row: {
          annual_revenue: string | null
          company_linkedin: string | null
          company_registration_number: string | null
          company_website: string | null
          created_at: string
          due_diligence_notes: string | null
          due_diligence_status: string | null
          employees_count: string | null
          id: string
          industry_sector: string | null
          investment_capacity: string | null
          kyc_documents: Json | null
          kyc_status: string | null
          lead_id: string
          lead_type: string
          nda_document_url: string | null
          nda_signed: boolean | null
          nda_signed_at: string | null
          project_description: string | null
          rejection_reason: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          annual_revenue?: string | null
          company_linkedin?: string | null
          company_registration_number?: string | null
          company_website?: string | null
          created_at?: string
          due_diligence_notes?: string | null
          due_diligence_status?: string | null
          employees_count?: string | null
          id?: string
          industry_sector?: string | null
          investment_capacity?: string | null
          kyc_documents?: Json | null
          kyc_status?: string | null
          lead_id: string
          lead_type: string
          nda_document_url?: string | null
          nda_signed?: boolean | null
          nda_signed_at?: string | null
          project_description?: string | null
          rejection_reason?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          annual_revenue?: string | null
          company_linkedin?: string | null
          company_registration_number?: string | null
          company_website?: string | null
          created_at?: string
          due_diligence_notes?: string | null
          due_diligence_status?: string | null
          employees_count?: string | null
          id?: string
          industry_sector?: string | null
          investment_capacity?: string | null
          kyc_documents?: Json | null
          kyc_status?: string | null
          lead_id?: string
          lead_type?: string
          nda_document_url?: string | null
          nda_signed?: boolean | null
          nda_signed_at?: string | null
          project_description?: string | null
          rejection_reason?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      press_releases: {
        Row: {
          content_en: string
          content_es: string
          content_it: string
          content_pt: string
          content_zh: string
          created_at: string
          id: string
          is_published: boolean | null
          location: string
          published_at: string | null
          slug: string
          title_en: string
          title_es: string
          title_it: string
          title_pt: string
          title_zh: string
          updated_at: string
        }
        Insert: {
          content_en: string
          content_es: string
          content_it?: string
          content_pt: string
          content_zh: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          location: string
          published_at?: string | null
          slug: string
          title_en: string
          title_es: string
          title_it?: string
          title_pt: string
          title_zh: string
          updated_at?: string
        }
        Update: {
          content_en?: string
          content_es?: string
          content_it?: string
          content_pt?: string
          content_zh?: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          location?: string
          published_at?: string | null
          slug?: string
          title_en?: string
          title_es?: string
          title_it?: string
          title_pt?: string
          title_zh?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_notifications: {
        Row: {
          body: string
          created_at: string
          failed_count: number | null
          id: string
          sent_by: string | null
          sent_count: number | null
          title: string
          topic: string | null
          url: string | null
        }
        Insert: {
          body: string
          created_at?: string
          failed_count?: number | null
          id?: string
          sent_by?: string | null
          sent_count?: number | null
          title: string
          topic?: string | null
          url?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          failed_count?: number | null
          id?: string
          sent_by?: string | null
          sent_count?: number | null
          title?: string
          topic?: string | null
          url?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          language: string | null
          p256dh: string
          topics: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          language?: string | null
          p256dh: string
          topics?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          language?: string | null
          p256dh?: string
          topics?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      signature_log: {
        Row: {
          created_at: string
          document_id: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          signature_hash: string
          signature_type: string
          signer_email: string
          signer_name: string
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          signature_hash: string
          signature_type: string
          signer_email: string
          signer_name: string
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          signature_hash?: string
          signature_type?: string
          signer_email?: string
          signer_name?: string
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signature_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "generated_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      youtube_cache: {
        Row: {
          id: string
          updated_at: string
          videos: Json
        }
        Insert: {
          id: string
          updated_at?: string
          videos?: Json
        }
        Update: {
          id?: string
          updated_at?: string
          videos?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_loi_download: {
        Args: { loi_token: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer"
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
      app_role: ["admin", "editor", "viewer"],
    },
  },
} as const

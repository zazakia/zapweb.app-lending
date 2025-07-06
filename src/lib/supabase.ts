import { createClient } from '@supabase/supabase-js'

// Use fallback values for demo if env vars are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

// Check if we have real Supabase credentials
const hasRealCredentials = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key'

export const supabase = hasRealCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null // Use null to indicate demo mode

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          full_name: string
          user_level: string
          status: string
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          full_name: string
          user_level: string
          status?: string
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          full_name?: string
          user_level?: string
          status?: string
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          customer_code: string
          first_name: string
          middle_name: string | null
          last_name: string
          date_of_birth: string | null
          gender: string | null
          civil_status: string | null
          address: string | null
          phone: string | null
          email: string | null
          occupation: string | null
          employer: string | null
          monthly_income: number | null
          id1_type: string | null
          id1_number: string | null
          id1_issued_by: string | null
          id1_expiry_date: string | null
          id2_type: string | null
          id2_number: string | null
          id2_issued_by: string | null
          id2_expiry_date: string | null
          credit_score: number
          late_payment_count: number
          late_payment_points: number
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          collateral_description: string | null
          collateral_value: number | null
          loan_purpose: string | null
          branch_id: string | null
          created_by: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_code: string
          first_name: string
          middle_name?: string | null
          last_name: string
          date_of_birth?: string | null
          gender?: string | null
          civil_status?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          occupation?: string | null
          employer?: string | null
          monthly_income?: number | null
          id1_type?: string | null
          id1_number?: string | null
          id1_issued_by?: string | null
          id1_expiry_date?: string | null
          id2_type?: string | null
          id2_number?: string | null
          id2_issued_by?: string | null
          id2_expiry_date?: string | null
          credit_score?: number
          late_payment_count?: number
          late_payment_points?: number
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          collateral_description?: string | null
          collateral_value?: number | null
          loan_purpose?: string | null
          branch_id?: string | null
          created_by?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_code?: string
          first_name?: string
          middle_name?: string | null
          last_name?: string
          date_of_birth?: string | null
          gender?: string | null
          civil_status?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          occupation?: string | null
          employer?: string | null
          monthly_income?: number | null
          id1_type?: string | null
          id1_number?: string | null
          id1_issued_by?: string | null
          id1_expiry_date?: string | null
          id2_type?: string | null
          id2_number?: string | null
          id2_issued_by?: string | null
          id2_expiry_date?: string | null
          credit_score?: number
          late_payment_count?: number
          late_payment_points?: number
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          collateral_description?: string | null
          collateral_value?: number | null
          loan_purpose?: string | null
          branch_id?: string | null
          created_by?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          loan_code: string
          customer_id: string
          loan_type_id: string
          principal_amount: number
          interest_rate: number
          interest_amount: number
          total_amortization: number
          current_balance: number
          term_months: number | null
          term_days: number | null
          release_date: string
          maturity_date: string
          collector_id: string | null
          branch_id: string | null
          loan_status: string
          life_insurance: number
          service_fee: number
          loan_category: string
          created_by: string | null
          approved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          loan_code: string
          customer_id: string
          loan_type_id: string
          principal_amount: number
          interest_rate: number
          interest_amount: number
          total_amortization: number
          current_balance: number
          term_months?: number | null
          term_days?: number | null
          release_date: string
          maturity_date: string
          collector_id?: string | null
          branch_id?: string | null
          loan_status?: string
          life_insurance?: number
          service_fee?: number
          loan_category?: string
          created_by?: string | null
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          loan_code?: string
          customer_id?: string
          loan_type_id?: string
          principal_amount?: number
          interest_rate?: number
          interest_amount?: number
          total_amortization?: number
          current_balance?: number
          term_months?: number | null
          term_days?: number | null
          release_date?: string
          maturity_date?: string
          collector_id?: string | null
          branch_id?: string | null
          loan_status?: string
          life_insurance?: number
          service_fee?: number
          loan_category?: string
          created_by?: string | null
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          payment_id: string
          loan_id: string
          customer_id: string
          payment_amount: number
          payment_date: string
          new_balance: number
          days_late: number
          late_payment_fee: number
          is_late_payment: boolean
          payment_method: string
          reference_number: string | null
          collector_id: string | null
          collected_by: string | null
          payment_status: string
          reversed_by: string | null
          reversed_at: string | null
          reversal_reason: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          payment_id: string
          loan_id: string
          customer_id: string
          payment_amount: number
          payment_date: string
          new_balance: number
          days_late?: number
          late_payment_fee?: number
          is_late_payment?: boolean
          payment_method?: string
          reference_number?: string | null
          collector_id?: string | null
          collected_by?: string | null
          payment_status?: string
          reversed_by?: string | null
          reversed_at?: string | null
          reversal_reason?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          payment_id?: string
          loan_id?: string
          customer_id?: string
          payment_amount?: number
          payment_date?: string
          new_balance?: number
          days_late?: number
          late_payment_fee?: number
          is_late_payment?: boolean
          payment_method?: string
          reference_number?: string | null
          collector_id?: string | null
          collected_by?: string | null
          payment_status?: string
          reversed_by?: string | null
          reversed_at?: string | null
          reversal_reason?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
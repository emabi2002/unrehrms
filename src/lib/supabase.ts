import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          created_at: string
          first_name: string
          last_name: string
          email: string
          phone: string
          employee_id: string
          department: string
          position: string
          employment_type: string
          hire_date: string
          salary: number
          status: 'active' | 'on_leave' | 'terminated'
        }
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['employees']['Insert']>
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string
          head_of_department: string | null
        }
      }
      leave_requests: {
        Row: {
          id: string
          employee_id: string
          leave_type: string
          start_date: string
          end_date: string
          reason: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
      }
      attendance: {
        Row: {
          id: string
          employee_id: string
          date: string
          check_in: string
          check_out: string | null
          status: 'present' | 'absent' | 'late' | 'half_day'
        }
      }
      salary_slips: {
        Row: {
          id: string
          employee_id: string
          month: string
          year: number
          basic_salary: number
          allowances: number
          deductions: number
          net_salary: number
          created_at: string
        }
      }
    }
  }
}

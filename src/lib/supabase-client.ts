'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './supabase'

export const createClient = () => createClientComponentClient<Database>()

// Helper functions for database operations
export const supabaseClient = createClient()

// Employee operations
export const employeeService = {
  async getAll() {
    const { data, error } = await supabaseClient
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getById(id: string) {
    const { data, error } = await supabaseClient
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async create(employee: Database['public']['Tables']['employees']['Insert']) {
    const { data, error } = await supabaseClient
      .from('employees')
      .insert(employee)
      .select()
      .single()
    return { data, error }
  },

  async update(id: string, employee: Database['public']['Tables']['employees']['Update']) {
    const { data, error } = await supabaseClient
      .from('employees')
      .update(employee)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async delete(id: string) {
    const { error } = await supabaseClient
      .from('employees')
      .delete()
      .eq('id', id)
    return { error }
  }
}

// Leave request operations
export const leaveService = {
  async getAll() {
    const { data, error } = await supabaseClient
      .from('leave_requests')
      .select(`
        *,
        employees (
          first_name,
          last_name,
          employee_id,
          department
        )
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async create(leave: Database['public']['Tables']['leave_requests']['Insert']) {
    const { data, error } = await supabaseClient
      .from('leave_requests')
      .insert(leave)
      .select()
      .single()
    return { data, error }
  },

  async updateStatus(id: string, status: 'approved' | 'rejected') {
    const { data, error } = await supabaseClient
      .from('leave_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }
}

// Attendance operations
export const attendanceService = {
  async getAll(date?: string) {
    let query = supabaseClient
      .from('attendance')
      .select(`
        *,
        employees (
          first_name,
          last_name,
          employee_id,
          department
        )
      `)
      .order('date', { ascending: false })

    if (date) {
      query = query.eq('date', date)
    }

    const { data, error } = await query
    return { data, error }
  },

  async checkIn(employeeId: string) {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    const { data, error } = await supabaseClient
      .from('attendance')
      .insert({
        employee_id: employeeId,
        date: today,
        check_in: now,
        status: 'present'
      })
      .select()
      .single()
    return { data, error }
  },

  async checkOut(attendanceId: string) {
    const now = new Date().toISOString()

    const { data, error } = await supabaseClient
      .from('attendance')
      .update({
        check_out: now
      })
      .eq('id', attendanceId)
      .select()
      .single()
    return { data, error }
  }
}

// Department operations
export const departmentService = {
  async getAll() {
    const { data, error } = await supabaseClient
      .from('departments')
      .select('*')
      .order('name', { ascending: true })
    return { data, error }
  },

  async create(department: Database['public']['Tables']['departments']['Insert']) {
    const { data, error } = await supabaseClient
      .from('departments')
      .insert(department)
      .select()
      .single()
    return { data, error }
  }
}

// Salary slip operations
export const salaryService = {
  async getAll() {
    const { data, error } = await supabaseClient
      .from('salary_slips')
      .select(`
        *,
        employees (
          first_name,
          last_name,
          employee_id,
          department
        )
      `)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
    return { data, error }
  },

  async getByEmployee(employeeId: string) {
    const { data, error } = await supabaseClient
      .from('salary_slips')
      .select('*')
      .eq('employee_id', employeeId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
    return { data, error }
  },

  async create(salarySlip: Database['public']['Tables']['salary_slips']['Insert']) {
    const { data, error } = await supabaseClient
      .from('salary_slips')
      .insert(salarySlip)
      .select()
      .single()
    return { data, error }
  }
}

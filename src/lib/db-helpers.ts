import { supabase } from './supabase'

// Employee operations
export const employeeService = {
  async getAll() {
    return await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })
  },

  async getById(id: string) {
    return await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()
  },

  async create(employee: any) {
    return await supabase
      .from('employees')
      .insert(employee)
      .select()
      .single()
  },

  async update(id: string, employee: any) {
    return await supabase
      .from('employees')
      .update(employee)
      .eq('id', id)
      .select()
      .single()
  },

  async delete(id: string) {
    return await supabase
      .from('employees')
      .delete()
      .eq('id', id)
  }
}

// Leave request operations
export const leaveService = {
  async getAll() {
    return await supabase
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
  },

  async create(leave: any) {
    return await supabase
      .from('leave_requests')
      .insert(leave)
      .select()
      .single()
  },

  async updateStatus(id: string, status: 'approved' | 'rejected') {
    return await supabase
      .from('leave_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
  }
}

// Attendance operations
export const attendanceService = {
  async getAll(date?: string) {
    let query = supabase
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

    return await query
  },

  async checkIn(employeeId: string) {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    return await supabase
      .from('attendance')
      .insert({
        employee_id: employeeId,
        date: today,
        check_in: now,
        status: 'present'
      })
      .select()
      .single()
  },

  async checkOut(attendanceId: string) {
    const now = new Date().toISOString()

    return await supabase
      .from('attendance')
      .update({
        check_out: now
      })
      .eq('id', attendanceId)
      .select()
      .single()
  }
}

// Department operations
export const departmentService = {
  async getAll() {
    return await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true })
  },

  async create(department: any) {
    return await supabase
      .from('departments')
      .insert(department)
      .select()
      .single()
  }
}

// Salary slip operations
export const salaryService = {
  async getAll() {
    return await supabase
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
  },

  async getByEmployee(employeeId: string) {
    return await supabase
      .from('salary_slips')
      .select('*')
      .eq('employee_id', employeeId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
  },

  async create(salarySlip: any) {
    return await supabase
      .from('salary_slips')
      .insert(salarySlip)
      .select()
      .single()
  }
}

/**
 * Database Type Definitions
 * Auto-generated from Supabase migrations
 * Last updated: December 21, 2025
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =====================================================
// Core Tables
// =====================================================

export interface Faculty {
  id: string
  code: string
  name: string
  description?: string
  dean_id?: string
  established_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  code?: string
  description?: string
  head_of_department?: string
  faculty_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AcademicRank {
  id: string
  code: string
  name: string
  description?: string
  rank_level: number
  min_years_experience: number
  requires_phd: boolean
  is_active: boolean
  created_at: string
}

export interface EmploymentType {
  id: string
  code: string
  name: string
  description?: string
  is_permanent: boolean
  is_active: boolean
  created_at: string
}

export interface Position {
  id: string
  code: string
  title: string
  description?: string
  department_id?: string
  academic_rank_id?: string
  employment_type_id?: string
  grade_level?: string
  min_salary?: number
  max_salary?: number
  reports_to_position_id?: string
  is_management: boolean
  is_academic: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  employee_number: string
  first_name: string
  last_name: string
  personal_email?: string
  work_email?: string
  mobile_phone?: string
  work_phone?: string

  // Employment details
  department_id?: string
  faculty_id?: string
  position_id?: string
  academic_rank_id?: string
  employment_type_id?: string
  reports_to?: string

  hire_date: string
  contract_start_date?: string
  contract_end_date?: string
  probation_end_date?: string

  // Personal details
  date_of_birth?: string
  gender?: string
  nationality?: string
  profile_picture?: string

  // Financial
  salary?: number
  tax_file_number?: string
  bank_name?: string
  bank_account_number?: string

  // Emergency
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string

  // Status
  employment_status: 'Active' | 'On Leave' | 'Terminated' | 'Resigned'
  is_active: boolean
  created_at: string
  updated_at: string
}

// Employee with relations
export interface EmployeeWithDetails extends Employee {
  department?: Department
  faculty?: Faculty
  position?: Position
  academic_rank?: AcademicRank
  employment_type?: EmploymentType
}

// =====================================================
// Leave Management
// =====================================================

export interface LeaveType {
  id: string
  code: string
  name: string
  annual_days: number
  carry_forward: boolean
  requires_approval: boolean
  paid: boolean
  color?: string
  is_active: boolean
  created_at: string
}

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  days_requested: number
  reason?: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export interface LeaveBalance {
  id: string
  employee_id: string
  leave_type_id: string
  year: number
  entitled: number
  used: number
  pending: number
  available: number
  carried_forward: number
  created_at: string
  updated_at: string
}

// =====================================================
// Attendance
// =====================================================

export interface Attendance {
  id: string
  employee_id: string
  date: string
  check_in?: string
  check_out?: string
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave'
  hours_worked?: number
  overtime_hours?: number
  location?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Shift {
  id: string
  name: string
  start_time: string
  end_time: string
  is_active: boolean
  created_at: string
}

export interface OvertimeRequest {
  id: string
  employee_id: string
  date: string
  hours: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  created_at: string
}

// =====================================================
// Documents
// =====================================================

export interface EmployeeDocument {
  id: string
  employee_id: string
  document_type: string
  document_name: string
  file_path: string
  file_size: number
  upload_date: string
  expiry_date?: string
  notes?: string
  created_at: string
}

export interface EmergencyContact {
  id: string
  employee_id: string
  name: string
  relationship: string
  phone_primary: string
  phone_secondary?: string
  email?: string
  address?: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

// =====================================================
// Payroll
// =====================================================

export interface SalaryStructure {
  id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SalaryComponent {
  id: string
  code: string
  name: string
  type: 'earning' | 'deduction'
  calculation_type: 'fixed' | 'percentage' | 'formula'
  default_value?: number
  is_taxable: boolean
  is_super_applicable: boolean
  is_active: boolean
  created_at: string
}

export interface PayPeriod {
  id: string
  period_type: 'monthly' | 'fortnightly' | 'weekly'
  start_date: string
  end_date: string
  pay_date: string
  status: 'draft' | 'processing' | 'completed' | 'paid'
  created_at: string
}

export interface PayRun {
  id: string
  pay_period_id: string
  status: 'draft' | 'processing' | 'approved' | 'paid'
  total_gross: number
  total_net: number
  total_tax: number
  total_super: number
  processed_by?: string
  processed_at?: string
  created_at: string
}

export interface Payslip {
  id: string
  pay_run_id: string
  employee_id: string
  pay_period_id: string
  gross_pay: number
  net_pay: number
  total_tax: number
  total_super: number
  total_deductions: number
  created_at: string
}

export interface TaxBracket {
  id: string
  year: number
  income_from: number
  income_to?: number
  tax_rate: number
  base_tax: number
  country: string
  is_active: boolean
  created_at: string
}

export interface SuperScheme {
  id: string
  code: string
  name: string
  employer_rate: number
  employee_rate: number
  is_active: boolean
  created_at: string
}

// =====================================================
// Recruitment
// =====================================================

export interface JobRequisition {
  id: string
  position_id: string
  department_id: string
  vacancies: number
  reason: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'filled'
  created_by: string
  created_at: string
}

export interface Candidate {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  resume_path?: string
  status: 'new' | 'screening' | 'interviewing' | 'offered' | 'hired' | 'rejected'
  created_at: string
}

export interface Application {
  id: string
  candidate_id: string
  requisition_id: string
  cover_letter?: string
  status: 'submitted' | 'screening' | 'shortlisted' | 'interviewed' | 'offered' | 'rejected'
  applied_at: string
  created_at: string
}

export interface Interview {
  id: string
  application_id: string
  scheduled_date: string
  interview_type: string
  interviewer_ids: string[]
  status: 'scheduled' | 'completed' | 'cancelled'
  feedback?: string
  rating?: number
  created_at: string
}

// =====================================================
// Performance
// =====================================================

export interface PerformanceGoal {
  id: string
  employee_id: string
  title: string
  description: string
  target_date: string
  status: 'active' | 'completed' | 'cancelled'
  progress: number
  created_at: string
  updated_at: string
}

export interface PerformanceReview {
  id: string
  employee_id: string
  reviewer_id: string
  review_period_start: string
  review_period_end: string
  overall_rating: number
  status: 'draft' | 'submitted' | 'completed'
  created_at: string
}

// =====================================================
// Training
// =====================================================

export interface TrainingCourse {
  id: string
  code: string
  name: string
  description?: string
  duration_hours: number
  is_mandatory: boolean
  is_active: boolean
  created_at: string
}

export interface TrainingEnrollment {
  id: string
  employee_id: string
  course_id: string
  enrollment_date: string
  completion_date?: string
  status: 'enrolled' | 'in_progress' | 'completed' | 'cancelled'
  score?: number
  created_at: string
}

export interface Certification {
  id: string
  employee_id: string
  name: string
  issuing_organization: string
  issue_date: string
  expiry_date?: string
  credential_id?: string
  is_active: boolean
  created_at: string
}

// =====================================================
// Database Schema
// =====================================================

export interface Database {
  public: {
    Tables: {
      faculties: { Row: Faculty; Insert: Omit<Faculty, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Faculty, 'id' | 'created_at' | 'updated_at'>> }
      departments: { Row: Department; Insert: Omit<Department, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Department, 'id' | 'created_at' | 'updated_at'>> }
      academic_ranks: { Row: AcademicRank; Insert: Omit<AcademicRank, 'id' | 'created_at'>; Update: Partial<Omit<AcademicRank, 'id' | 'created_at'>> }
      employment_types: { Row: EmploymentType; Insert: Omit<EmploymentType, 'id' | 'created_at'>; Update: Partial<Omit<EmploymentType, 'id' | 'created_at'>> }
      positions: { Row: Position; Insert: Omit<Position, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Position, 'id' | 'created_at' | 'updated_at'>> }
      employees: { Row: Employee; Insert: Omit<Employee, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>> }
      leave_types: { Row: LeaveType; Insert: Omit<LeaveType, 'id' | 'created_at'>; Update: Partial<Omit<LeaveType, 'id' | 'created_at'>> }
      leave_requests: { Row: LeaveRequest; Insert: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>> }
      leave_balances: { Row: LeaveBalance; Insert: Omit<LeaveBalance, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<LeaveBalance, 'id' | 'created_at' | 'updated_at'>> }
      attendance: { Row: Attendance; Insert: Omit<Attendance, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Attendance, 'id' | 'created_at' | 'updated_at'>> }
      employee_documents: { Row: EmployeeDocument; Insert: Omit<EmployeeDocument, 'id' | 'created_at'>; Update: Partial<Omit<EmployeeDocument, 'id' | 'created_at'>> }
      emergency_contacts: { Row: EmergencyContact; Insert: Omit<EmergencyContact, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<EmergencyContact, 'id' | 'created_at' | 'updated_at'>> }
      salary_components: { Row: SalaryComponent; Insert: Omit<SalaryComponent, 'id' | 'created_at'>; Update: Partial<Omit<SalaryComponent, 'id' | 'created_at'>> }
      pay_periods: { Row: PayPeriod; Insert: Omit<PayPeriod, 'id' | 'created_at'>; Update: Partial<Omit<PayPeriod, 'id' | 'created_at'>> }
      payslips: { Row: Payslip; Insert: Omit<Payslip, 'id' | 'created_at'>; Update: Partial<Omit<Payslip, 'id' | 'created_at'>> }
      tax_brackets: { Row: TaxBracket; Insert: Omit<TaxBracket, 'id' | 'created_at'>; Update: Partial<Omit<TaxBracket, 'id' | 'created_at'>> }
      super_schemes: { Row: SuperScheme; Insert: Omit<SuperScheme, 'id' | 'created_at'>; Update: Partial<Omit<SuperScheme, 'id' | 'created_at'>> }
      candidates: { Row: Candidate; Insert: Omit<Candidate, 'id' | 'created_at'>; Update: Partial<Omit<Candidate, 'id' | 'created_at'>> }
      applications: { Row: Application; Insert: Omit<Application, 'id' | 'created_at'>; Update: Partial<Omit<Application, 'id' | 'created_at'>> }
      performance_goals: { Row: PerformanceGoal; Insert: Omit<PerformanceGoal, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<PerformanceGoal, 'id' | 'created_at' | 'updated_at'>> }
      training_courses: { Row: TrainingCourse; Insert: Omit<TrainingCourse, 'id' | 'created_at'>; Update: Partial<Omit<TrainingCourse, 'id' | 'created_at'>> }
      training_enrollments: { Row: TrainingEnrollment; Insert: Omit<TrainingEnrollment, 'id' | 'created_at'>; Update: Partial<Omit<TrainingEnrollment, 'id' | 'created_at'>> }
      certifications: { Row: Certification; Insert: Omit<Certification, 'id' | 'created_at'>; Update: Partial<Omit<Certification, 'id' | 'created_at'>> }
    }
  }
}

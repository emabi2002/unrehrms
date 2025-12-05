import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/lib/supabase'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Sample employee data
const employees = [
  {
    first_name: 'John',
    last_name: 'Kila',
    email: 'j.kila@unre.ac.pg',
    phone: '+675 7123 4567',
    employee_id: 'UNRE-2020-001',
    department: 'Faculty of Environmental Sciences',
    position: 'Senior Lecturer',
    employment_type: 'Full-time Academic',
    hire_date: '2020-01-15',
    salary: 85000,
    status: 'active' as const,
    profile_picture: null
  },
  {
    first_name: 'Sarah',
    last_name: 'Puka',
    email: 's.puka@unre.ac.pg',
    phone: '+675 7234 5678',
    employee_id: 'UNRE-2021-045',
    department: 'Administrative Services',
    position: 'HR Officer',
    employment_type: 'Full-time Administrative',
    hire_date: '2021-03-10',
    salary: 55000,
    status: 'active' as const
  },
  {
    first_name: 'Mary',
    last_name: 'Tone',
    email: 'm.tone@unre.ac.pg',
    phone: '+675 7345 6789',
    employee_id: 'UNRE-2018-012',
    department: 'Faculty of Natural Resources',
    position: 'Professor',
    employment_type: 'Full-time Academic',
    hire_date: '2018-08-01',
    salary: 110000,
    status: 'active' as const
  },
  {
    first_name: 'David',
    last_name: 'Kama',
    email: 'd.kama@unre.ac.pg',
    phone: '+675 7456 7890',
    employee_id: 'UNRE-2022-078',
    department: 'IT Department',
    position: 'Systems Administrator',
    employment_type: 'Full-time Technical',
    hire_date: '2022-05-20',
    salary: 62000,
    status: 'active' as const
  },
  {
    first_name: 'Grace',
    last_name: 'Namu',
    email: 'g.namu@unre.ac.pg',
    phone: '+675 7567 8901',
    employee_id: 'UNRE-2019-034',
    department: 'Faculty of Agriculture',
    position: 'Assistant Lecturer',
    employment_type: 'Full-time Academic',
    hire_date: '2019-11-01',
    salary: 68000,
    status: 'active' as const
  },
  {
    first_name: 'Michael',
    last_name: 'Wari',
    email: 'm.wari@unre.ac.pg',
    phone: '+675 7678 9012',
    employee_id: 'UNRE-2020-056',
    department: 'Student Services',
    position: 'Student Affairs Officer',
    employment_type: 'Full-time Administrative',
    hire_date: '2020-09-15',
    salary: 52000,
    status: 'active' as const
  },
  {
    first_name: 'Patricia',
    last_name: 'Luma',
    email: 'p.luma@unre.ac.pg',
    phone: '+675 7789 0123',
    employee_id: 'UNRE-2017-023',
    department: 'Research & Development',
    position: 'Research Director',
    employment_type: 'Full-time Academic',
    hire_date: '2017-03-20',
    salary: 95000,
    status: 'active' as const
  },
  {
    first_name: 'James',
    last_name: 'Kora',
    email: 'j.kora@unre.ac.pg',
    phone: '+675 7890 1234',
    employee_id: 'UNRE-2019-067',
    department: 'Library Services',
    position: 'Chief Librarian',
    employment_type: 'Full-time Administrative',
    hire_date: '2019-07-01',
    salary: 58000,
    status: 'active' as const
  },
  {
    first_name: 'Helen',
    last_name: 'Tari',
    email: 'h.tari@unre.ac.pg',
    phone: '+675 7901 2345',
    employee_id: 'UNRE-2021-089',
    department: 'Faculty of Environmental Sciences',
    position: 'Lecturer',
    employment_type: 'Full-time Academic',
    hire_date: '2021-02-10',
    salary: 72000,
    status: 'active' as const
  },
  {
    first_name: 'Robert',
    last_name: 'Moi',
    email: 'r.moi@unre.ac.pg',
    phone: '+675 7012 3456',
    employee_id: 'UNRE-2020-034',
    department: 'Faculty of Natural Resources',
    position: 'Associate Professor',
    employment_type: 'Full-time Academic',
    hire_date: '2020-08-15',
    salary: 88000,
    status: 'active' as const
  },
  {
    first_name: 'Anna',
    last_name: 'Kewa',
    email: 'a.kewa@unre.ac.pg',
    phone: '+675 7123 4567',
    employee_id: 'UNRE-2022-101',
    department: 'Faculty of Agriculture',
    position: 'Lecturer',
    employment_type: 'Full-time Academic',
    hire_date: '2022-01-05',
    salary: 70000,
    status: 'active' as const
  },
  {
    first_name: 'Peter',
    last_name: 'Siune',
    email: 'p.siune@unre.ac.pg',
    phone: '+675 7234 5678',
    employee_id: 'UNRE-2018-045',
    department: 'IT Department',
    position: 'Network Administrator',
    employment_type: 'Full-time Technical',
    hire_date: '2018-06-10',
    salary: 65000,
    status: 'active' as const
  },
  {
    first_name: 'Lisa',
    last_name: 'Kumul',
    email: 'l.kumul@unre.ac.pg',
    phone: '+675 7345 6789',
    employee_id: 'UNRE-2021-112',
    department: 'Administrative Services',
    position: 'Finance Officer',
    employment_type: 'Full-time Administrative',
    hire_date: '2021-04-01',
    salary: 60000,
    status: 'active' as const
  },
  {
    first_name: 'Thomas',
    last_name: 'Aiga',
    email: 't.aiga@unre.ac.pg',
    phone: '+675 7456 7890',
    employee_id: 'UNRE-2019-078',
    department: 'Faculty of Environmental Sciences',
    position: 'Research Fellow',
    employment_type: 'Full-time Academic',
    hire_date: '2019-09-01',
    salary: 75000,
    status: 'active' as const
  },
  {
    first_name: 'Catherine',
    last_name: 'Wama',
    email: 'c.wama@unre.ac.pg',
    phone: '+675 7567 8901',
    employee_id: 'UNRE-2020-123',
    department: 'Student Services',
    position: 'Counselor',
    employment_type: 'Full-time Administrative',
    hire_date: '2020-11-15',
    salary: 54000,
    status: 'active' as const
  },
  {
    first_name: 'Daniel',
    last_name: 'Nori',
    email: 'd.nori@unre.ac.pg',
    phone: '+675 7678 9012',
    employee_id: 'UNRE-2017-056',
    department: 'Faculty of Natural Resources',
    position: 'Senior Lecturer',
    employment_type: 'Full-time Academic',
    hire_date: '2017-02-01',
    salary: 85000,
    status: 'active' as const,
    profile_picture: null
  },
  {
    first_name: 'Jennifer',
    last_name: 'Maima',
    email: 'j.maima@unre.ac.pg',
    phone: '+675 7789 0123',
    employee_id: 'UNRE-2021-134',
    department: 'Library Services',
    position: 'Assistant Librarian',
    employment_type: 'Full-time Administrative',
    hire_date: '2021-06-01',
    salary: 48000,
    status: 'active' as const
  },
  {
    first_name: 'Steven',
    last_name: 'Kopane',
    email: 's.kopane@unre.ac.pg',
    phone: '+675 7890 1234',
    employee_id: 'UNRE-2019-145',
    department: 'Research & Development',
    position: 'Research Officer',
    employment_type: 'Full-time Academic',
    hire_date: '2019-04-10',
    salary: 68000,
    status: 'active' as const
  },
  {
    first_name: 'Margaret',
    last_name: 'Tau',
    email: 'm.tau@unre.ac.pg',
    phone: '+675 7901 2345',
    employee_id: 'UNRE-2022-156',
    department: 'Faculty of Agriculture',
    position: 'Assistant Lecturer',
    employment_type: 'Full-time Academic',
    hire_date: '2022-03-15',
    salary: 66000,
    status: 'active' as const
  },
  {
    first_name: 'Andrew',
    last_name: 'Gari',
    email: 'a.gari@unre.ac.pg',
    phone: '+675 7012 3456',
    employee_id: 'UNRE-2018-167',
    department: 'IT Department',
    position: 'Technical Support Officer',
    employment_type: 'Full-time Technical',
    hire_date: '2018-10-01',
    salary: 56000,
    status: 'active' as const,
    profile_picture: null
  }
]

// Sample department data
const departments = [
  {
    name: 'Faculty of Environmental Sciences',
    description: 'Research and teaching in environmental sustainability, climate change, and conservation',
    head_of_department: 'Dr. John Kila'
  },
  {
    name: 'Faculty of Natural Resources',
    description: 'Forestry, wildlife management, and natural resource conservation',
    head_of_department: 'Prof. Mary Tone'
  },
  {
    name: 'Faculty of Agriculture',
    description: 'Sustainable agriculture, crop science, and food security research',
    head_of_department: 'Dr. Grace Namu'
  },
  {
    name: 'Administrative Services',
    description: 'Human resources, finance, procurement, and general administration',
    head_of_department: 'Sarah Puka'
  },
  {
    name: 'IT Department',
    description: 'Information systems, network infrastructure, and technical support',
    head_of_department: 'David Kama'
  },
  {
    name: 'Student Services',
    description: 'Student affairs, counseling, career services, and campus life',
    head_of_department: 'Michael Wari'
  },
  {
    name: 'Research & Development',
    description: 'Research grants, innovation projects, and academic publications',
    head_of_department: 'Dr. Patricia Luma'
  },
  {
    name: 'Library Services',
    description: 'Academic resources, digital library, and research support',
    head_of_department: 'James Kora'
  }
]

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n')

  try {
    // 1. Seed Departments
    console.log('📁 Seeding departments...')
    const { data: departmentsData, error: deptError } = await supabase
      .from('departments')
      .insert(departments)
      .select()

    if (deptError) {
      console.error('Error seeding departments:', deptError)
    } else {
      console.log(`✅ Seeded ${departmentsData?.length || 0} departments\n`)
    }

    // 2. Seed Employees
    console.log('👥 Seeding employees...')
    const { data: employeesData, error: empError } = await supabase
      .from('employees')
      .insert(employees)
      .select()

    if (empError) {
      console.error('Error seeding employees:', empError)
      console.log('Note: This might fail if employees already exist or due to constraints\n')
    } else {
      console.log(`✅ Seeded ${employeesData?.length || 0} employees\n`)
    }

    // 3. Seed Leave Requests (if employees were created)
    if (employeesData && employeesData.length > 0) {
      console.log('📅 Seeding leave requests...')

      const leaveRequests = [
        {
          employee_id: employeesData[0].id,
          leave_type: 'Annual Leave',
          start_date: '2025-12-20',
          end_date: '2025-12-24',
          reason: 'Family vacation during Christmas holidays',
          status: 'pending' as const
        },
        {
          employee_id: employeesData[1].id,
          leave_type: 'Sick Leave',
          start_date: '2025-12-06',
          end_date: '2025-12-07',
          reason: 'Medical appointment and recovery',
          status: 'pending' as const
        },
        {
          employee_id: employeesData[2].id,
          leave_type: 'Conference Leave',
          start_date: '2025-12-10',
          end_date: '2025-12-12',
          reason: 'Attending International Environmental Conference',
          status: 'approved' as const
        },
        {
          employee_id: employeesData[3].id,
          leave_type: 'Annual Leave',
          start_date: '2025-12-15',
          end_date: '2025-12-19',
          reason: 'Personal time off',
          status: 'approved' as const
        },
        {
          employee_id: employeesData[4].id,
          leave_type: 'Study Leave',
          start_date: '2025-11-28',
          end_date: '2025-11-30',
          reason: 'Workshop on sustainable farming',
          status: 'rejected' as const
        }
      ]

      const { data: leaveData, error: leaveError } = await supabase
        .from('leave_requests')
        .insert(leaveRequests)
        .select()

      if (leaveError) {
        console.error('Error seeding leave requests:', leaveError)
      } else {
        console.log(`✅ Seeded ${leaveData?.length || 0} leave requests\n`)
      }

      // 4. Seed Attendance Records
      console.log('⏰ Seeding attendance records...')

      const today = new Date()
      const attendanceRecords = []

      // Create 5 days of attendance for first 10 employees
      for (let day = 0; day < 5; day++) {
        const date = new Date(today)
        date.setDate(date.getDate() - day)
        const dateStr = date.toISOString().split('T')[0]

        for (let i = 0; i < Math.min(10, employeesData.length); i++) {
          const employee = employeesData[i]
          const randomHour = 8 + Math.floor(Math.random() * 2) // 8-9 AM
          const randomMinute = Math.floor(Math.random() * 60)
          const checkIn = `${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}:00`

          const checkOutHour = 17 + Math.floor(Math.random() * 2) // 5-6 PM
          const checkOutMinute = Math.floor(Math.random() * 60)
          const checkOut = `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}:00`

          attendanceRecords.push({
            employee_id: employee.id,
            date: dateStr,
            check_in: checkIn,
            check_out: checkOut,
            status: randomHour >= 9 ? 'late' as const : 'present' as const
          })
        }
      }

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .insert(attendanceRecords)
        .select()

      if (attendanceError) {
        console.error('Error seeding attendance:', attendanceError)
      } else {
        console.log(`✅ Seeded ${attendanceData?.length || 0} attendance records\n`)
      }

      // 5. Seed Salary Slips
      console.log('💰 Seeding salary slips...')

      const salarySlips = employeesData.slice(0, 10).map(emp => ({
        employee_id: emp.id,
        month: 'December',
        year: 2025,
        basic_salary: emp.salary,
        allowances: Math.floor(emp.salary * 0.25),
        deductions: Math.floor(emp.salary * 0.15),
        net_salary: emp.salary + Math.floor(emp.salary * 0.25) - Math.floor(emp.salary * 0.15)
      }))

      const { data: salaryData, error: salaryError } = await supabase
        .from('salary_slips')
        .insert(salarySlips)
        .select()

      if (salaryError) {
        console.error('Error seeding salary slips:', salaryError)
      } else {
        console.log(`✅ Seeded ${salaryData?.length || 0} salary slips\n`)
      }
    }

    console.log('\n✅ Database seeding completed successfully!')
    console.log('\nSeeded data summary:')
    console.log(`- ${departmentsData?.length || 0} departments`)
    console.log(`- ${employeesData?.length || 0} employees`)
    console.log('- Leave requests, attendance records, and salary slips\n')

  } catch (error) {
    console.error('❌ Error during database seeding:', error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('🎉 Seeding process finished!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

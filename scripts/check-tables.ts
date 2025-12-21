import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('🔍 Checking Existing Tables...\n')

  const tablesToCheck = [
    'employees',
    'departments',
    'leave_requests',
    'attendance',
    'salary_slips',
    'positions',
    'faculties',
    'academic_ranks',
    'employment_types',
    'payroll',
    'tax_tables',
    'superannuation_schemes',
    'leave_types',
    'leave_allocations',
    'job_openings',
    'applicants',
    'appraisals'
  ]

  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (!error) {
        console.log(`✅ ${table}: EXISTS (${count || 0} rows)`)
        
        // Get a sample row to see structure
        const { data: sample } = await supabase
          .from(table)
          .select('*')
          .limit(1)
          .single()
        
        if (sample) {
          console.log('   Columns:', Object.keys(sample).join(', '))
        }
      } else {
        console.log(`❌ ${table}: DOES NOT EXIST`)
      }
    } catch (err) {
      console.log(`❌ ${table}: ERROR - ${err}`)
    }
  }
}

checkTables()
  .then(() => console.log('\n✅ Table check complete'))
  .catch(err => console.error('❌ Error:', err))

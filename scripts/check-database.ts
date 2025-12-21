import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('🔍 Checking Supabase database status...\n')

  try {
    // Test connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('employees')
      .select('count')
      .limit(1)

    if (connectionError) {
      if (connectionError.message.includes('relation') || connectionError.message.includes('does not exist')) {
        console.log('❌ Database tables not found!')
        console.log('📋 You need to run migrations first.\n')
        console.log('Follow these steps:')
        console.log('1. Go to https://supabase.com/dashboard')
        console.log('2. Open your project: qltnmteqivrnljemyvvb')
        console.log('3. Click "SQL Editor" in the sidebar')
        console.log('4. Click "New query"')
        console.log('5. Copy the content from: .same/complete_migration.sql')
        console.log('6. Paste and click "Run"\n')
        return false
      }
      throw connectionError
    }

    // Check employee count
    const { count: employeeCount, error: countError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })

    if (countError) throw countError

    console.log('✅ Database connection successful!')
    console.log(`👥 Employees in database: ${employeeCount || 0}`)

    // Check other tables
    const tables = ['departments', 'leave_requests', 'attendance', 'salary_slips']

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (!error) {
        console.log(`✅ ${table}: ${count || 0} records`)
      }
    }

    if (employeeCount === 0) {
      console.log('\n📝 Database is empty. Run seed script:')
      console.log('   bun run seed')
    } else {
      console.log('\n🎉 Database is ready!')
    }

    return true

  } catch (error) {
    console.error('❌ Error checking database:', error)
    return false
  }
}

checkDatabase()

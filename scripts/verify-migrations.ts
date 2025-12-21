import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyMigrations() {
  console.log('🔍 Verifying Database Migrations...\n')
  console.log('Database:', supabaseUrl)
  console.log('='.repeat(70))

  const expectedTables = [
    // Foundation tables
    'faculties',
    'academic_ranks',
    'employment_types',
    'positions',

    // Payroll tables
    'salary_structures',
    'salary_components',
    'salary_structure_components',
    'employee_salary_details',
    'employee_salary_components',
    'pay_periods',
    'pay_runs',
    'payslip_details',
    'payslip_line_items',
    'bank_export_files',
    'additional_earnings',
    'additional_deductions',
    'payroll_audit_log',

    // Tax tables
    'png_tax_brackets',
    'png_tax_exemptions',
    'tax_calculation_history',
    'tax_configuration',
    'employee_tax_declarations',
    'annual_tax_summaries',

    // Super tables
    'super_schemes',
    'employee_super_memberships',
    'super_contributions',
    'super_payment_batches',
    'super_batch_line_items',
    'super_configuration'
  ]

  let successCount = 0
  let totalTables = expectedTables.length

  console.log('\n📋 Checking for new tables:\n')

  for (const table of expectedTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (!error) {
        console.log(`   ✅ ${table.padEnd(35)} - EXISTS (${count || 0} rows)`)
        successCount++
      } else {
        console.log(`   ❌ ${table.padEnd(35)} - MISSING`)
      }
    } catch (err) {
      console.log(`   ❌ ${table.padEnd(35)} - ERROR`)
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log(`\n📊 Verification Summary:`)
  console.log(`   ✅ Tables Found: ${successCount}/${totalTables}`)
  console.log(`   ❌ Tables Missing: ${totalTables - successCount}/${totalTables}`)
  console.log(`   📈 Completion: ${Math.round((successCount/totalTables)*100)}%`)

  if (successCount === totalTables) {
    console.log('\n🎉 All migrations verified successfully!')
    console.log('\nYour database now has:')
    console.log('   • Complete payroll system')
    console.log('   • PNG tax calculation engine')
    console.log('   • Superannuation management')
    console.log('\nNext: Run seed data script to populate master data')
  } else if (successCount > 0) {
    console.log('\n⚠️  Some tables are missing. Migrations may be partially applied.')
    console.log('\nTo fix:')
    console.log('   1. Check Supabase SQL Editor for errors')
    console.log('   2. Re-run failed migrations')
    console.log('   3. Check migration files for syntax errors')
  } else {
    console.log('\n❌ No new tables found. Migrations not applied.')
    console.log('\nPlease apply migrations using the Supabase SQL Editor:')
    console.log('   https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb/sql')
  }

  // Check for specific data
  if (successCount > 0) {
    console.log('\n📦 Checking seeded data:\n')

    // Check tax brackets
    const { data: taxBrackets } = await supabase
      .from('png_tax_brackets')
      .select('*')
      .eq('tax_year', 2025)

    if (taxBrackets && taxBrackets.length > 0) {
      console.log(`   ✅ PNG Tax Brackets 2025: ${taxBrackets.length} brackets`)
    }

    // Check super schemes
    const { data: superSchemes } = await supabase
      .from('super_schemes')
      .select('*')

    if (superSchemes && superSchemes.length > 0) {
      console.log(`   ✅ Superannuation Schemes: ${superSchemes.length} schemes`)
      superSchemes.forEach(scheme => {
        console.log(`      - ${scheme.name} (${scheme.employer_rate}% employer)`)
      })
    }
  }

  console.log('\n')
}

verifyMigrations()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })

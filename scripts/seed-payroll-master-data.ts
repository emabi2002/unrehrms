import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedPayrollMasterData() {
  console.log('🌱 Seeding Payroll Master Data...\n')

  try {
    // =====================================================
    // 1. SEED PNG TAX BRACKETS (2025)
    // =====================================================
    console.log('📊 Seeding PNG Tax Brackets (2025)...')

    const taxBrackets = [
      { tax_year: 2025, bracket_number: 1, min_income: 0.00, max_income: 12500.00, tax_rate: 0.00, base_tax: 0.00 },
      { tax_year: 2025, bracket_number: 2, min_income: 12500.01, max_income: 20000.00, tax_rate: 22.00, base_tax: 0.00 },
      { tax_year: 2025, bracket_number: 3, min_income: 20000.01, max_income: 33000.00, tax_rate: 30.00, base_tax: 1650.00 },
      { tax_year: 2025, bracket_number: 4, min_income: 33000.01, max_income: 70000.00, tax_rate: 35.00, base_tax: 5550.00 },
      { tax_year: 2025, bracket_number: 5, min_income: 70000.01, max_income: 250000.00, tax_rate: 40.00, base_tax: 18500.00 },
      { tax_year: 2025, bracket_number: 6, min_income: 250000.01, max_income: null, tax_rate: 42.00, base_tax: 90500.00 },
    ]

    for (const bracket of taxBrackets) {
      const { error } = await supabase
        .from('png_tax_brackets')
        .upsert(bracket, { onConflict: 'tax_year,bracket_number' })

      if (error) {
        console.error(`   ❌ Error seeding bracket ${bracket.bracket_number}:`, error.message)
      }
    }

    console.log('   ✅ Seeded 6 PNG tax brackets for 2025')

    // =====================================================
    // 2. SEED PNG TAX EXEMPTIONS
    // =====================================================
    console.log('\n📋 Seeding PNG Tax Exemptions...')

    const taxExemptions = [
      { tax_year: 2025, exemption_type: 'personal_rebate', description: 'Personal tax rebate', amount: 0.00 },
      { tax_year: 2025, exemption_type: 'dependent_rebate', description: 'Dependent allowance rebate', amount: 0.00 },
    ]

    const { error: exemptionError } = await supabase
      .from('png_tax_exemptions')
      .upsert(taxExemptions, { onConflict: 'id' })

    if (!exemptionError) {
      console.log('   ✅ Seeded 2 tax exemption types')
    }

    // =====================================================
    // 3. SEED TAX CONFIGURATION
    // =====================================================
    console.log('\n⚙️ Seeding Tax Configuration...')

    const taxConfig = [
      { config_key: 'current_tax_year', config_value: '2025', description: 'Current tax year', data_type: 'number' },
      { config_key: 'tax_calculation_method', config_value: 'graduated', description: 'Tax calculation method', data_type: 'text' },
      { config_key: 'apply_personal_rebate', config_value: 'false', description: 'Apply personal rebate', data_type: 'boolean' },
      { config_key: 'tax_rounding_method', config_value: 'nearest', description: 'Tax rounding method', data_type: 'text' },
      { config_key: 'minimum_taxable_income', config_value: '12500.00', description: 'Minimum annual income before tax applies', data_type: 'number' },
    ]

    const { error: configError } = await supabase
      .from('tax_configuration')
      .upsert(taxConfig, { onConflict: 'config_key' })

    if (!configError) {
      console.log('   ✅ Seeded 5 tax configuration settings')
    }

    // =====================================================
    // 4. SEED SUPERANNUATION SCHEMES
    // =====================================================
    console.log('\n💰 Seeding Superannuation Schemes...')

    const superSchemes = [
      {
        code: 'NAMBAWAN',
        name: 'Nambawan Super',
        description: 'Nambawan Super Limited - PNG largest superannuation fund',
        employer_rate: 8.4,
        min_employee_rate: 0.0,
        max_employee_rate: 100.0,
        contact_email: 'info@nambawansuper.com.pg',
        contact_phone: '+675 321 3399',
        bank_name: 'Bank South Pacific',
        bank_account_number: 'NAMBAWAN-MAIN',
        is_active: true
      },
      {
        code: 'NASFUND',
        name: 'NASFUND',
        description: 'National Superannuation Fund - PNG second largest fund',
        employer_rate: 8.4,
        min_employee_rate: 0.0,
        max_employee_rate: 100.0,
        contact_email: 'info@nasfund.com.pg',
        contact_phone: '+675 309 3900',
        bank_name: 'Bank South Pacific',
        bank_account_number: 'NASFUND-MAIN',
        is_active: true
      }
    ]

    const { error: superError } = await supabase
      .from('super_schemes')
      .upsert(superSchemes, { onConflict: 'code' })

    if (!superError) {
      console.log('   ✅ Seeded 2 superannuation schemes (Nambawan & NASFUND)')
    } else {
      console.error('   ❌ Error seeding super schemes:', superError.message)
    }

    // =====================================================
    // 5. SEED SUPER CONFIGURATION
    // =====================================================
    console.log('\n⚙️ Seeding Super Configuration...')

    const superConfig = [
      { config_key: 'statutory_employer_rate', config_value: '8.4', description: 'PNG statutory employer contribution rate', data_type: 'number' },
      { config_key: 'allow_employee_contributions', config_value: 'true', description: 'Allow employee voluntary contributions', data_type: 'boolean' },
      { config_key: 'allow_salary_sacrifice', config_value: 'true', description: 'Allow salary sacrifice to super', data_type: 'boolean' },
      { config_key: 'default_scheme_code', config_value: 'NAMBAWAN', description: 'Default super scheme for new employees', data_type: 'text' },
    ]

    const { error: superConfigError } = await supabase
      .from('super_configuration')
      .upsert(superConfig, { onConflict: 'config_key' })

    if (!superConfigError) {
      console.log('   ✅ Seeded 4 super configuration settings')
    }

    // =====================================================
    // 6. SEED SALARY COMPONENTS
    // =====================================================
    console.log('\n💵 Seeding Salary Components...')

    const salaryComponents = [
      // EARNINGS
      { code: 'BASIC', name: 'Basic Salary', type: 'earning', description: 'Base salary/wages', formula: null, is_taxable: true, affects_super: true, is_system: true, is_active: true },
      { code: 'HOUSING', name: 'Housing Allowance', type: 'earning', description: 'Housing allowance', formula: null, is_taxable: true, affects_super: true, is_system: false, is_active: true },
      { code: 'TRANSPORT', name: 'Transport Allowance', type: 'earning', description: 'Transport/travel allowance', formula: null, is_taxable: true, affects_super: true, is_system: false, is_active: true },
      { code: 'ACADEMIC', name: 'Academic Load Allowance', type: 'earning', description: 'Additional payment for extra teaching load', formula: null, is_taxable: true, affects_super: true, is_system: false, is_active: true },
      { code: 'RESEARCH', name: 'Research Allowance', type: 'earning', description: 'Research project allowance', formula: null, is_taxable: true, affects_super: true, is_system: false, is_active: true },
      { code: 'ACTING', name: 'Acting Allowance', type: 'earning', description: 'Acting in higher position', formula: null, is_taxable: true, affects_super: true, is_system: false, is_active: true },
      { code: 'OVERTIME', name: 'Overtime Pay', type: 'earning', description: 'Overtime hours payment', formula: null, is_taxable: true, affects_super: false, is_system: false, is_active: true },

      // DEDUCTIONS
      { code: 'TAX', name: 'Income Tax (PAYE)', type: 'deduction', description: 'PNG salary & wages tax', formula: 'calculate_png_tax', is_taxable: false, affects_super: false, is_system: true, is_active: true },
      { code: 'SUPER_EMP', name: 'Superannuation (Employer)', type: 'deduction', description: 'Employer super contribution (8.4%)', formula: 'calculate_employer_super', is_taxable: false, affects_super: false, is_system: true, is_active: true },
      { code: 'SUPER_EE', name: 'Superannuation (Employee)', type: 'deduction', description: 'Employee voluntary super contribution', formula: null, is_taxable: false, affects_super: false, is_system: false, is_active: true },
      { code: 'SALARY_SACRIFICE', name: 'Salary Sacrifice', type: 'deduction', description: 'Pre-tax super contribution', formula: null, is_taxable: false, affects_super: false, is_system: false, is_active: true },
      { code: 'LOAN', name: 'Loan Repayment', type: 'deduction', description: 'Staff loan repayment', formula: null, is_taxable: false, affects_super: false, is_system: false, is_active: true },
      { code: 'ADVANCE', name: 'Salary Advance', type: 'deduction', description: 'Salary advance repayment', formula: null, is_taxable: false, affects_super: false, is_system: false, is_active: true },
      { code: 'GARNISHMENT', name: 'Garnishment', type: 'deduction', description: 'Court-ordered deduction', formula: null, is_taxable: false, affects_super: false, is_system: false, is_active: true },
    ]

    let componentCount = 0
    for (const component of salaryComponents) {
      const { error } = await supabase
        .from('salary_components')
        .upsert(component, { onConflict: 'code' })

      if (!error) componentCount++
    }

    console.log(`   ✅ Seeded ${componentCount} salary components (earnings & deductions)`)

    // =====================================================
    // VERIFICATION
    // =====================================================
    console.log('\n' + '='.repeat(60))
    console.log('🔍 Verifying Seed Data...\n')

    const { count: taxCount } = await supabase.from('png_tax_brackets').select('*', { count: 'exact', head: true }).eq('tax_year', 2025)
    const { count: superCount } = await supabase.from('super_schemes').select('*', { count: 'exact', head: true }).eq('is_active', true)
    const { count: componentCount2 } = await supabase.from('salary_components').select('*', { count: 'exact', head: true })

    console.log(`   ✅ PNG Tax Brackets: ${taxCount} (expected 6)`)
    console.log(`   ✅ Super Schemes: ${superCount} (expected 2)`)
    console.log(`   ✅ Salary Components: ${componentCount2} (expected 14)`)

    if (taxCount === 6 && superCount === 2 && componentCount2 === 14) {
      console.log('\n🎉 All payroll master data seeded successfully!')
      console.log('\nYou can now:')
      console.log('   1. Create salary structures')
      console.log('   2. Assign employee salaries')
      console.log('   3. Process payroll runs')
      console.log('   4. Generate payslips with PNG tax & super')
    } else {
      console.log('\n⚠️  Some data may be missing. Check errors above.')
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    throw error
  }
}

console.log('🚀 PNG UNRE HRMS - Payroll Master Data Seeding')
console.log('='.repeat(60))
console.log('')

seedPayrollMasterData()
  .then(() => {
    console.log('\n✅ Seeding completed successfully!')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Seeding failed:', err)
    process.exit(1)
  })

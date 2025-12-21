import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkSeedData() {
  console.log('🔍 Checking Seed Data...\n')
  
  // Check PNG Tax Brackets
  const { data: taxBrackets } = await supabase
    .from('png_tax_brackets')
    .select('*')
    .eq('tax_year', 2025)
    .order('bracket_number')
  
  console.log('📊 PNG Tax Brackets (2025):')
  if (taxBrackets && taxBrackets.length > 0) {
    console.log(`   ✅ Found ${taxBrackets.length} tax brackets`)
    taxBrackets.forEach(b => {
      const max = b.max_income ? `K${b.max_income.toLocaleString()}` : 'and above'
      console.log(`   ${b.bracket_number}. K${b.min_income.toLocaleString()} - ${max} @ ${b.tax_rate}%`)
    })
  } else {
    console.log('   ❌ No tax brackets found - need to seed!')
  }
  
  console.log('\n💰 Superannuation Schemes:')
  const { data: superSchemes } = await supabase
    .from('super_schemes')
    .select('*')
    .eq('is_active', true)
  
  if (superSchemes && superSchemes.length > 0) {
    console.log(`   ✅ Found ${superSchemes.length} schemes`)
    superSchemes.forEach(s => {
      console.log(`   - ${s.name} (${s.employer_rate}% employer)`)
    })
  } else {
    console.log('   ❌ No super schemes found - need to seed!')
  }
  
  console.log('\n🎓 Foundation Data:')
  const { count: facCount } = await supabase.from('faculties').select('*', { count: 'exact', head: true })
  const { count: rankCount } = await supabase.from('academic_ranks').select('*', { count: 'exact', head: true })
  const { count: empTypeCount } = await supabase.from('employment_types').select('*', { count: 'exact', head: true })
  const { count: posCount } = await supabase.from('positions').select('*', { count: 'exact', head: true })
  
  console.log(`   ✅ Faculties: ${facCount}`)
  console.log(`   ✅ Academic Ranks: ${rankCount}`)
  console.log(`   ✅ Employment Types: ${empTypeCount}`)
  console.log(`   ✅ Positions: ${posCount}`)
  
  // Summary
  console.log('\n' + '='.repeat(60))
  const needsSeeding = (!taxBrackets?.length || !superSchemes?.length)
  if (needsSeeding) {
    console.log('⚠️  NEED TO SEED: PNG Tax Brackets and Super Schemes')
    console.log('\nRe-run migrations 003 and 004 in Supabase SQL Editor')
  } else {
    console.log('✅ All seed data loaded successfully!')
  }
}

checkSeedData().then(() => process.exit(0)).catch(console.error)

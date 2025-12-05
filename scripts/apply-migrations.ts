import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration(migrationFile: string, migrationName: string) {
  console.log(`\n📝 Applying ${migrationName}...`)
  
  try {
    const sqlContent = readFileSync(migrationFile, 'utf-8')
    
    // Split by semicolons but keep comments
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'))
    
    console.log(`   Found ${statements.length} SQL statements`)
    
    // Execute the full migration as one query
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: sqlContent 
    }).single()
    
    if (error) {
      // Try executing directly via Supabase client
      console.log('   Trying alternative execution method...')
      
      // For Supabase, we need to use the REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ query: sqlContent })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }
    }
    
    console.log(`   ✅ ${migrationName} applied successfully!`)
    return true
    
  } catch (error) {
    console.error(`   ❌ Error applying ${migrationName}:`, error)
    return false
  }
}

async function runMigrations() {
  console.log('🚀 Starting Database Migrations...\n')
  console.log('Database:', supabaseUrl)
  console.log('=' .repeat(60))
  
  const migrations = [
    {
      file: 'supabase/migrations/002_payroll_system.sql',
      name: 'Migration 002: Payroll System'
    },
    {
      file: 'supabase/migrations/003_png_tax_tables.sql',
      name: 'Migration 003: PNG Tax Tables'
    },
    {
      file: 'supabase/migrations/004_super_schemes.sql',
      name: 'Migration 004: Superannuation Schemes'
    }
  ]
  
  let successCount = 0
  
  for (const migration of migrations) {
    const success = await applyMigration(migration.file, migration.name)
    if (success) successCount++
  }
  
  console.log('\n' + '='.repeat(60))
  console.log(`\n📊 Migration Summary:`)
  console.log(`   ✅ Successful: ${successCount}/${migrations.length}`)
  console.log(`   ❌ Failed: ${migrations.length - successCount}/${migrations.length}`)
  
  if (successCount === migrations.length) {
    console.log('\n🎉 All migrations applied successfully!')
    console.log('\nNext steps:')
    console.log('  1. Verify tables were created')
    console.log('  2. Seed master data')
    console.log('  3. Build payroll UI')
  } else {
    console.log('\n⚠️  Some migrations failed. Check errors above.')
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })

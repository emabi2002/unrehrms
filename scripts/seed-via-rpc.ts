import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedViaRPC() {
  console.log('🌱 Seeding master data via RPC...\n')
  
  try {
    // Read the seed SQL file
    const seedSQL = readFileSync(join(process.cwd(), 'supabase', 'seed-data.sql'), 'utf-8')
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: seedSQL })
    
    if (error) {
      console.error('Error:', error.message)
      console.log('\n❌ RPC method not available.')
      console.log('📝 Please run seed-data.sql manually in Supabase SQL Editor')
      console.log('   See: SEED_MASTER_DATA.md for instructions')
    } else {
      console.log('✅ Seed data applied successfully!')
      console.log('Data:', data)
    }
  } catch (err: any) {
    console.log('\n📝 Manual seeding required.')
    console.log('Run this file in Supabase SQL Editor:')
    console.log('   supabase/seed-data.sql')
    console.log('\nSee SEED_MASTER_DATA.md for step-by-step instructions')
  }
}

seedViaRPC()

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectSchema() {
  console.log('🔍 Inspecting Supabase Database Schema...\n')

  // Query to get all tables in the public schema
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name')

  if (tablesError) {
    console.error('Error fetching tables:', tablesError)
    return
  }

  console.log('📊 Existing Tables:\n')
  
  for (const table of tables || []) {
    const tableName = table.table_name
    console.log(`\n--- ${tableName} ---`)

    // Get columns for this table
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position')

    if (columns) {
      columns.forEach((col: any) => {
        console.log(`  - ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`)
      })
    }

    // Get row count
    const { count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    console.log(`  [${count || 0} rows]`)
  }
}

inspectSchema()
  .then(() => console.log('\n✅ Schema inspection complete'))
  .catch(err => console.error('❌ Error:', err))

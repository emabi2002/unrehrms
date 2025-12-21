import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qltnmteqivrnljemyvvb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdG5tdGVxaXZybmxqZW15dnZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkwNDQ1NywiZXhwIjoyMDgwNDgwNDU3fQ.FI1LarRU9BWcL4SjOY1m3cSTGTyJXQN2hBH4yRD2cIs'
);

async function checkSchema() {
  console.log('🔍 Checking current Supabase database schema...\n');
  
  // Get all tables
  const { data: tables, error } = await supabase.rpc('get_schema_info', {});
  
  if (error) {
    // Try alternative method
    const { data, error: err2 } = await supabase
      .from('employees')
      .select('*')
      .limit(1);
    
    if (!err2) {
      console.log('✅ employees table exists');
    }
    
    // Check for other known tables
    const tablesToCheck = [
      'employees', 'departments', 'leave_requests', 'attendance', 
      'salary_slips', 'emergency_contacts', 'employee_documents'
    ];
    
    for (const table of tablesToCheck) {
      const { error: checkErr } = await supabase.from(table).select('*').limit(0);
      if (!checkErr) {
        console.log(`✅ ${table} table exists`);
      } else {
        console.log(`❌ ${table} table does NOT exist`);
      }
    }
  }
  
  // Check employees table structure
  const { data: empData } = await supabase
    .from('employees')
    .select('*')
    .limit(1);
  
  if (empData && empData.length > 0) {
    console.log('\n📊 Employee table columns:', Object.keys(empData[0]));
  }
}

checkSchema().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

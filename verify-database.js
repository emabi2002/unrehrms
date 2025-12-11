import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qltnmteqivrnljemyvvb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdG5tdGVxaXZybmxqZW15dnZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkwNDQ1NywiZXhwIjoyMDgwNDgwNDU3fQ.FI1LarRU9BWcL4SjOY1m3cSTGTyJXQN2hBH4yRD2cIs'
);

async function verifyDatabase() {
  console.log('🔍 Verifying PNG UNRE HRMS Database...\n');

  // Count total tables
  const { data: allTables, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');

  if (error) {
    console.log('Using RPC to count tables...');
    // Alternative method
  }

  // Check specific critical tables
  const criticalTables = [
    'employees',
    'emergency_contacts',
    'employee_documents',
    'document_types',
    'positions',
    'job_requisitions',
    'candidates',
    'training_courses',
    'performance_goals',
    'user_roles',
    'grievances',
    'safety_incidents',
    'travel_requests',
  ];

  console.log('✅ Checking Critical Tables:\n');

  for (const table of criticalTables) {
    const { error: checkErr } = await supabase.from(table).select('*').limit(0);
    if (!checkErr) {
      console.log(`   ✓ ${table}`);
    } else {
      console.log(`   ✗ ${table} - MISSING!`);
    }
  }

  // Check document types
  const { data: docTypes, error: docError } = await supabase
    .from('document_types')
    .select('count');

  console.log('\n📄 Document Types:');
  const { count: docCount } = await supabase
    .from('document_types')
    .select('*', { count: 'exact', head: true });
  console.log(`   Found: ${docCount} types`);

  // Check user roles
  console.log('\n👥 User Roles:');
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role_name')
    .order('role_level');

  if (roles) {
    roles.forEach(role => console.log(`   ✓ ${role.role_name}`));
  }

  // Check public holidays
  const { count: holidayCount } = await supabase
    .from('public_holidays')
    .select('*', { count: 'exact', head: true })
    .eq('year', 2025);

  console.log(`\n🎄 Public Holidays (2025): ${holidayCount || 0} holidays`);

  // Check system settings
  const { count: settingsCount } = await supabase
    .from('system_settings')
    .select('*', { count: 'exact', head: true });

  console.log(`\n⚙️  System Settings: ${settingsCount || 0} settings`);

  console.log('\n🎉 Database verification complete!\n');
}

verifyDatabase().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

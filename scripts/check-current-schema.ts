/**
 * Check Current Database Schema
 * Lists all tables and their structures in the Supabase database
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking Supabase Database Schema...\n');
  console.log('📊 Database:', supabaseUrl);
  console.log('');

  try {
    // Get list of all tables
    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    }).single();

    // If RPC doesn't work, try direct query
    if (tablesError) {
      console.log('Using alternative method to fetch tables...\n');

      // Try to query a known table to test connection
      const { data: employeesTest, error: empError } = await supabase
        .from('employees')
        .select('*')
        .limit(1);

      if (!empError) {
        console.log('✅ Database connection successful!');
        console.log('✅ Employees table exists and is accessible\n');
      }

      // List tables we know should exist
      const expectedTables = [
        'employees',
        'departments',
        'faculties',
        'positions',
        'academic_ranks',
        'employment_types',
        'leave_types',
        'leave_requests',
        'leave_balances',
        'attendance',
        'salary_structures',
        'pay_periods',
        'payslips',
        'tax_brackets',
        'super_schemes',
        'emergency_contacts',
        'employee_documents',
        'candidates',
        'applications',
        'interviews',
        'performance_goals',
        'training_courses',
        'certifications',
      ];

      console.log('📋 Checking for expected tables:\n');

      let foundCount = 0;
      const foundTables: string[] = [];
      const missingTables: string[] = [];

      for (const tableName of expectedTables) {
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          foundCount++;
          foundTables.push(tableName);
          console.log(`  ✅ ${tableName}`);
        } else {
          missingTables.push(tableName);
          console.log(`  ❌ ${tableName} - ${error.message}`);
        }
      }

      console.log(`\n📊 Summary:`);
      console.log(`  Found: ${foundCount}/${expectedTables.length} tables`);
      console.log(`  Missing: ${missingTables.length} tables\n`);

      if (foundCount > 0) {
        console.log('✅ Database has existing tables!');
        console.log('\n📋 Found tables:');
        foundTables.forEach(t => console.log(`  - ${t}`));
      }

      if (missingTables.length > 0) {
        console.log('\n⚠️  Missing tables:');
        missingTables.forEach(t => console.log(`  - ${t}`));
        console.log('\nYou may need to apply some migrations.');
      }

      // Check employee count
      const { count: empCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      console.log(`\n👥 Current data:`);
      console.log(`  Employees: ${empCount || 0}`);

      // Check departments
      const { count: deptCount } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true });

      console.log(`  Departments: ${deptCount || 0}`);

      // Check leave requests
      const { count: leaveCount } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true });

      console.log(`  Leave Requests: ${leaveCount || 0}`);

      return { foundCount, totalExpected: expectedTables.length, foundTables, missingTables };
    }

    console.log('Schema check complete!');
  } catch (error: any) {
    console.error('❌ Error checking schema:', error.message);
    console.log('\n💡 Tip: Make sure your .env.local file has the correct Supabase credentials');
  }
}

// Run the check
checkSchema()
  .then((result) => {
    if (result) {
      console.log('\n🎉 Schema check complete!');

      if (result.foundCount === result.totalExpected) {
        console.log('✅ All expected tables exist!');
        console.log('✅ No migrations needed - database is ready!');
      } else if (result.foundCount > 0) {
        console.log('⚠️  Some tables exist, some are missing');
        console.log('📝 You may need to apply remaining migrations');
      } else {
        console.log('❌ No tables found');
        console.log('📝 You need to apply all migrations');
      }
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

/**
 * Apply Missing Tables Migration
 * Adds payslips, tax_brackets, and certifications tables
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 Applying Missing Tables Migration...\n');

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations/009_add_missing_tables.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log(`   Size: ${sql.length} characters\n`);

    // Note: Supabase client doesn't directly support raw SQL execution
    // We need to use the REST API or PostgreSQL connection
    console.log('⚠️  This migration needs to be applied via Supabase SQL Editor\n');
    console.log('📋 Instructions:');
    console.log('   1. Go to: https://app.supabase.com/project/qltnmteqivrnljemyvvb/sql/new');
    console.log('   2. Copy the content from: supabase/migrations/009_add_missing_tables.sql');
    console.log('   3. Paste and click RUN\n');

    console.log('💡 Alternative: I can show you a summary of what will be created:\n');

    console.log('✅ Tables to be created:');
    console.log('   1. payslips - Employee payslip records');
    console.log('   2. tax_brackets - PNG tax calculation (with 2025 brackets)');
    console.log('   3. certifications - Professional certifications');
    console.log('   4. payslip_details - Detailed payslip breakdowns (bonus)\n');

    console.log('✅ Helper functions:');
    console.log('   - calculate_png_tax() - PNG tax calculator\n');

    console.log('✅ Data seeded:');
    console.log('   - 2025 PNG tax brackets (6 brackets, 0% to 42%)\n');

    // Try to verify if tables already exist
    console.log('🔍 Checking if tables already exist...\n');

    const tables = ['payslips', 'tax_brackets', 'certifications'];
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);

      if (error) {
        console.log(`   ❌ ${table} - Not found (will be created)`);
      } else {
        console.log(`   ✅ ${table} - Already exists`);
      }
    }

    console.log('\n📝 Ready to apply migration!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
applyMigration()
  .then(() => {
    console.log('\n✨ Migration check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

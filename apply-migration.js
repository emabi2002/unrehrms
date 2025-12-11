import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  'https://qltnmteqivrnljemyvvb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdG5tdGVxaXZybmxqZW15dnZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkwNDQ1NywiZXhwIjoyMDgwNDgwNDU3fQ.FI1LarRU9BWcL4SjOY1m3cSTGTyJXQN2hBH4yRD2cIs'
);

async function applyMigration() {
  console.log('🚀 Applying Phase 1 Migration...\n');
  
  try {
    const migrationSQL = readFileSync('./supabase/migrations/005_emergency_contacts_and_documents.sql', 'utf8');
    
    console.log('📝 Migration SQL loaded, executing...\n');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.log('\n⚠️  Will apply migration in chunks...');
      return false;
    }
    
    console.log('✅ Migration applied successfully!');
    return true;
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

applyMigration().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

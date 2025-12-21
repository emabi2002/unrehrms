import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkColumns() {
  console.log('🔍 Checking table structures...\n');
  
  // Check employees table
  const { data: emp, error: empErr } = await supabase
    .from('employees')
    .select('*')
    .limit(1);
  
  if (emp && emp[0]) {
    console.log('✅ Employees table columns:', Object.keys(emp[0]));
  }
  
  // Check pay_periods table
  const { data: pp, error: ppErr } = await supabase
    .from('pay_periods')
    .select('*')
    .limit(1);
  
  if (pp && pp[0]) {
    console.log('✅ Pay_periods table columns:', Object.keys(pp[0]));
  } else {
    console.log('⚠️  Pay_periods table is empty or has issues');
  }
}

checkColumns();

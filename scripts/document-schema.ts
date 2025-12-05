import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function documentSchema() {
  const tables = [
    'employees', 'departments', 'leave_requests', 'attendance', 'salary_slips',
    'positions', 'faculties', 'academic_ranks', 'employment_types', 'payroll',
    'tax_tables', 'superannuation_schemes', 'leave_types', 'leave_allocations',
    'job_openings', 'applicants', 'appraisals'
  ]

  let documentation = '# Current Supabase Database Schema\n\n'
  documentation += `Generated: ${new Date().toISOString()}\n\n`

  for (const table of tables) {
    try {
      const { data, count } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (data && data.length > 0) {
        documentation += `## ${table}\n\n`
        documentation += `**Row Count:** ${count || 0}\n\n`
        documentation += '**Columns:**\n\n'
        
        const sample = data[0]
        for (const [key, value] of Object.entries(sample)) {
          const type = typeof value
          const sqlType = value === null ? 'NULL' :
                         type === 'string' ? 'TEXT' :
                         type === 'number' ? (Number.isInteger(value as number) ? 'INTEGER' : 'NUMERIC') :
                         type === 'boolean' ? 'BOOLEAN' :
                         'UNKNOWN'
          documentation += `- \`${key}\`: ${sqlType}\n`
        }
        documentation += '\n'
      } else {
        // Table exists but no data
        documentation += `## ${table}\n\n**Row Count:** 0 (empty table)\n\n`
      }
    } catch (err) {
      documentation += `## ${table}\n\n**Status:** ERROR - ${err}\n\n`
    }
  }

  writeFileSync('supabase/current-schema.md', documentation)
  console.log('✅ Schema documentation created at supabase/current-schema.md')
}

documentSchema().catch(console.error)

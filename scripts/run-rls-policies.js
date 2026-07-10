#!/usr/bin/env node

/**
 * Script to apply RLS (Row Level Security) policies to Supabase
 * Usage: node scripts/run-rls-policies.js
 * Requires: DATABASE_URL in .env.local
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function runRLSPolicies() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      '❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  console.log('🔄 Applying RLS policies...\n');

  // Read the RLS policies SQL file
  const sqlPath = path.join(__dirname, 'rls-policies.sql');
  let sqlStatements;

  try {
    sqlStatements = fs.readFileSync(sqlPath, 'utf-8');
  } catch (error) {
    console.error(`❌ Could not read rls-policies.sql: ${error.message}`);
    process.exit(1);
  }

  // Split by semicolons and filter empty statements
  const statements = sqlStatements
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    try {
      const { data, error } = await supabase.rpc('exec', {
        statement: statement,
      });

      if (error) {
        // Try direct SQL execution as fallback
        console.log(`⚠️  RPC failed, attempting direct execution...`);
        // The RLS policies require direct database access through a management API
        // which isn't available through the client, so we'll log what needs to be done
        console.log(`📋 Execute in Supabase Dashboard SQL Editor:\n${statement}\n`);
        errorCount++;
        continue;
      }

      successCount++;
      console.log(`✅ Policy applied`);
    } catch (error) {
      console.log(`⚠️  Note: RLS policies need to be applied via Supabase Dashboard`);
      errorCount++;
    }
  }

  if (errorCount > 0) {
    console.log('\n⚠️  RLS policies require manual setup via Supabase Dashboard:');
    console.log('\n1. Go to Supabase Dashboard → Your Project → SQL Editor');
    console.log('2. Open scripts/rls-policies.sql');
    console.log('3. Copy all the SQL and paste into the SQL Editor');
    console.log('4. Click "Run"');
    console.log('\n✅ Then run: npx prisma db push');
  } else {
    console.log('\n✅ RLS policies applied successfully!');
  }
}

runRLSPolicies().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

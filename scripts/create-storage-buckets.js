#!/usr/bin/env node

/**
 * Script to create Supabase Storage buckets
 * Usage: node scripts/create-storage-buckets.js
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKETS = [
  { name: 'gallery', description: 'Church gallery images' },
  { name: 'sermons', description: 'Sermon videos and audio' },
  { name: 'pastors', description: 'Pastor profiles and images' },
  { name: 'documents', description: 'Church documents and PDFs' },
];

async function createStorageBuckets() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      '❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
    console.error('Make sure .env.local is created with these variables.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  console.log('🔄 Creating Supabase Storage buckets...\n');

  for (const bucket of BUCKETS) {
    try {
      // Check if bucket already exists
      const { data: existingBucket } = await supabase.storage.getBucket(bucket.name);

      if (existingBucket) {
        console.log(`✅ Bucket "${bucket.name}" already exists`);
        continue;
      }
    } catch (error) {
      // Bucket doesn't exist, we'll create it
    }

    try {
      // Create bucket
      const { data, error: createError } = await supabase.storage.createBucket(bucket.name, {
        public: true,
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'video/mp4',
          'video/webm',
          'audio/mpeg',
          'audio/wav',
          'application/pdf',
        ],
      });

      if (createError) {
        console.error(`❌ Failed to create bucket "${bucket.name}": ${createError.message}`);
        continue;
      }

      console.log(`✅ Created bucket: "${bucket.name}"`);

      // Update bucket with public policy
      const { error: updateError } = await supabase.storage.updateBucket(bucket.name, {
        public: true,
      });

      if (updateError) {
        console.error(`⚠️  Bucket created but failed to set public: ${updateError.message}`);
      } else {
        console.log(`   └─ Set to public access`);
      }
    } catch (error) {
      console.error(`❌ Error with bucket "${bucket.name}": ${error.message}`);
    }
  }

  console.log('\n✅ Storage bucket setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Run RLS policies: node scripts/run-rls-policies.js');
  console.log('2. Push Prisma schema: npx prisma db push');
  console.log('3. Test locally: npm run dev');
}

createStorageBuckets().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

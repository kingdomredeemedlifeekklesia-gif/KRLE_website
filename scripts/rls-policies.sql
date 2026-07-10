-- ================================================================
-- KRLE Website - Supabase RLS Policies Setup Script
-- ================================================================
-- Run this in Supabase SQL Editor to set up Row Level Security
-- 
-- Instructions:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create a new query
-- 3. Paste the relevant section below
-- 4. Click "Run"
--
-- Note: You may need to run sections one at a time or adjust for
-- your specific Supabase setup.
-- ================================================================

-- ================================================================
-- STORAGE BUCKET POLICIES
-- ================================================================

-- 1. Enable RLS on storage objects (if not already enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Public Read Access (Anonymous + Authenticated can view)
CREATE POLICY "Public read access - gallery"
ON storage.objects
FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Public read access - sermons"
ON storage.objects
FOR SELECT
USING (bucket_id = 'sermons');

CREATE POLICY "Public read access - pastors"
ON storage.objects
FOR SELECT
USING (bucket_id = 'pastors');

CREATE POLICY "Public read access - documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'documents');

-- 3. Authenticated Upload (Only authenticated users can upload)
CREATE POLICY "Authenticated upload - gallery"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'gallery'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated upload - sermons"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'sermons'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated upload - pastors"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'pastors'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated upload - documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
);

-- 4. Authenticated Delete (Only authenticated users can delete)
CREATE POLICY "Authenticated delete - gallery"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'gallery'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete - sermons"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'sermons'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete - pastors"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'pastors'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete - documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
);

-- ================================================================
-- DATABASE TABLE POLICIES
-- ================================================================

-- Enable RLS on all application tables
ALTER TABLE "ContactMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunityMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GalleryImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecurringSubscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Record" ENABLE ROW LEVEL SECURITY;

-- ContactMessage Policies (Public can view and create)
CREATE POLICY "Public read contact messages"
ON "ContactMessage"
FOR SELECT
USING (true);

CREATE POLICY "Public insert contact messages"
ON "ContactMessage"
FOR INSERT
WITH CHECK (true);

-- CommunityMember Policies (Public can view and join)
CREATE POLICY "Public read community members"
ON "CommunityMember"
FOR SELECT
USING (true);

CREATE POLICY "Public insert community members"
ON "CommunityMember"
FOR INSERT
WITH CHECK (true);

-- GalleryImage Policies (Public read, authenticated write)
CREATE POLICY "Public read gallery images"
ON "GalleryImage"
FOR SELECT
USING (true);

CREATE POLICY "Authenticated upload gallery images"
ON "GalleryImage"
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete gallery images"
ON "GalleryImage"
FOR DELETE
USING (auth.role() = 'authenticated');

-- PaymentTransaction Policies (Public read donations, own transactions)
CREATE POLICY "Public read payment transactions"
ON "PaymentTransaction"
FOR SELECT
USING (true);

CREATE POLICY "Public insert payment transactions"
ON "PaymentTransaction"
FOR INSERT
WITH CHECK (true);

-- RecurringSubscription Policies (Authenticated only)
CREATE POLICY "Authenticated read subscriptions"
ON "RecurringSubscription"
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated insert subscriptions"
ON "RecurringSubscription"
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Record Policies (Public read, authenticated write)
CREATE POLICY "Public read records"
ON "Record"
FOR SELECT
USING (true);

CREATE POLICY "Authenticated insert records"
ON "Record"
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- ================================================================
-- VERIFY RLS IS ENABLED
-- ================================================================

-- Check which tables have RLS enabled:
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ================================================================
-- NOTES
-- ================================================================
-- 
-- - Policies are evaluated in order; first matching policy applies
-- - UPDATE requires both SELECT and UPDATE policies
-- - To debug policy issues, check Supabase Dashboard → Logs
-- - Performance: Add indexes on columns used in policy conditions
--
-- Example index for performance:
-- CREATE INDEX idx_gallery_category ON "GalleryImage"(category);
--
-- ================================================================

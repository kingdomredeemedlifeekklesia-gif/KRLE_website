# Supabase Setup Guide for KRLE Website

## Overview

This guide covers setting up Supabase storage buckets, RLS policies, and Prisma database for the KRLE church website.

## Prerequisites

- Supabase account and project created at https://supabase.com
- Supabase CLI installed (or access token from user settings)
- Local `.env.local` file with credentials (from `scripts/create-env-local.*`)

## Part 1: Supabase Storage Buckets

### 1.1 Create Storage Buckets via Dashboard

1. Log in to **Supabase Dashboard** → Your Project
2. Go to **Storage** → **Buckets**
3. Create four buckets (click **New Bucket**):

   - **gallery** (for church photos, events)
   - **sermons** (for sermon audio/video)
   - **pastors** (for pastor profiles)
   - **documents** (for PDFs, forms, etc.)

4. For each bucket:
   - **Public Access**: Toggle **ON** (for public viewing)
   - **File Size Limit**: Set to `10MB`
   - Click **Create Bucket**

### 1.2 Make Buckets Public

By default, buckets are private. To make them public:

1. In **Storage** → Select each bucket
2. Click **Policies** tab
3. Click **New Policy** → **Get** (for SELECT)
4. Name: `"Public read access"`
5. Paste this policy:

```sql
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');
```

6. Repeat for each bucket (`gallery`, `sermons`, `pastors`, `documents`)

---

## Part 2: Row Level Security (RLS) Policies

### 2.1 Enable RLS on Storage Objects

1. In Supabase Dashboard → **Storage** → Select a bucket
2. Click **Policies** tab
3. If RLS is disabled, enable it first
4. Create these policies:

#### Policy 1: Public Read Access

```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('gallery', 'sermons', 'pastors', 'documents'));
```

#### Policy 2: Authenticated Users Can Upload

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('gallery', 'sermons', 'pastors', 'documents')
  AND auth.role() = 'authenticated'
);
```

#### Policy 3: Authenticated Users Can Delete Own Files

```sql
CREATE POLICY "Authenticated users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('gallery', 'sermons', 'pastors', 'documents')
  AND auth.role() = 'authenticated'
);
```

### 2.2 Enable RLS on Database Tables

For security, enable RLS on all Prisma tables:

```sql
-- Enable RLS on all tables
ALTER TABLE "ContactMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunityMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GalleryImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecurringSubscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Record" ENABLE ROW LEVEL SECURITY;

-- Allow public read access to non-sensitive tables
CREATE POLICY "Public read ContactMessage"
ON "ContactMessage" FOR SELECT
USING (true);

CREATE POLICY "Public insert ContactMessage"
ON "ContactMessage" FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public read GalleryImage"
ON "GalleryImage" FOR SELECT
USING (true);

-- Allow authenticated write access
CREATE POLICY "Authenticated write"
ON "GalleryImage" FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete"
ON "GalleryImage" FOR DELETE
USING (auth.role() = 'authenticated');
```

---

## Part 3: Database Setup with Prisma

### 3.1 Push Prisma Schema to Supabase

Once your `.env.local` is populated with `DATABASE_URL`:

```bash
npx prisma db push
```

This will:
- Create all tables from `prisma/schema.prisma`
- Create indexes
- Validate the schema

### 3.2 Verify Tables Created

In Supabase Dashboard → **SQL Editor**, run:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see:
- ContactMessage
- CommunityMember
- GalleryImage
- PaymentTransaction
- RecurringSubscription
- Record

---

## Part 4: Helper Functions

### 4.1 Upload Images

Use the helper in `src/lib/supabase-helpers.ts`:

```typescript
import { uploadImage } from '@/lib/supabase-helpers';

const { publicUrl, storagePath } = await uploadImage('gallery', file);
```

### 4.2 Delete Images

```typescript
import { deleteImage } from '@/lib/supabase-helpers';

await deleteImage('gallery', storagePath);
```

### 4.3 Get Public URL

```typescript
import { getPublicUrl } from '@/lib/supabase-helpers';

const url = getPublicUrl('gallery', 'image-path.jpg');
```

### 4.4 List Files

```typescript
import { listFiles } from '@/lib/supabase-helpers';

const files = await listFiles('gallery');
```

---

## Part 5: Environment Variables

Your `.env.local` should have:

```bash
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Other services
NEXT_PUBLIC_YOUTUBE_API_KEY=...
PAYSTACK_SECRET_KEY=...
```

---

## Part 6: Troubleshooting

### Issue: "No matching Supabase CLI binary found"

**Solution**: Install Supabase CLI manually from GitHub releases or use token-based auth:

```bash
npm install -g supabase
supabase login --token YOUR_TOKEN
```

### Issue: "Database connection failed"

**Solution**: Verify `DATABASE_URL` is correct in `.env.local`:
- Check Supabase Dashboard → Settings → Database → Connection String
- Ensure it includes `?sslmode=require`

### Issue: "Storage bucket not public"

**Solution**: Check bucket policies in Supabase Dashboard → Storage → Policies
- Ensure "Public read access" policy exists
- Verify RLS is enabled

### Issue: "Prisma client out of sync"

**Solution**: Regenerate Prisma client:

```bash
npx prisma generate
```

---

## Part 7: Testing Upload/Download

### Local Test (Admin Gallery)

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/admin/gallery

3. Upload an image:
   - Fill in Title, Category, Description
   - Select image file
   - Click "Upload Images"

4. Verify:
   - Image appears in gallery grid
   - File is stored in Supabase Storage
   - URL is public and accessible

### Test Download

1. In admin gallery, click **Download** on an image
2. File should download with correct name and format

### Test Deletion

1. Click **Delete** on an image
2. Confirm deletion
3. Image should be removed from gallery and storage

---

## Part 8: Deployment to Railway

### 8.1 Add Secrets to Railway

In Railway Dashboard → Your Project → Variables, add:

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_YOUTUBE_API_KEY=...
PAYSTACK_SECRET_KEY=...
```

### 8.2 Deploy

```bash
railway up
```

Or use GitHub Actions for automatic deployment.

---

## Part 9: Monitoring & Maintenance

### Monitor Storage Usage

Supabase Dashboard → **Storage** → View bucket sizes

### Check Logs

- API errors: Dashboard → **Logs** → **API Audits**
- Database queries: Dashboard → **Database** → **Query Performance**

### Backup Data

Supabase automatically backs up your database. To export:

Dashboard → **Database** → **Backups** → Download

---

## API Reference

See [API_REFERENCE.md](./API_REFERENCE.md) for complete API documentation.

## Security Checklist

- ✅ RLS enabled on all storage buckets
- ✅ RLS enabled on database tables
- ✅ Public buckets only for read operations
- ✅ Authenticated users can upload/delete
- ✅ Service role key stored in `.env.local` (never committed)
- ✅ Database credentials use SSL mode

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **GitHub Issues**: Create an issue in your repo

---

*Last Updated: 2024*

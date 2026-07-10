# Supabase Integration - Complete Implementation Guide

> **Status**: ✅ Ready to Deploy
> **Build**: ✅ Compiles successfully
> **Database**: ✅ Prisma configured
> **Storage**: ✅ All buckets configured in code

---

## What's Been Implemented

### ✅ Local Files (Already Created)

1. **`src/lib/supabase-storage.ts`** - Admin client for storage operations
2. **`src/lib/supabase-helpers.ts`** - High-level helpers (NEW)
   - `uploadImage(bucket, file, customPath?)`
   - `deleteImage(bucket, storagePath)`
   - `deleteImages(bucket, storagePaths[])`
   - `getPublicUrl(bucket, storagePath)`
   - `downloadImage(bucket, storagePath)`
   - `fileExists(bucket, storagePath)`
   - `listFiles(bucket, path?)`
   - `getBucketInfo(bucket)`

3. **`src/app/api/gallery/route.ts`** - Gallery upload/delete API
4. **`src/app/api/gallery/download/route.ts`** - Gallery download API
5. **`src/app/admin/gallery/page.tsx`** - Admin gallery UI
6. **`src/app/admin/site/page.tsx`** - UPDATED to use Supabase (NEW)

7. **`prisma/schema.prisma`** - Complete database schema
   - ContactMessage
   - CommunityMember
   - GalleryImage
   - PaymentTransaction
   - RecurringSubscription
   - Record

8. **`.env.example`** - Environment template with all required variables

### 📄 Documentation (NEW - Created for You)

1. **`SUPABASE_SETUP.md`** - Complete setup guide with all steps
2. **`SUPABASE_CHECKLIST.md`** - Phase-by-phase checklist
3. **`scripts/rls-policies.sql`** - RLS policies SQL script
4. **This file** - Integration overview

---

## Quick Start (You Are Here)

### Step 1: Use Your Access Token (Already Done ✅)
You have your Supabase access token. Next steps require Supabase Dashboard access.

### Step 2: Create Storage Buckets (5 minutes)

In **Supabase Dashboard** → **Storage** → **Buckets**:

```
1. Click "New Bucket"
2. Name: "gallery"
3. Toggle "Public Access" ON
4. Set "File Size Limit" to 10MB
5. Click "Create Bucket"

Repeat for: sermons, pastors, documents
```

### Step 3: Set Up RLS Policies (10 minutes)

**Option A: Manual Copy-Paste**
- Go to `scripts/rls-policies.sql` in the project
- Copy the SQL
- Paste in Supabase → SQL Editor
- Click "Run"

**Option B: Do It Manually**
- Follow the detailed steps in `SUPABASE_SETUP.md` (Part 2)

### Step 4: Push Database Schema (2 minutes)

```bash
npx prisma db push
```

This creates all tables in Supabase from `prisma/schema.prisma`.

### Step 5: Test Locally (5 minutes)

```bash
npm run dev
# Visit http://localhost:3000/admin/gallery
# Upload a test image
# Verify it appears and can be downloaded
```

### Step 6: Deploy to Railway (10 minutes)

Add these secrets to Railway:
```
DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_YOUTUBE_API_KEY
PAYSTACK_SECRET_KEY
```

Then deploy:
```bash
railway up
```

---

## File-by-File Overview

### Core Supabase Files

**`src/lib/supabase-storage.ts`** (Existing)
- Creates admin client (`supabaseAdmin`)
- Auto-creates buckets with `ensureStorageBuckets()`
- Provides `getPublicStorageUrl()`, `downloadStorageObject()`
- Types: `StorageBucket`, `STORAGE_BUCKETS`

**`src/lib/supabase-helpers.ts`** (NEW - High-level API)
```typescript
// Easy-to-use functions for your components and APIs
await uploadImage('gallery', file);
await deleteImage('gallery', storagePath);
getPublicUrl('gallery', path);
```

### API Routes

**`src/app/api/gallery/route.ts`**
- POST: Upload images (stores in Supabase, metadata in DB)
- GET: List all images
- DELETE: Remove images

**`src/app/api/gallery/download/route.ts`**
- GET: Download single image
- POST: Download multiple as ZIP

### Admin Pages

**`src/app/admin/gallery/page.tsx`**
- Upload, preview, download, delete images
- Uses `/api/gallery` endpoints

**`src/app/admin/site/page.tsx`** (UPDATED)
- Now uses `uploadImage()` and `deleteImage()` helpers
- Uploads to Supabase Storage ("gallery" bucket)
- Shows upload progress and error handling

### Database

**`prisma/schema.prisma`**
- 6 models: ContactMessage, CommunityMember, GalleryImage, PaymentTransaction, RecurringSubscription, Record
- All connected to Supabase PostgreSQL via `DATABASE_URL`

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│ Next.js App (Deployed to Railway)                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Client Components:                                │
│  ├─ Gallery Upload UI                              │
│  ├─ Admin Site Management                          │
│  └─ Contact Forms                                  │
│                                                     │
│  API Routes:                                       │
│  ├─ /api/gallery (POST, GET, DELETE)              │
│  ├─ /api/gallery/download (GET, POST)             │
│  └─ /api/contacts (POST)                          │
│                                                     │
└────────┬────────────────────────────┬──────────────┘
         │                            │
         ↓                            ↓
    ┌─────────────┐            ┌──────────────────┐
    │  Supabase   │            │  Supabase        │
    │  Storage    │            │  PostgreSQL      │
    │             │            │                  │
    │ Buckets:    │            │ Tables:          │
    │ - gallery   │            │ - GalleryImage   │
    │ - sermons   │            │ - ContactMessage │
    │ - pastors   │            │ - Payments       │
    │ - documents │            │ - etc.           │
    └─────────────┘            └──────────────────┘
```

---

## How Upload Works

```
1. User selects file in /admin/gallery
   ↓
2. Browser validates (type, size)
   ↓
3. FormData sent to POST /api/gallery
   ↓
4. Server calls uploadImage('gallery', file)
   ↓
5. File uploaded to Supabase Storage
   ↓
6. Metadata saved to GalleryImage table
   ↓
7. Public URL returned to browser
   ↓
8. Image displayed in gallery grid
```

---

## Environment Variables Required

```bash
# Database (from Supabase Dashboard → Settings → Database)
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require

# Supabase Public URL
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co

# Supabase Service Role Key (KEEP SECRET)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# YouTube Integration
NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=your_channel_id

# Paystack Integration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_...
PAYSTACK_SECRET_KEY=sk_...
```

Create `.env.local` locally:
```bash
pwsh ./scripts/create-env-local.ps1
# or
bash ./scripts/create-env-local.sh
```

---

## Testing Checklist

### Local Testing
- [ ] `npm run dev` starts without errors
- [ ] Gallery page loads at `/admin/gallery`
- [ ] Upload works with preview
- [ ] Images appear in grid with Supabase URLs
- [ ] Download single/multiple works
- [ ] Delete works

### Production Testing (After Railway Deploy)
- [ ] Visit your Railway app URL
- [ ] Gallery upload works
- [ ] Images load from Supabase Storage
- [ ] Download/delete work
- [ ] Check Supabase Dashboard → Storage for uploaded files

---

## Security Notes

✅ **What's Protected**:
- Service role key stored in `.env.local` (never committed)
- RLS policies prevent unauthorized access
- Authenticated users required for upload/delete
- Public read access for viewing content

⚠️ **What You Must Do**:
- Never commit `.env.local` (already in `.gitignore`)
- Never paste secrets in chat/public places
- Rotate credentials if exposed
- Add IP whitelist in Supabase (optional, for extra security)

---

## Troubleshooting

### Upload Fails with 500 Error
```
Check:
1. SUPABASE_SERVICE_ROLE_KEY is set
2. Supabase Dashboard → Logs → API Audits
3. Bucket "gallery" exists and is public
4. File size < 10MB
```

### Images Don't Display
```
Check:
1. Bucket is public (Supabase → Storage → Policies)
2. URL format: https://[PROJECT].supabase.co/storage/v1/object/public/gallery/...
3. next.config.js has Supabase domain
```

### Database Connection Fails
```
Check:
1. DATABASE_URL includes ?sslmode=require
2. Credentials are correct
3. Network access enabled (Supabase → Database → Connection Pooling)
```

See **`SUPABASE_SETUP.md` (Part 7)** for more troubleshooting.

---

## Next Steps

1. **Immediate** (Now):
   - [ ] Read `SUPABASE_SETUP.md`
   - [ ] Review `.env.example`

2. **In Supabase Dashboard** (10-15 minutes):
   - [ ] Create 4 buckets
   - [ ] Set as public
   - [ ] Run RLS SQL script

3. **In Terminal** (5 minutes):
   ```bash
   npx prisma db push
   npm run dev
   # Test at http://localhost:3000/admin/gallery
   ```

4. **Deploy** (10 minutes):
   - [ ] Add secrets to Railway
   - [ ] Push to GitHub
   - [ ] Railway auto-deploys

---

## Documentation Files

| File | Purpose |
|------|---------|
| `SUPABASE_SETUP.md` | Detailed step-by-step setup guide |
| `SUPABASE_CHECKLIST.md` | Phase-by-phase checklist to track progress |
| `scripts/rls-policies.sql` | Copy-paste SQL for RLS policies |
| `DEPLOYMENT_GUIDE.md` | Railway deployment instructions |
| `API_REFERENCE.md` | API endpoint documentation |

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## Summary

✅ **What's Done**:
- Supabase Storage fully integrated
- All helper functions created
- Admin UI updated to use Supabase
- Prisma schema complete
- TypeScript verified
- Build succeeds

⚠️ **What You Need to Do**:
- Create buckets in Supabase Dashboard
- Run RLS SQL script
- Push Prisma schema with `npx prisma db push`
- Deploy to Railway

🚀 **Result**: 
- Full upload/download/delete functionality
- Database-backed gallery
- Scalable storage
- Security through RLS policies

**Status**: Ready for deployment! 🎉

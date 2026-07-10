# Supabase Integration Checklist for KRLE Website

> Complete this checklist to finalize your Supabase setup and ensure all features work correctly.

## Phase 1: Local Setup ✅ (Can be done now)

- [x] Install Supabase CLI or use access token
- [x] Create `.env.local` with credentials (use `scripts/create-env-local.*`)
- [x] Verify `DATABASE_URL` is set correctly
- [x] Verify `NEXT_PUBLIC_SUPABASE_URL` is set
- [x] Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- [x] Run `npm install` to install dependencies
- [x] Run `npx prisma generate` to generate Prisma client
- [x] Run `npm run build` to verify TypeScript compilation

## Phase 2: Supabase Project Setup (Must be done in Supabase Dashboard)

### 2.1 Storage Buckets
- [ ] Create `gallery` bucket with public access
- [ ] Create `sermons` bucket with public access
- [ ] Create `pastors` bucket with public access
- [ ] Create `documents` bucket with public access
- [ ] Set each bucket file size limit to 10MB

### 2.2 Row Level Security (RLS)
- [ ] Run SQL script: `scripts/rls-policies.sql`
- [ ] Or manually create policies for each bucket:
  - [ ] Gallery bucket: Public read, Authenticated upload/delete
  - [ ] Sermons bucket: Public read, Authenticated upload/delete
  - [ ] Pastors bucket: Public read, Authenticated upload/delete
  - [ ] Documents bucket: Public read, Authenticated upload/delete

### 2.3 Database Tables
- [ ] Verify all Prisma tables are created
  - [ ] ContactMessage
  - [ ] CommunityMember
  - [ ] GalleryImage
  - [ ] PaymentTransaction
  - [ ] RecurringSubscription
  - [ ] Record
- [ ] Enable RLS on all tables (see `scripts/rls-policies.sql`)
- [ ] Create policies for table access

### 2.4 Security
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is kept SECRET (never commit)
- [ ] Confirm `.env.local` is in `.gitignore`
- [ ] Check that Supabase API is not exposed in frontend code

## Phase 3: Database Migration

- [ ] Push Prisma schema to Supabase: `npx prisma db push`
- [ ] Verify no errors during schema push
- [ ] Check Supabase Dashboard for created tables

## Phase 4: Local Testing

### 4.1 Gallery Upload/Download
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to http://localhost:3000/admin/gallery
- [ ] Upload a test image
- [ ] Verify image appears in gallery grid
- [ ] Verify image URL is public (can be viewed in new tab)
- [ ] Download single image
- [ ] Download multiple images as ZIP
- [ ] Delete image
- [ ] Verify file is removed from storage and DB

### 4.2 Admin Site Management
- [ ] Navigate to http://localhost:3000/admin/site
- [ ] Upload images using new form
- [ ] Verify uploads go to Supabase Storage
- [ ] Delete images
- [ ] Verify deletion works with Supabase Storage

### 4.3 Contact Form
- [ ] Navigate to http://localhost:3000/contact
- [ ] Submit test message
- [ ] Verify message appears in admin panel
- [ ] Verify message is stored in database

### 4.4 Community Join
- [ ] Navigate to http://localhost:3000/ministries-community (or join link)
- [ ] Submit join form
- [ ] Verify new member appears in database
- [ ] Check Supabase Dashboard → SQL Editor → SELECT * FROM "CommunityMember"

### 4.5 Donations
- [ ] Navigate to http://localhost:3000/donate
- [ ] Test payment form (use Paystack test credentials)
- [ ] Verify payment appears in admin panel
- [ ] Check Supabase Dashboard → PaymentTransaction table

## Phase 5: Production Deployment

### 5.1 Railway Setup
- [ ] Create Railway project
- [ ] Connect GitHub repository
- [ ] Add environment variables to Railway:
  - [ ] `DATABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_YOUTUBE_API_KEY`
  - [ ] `PAYSTACK_SECRET_KEY`
  - [ ] `NODE_ENV=production`

### 5.2 Build & Deploy
- [ ] Build locally: `npm run build` (should succeed)
- [ ] Commit changes to GitHub
- [ ] Railway auto-deploys
- [ ] Verify deployment: Check Railway logs
- [ ] Test production URL (should be https://your-domain.railway.app)

### 5.3 Production Testing
- [ ] Navigate to production URL
- [ ] Test gallery upload
- [ ] Test image display
- [ ] Test download/delete
- [ ] Test contact form
- [ ] Test donation (use live Paystack keys)
- [ ] Check Supabase Dashboard for new data

## Phase 6: Monitoring & Maintenance

### 6.1 Regular Checks (Weekly)
- [ ] Check Supabase Dashboard → Storage → Usage
- [ ] Check Supabase Dashboard → Database → Logs
- [ ] Review new contact messages
- [ ] Review new donations/payments

### 6.2 Performance Optimization
- [ ] Add indexes to frequently queried columns
  ```sql
  CREATE INDEX idx_gallery_category ON "GalleryImage"(category);
  CREATE INDEX idx_payment_status ON "PaymentTransaction"(status);
  ```
- [ ] Monitor query performance in Supabase Dashboard

### 6.3 Backup & Recovery
- [ ] Enable automatic backups in Supabase (default: enabled)
- [ ] Test database restore (backup to staging first)
- [ ] Document recovery procedures

## Phase 7: Troubleshooting

If you encounter issues, check these:

### Upload Fails
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] Verify bucket is public
- [ ] Check Supabase Dashboard → Logs for errors
- [ ] Verify file size < 10MB

### Images Don't Display
- [ ] Verify bucket is public
- [ ] Check image URL format: `https://[PROJECT_REF].supabase.co/storage/v1/object/public/[BUCKET]/[FILE]`
- [ ] Check `next.config.js` has Supabase domain in `remotePatterns`

### Database Connection Fails
- [ ] Verify `DATABASE_URL` includes `?sslmode=require`
- [ ] Check IP whitelist in Supabase → Settings → Database
- [ ] Verify credentials are correct

### RLS Policy Issues
- [ ] Check policies are created in Supabase Dashboard → Storage → Policies
- [ ] Verify authentication status (token in header)
- [ ] Check logs for policy denial messages

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Supabase RLS Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## Support & Questions

If stuck on any step:
1. Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions
2. Review [API_REFERENCE.md](./API_REFERENCE.md) for API endpoints
3. Check Supabase Logs and error messages
4. Create an issue with error details

---

**Status**: 🚀 Ready for Supabase Integration

**Next Step**: Follow Phase 2 to create buckets and set up RLS policies in Supabase Dashboard

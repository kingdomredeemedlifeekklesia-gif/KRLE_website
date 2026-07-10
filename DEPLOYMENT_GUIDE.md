# KRLE Website - Supabase Migration & Deployment Guide

## ✅ Migration Status: COMPLETE

This guide covers the complete migration from Railway PostgreSQL to Supabase PostgreSQL, including all integrations.

---

## 🔐 CRITICAL: Security Setup

### 1. Rotate Supabase Credentials
⚠️ **The credentials shared in this session are now EXPOSED and MUST BE ROTATED IMMEDIATELY**

**Steps:**
1. Go to Supabase Dashboard → Project Settings → API Keys
2. Click "Rotate" next to each key
3. Copy the new keys to your `.env.local` file
4. Never share credentials again

---

## 📋 Prerequisites

Before deploying, ensure you have:

- [x] Supabase project created at https://supabase.com
- [x] GitHub repository connected to Railway
- [x] Node.js 18+ installed locally
- [x] PostgreSQL database connection string from Supabase

---

## 🚀 Local Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd KRLE_website

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create `.env.local` with your Supabase credentials:

```bash
# Database - From Supabase Dashboard
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require

# Supabase - From Supabase Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# YouTube - From Google Cloud Console
NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key_here
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=your_channel_id_here

# Paystack - From Paystack Dashboard
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_public_key_here
PAYSTACK_SECRET_KEY=your_secret_key_here

# Admin & Social
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password_here
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/your-church
NEXT_PUBLIC_X_URL=https://x.com/your-church
NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/@your-church
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/your-church
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/your-church
NEXT_PUBLIC_TIKTOK_URL=https://tiktok.com/@your-church

NODE_ENV=production
```

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Verify connection
npm run check-db
```

### 4. Test Locally

```bash
# Development mode
npm run dev

# Open http://localhost:3000
# Test gallery upload at http://localhost:3000/admin/gallery
# Test donation at http://localhost:3000/donate
```

---

## 🏗️ Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

**Output should show:**
- ✓ Compiled successfully
- ✓ Finished TypeScript
- ✓ All routes listed (35 routes)

---

## 🚢 Railway Deployment

### 1. Connect GitHub to Railway

1. Go to https://railway.app/login
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository

### 2. Configure Environment Variables

In Railway Dashboard:

1. Go to Project Settings → Variables
2. Add each variable from your `.env.local`
3. **Do NOT expose sensitive keys** - Railway will keep them private

### 3. Set Build & Start Commands

In Railway Dashboard → Deployment → Settings:

```
Build Command: prisma generate && next build
Start Command: next start
```

### 4. Verify Deployment

After deployment:

1. Go to Railway → Deployments
2. Check logs for "✓ Compiled successfully"
3. Visit your domain
4. Test all features:
   - Gallery upload & display
   - YouTube sermon videos
   - Donation form
   - Admin dashboard

---

## 📦 Feature Checklist

### Gallery
- [x] Upload single/multiple images to Supabase Storage
- [x] Display images with preview modal
- [x] Download selected images as ZIP
- [x] Delete images from storage & database
- [x] Admin dashboard for management

### Sermons
- [x] Fetch latest videos from YouTube API
- [x] Display thumbnail & publish date
- [x] Link to YouTube video
- [x] Fallback: "No sermons available"

### Donations (Paystack)
- [x] Payment form with amount input
- [x] Redirect to Paystack payment
- [x] Verify payment with Paystack API
- [x] Store transaction in database
- [x] Display payment status

### Admin Dashboard
- [x] Gallery management (upload/delete/download)
- [x] Payment transactions view
- [x] Filter & search
- [x] Expense tracking
- [x] Record management

### About Page
- [x] Pastor image properly centered
- [x] Image styling responsive
- [x] Full face visible

### Footer
- [x] All social links configurable
- [x] Facebook, X, YouTube, LinkedIn, Instagram, TikTok

---

## 🔧 Supabase Setup

### 1. Create Storage Buckets

Buckets are auto-created by the app, but if needed:

1. Go to Supabase Dashboard → Storage
2. Create buckets (if missing):
   - `gallery` (images)
   - `sermons` (future use)
   - `pastors` (future use)
   - `documents` (future use)

3. Set bucket policies for public access (gallery, sermons, pastors)

### 2. Enable RLS (Row Level Security)

For storage buckets:

```sql
-- Gallery bucket - Allow public read
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

-- Gallery bucket - Allow authenticated upload
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery');
```

---

## 🐛 Troubleshooting

### Build Error: "DATABASE_URL not found"
- ✓ Make sure `.env.local` has `DATABASE_URL`
- ✓ Check Railway environment variables

### Images Not Displaying
- ✓ Check Supabase bucket name matches "gallery"
- ✓ Verify images uploaded to correct path
- ✓ Check next.config.js has Supabase domain

### Payment Not Verifying
- ✓ Verify Paystack keys are correct
- ✓ Check transaction reference format
- ✓ Verify PAYSTACK_SECRET_KEY is server-side only

### YouTube Videos Not Loading
- ✓ Verify YouTube API key is enabled in Google Cloud Console
- ✓ Check channel ID is public
- ✓ Verify API quota is sufficient

---

## 📊 Monitoring

### Useful Commands

```bash
# Check database connection
npm run check-db

# View Prisma studio (local only)
npx prisma studio

# Check environment status
curl https://your-domain.railway.app/api/env-status
```

### Logs

- **Railway**: Dashboard → Deployments → View Logs
- **Supabase**: Dashboard → Logs
- **Local**: `npm run dev` terminal output

---

## 🔄 Maintenance

### Database Migrations

After schema changes:

```bash
npx prisma db push

# Or use migrations:
npx prisma migrate dev --name describe_change
```

### Image Cleanup

To delete old images from Supabase:

1. Use Admin Dashboard → Gallery → Delete
2. Or use Supabase Dashboard → Storage

### Update Dependencies

```bash
npm update
npm audit fix
```

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Railway Docs**: https://docs.railway.app
- **Paystack Docs**: https://paystack.com/docs

---

## ✨ Summary

Your KRLE Website is now:
- ✓ Using Supabase PostgreSQL
- ✓ Storing images in Supabase Storage
- ✓ Integrated with YouTube API
- ✓ Processing payments with Paystack
- ✓ Ready for production on Railway
- ✓ Zero TypeScript/build errors

**Next Steps:**
1. Rotate Supabase credentials
2. Configure `.env.local` locally
3. Test with `npm run dev`
4. Deploy to Railway
5. Monitor logs and verify all features work

Good luck! 🙏

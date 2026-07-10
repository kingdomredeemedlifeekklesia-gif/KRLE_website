# 🚀 KRLE Website - Quick Deployment Checklist

## ⚠️ SECURITY FIRST

- [ ] **ROTATE SUPABASE CREDENTIALS** - Previous credentials are exposed
  - [ ] Go to Supabase Dashboard → Settings → API Keys → Rotate
  - [ ] Copy NEW keys to `.env.local`
  - [ ] Delete old credentials from anywhere they were shared

## 🔧 Local Setup (First Time Only)

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Create `.env.local` with Supabase credentials
- [ ] Run `npx prisma db push` to create database tables
- [ ] Run `npm run dev` and test locally
- [ ] Access http://localhost:3000/admin/gallery to test upload

## 📝 Environment Variables Required

- [ ] `DATABASE_URL` - From Supabase Dashboard
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - From Supabase Dashboard
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - From Supabase Dashboard
- [ ] `NEXT_PUBLIC_YOUTUBE_API_KEY` - From Google Cloud Console
- [ ] `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` - Your YouTube channel
- [ ] `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` - From Paystack Dashboard
- [ ] `PAYSTACK_SECRET_KEY` - From Paystack Dashboard
- [ ] `NEXT_PUBLIC_ADMIN_PASSWORD` - Your choice (secure)
- [ ] `NEXT_PUBLIC_FACEBOOK_URL` - Your Facebook page
- [ ] `NEXT_PUBLIC_X_URL` - Your X/Twitter account
- [ ] `NEXT_PUBLIC_YOUTUBE_URL` - Your YouTube channel
- [ ] `NEXT_PUBLIC_LINKEDIN_URL` - Your LinkedIn company
- [ ] `NEXT_PUBLIC_INSTAGRAM_URL` - Your Instagram account
- [ ] `NEXT_PUBLIC_TIKTOK_URL` - Your TikTok account

## 🏗️ Build Verification

- [ ] Run `npm run build` successfully (0 errors)
- [ ] Verify TypeScript passes
- [ ] Check all 35 routes compile

## 🚢 Railway Setup

1. Connect GitHub Repository
   - [ ] Go to https://railway.app
   - [ ] Create new project
   - [ ] Connect your GitHub repo

2. Configure Build & Start
   - [ ] Build Command: `prisma generate && next build`
   - [ ] Start Command: `next start`

3. Add Environment Variables
   - [ ] Add all 13 variables to Railway
   - [ ] Do NOT expose secret keys

4. Deploy
   - [ ] Trigger deployment
   - [ ] Wait for build to complete (5-10 min)
   - [ ] Check logs for errors

## ✅ Post-Deployment Testing

- [ ] Visit your domain
- [ ] Test admin gallery upload
- [ ] Test image display on gallery page
- [ ] Test sermon page (YouTube videos)
- [ ] Test donation page (Paystack)
- [ ] Test about page (pastor image visible)
- [ ] Test footer (social links work)

## 🐛 If Something Fails

- [ ] Check Railway logs for errors
- [ ] Verify all environment variables are set
- [ ] Run `npm run build` locally to reproduce error
- [ ] Check Supabase dashboard for connection issues
- [ ] Verify Prisma client is generated: `npx prisma generate`

## 📊 Success Indicators

- ✓ Build completes with 0 errors
- ✓ No TypeScript errors
- ✓ All images display from Supabase Storage
- ✓ YouTube videos load on sermon page
- ✓ Donation form works end-to-end
- ✓ Admin dashboard functions correctly
- ✓ Database tables created successfully

## 🔄 Ongoing Maintenance

- [ ] Monitor Railway logs weekly
- [ ] Check Supabase storage usage monthly
- [ ] Update dependencies quarterly: `npm update`
- [ ] Review Paystack transactions monthly
- [ ] Backup database monthly (Supabase auto-backups daily)

---

**Last Updated**: 2026-06-18
**Status**: Ready for Production ✅

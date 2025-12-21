# 🚀 GitHub & Netlify Deployment Guide

## Your Changes Are Ready to Push!

All your code changes have been committed locally. Here's how to push to GitHub and deploy to Netlify.

---

## 📦 What's Been Committed

**Commit:** `feat: Add Supabase database connection and comprehensive documentation`

**Files Changed:** 14 files, 6,587 additions
- ✅ Supabase connection configured
- ✅ All 8 database migrations consolidated
- ✅ 6 comprehensive setup guides created
- ✅ Database check scripts added
- ✅ TypeScript issues fixed
- ✅ Missing dependencies added

---

## Step 1: Push to GitHub

### Option A: Using GitHub Desktop (Easiest)

1. Open **GitHub Desktop**
2. Select the `unrehrms` repository
3. You should see the commit ready to push
4. Click **"Push origin"**
5. Done! ✅

### Option B: Using Git Command Line

You need to authenticate first. Choose one method:

**Method 1: GitHub CLI (Recommended)**
```bash
# Install GitHub CLI if not installed
# https://cli.github.com/

# Authenticate
gh auth login

# Push
cd unrehrms
git push origin main
```

**Method 2: Personal Access Token**
```bash
# Generate a new token at:
# https://github.com/settings/tokens/new
# Scopes needed: repo (all)

# Set remote with new token
cd unrehrms
git remote set-url origin https://YOUR_USERNAME:YOUR_NEW_TOKEN@github.com/emabi2002/unrehrms.git

# Push
git push origin main
```

**Method 3: SSH Key**
```bash
# If you have SSH keys set up
cd unrehrms
git remote set-url origin git@github.com:emabi2002/unrehrms.git
git push origin main
```

---

## Step 2: Deploy to Netlify

### Option A: Automatic Deployment (Recommended)

**If you've already connected the repo to Netlify:**

1. Push to GitHub (Step 1)
2. Netlify will **automatically deploy** within 2-3 minutes
3. Check: https://app.netlify.com/sites/YOUR_SITE_NAME
4. Done! ✅

**If this is your first deployment:**

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub**
4. Authorize Netlify (if needed)
5. Select repository: **emabi2002/unrehrms**
6. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Framework:** Next.js
7. Add environment variables (IMPORTANT!):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://qltnmteqivrnljemyvvb.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdG5tdGVxaXZybmxqZW15dnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MDQ0NTcsImV4cCI6MjA4MDQ4MDQ1N30.0vcqkzjMIb2QI4sD-0k6ujtCJxFRHiwnW9VDgPwUupc`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdG5tdGVxaXZybmxqZW15dnZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkwNDQ1NywiZXhwIjoyMDgwNDgwNDU3fQ.FI1LarRU9BWcL4SjOY1m3cSTGTyJXQN2hBH4yRD2cIs`
8. Click **"Deploy site"**
9. Wait 3-5 minutes for build
10. Your site will be live! 🎉

### Option B: Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd unrehrms
netlify deploy --prod
```

---

## Step 3: Configure Custom Domain (Optional)

1. In Netlify dashboard, go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `hrms.unre.ac.pg`)
4. Follow DNS configuration instructions
5. SSL certificate will be automatically provisioned

---

## 🔐 Environment Variables for Netlify

Make sure to add these in Netlify:

**Site settings → Environment variables:**

```
NEXT_PUBLIC_SUPABASE_URL=https://qltnmteqivrnljemyvvb.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdG5tdGVxaXZybmxqZW15dnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MDQ0NTcsImV4cCI6MjA4MDQ4MDQ1N30.0vcqkzjMIb2QI4sD-0k6ujtCJxFRHiwnW9VDgPwUupc

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdG5tdGVxaXZybmxqZW15dnZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkwNDQ1NywiZXhwIjoyMDgwNDgwNDU3fQ.FI1LarRU9BWcL4SjOY1m3cSTGTyJXQN2hBH4yRD2cIs
```

---

## ✅ Deployment Checklist

### Before Deployment
- [x] Database connected to Supabase ✅
- [x] All migrations completed ✅
- [x] Sample data seeded ✅
- [x] Application tested locally ✅
- [x] Changes committed to Git ✅
- [ ] Pushed to GitHub
- [ ] Deployed to Netlify

### After Deployment
- [ ] Verify deployment URL works
- [ ] Test database connection in production
- [ ] Check all pages load correctly
- [ ] Test employee management features
- [ ] Verify payroll calculations work
- [ ] Test leave management system
- [ ] Configure custom domain (optional)
- [ ] Set up SSL (automatic with Netlify)
- [ ] Enable authentication (future)
- [ ] Set up monitoring (optional)

---

## 🚨 Troubleshooting

### Issue: GitHub Push Fails (Authentication)
**Solution:**
1. Generate new Personal Access Token: https://github.com/settings/tokens/new
2. Grant `repo` scope
3. Use token in git remote URL or use GitHub CLI

### Issue: Netlify Build Fails
**Solution:**
1. Check build logs in Netlify dashboard
2. Verify environment variables are set
3. Ensure `package.json` has correct build script
4. Check Node.js version compatibility

### Issue: Site Loads But No Data
**Solution:**
1. Verify environment variables in Netlify
2. Check Supabase project is active
3. Test database connection from production
4. Review browser console for errors

### Issue: 500 Server Error
**Solution:**
1. Check Netlify function logs
2. Verify Supabase service role key is set
3. Check API routes are working
4. Review server-side error logs

---

## 📊 Expected Deployment Time

- **GitHub Push:** Instant
- **Netlify Build:** 3-5 minutes
- **DNS Propagation (custom domain):** 1-48 hours
- **SSL Certificate:** Automatic (5-10 minutes)

---

## 🎯 Post-Deployment Tasks

### Immediate
1. ✅ Test the live site
2. ✅ Verify database connectivity
3. ✅ Check all pages load
4. ✅ Test core features

### Short-term
- [ ] Enable Supabase authentication
- [ ] Set up Row Level Security (RLS)
- [ ] Configure email notifications
- [ ] Import real employee data
- [ ] Set up backups

### Long-term
- [ ] User training and onboarding
- [ ] Data migration from old system
- [ ] Performance monitoring
- [ ] Regular updates and maintenance
- [ ] Feature requests and improvements

---

## 🔗 Important Links

**GitHub Repository:**
https://github.com/emabi2002/unrehrms

**Supabase Dashboard:**
https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb

**Netlify Dashboard:**
https://app.netlify.com

**Documentation:**
- Setup guides: `.same/` folder
- Database schema: `supabase/migrations/`
- System overview: `.same/system-overview.md`

---

## 💡 Pro Tips

1. **Use Branch Protection:** Set up branch protection rules on GitHub
2. **Enable Auto-Deploy:** Netlify will auto-deploy on every push to main
3. **Preview Deployments:** Netlify creates preview URLs for pull requests
4. **Monitor Performance:** Use Netlify Analytics (optional paid feature)
5. **Backup Regularly:** Export Supabase database periodically

---

## 📞 Need Help?

**Netlify Support:**
- Docs: https://docs.netlify.com
- Community: https://answers.netlify.com

**Supabase Support:**
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

**GitHub Support:**
- Docs: https://docs.github.com
- Community: https://github.community

---

## 🎉 You're Almost There!

Just two more steps:
1. **Push to GitHub** (choose method above)
2. **Deploy to Netlify** (automatic or manual)

Your PNG UNRE HRMS will be live and accessible worldwide! 🌍

---

**Guide Created:** December 18, 2025
**System Version:** 1.0.0
**Status:** Ready for Deployment 🚀

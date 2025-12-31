# Vercel Deployment Quick Start Guide

This guide provides a streamlined approach to deploying GrantFounders on Vercel.

## ✅ Pre-Deployment Verification

Run this command to verify your setup:

```bash
cd web
node scripts/verify-deployment.js
```

All checks should pass before proceeding.

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Environment Variables

Create a `.env.production` file locally to document your production environment variables (do NOT commit this file):

**Minimum Required Variables:**
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
GF_SECRET_KEY=gf-777ace-your-secret

# Application
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=production

# Stripe (Optional - set to false if not using)
ENABLE_STRIPE=false
```

**With Stripe Enabled:**
```bash
# Add these if ENABLE_STRIPE=true
ENABLE_STRIPE=true
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

### Step 2: Connect to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New Project"**
3. **Import from GitHub**: Select `pedroviveiros2025/grantfounders`
4. **Configure Build Settings**:
   - Framework Preset: **Next.js**
   - Root Directory: **`web`** ⚠️ **CRITICAL - Must be set!**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm ci`
   - Node.js Version: 20.x

### Step 3: Add Environment Variables

Before deploying, add your environment variables:

1. Click **"Environment Variables"** in the project configuration
2. Add each variable from your `.env.production` file
3. For each variable:
   - **Name**: Variable name (e.g., `SUPABASE_URL`)
   - **Value**: Variable value
   - **Environments**: Check all three: Production ✅ Preview ✅ Development ✅
4. Click **"Add"** for each variable

### Step 4: Deploy

1. **Click "Deploy"** button
2. **Monitor build logs** for:
   - ✅ `Installing dependencies... npm ci`
   - ✅ `✅ All required GrantFounders env vars OK`
   - ✅ `ℹ️  Stripe integration disabled` (or enabled if configured)
   - ✅ `Creating an optimized production build...`
   - ✅ `Build Complete`
3. **Note your preview URL**: `https://grantfounders-xyz123.vercel.app`

### Step 5: Test Preview Deployment

Test the preview URL before attaching your custom domain:

```bash
# Test health endpoint
curl https://grantfounders-xyz123.vercel.app/api/health

# Expected response:
# {"ok":true,"data":{"status":"healthy","version":"1.0.0",...}}

# Test homepage
curl https://grantfounders-xyz123.vercel.app/

# Test CORS
curl -X OPTIONS https://grantfounders-xyz123.vercel.app/api/ace/score
```

Or use the smoke test script:

```bash
cd web
node scripts/smoke-test.js https://grantfounders-xyz123.vercel.app your-api-key
```

### Step 6: Attach Custom Domain (Optional)

1. **Go to Project Settings** → **Domains**
2. **Add domain**: `www.grantfounders.com`
3. **Add redirect**: `grantfounders.com` → `www.grantfounders.com`
4. **Configure DNS** at your DNS provider:
   ```
   Type    Name    Value                   TTL
   A       @       76.76.21.21            Auto
   CNAME   www     cname.vercel-dns.com   Auto
   ```
5. **Wait for DNS propagation** (5-30 minutes)
6. **Verify SSL**: Vercel auto-issues SSL certificates

### Step 7: Configure Stripe Webhook (If Using Stripe)

Only if `ENABLE_STRIPE=true`:

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/webhooks
2. **Click "Add endpoint"**
3. **Endpoint URL**: `https://www.grantfounders.com/api/stripe/webhook`
4. **Select events**: `checkout.session.completed`
5. **Copy the Signing Secret** (`whsec_...`)
6. **Update Vercel environment variable**: Add/update `STRIPE_WEBHOOK_SECRET`
7. **Redeploy** the project

## 🧪 Post-Deployment Verification

After deployment, verify everything works:

```bash
# 1. Health check
curl https://www.grantfounders.com/api/health

# 2. Run smoke tests
cd web
node scripts/smoke-test.js https://www.grantfounders.com your-api-key

# 3. Test in browser
# - Visit https://www.grantfounders.com
# - Verify homepage loads
# - Check browser console for errors
```

## 🆘 Troubleshooting

### Build fails with "Missing env vars"
**Solution**: Add the missing environment variables in Vercel → Settings → Environment Variables, then redeploy.

### Build fails with "Wrong workspace" or "Multiple lockfiles"
**Solution**: Verify Root Directory is set to `web` in Project Settings → General.

### API routes return 404
**Solution**: 
1. Check build logs for compilation errors
2. Verify API routes exist in `app/api/` directory
3. Clear deployment cache and redeploy

### API routes return 500
**Solution**:
1. Check Vercel → Deployments → [latest] → Functions → View logs
2. Common causes: Missing env vars, invalid Supabase credentials
3. Verify environment variables match your Supabase project

### CORS errors in browser
**Solution**: All API routes have CORS configured. Test with:
```bash
curl -X OPTIONS https://your-domain.com/api/ace/score -v
# Should return status 204 with CORS headers
```

## 📊 Deployment Checklist

Use this checklist to ensure nothing is missed:

- [ ] Run `node scripts/verify-deployment.js` - all checks pass
- [ ] Environment variables documented in `.env.production`
- [ ] Supabase database schema deployed
- [ ] Vercel project created with Root Directory = `web`
- [ ] All environment variables added to Vercel
- [ ] Initial deployment successful
- [ ] Preview URL tested (smoke tests pass)
- [ ] Custom domain configured (if applicable)
- [ ] DNS records updated (if applicable)
- [ ] SSL certificate verified (if applicable)
- [ ] Stripe webhook configured (if using Stripe)
- [ ] Production deployment tested and verified

## 📚 Additional Resources

- **Full Deployment Runbook**: See `DEPLOYMENT_RUNBOOK.md`
- **Vercel Setup Guide**: See `VERCEL_SETUP_GUIDE.md`
- **API Reference**: See `API_REFERENCE.md`
- **Deployment Validation**: See `DEPLOYMENT_VALIDATION.md`

## 🎯 Expected Results

After successful deployment:

- ✅ Homepage loads at `https://www.grantfounders.com`
- ✅ Health endpoint returns `{"ok":true,"data":{"status":"healthy"}}`
- ✅ ACE scoring API works with valid API key
- ✅ CORS headers present on all API routes
- ✅ Build completes in ~2-3 minutes
- ✅ SSL certificate valid (🔒 in browser)
- ✅ No console errors in browser

## 🔄 Redeploying

To redeploy after changes:

1. **Commit changes** to git: `git add . && git commit -m "Your message"`
2. **Push to GitHub**: `git push`
3. **Vercel auto-deploys** on push to main branch
4. **Or manual redeploy**: Vercel → Deployments → ⋯ → Redeploy

## 🎉 Success!

Once all checks pass and your site is live, you're ready to use GrantFounders in production!

For ongoing monitoring:
- Check Vercel Analytics for usage metrics
- Monitor Vercel Logs for errors
- Use health endpoint for uptime monitoring
- Run smoke tests periodically

---

**Last Updated**: 2025-12-31  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

# Vercel Configuration Checklist
**Project:** grantfounders  
**Production Domain:** https://www.grantfounders.com  
**Repository:** pedroviveiros2025/grantfounders (main branch)

---

## ✅ VERCEL PROJECT SETTINGS

### General
- [ ] **Project Name:** grantfounders
- [ ] **Framework:** Next.js
- [ ] **Root Directory:** `web` ⚠️ CRITICAL - Must be set to "web", not repo root
- [ ] **Build Command:** `npm run build` (auto-detected)
- [ ] **Install Command:** `npm ci` (recommended for deterministic builds)
- [ ] **Output Directory:** `.next` (auto-detected)
- [ ] **Node.js Version:** 20.x or higher

### Monorepo Configuration
⚠️ **IMPORTANT:** This is a monorepo. Vercel must use `/web` as the root directory.

**What we've done:**
- Removed root `package-lock.json` to prevent confusion
- Added `vercel.json` at root with explicit commands
- Added `.vercelignore` to exclude non-web directories
- Added `/web/vercel.json` with Next.js config

**Vercel Settings:**
1. When creating project, set "Root Directory" to `web`
2. Vercel will install dependencies from `/web/package-lock.json`
3. Build runs from `/web` directory context

### Domains
- [ ] **Primary Domain:** www.grantfounders.com
- [ ] **Alternative Domain:** grantfounders.com (redirects to www)
- [ ] **SSL/TLS:** Auto-enabled by Vercel

**DNS Configuration:**
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

---

## 🔐 ENVIRONMENT VARIABLES (Production)

**Location:** Project Settings → Environment Variables

### Minimal Configuration (Core API Only)
For deploying just the ACE scoring API without Stripe:

```bash
# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Security (Required)
JWT_SECRET=your-super-secret-jwt-key-change-this
GF_SECRET_KEY=gf-777ace-secret-key

# App Config (Required)
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=production

# Stripe Control (Optional)
ENABLE_STRIPE=false
```

### Full Configuration (With Stripe Billing)
To enable Stripe checkout and webhooks:

```bash
# All from Minimal Configuration above, plus:

# Stripe (Required when ENABLE_STRIPE=true)
ENABLE_STRIPE=true
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

**How to add in Vercel:**
1. Go to Project Settings → Environment Variables
2. Add each variable
3. Select environments: Production, Preview, Development
4. Click "Save"
5. Redeploy for changes to take effect

---

## 🔗 STRIPE WEBHOOK CONFIGURATION

**Location:** Stripe Dashboard → Webhooks

### Endpoint Setup
- **Endpoint URL:** `https://www.grantfounders.com/api/stripe/webhook`
- **API Version:** 2025-12-15.clover (or latest)
- **Events to Listen:** Select specific events
  - [ ] `checkout.session.completed` ← **Required**

### Webhook Secret
- [ ] Copy the webhook signing secret
- [ ] Add to Vercel as `STRIPE_WEBHOOK_SECRET`

### Testing
```bash
# Use Stripe CLI to forward webhook events to local development
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 🗄️ SUPABASE CONFIGURATION

### Database Setup
Ensure these tables exist:
- [ ] `orgs` - Organization records
- [ ] `org_memberships` - User-to-org relationships
- [ ] `api_keys` - API keys for external access
- [ ] `usage_events` - API usage tracking

### RPC Functions
Verify these exist in Supabase SQL:
- [ ] `verify_api_key(p_key text)` - Returns org & api_key data
- [ ] `create_api_key(p_org uuid, p_name text)` - Creates new API key

### Authentication
- [ ] Enable Email/Password authentication
- [ ] Set redirect URL to `https://www.grantfounders.com/auth/callback`

### Credentials
- [ ] Get `SUPABASE_URL` from Project Settings → API
- [ ] Get `SUPABASE_SERVICE_ROLE_KEY` from Project Settings → API (service_role)
- [ ] Get `SUPABASE_ANON_KEY` from Project Settings → API (anon)

---

## ✅ PRE-DEPLOYMENT CHECKS

### Local Testing
```powershell
# Navigate to web directory
cd web

# Install dependencies (use ci for clean install)
npm ci

# Create environment file
cp .env.example .env.local  # Then edit with your values

# Minimal env for testing (without Stripe):
# SUPABASE_URL=...
# SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
# JWT_SECRET=test-secret
# GF_SECRET_KEY=gf-secret
# NEXT_PUBLIC_APP_VERSION=1.0.0
# NEXT_PUBLIC_ENVIRONMENT=development

# Build for production
npm run build

# Start production server
npm start
```

### Test Endpoints (PowerShell)
```powershell
# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET

# Test homepage
Invoke-WebRequest -Uri "http://localhost:3000" -Method GET

# Test ACE Score endpoint (requires valid API key from Supabase)
$body = @{
  project_name = "Test Project"
  sector = "gov"
  budget = 1000000
  duration_months = 12
  beneficiaries = 1000
  esg_score = 75
  risk_index = 30
  execution_capacity = 80
  scalability = 70
  strategic_value = 85
  compliance_score = 90
  expected_roi = 15
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/ace/score" `
  -Method POST `
  -Headers @{ Authorization = "Bearer your-api-key"; "Content-Type" = "application/json" } `
  -Body $body

# Run smoke tests
node scripts/smoke-test.js http://localhost:3000 your-api-key
```

### Git Status
```powershell
git status  # Should show "working tree clean"
git log --oneline -5  # Verify recent commits
```

---

## 🚀 DEPLOYMENT PROCESS

### Step 1: Connect Repository
1. [ ] Go to Vercel Dashboard → "Add New Project"
2. [ ] Select GitHub and authorize Vercel
3. [ ] Select repository: `pedroviveiros2025/grantfounders`
4. [ ] **IMPORTANT:** Configure Project
   - Framework Preset: Next.js
   - Root Directory: `web` ⚠️ **MUST BE SET**
   - Build Command: Leave as default (`npm run build`)
   - Output Directory: Leave as default (`.next`)

### Step 2: Configure Environment Variables
1. [ ] Before deploying, click "Environment Variables"
2. [ ] Add minimal required vars (see section above)
3. [ ] Start with `ENABLE_STRIPE=false` for first deployment
4. [ ] Ensure all values are production-ready (no test keys)

### Step 3: First Deployment
1. [ ] Click "Deploy"
2. [ ] Monitor build logs for errors
3. [ ] Build should complete successfully
4. [ ] Wait for "Deployment Complete" status
5. [ ] Note the preview URL (e.g., `grantfounders-abc123.vercel.app`)

### Step 4: Test Preview Deployment
```powershell
$previewUrl = "https://grantfounders-abc123.vercel.app"

# Test health
Invoke-RestMethod -Uri "$previewUrl/api/health" -Method GET

# Test homepage
Invoke-WebRequest -Uri "$previewUrl" -Method GET

# Run full smoke test
node scripts/smoke-test.js $previewUrl your-api-key
```

### Step 5: Attach Custom Domain
1. [ ] Go to Project Settings → Domains
2. [ ] Remove domain from any old project first (if exists)
3. [ ] Add domain: `www.grantfounders.com`
4. [ ] Add redirect: `grantfounders.com` → `www.grantfounders.com`
5. [ ] Configure DNS as shown in Domains section above
6. [ ] Wait for DNS propagation (5-30 minutes)
7. [ ] Verify SSL certificate is issued

### Step 6: Verify Production Domain
```powershell
# Test production domain
Invoke-RestMethod -Uri "https://www.grantfounders.com/api/health" -Method GET

# Full smoke test
node scripts/smoke-test.js https://www.grantfounders.com your-api-key
```

---

## 📊 POST-DEPLOYMENT VERIFICATION

### Logs & Monitoring
- [ ] Vercel Dashboard → Deployments → Click latest deployment
- [ ] Check build logs for warnings
- [ ] Click "Functions" tab to see API routes
- [ ] Monitor runtime logs for errors

### API Health Checks
```powershell
$baseUrl = "https://www.grantfounders.com"

# 1. Health check
$health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
Write-Host "Health: $($health.data.status)"

# 2. CORS preflight
Invoke-WebRequest -Uri "$baseUrl/api/ace/score" -Method OPTIONS

# 3. Test ACE endpoint (requires API key)
$body = @{
  project_name = "Production Test"
  sector = "gov"
  budget = 500000
  duration_months = 12
  beneficiaries = 500
  esg_score = 80
  risk_index = 20
  execution_capacity = 85
  scalability = 75
  strategic_value = 90
  compliance_score = 95
  expected_roi = 18
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "$baseUrl/api/ace/score" `
  -Method POST `
  -Headers @{ Authorization = "Bearer your-api-key"; "Content-Type" = "application/json" } `
  -Body $body

Write-Host "ACE Score: $($result.data.final_score)"
```

### Monitoring & Analytics
- [ ] Enable Vercel Analytics (if desired)
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Monitor API usage via Supabase `usage_events` table

---

## 🔄 CONTINUOUS DEPLOYMENT

### Git Workflow
- Every push to `main` → Automatic Vercel deployment
- Preview deployments for PRs (if enabled)
- Rollback available via Vercel dashboard

### Best Practices
- [ ] Never commit `.env.local` or credentials
- [ ] Use `.env.example` template for team reference
- [ ] Tag releases in GitHub: `git tag v1.0.0`
- [ ] Keep `package.json` versions up to date

---

## 🆘 TROUBLESHOOTING

### Build Fails

**Symptom:** Build fails with "Missing env vars"
```
Solution:
1. Check which vars are missing in build log
2. Add them in Vercel → Project Settings → Environment Variables
3. For Stripe vars: set ENABLE_STRIPE=false if not using billing yet
4. Redeploy from Vercel dashboard
```

**Symptom:** "Wrong workspace detected" or "Multiple lockfiles found"
```
Solution:
1. Verify Root Directory is set to "web" in Project Settings
2. Ensure root package-lock.json was deleted
3. Check that web/package-lock.json exists
4. Redeploy with clean cache (Deployments → ⋯ → Redeploy)
```

### API Routes Return 404

**Symptom:** `GET /api/ace/score` returns 404
```
Solution:
1. Verify route file exists: web/app/api/ace/score/route.ts
2. Check build logs - Next.js should list all API routes
3. Ensure no routing conflicts in app directory
4. Test with preview URL first before custom domain
```

**Symptom:** Custom domain returns 404, but preview URL works
```
Solution:
1. Go to Vercel → Project Settings → Domains
2. Remove domain from old project (if exists)
3. Re-add domain to current project
4. Redeploy: Deployments → ⋯ → Redeploy
5. Clear browser cache / try incognito
6. Check DNS: nslookup www.grantfounders.com
```

### API Routes Return 500

**Symptom:** POST /api/ace/score returns 500 error
```
Solution:
1. Check function logs: Deployments → Click deployment → Functions tab
2. Common causes:
   - Missing SUPABASE_* env vars
   - Invalid API key in request
   - Database connection error
3. Test locally with same env vars
4. Verify Supabase service role key is correct
```

### CORS Errors

**Symptom:** Browser shows CORS error
```
Solution:
1. All API routes now include CORS headers (Access-Control-Allow-Origin: *)
2. Ensure OPTIONS handler exists in route
3. Test CORS preflight: Invoke-WebRequest -Method OPTIONS -Uri "https://..."
4. Check response headers include: Access-Control-Allow-Methods
```

### Stripe Webhook Not Firing

**Symptom:** Stripe events not processed
```
Solution (only if ENABLE_STRIPE=true):
1. Verify webhook endpoint in Stripe Dashboard:
   URL: https://www.grantfounders.com/api/stripe/webhook
2. Check webhook secret matches STRIPE_WEBHOOK_SECRET in Vercel
3. Test webhook delivery in Stripe Dashboard
4. Check Vercel function logs for webhook errors
5. Ensure webhook endpoint is deployed (check preview first)
```

---

## 🔄 DOMAIN MIGRATION (If Needed)

### Moving from Old Vercel Project to New

If you have domain attached to wrong project:

```
Step 1: Identify Projects
- Old project: (wrong root directory, has your domain)
- New project: (correct /web root, no domain yet)

Step 2: Remove Domain from Old Project
1. Go to old project → Settings → Domains
2. Click domain → Remove
3. Confirm removal

Step 3: Add Domain to New Project
1. Go to new project → Settings → Domains
2. Add: www.grantfounders.com
3. Vercel will verify DNS automatically

Step 4: Configure DNS (if not already)
A      @       76.76.21.21
CNAME  www     cname.vercel-dns.com

Step 5: Redeploy New Project
1. Go to Deployments
2. Click ⋯ on latest deployment
3. Click "Redeploy"
4. Wait for completion

Step 6: Test
Invoke-RestMethod -Uri "https://www.grantfounders.com/api/health"
```

---

## 📞 SUPPORT RESOURCES

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs/api
- **Vercel Status:** https://www.vercel-status.com/

---

## ✅ FINAL DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Root `package-lock.json` removed from repo root
- [ ] `vercel.json` exists at repo root
- [ ] `/web/vercel.json` exists
- [ ] All environment variables documented
- [ ] Local build succeeds: `cd web && npm ci && npm run build`
- [ ] Local smoke test passes: `node scripts/smoke-test.js http://localhost:3000`
- [ ] Git working tree is clean

### Vercel Configuration
- [ ] Root Directory = `web`
- [ ] Framework = Next.js
- [ ] Node.js version = 20.x
- [ ] Install Command = `npm ci`
- [ ] All required env vars added
- [ ] `ENABLE_STRIPE` set appropriately

### Post-Deployment
- [ ] Build succeeds in Vercel
- [ ] Preview URL works
- [ ] Custom domain attached and SSL enabled
- [ ] Health check returns 200: `/api/health`
- [ ] Homepage loads: `/`
- [ ] ACE endpoint works: `/api/ace/score`
- [ ] Smoke test passes on production
- [ ] Function logs show no errors

**Status:** ✅ Production-Ready

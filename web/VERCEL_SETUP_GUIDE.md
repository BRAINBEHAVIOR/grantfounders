# Vercel Configuration Checklist
**Project:** grantfounders  
**Production Domain:** https://www.grantfounders.com  
**Repository:** pedroviveiros2025/grantfounders (main branch)

---

## ✅ VERCEL PROJECT SETTINGS

### General
- [ ] **Project Name:** grantfounders
- [ ] **Framework:** Next.js
- [ ] **Root Directory:** `web` (NOT the repo root)
- [ ] **Build Command:** `npm run build` (auto-detected)
- [ ] **Install Command:** `npm install` (auto-detected)
- [ ] **Output Directory:** `.next` (auto-detected)
- [ ] **Node.js Version:** 20.x or higher

### Domains
- [ ] **Primary Domain:** www.grantfounders.com
- [ ] **Alternative Domain:** grantfounders.com (if needed)
- [ ] **SSL/TLS:** Auto-enabled by Vercel

---

## 🔐 ENVIRONMENT VARIABLES (Production)

**Location:** Project Settings → Environment Variables

### Server-Side Only (do NOT check "Expose to Browser")
```
SUPABASE_URL = <your-supabase-project-url>
SUPABASE_SERVICE_ROLE_KEY = <your-service-role-key>
SUPABASE_ANON_KEY = <your-anon-key>
STRIPE_SECRET_KEY = <your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET = <your-stripe-webhook-secret>
STRIPE_PRO_PRICE_ID = <your-price-id-from-stripe>
SECRET_SALT = gf-777ace
```

**How to add:**
1. Go to Project Settings
2. Click "Environment Variables"
3. Add each variable with scope: "Production", "Preview", "Development"
4. Leave "Expose to Browser" unchecked for all above

### Public Variables (NEXT_PUBLIC)
```
NEXT_PUBLIC_APP_URL = https://www.grantfounders.com
```

**How to add:**
1. Same location as above
2. Name must start with `NEXT_PUBLIC_`
3. Vercel automatically exposes to browser
4. Check all scopes: Production, Preview, Development

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
```bash
cd web

# Install dependencies
npm install

# Set local env vars
cp .env.example .env.local  # Create if needed

# Build for production
npm run build

# Start production server
npm start
```

Test endpoints:
```bash
# Test ACE Score endpoint
curl -X POST http://localhost:3000/api/ace/score \
  -H "Authorization: Bearer test-key" \
  -H "Content-Type: application/json" \
  -d '{"project_name":"Test","sector":"gov","budget":1000000,"duration_months":12,"beneficiaries":1000,"esg_score":75,"risk_index":30,"execution_capacity":80,"scalability":70,"strategic_value":85,"compliance_score":90,"expected_roi":15}'

# Test Auth endpoint
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","action":"signup"}'

# Test Stripe Checkout
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com"}'
```

### Git Status
```bash
cd grantfounders
git status  # Should show "working tree clean"
git log --oneline -5  # Verify recent commits
```

---

## 🚀 DEPLOYMENT PROCESS

### Step 1: Connect Repository
- [ ] Vercel dashboard → "Import Project"
- [ ] Select GitHub repo: `pedroviveiros2025/grantfounders`
- [ ] Select branch: `main`
- [ ] Root directory: `web`

### Step 2: Configure Environment
- [ ] Add all env vars from section above
- [ ] Verify production values (not test/dev keys)

### Step 3: Deploy
- [ ] Click "Deploy"
- [ ] Monitor build logs for errors
- [ ] Wait for "Deployment Complete" status

### Step 4: Verify Production
- [ ] Visit `https://www.grantfounders.com`
- [ ] Check API routes respond (Vercel logs)
- [ ] Test Stripe webhook is reaching your endpoint

---

## 📊 POST-DEPLOYMENT VERIFICATION

### Logs & Monitoring
- [ ] Vercel Dashboard → Deployments → View logs
- [ ] Check for any errors in build or runtime
- [ ] Monitor "Function" tab for API route performance

### API Health
```bash
# Test each endpoint
curl https://www.grantfounders.com/api/ace/score -X OPTIONS  # Should return 204
curl https://www.grantfounders.com/api/auth -X POST ...
curl https://www.grantfounders.com/api/stripe/webhook -X POST ...  # Should require signature
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
1. Check Node version in Vercel matches local
2. Run `npm run build` locally to reproduce
3. Check env vars are set in Vercel settings
4. Review build logs in Vercel dashboard

### API Routes Return 500
1. Check Vercel function logs: Deployments → Logs
2. Verify env vars are present and correct
3. Test locally: `npm run dev` then curl
4. Check Supabase credentials are valid

### Stripe Webhook Not Firing
1. Verify endpoint URL in Stripe dashboard
2. Check webhook secret is correct in Vercel env var
3. Test with Stripe CLI locally first
4. Monitor webhook delivery status in Stripe dashboard

### CORS Errors
1. Verify CORS headers in `/api/ace/score` route
2. Check `Access-Control-Allow-Origin` matches your domain
3. Test with curl `-H "Origin: https://www.grantfounders.com"`

---

## 📞 SUPPORT RESOURCES

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs/api
- **Vercel Status:** https://www.vercel-status.com/

---

## ✅ FINAL CHECKLIST

- [ ] All environment variables set in Vercel
- [ ] Root directory configured as `web`
- [ ] Stripe webhook endpoint configured
- [ ] Build succeeds locally
- [ ] All API routes tested locally
- [ ] Git history is clean
- [ ] Ready to deploy

**Status:** Ready for production deployment ✅

# ✅ Pre-Deployment Checklist for Vercel

Use this checklist before deploying to Vercel to ensure everything is properly configured.

## 📋 Repository Configuration

- [ ] All code changes committed to git
- [ ] Latest changes pushed to GitHub
- [ ] Branch is up to date with main/production branch
- [ ] No uncommitted changes in working directory
- [ ] `.gitignore` properly configured (excludes `.env*` files)

## 🔧 Project Structure

Run `npm run verify-deployment` from the `web` directory. All checks should pass:

- [ ] Root `vercel.json` exists and references `web` directory
- [ ] `.vercelignore` exists and excludes non-web files
- [ ] No `package-lock.json` at repository root
- [ ] `web/package.json` exists with all required scripts
- [ ] `web/package-lock.json` exists
- [ ] `web/next.config.ts` configured
- [ ] `web/vercel.json` exists
- [ ] All API routes present (`health`, `ace/score`, `auth`, `stripe/*`)
- [ ] All required source files present

## 🔐 Environment Variables

- [ ] Environment variables documented (use `.env.example` as template)
- [ ] Supabase credentials ready:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Security keys generated:
  - [ ] `JWT_SECRET` (32+ characters)
  - [ ] `GF_SECRET_KEY`
- [ ] Application config ready:
  - [ ] `NEXT_PUBLIC_APP_VERSION`
  - [ ] `NEXT_PUBLIC_ENVIRONMENT=production`
- [ ] Stripe config (if needed):
  - [ ] `ENABLE_STRIPE` set to `true` or `false`
  - [ ] If `true`, all Stripe keys ready (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, etc.)

## 🗄️ Database

- [ ] Supabase project created
- [ ] Database schema deployed (from `supabase_schema.sql`)
- [ ] Required tables exist:
  - [ ] `organizations`
  - [ ] `api_keys`
  - [ ] `subscriptions`
  - [ ] `ace_scores`
  - [ ] `api_usage_log`
- [ ] RPC functions deployed
- [ ] Row Level Security (RLS) policies configured
- [ ] Database connection tested

## 💳 Stripe Configuration (If Applicable)

- [ ] Stripe account created
- [ ] Test mode keys obtained for development
- [ ] Production keys obtained for production
- [ ] Price IDs created:
  - [ ] Pro tier price ID
  - [ ] Enterprise tier price ID
- [ ] Webhook endpoint will be configured after first deployment

## 🚀 Vercel Project Setup

- [ ] Vercel account created
- [ ] GitHub account connected to Vercel
- [ ] Repository access granted to Vercel

### Vercel Project Settings

- [ ] **Framework Preset**: Next.js
- [ ] **Root Directory**: `web` ⚠️ **CRITICAL - Must be set!**
- [ ] **Build Command**: `npm run build` (auto-detected)
- [ ] **Output Directory**: `.next` (auto-detected)
- [ ] **Install Command**: `npm ci`
- [ ] **Node.js Version**: 20.x or higher

### Vercel Environment Variables

Add all environment variables in Vercel Project Settings:

- [ ] All variables added to Vercel
- [ ] Variables set for all environments:
  - [ ] Production ✅
  - [ ] Preview ✅
  - [ ] Development ✅
- [ ] No sensitive data hardcoded in source code
- [ ] `.env.local` not committed to git

## 🧪 Local Testing

Before deploying, test locally:

- [ ] Dependencies installed: `npm ci`
- [ ] Environment check passes: `npm run check-env`
- [ ] Deployment verification passes: `npm run verify-deployment`
- [ ] Local build succeeds: `npm run build`
- [ ] Dev server runs: `npm run dev`
- [ ] Health endpoint works: `curl http://localhost:3000/api/health`
- [ ] No TypeScript errors
- [ ] No ESLint errors (critical only)

## 📦 First Deployment

- [ ] Clicked "Deploy" in Vercel
- [ ] Build logs reviewed for errors
- [ ] Build succeeded
- [ ] Preview URL generated
- [ ] Preview URL tested:
  - [ ] Homepage loads
  - [ ] Health endpoint returns 200
  - [ ] API routes respond correctly
  - [ ] No console errors in browser

## 🔍 Post-Deployment Verification

- [ ] Run smoke tests: `npm run smoke-test <preview-url> <api-key>`
- [ ] All smoke tests pass
- [ ] Check Vercel Functions logs for errors
- [ ] Test CORS headers on API routes
- [ ] Verify environment variables are loaded correctly

## 🌐 Custom Domain (Optional)

If using a custom domain:

- [ ] Domain ownership verified
- [ ] DNS provider access available
- [ ] Old domain detached from previous project (if applicable)
- [ ] New domain added to Vercel project
- [ ] DNS records configured:
  - [ ] A record for `@` pointing to `76.76.21.21`
  - [ ] CNAME record for `www` pointing to `cname.vercel-dns.com`
- [ ] DNS propagation complete (check with `nslookup`)
- [ ] SSL certificate issued by Vercel
- [ ] HTTPS works on custom domain
- [ ] Redirect from apex to www configured (or vice versa)

## 🪝 Stripe Webhook (If Using Stripe)

Only if `ENABLE_STRIPE=true`:

- [ ] Production URL confirmed
- [ ] Stripe webhook endpoint created:
  - [ ] Endpoint URL: `https://your-domain.com/api/stripe/webhook`
  - [ ] Events: `checkout.session.completed`
- [ ] Webhook signing secret obtained
- [ ] `STRIPE_WEBHOOK_SECRET` environment variable updated in Vercel
- [ ] Project redeployed after webhook config
- [ ] Webhook tested with Stripe CLI or test payment

## 📊 Final Production Tests

- [ ] Production URL accessible
- [ ] Health check works: `curl https://your-domain.com/api/health`
- [ ] Homepage renders correctly
- [ ] API authentication works
- [ ] ACE scoring endpoint works
- [ ] Rate limiting works
- [ ] Error handling works (test invalid requests)
- [ ] CORS headers present
- [ ] No secrets exposed in client-side code
- [ ] Browser console has no errors
- [ ] Mobile responsive (if applicable)

## 📚 Documentation

- [ ] Deployment documented for team
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide available
- [ ] Runbook created for maintenance

## 🔒 Security

- [ ] All secrets stored in environment variables
- [ ] No `.env` files committed to git
- [ ] API keys rotated from defaults
- [ ] JWT secret is strong (32+ random characters)
- [ ] CORS configured appropriately
- [ ] Rate limiting enabled
- [ ] Input validation active (Zod schemas)
- [ ] SQL injection protection (using Supabase client)
- [ ] Authentication required on protected routes

## 📈 Monitoring

- [ ] Vercel Analytics enabled (optional)
- [ ] Error tracking configured (optional)
- [ ] Uptime monitoring set up (optional)
- [ ] Health check endpoint available for monitoring
- [ ] Log retention configured

## ✅ Final Sign-Off

- [ ] All critical checklist items completed
- [ ] Team/stakeholders notified
- [ ] Documentation updated with live URLs
- [ ] Backup/rollback plan in place
- [ ] Support contacts documented

---

## 🆘 Troubleshooting

If any item fails, refer to:
- `VERCEL_QUICK_START.md` - Quick deployment guide
- `DEPLOYMENT_RUNBOOK.md` - Comprehensive troubleshooting
- `VERCEL_SETUP_GUIDE.md` - Detailed Vercel configuration
- Vercel dashboard → Deployments → [latest] → Logs

---

**Last Updated**: 2025-12-31  
**Version**: 1.0.0  

## ✨ Ready to Deploy!

If all items are checked, you're ready to deploy GrantFounders to Vercel! 🚀

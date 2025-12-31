# GrantFounders™ Web Application

This is the web application for GrantFounders, built with [Next.js](https://nextjs.org) 16.1.1 and TypeScript.

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Supabase account (for backend services)
- Stripe account (optional, for billing features)

### Installation

1. **Install dependencies:**
   ```bash
   npm ci
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit .env.local with your actual values
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## 📋 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle (includes env validation)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run check-env` - Validate environment variables
- `node scripts/verify-deployment.js` - Verify deployment configuration
- `node scripts/smoke-test.js <URL> <API_KEY>` - Run API smoke tests

## 🏗️ Project Structure

```
web/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── ace/score/    # ACE scoring endpoint
│   │   ├── auth/         # Authentication
│   │   ├── health/       # Health check
│   │   └── stripe/       # Stripe integration
│   ├── dashboard/        # Dashboard pages
│   ├── pricing/          # Pricing page
│   ├── projects/         # Project management
│   └── layout.tsx        # Root layout
├── src/
│   ├── components/       # React components
│   ├── config/          # Configuration files
│   ├── lib/             # Core libraries (ACE kernel, etc.)
│   ├── services/        # Service layer (Supabase, Stripe, etc.)
│   └── types/           # TypeScript type definitions
├── scripts/             # Utility scripts
└── public/              # Static assets
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

**Minimum Required:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - Secret for JWT signing (32+ chars)
- `GF_SECRET_KEY` - Master key for owner authentication
- `NEXT_PUBLIC_APP_VERSION` - Application version
- `NEXT_PUBLIC_ENVIRONMENT` - Environment (development/production)

**Optional (Stripe):**
- `ENABLE_STRIPE` - Set to "true" to enable Stripe
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `STRIPE_PRO_PRICE_ID` - Pro tier price ID
- `STRIPE_ENTERPRISE_PRICE_ID` - Enterprise tier price ID

## 🚢 Deployment

### Vercel (Recommended)

1. **Verify your setup:**
   ```bash
   node scripts/verify-deployment.js
   ```

2. **Follow the Quick Start Guide:**
   - See `/VERCEL_QUICK_START.md` in the project root
   - Or see the comprehensive guide in `DEPLOYMENT_RUNBOOK.md`

3. **Key Vercel Settings:**
   - Framework: Next.js
   - Root Directory: `web` ⚠️ **CRITICAL**
   - Build Command: `npm run build`
   - Install Command: `npm ci`
   - Node Version: 20.x

4. **Add environment variables** in Vercel dashboard

5. **Deploy!**

### Testing Deployment

After deployment, run smoke tests:

```bash
node scripts/smoke-test.js https://your-domain.com your-api-key
```

## 📚 Documentation

- **API Reference**: See `API_REFERENCE.md`
- **Deployment Guide**: See `/VERCEL_QUICK_START.md`
- **Full Runbook**: See `/DEPLOYMENT_RUNBOOK.md`
- **Vercel Setup**: See `VERCEL_SETUP_GUIDE.md`

## 🧪 Testing

Health check endpoint:
```bash
curl http://localhost:3000/api/health
```

ACE scoring endpoint:
```bash
curl -X POST http://localhost:3000/api/ace/score \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "project_name": "Test Project",
    "sector": "gov",
    "budget": 100000,
    "duration_months": 12,
    "beneficiaries": 1000,
    "esg_score": 75,
    "risk_index": 25,
    "execution_capacity": 80,
    "scalability": 70,
    "strategic_value": 85,
    "compliance_score": 90,
    "expected_roi": 15
  }'
```

## 🔧 Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Custom API Keys
- **Payments**: Stripe (optional)
- **Validation**: Zod
- **Charts**: Recharts
- **Icons**: Lucide React

## 📞 Support

For issues or questions:
- Check the troubleshooting section in `DEPLOYMENT_RUNBOOK.md`
- Review API documentation in `API_REFERENCE.md`
- Check Vercel deployment logs for errors

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-12-31

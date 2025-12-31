# GrantFounders™

Federal funding intelligence platform powered by the GF-777ACE kernel.

## 🚀 Quick Links

- **[Deployment Quick Start](VERCEL_QUICK_START.md)** - Fast-track Vercel deployment guide
- **[Pre-Deployment Checklist](PRE_DEPLOYMENT_CHECKLIST.md)** - Complete deployment validation
- **[Deployment Runbook](DEPLOYMENT_RUNBOOK.md)** - Comprehensive deployment guide
- **[Web Application](web/README.md)** - Next.js web app documentation

## 📁 Repository Structure

```
grantfounders/
├── web/                        # Next.js web application
│   ├── app/                   # Next.js App Router
│   ├── src/                   # Source code
│   ├── scripts/               # Utility scripts
│   └── README.md              # Web app documentation
├── supabase/                   # Supabase configuration
│   ├── migrations/            # Database migrations
│   └── seed.sql               # Seed data
├── vercel.json                 # Vercel monorepo configuration
├── .vercelignore              # Vercel ignore rules
└── *.md                       # Documentation files
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 16.1.1, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Custom API Keys
- **Payments**: Stripe (optional)
- **Deployment**: Vercel

## 🚦 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Supabase account
- Vercel account (for deployment)
- Stripe account (optional, for billing)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pedroviveiros2025/grantfounders.git
   cd grantfounders
   ```

2. **Navigate to web directory:**
   ```bash
   cd web
   ```

3. **Install dependencies:**
   ```bash
   npm ci
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

### Verify Setup

Before deploying, verify your configuration:

```bash
cd web
npm run verify-deployment
```

All checks should pass. ✅

## 📦 Deployment

This is a **monorepo** configured for Vercel deployment.

### Important Vercel Settings

- **Root Directory**: `web` ⚠️ **CRITICAL**
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Install Command**: `npm ci`
- **Node Version**: 20.x

### Deploy to Vercel

1. **Read the Quick Start Guide:**
   - See [VERCEL_QUICK_START.md](VERCEL_QUICK_START.md)

2. **Verify your setup:**
   ```bash
   cd web
   npm run verify-deployment
   ```

3. **Follow the deployment steps:**
   - Connect to Vercel
   - Set Root Directory to `web`
   - Add environment variables
   - Deploy!

## 📚 Documentation

- **[VERCEL_QUICK_START.md](VERCEL_QUICK_START.md)** - Fast deployment guide
- **[PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)** - Pre-deployment validation
- **[DEPLOYMENT_RUNBOOK.md](DEPLOYMENT_RUNBOOK.md)** - Complete deployment runbook
- **[web/VERCEL_SETUP_GUIDE.md](web/VERCEL_SETUP_GUIDE.md)** - Detailed Vercel configuration
- **[web/API_REFERENCE.md](web/API_REFERENCE.md)** - API documentation
- **[web/README.md](web/README.md)** - Web application documentation

## 🧪 Testing

### Local Testing

```bash
cd web

# Check environment variables
npm run check-env

# Verify deployment configuration
npm run verify-deployment

# Run development server
npm run dev

# Build production bundle
npm run build
```

### API Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Run smoke tests (requires API key)
npm run smoke-test http://localhost:3000 your-api-key
```

## 🔒 Security

- All secrets stored in environment variables
- No `.env` files committed to git
- API key authentication required
- Rate limiting enabled
- Input validation with Zod
- CORS configured on all API routes

## 🆘 Support

- Check documentation in the repository
- Review Vercel deployment logs
- See troubleshooting in [DEPLOYMENT_RUNBOOK.md](DEPLOYMENT_RUNBOOK.md)

## 📄 License

Proprietary - GrantFounders™

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2025-12-31

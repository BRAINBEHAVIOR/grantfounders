# GrantFounders™
Federal Funding Intelligence Platform (GF-777ACE / DIOS)

## 📚 Documentation

- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - ⚡ Fast lookup guide with tables and quick examples
- **[AGENTS_OVERVIEW.md](./AGENTS_OVERVIEW.md)** - 📖 Comprehensive guide to all implemented features and intelligent agents (English)
- **[AGENTES_RESUMO.md](./AGENTES_RESUMO.md)** - 📖 Guia completo de todas as funcionalidades e agentes inteligentes (Português)
- **[DEPLOYMENT_RUNBOOK.md](./DEPLOYMENT_RUNBOOK.md)** - 🚀 Production deployment guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - ✅ Implementation status and changes

## 🎯 What is GrantFounders?

GrantFounders is an advanced AI-powered platform for federal funding intelligence. It uses behavioral analysis, predictive forecasting, and multi-agent AI to help organizations:

- **Evaluate grant readiness** with the GF-777ACE scoring algorithm
- **Match projects** with federal funding opportunities
- **Forecast funding outcomes** using historical data and agency DNA
- **Automate applications** with intelligent agents
- **Track compliance** with federal regulations

## 🤖 Intelligent Agents

The platform includes 8 specialized agents/systems:

1. **Core Database Schema** - Multi-tenant foundation with 81 tables
2. **Serverless API Layer** - Production-grade API with rate limiting
3. **Demo Chatbot Interface** - Interactive decision engine demo
4. **Federal Grant Readiness Terminal** - Main evaluation interface
5. **GrantFounders OS™** - Multi-agent cognitive system
6. **Federal FOA Harvester** - Autonomous opportunity ingestion
7. **Match & Forecast Engine** - Predictive intelligence core
8. **Agency DNA Builder** - Behavioral profiling system

See [AGENTS_OVERVIEW.md](./AGENTS_OVERVIEW.md) for detailed documentation of each agent.

## 🚀 Quick Start

```bash
# Navigate to web directory
cd web

# Install dependencies
npm ci

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev

# Visit http://localhost:3000
```

## 📡 API Access

```typescript
// Evaluate a project
const response = await fetch('https://www.grantfounders.com/api/ace/score', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    project_name: "AI Climate Monitor",
    sector: "gov",
    budget: 750000,
    duration_months: 24,
    // ... other parameters
  })
});
```

See [web/API_REFERENCE.md](./web/API_REFERENCE.md) for complete API documentation.

## 🏗️ Architecture

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **AI/ML:** GPT-4, pgvector, custom ML models
- **Deployment:** Vercel (serverless)

## 📞 Support

- **Documentation:** [AGENTS_OVERVIEW.md](./AGENTS_OVERVIEW.md)
- **API Reference:** [web/API_REFERENCE.md](./web/API_REFERENCE.md)
- **Issues:** https://github.com/pedroviveiros2025/grantfounders/issues

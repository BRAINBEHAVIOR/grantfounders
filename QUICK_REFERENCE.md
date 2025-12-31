# GrantFounders™ Quick Reference
## Fast lookup guide for all agents and features

**Last Updated:** December 31, 2025

---

## 📊 Agents Summary Table

| # | Agent/Feature | Status | Lines | Purpose | Key Tables |
|---|---------------|--------|-------|---------|------------|
| 1 | **Core Database Schema** | ✅ Completed | +4,214 | Multi-tenant foundation with RLS, audit logging, and compliance tracking | `organizations`, `gf_decisions`, `audit_logs`, `api_keys` (81 tables total) |
| 2 | **Serverless API Layer** | ✅ Completed | +778 | Production API with auth, validation, CORS, rate limiting | N/A (API routes) |
| 3 | **Demo Chatbot Interface** | ✅ Completed | +759 | Interactive demo of decision engine | N/A (UI component) |
| 4 | **Federal Grant Readiness Terminal** | ✅ Completed | +7,162 | Main evaluation interface with ACE scoring | `gf_assessment_inputs`, `gf_decisions` |
| 5 | **GrantFounders OS™** | ✅ Completed | +6,567 | Multi-agent cognitive system orchestrating specialized AI agents | `ai_models`, `ai_routes`, `ai_usage_events` |
| 6 | **Federal FOA Harvester** | ✅ Completed | +3,806 | Autonomous data ingestion from federal sources | `foas`, `funding_opportunities`, `grant_chunks` |
| 7 | **Agency DNA Builder** | 🔴 Cancelled | +3,593 | Behavioral profiling (integrated into other components) | `agency_market_dna`, `agency_dna_snapshots` |
| 8 | **Match & Forecast Engine** | ✅ Completed | +5,712 | Predictive matching and funding forecasting | `project_grant_matches`, `funding_forecasts`, `funding_signals` |

**Total Lines Changed:** ~32,671 additions across all completed PRs

---

## 🎯 Quick Function Reference

### Core API Endpoints

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/health` | GET | No | System health check |
| `/api/ace/score` | POST | Yes | Evaluate project and get ACE score |
| `/api/auth` | POST | No | User signup/signin |
| `/api/stripe/checkout` | POST | No | Create payment checkout session |
| `/api/stripe/webhook` | POST | No (webhook) | Process Stripe events |

### Key Database Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `verify_api_key(key)` | Validate API key | Organization context |
| `create_api_key(org_id, name)` | Generate new API key | API key string |
| `match_opportunities(embedding, count)` | Find matching FOAs | Array of opportunities |
| `match_grant_chunks(opp_id, embedding, count)` | Semantic chunk search | Array of text segments |
| `can_run_autopilot(org_id)` | Check autopilot quota | Boolean |
| `gf_autopilot_generate(top_n)` | Generate autopilot plans | Void (inserts plans) |

---

## 📋 ACE Algorithm Quick Reference

### Input Parameters (13 total)

1. `project_name` - String identifier
2. `sector` - Enum: gov|health|bank|fund
3. `budget` - Number (USD)
4. `duration_months` - Number
5. `beneficiaries` - Number
6. `esg_score` - Number (0-100)
7. `risk_index` - Number (0-100)
8. `execution_capacity` - Number (0-100)
9. `scalability` - Number (0-100)
10. `strategic_value` - Number (0-100)
11. `compliance_score` - Number (0-100)
12. `expected_roi` - Number (percentage)

### Feature Weights

- **Efficiency** (25%) - Budget, ROI, execution
- **Governance** (25%) - Compliance, risk
- **Sustainability** (20%) - Duration, scalability
- **Impact** (20%) - Beneficiaries, ESG, strategic value
- **Resilience** (10%) - Risk mitigation, execution

### Decision Tiers

| Tier | Score Range | Decision | Meaning |
|------|-------------|----------|---------|
| AAA | 85-100 | AUTO_APPROVED | Highest confidence |
| A | 70-84 | REVIEW_REQUIRED | Strong candidate |
| B | 55-69 | CONDITIONAL_APPROVAL | Needs modification |
| C | 0-54 | BLOCKED | Does not meet criteria |

---

## 🗄️ Key Database Tables

### Multi-Tenancy & Auth
- `organizations` - Tenant entities
- `org_users` - User memberships
- `org_subscriptions` - Billing/plans
- `api_keys` - API authentication

### Decision Intelligence
- `gf_assessment_inputs` - Project data
- `gf_decisions` - ACE scores and decisions
- `audit_logs` - Complete audit trail
- `usage_events` - API usage tracking

### Federal Opportunities
- `foas` - Federal opportunity announcements
- `funding_opportunities` - Extended metadata
- `grant_chunks` - Text segments with embeddings
- `funding_signals` - Extracted signals

### Matching & Forecasting
- `project_grant_matches` - Match results with scores
- `funding_forecasts` - Predictive analytics
- `funding_prediction_models` - ML model artifacts

### Agency Intelligence
- `agency_market_dna` - Behavioral profiles
- `agency_dna_snapshots` - Historical DNA
- `agency_award_events` - Historical awards
- `agency_domain_weights` - Sector preferences

### Multi-Agent System
- `ai_models` - Model configurations
- `ai_routes` - Model routing rules
- `ai_usage_events` - Token tracking
- `autopilot_plans` - Generated action plans
- `autopilot_tasks` - Specific tasks

### Compliance
- `compliance_firewall_rules` - Validation rules
- `compliance_items` - Specific requirements
- `federal_hidden_taxonomy` - Federal knowledge base

---

## 🔑 Authentication Methods

### Method 1: API Key (Production)
```http
Authorization: Bearer gf_key_abc123xyz
```
- Used by client applications
- Rate limited: 120 req/min
- Generated via Stripe checkout
- Usage tracked per organization

### Method 2: Owner Secret (Admin)
```http
x-gf-secret: your-gf-secret-key
```
- Server-to-server only
- Bypasses API key verification
- No rate limits
- Usage NOT logged to database

---

## 🚀 Common Usage Patterns

### Evaluate a Project
```typescript
const result = await fetch('/api/ace/score', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    project_name: "Climate AI",
    sector: "gov",
    budget: 750000,
    // ... other params
  })
});
// Returns: { ace_score, tier, decision, kernel, rationale }
```

### Find Matching Opportunities
```sql
SELECT * FROM match_opportunities(
  query_embedding := project_vector,
  match_count := 20
)
ORDER BY score DESC;
```

### Check Agency DNA
```sql
SELECT 
  hot_verticals,
  funding_language_profile,
  innovation_appetite_index
FROM agency_market_dna
WHERE agency_code = 'DOD';
```

### Generate Autopilot Plan
```sql
-- First check if org can run autopilot
SELECT can_run_autopilot('org-uuid');

-- Then generate plan
SELECT gf_autopilot_generate(top_n := 3);
```

---

## 📊 Matching Algorithm Breakdown

### Component Weights

1. **Semantic Matching** (40%) - Vector similarity
2. **Agency DNA Matching** (30%) - Behavioral alignment
3. **Compliance Matching** (20%) - Requirements fit
4. **Budget Alignment** (10%) - Financial fit

### Match Score Components

- `gf_rank` (0-100) - Overall match quality
- `approval_score` (0-100) - Predicted approval probability
- `funding_forecast` ($) - Estimated award amount
- `match_metadata` (JSONB) - Detailed breakdown

---

## 🔍 Data Sources

### Federal Opportunity Sources
1. **Grants.gov API** - Primary grant source
2. **SAM.gov** - Federal contracting
3. **SBIR.gov** - Small business programs
4. **Agency portals** - Direct feeds

### Harvest Schedule
- **Frequency:** Every 6 hours
- **Change Detection:** Only new/updated FOAs
- **Error Handling:** Exponential backoff retry
- **Notifications:** High-value opportunity alerts

---

## 🏗️ Technology Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Server Components

### Backend
- Supabase (PostgreSQL 15)
- pgvector (semantic search)
- Next.js API Routes
- Edge Functions

### AI/ML
- OpenAI GPT-4
- Custom ML models
- Vector embeddings
- Pattern recognition

### Infrastructure
- Vercel (deployment)
- Stripe (payments)
- GitHub (version control)
- Supabase (database + auth)

---

## 📞 Support & Resources

### Documentation Files
- `AGENTS_OVERVIEW.md` - Detailed English guide
- `AGENTES_RESUMO.md` - Guia detalhado em Português
- `DEPLOYMENT_RUNBOOK.md` - Production deployment
- `web/API_REFERENCE.md` - Complete API docs
- `IMPLEMENTATION_SUMMARY.md` - Implementation status

### External Links
- **Repository:** https://github.com/pedroviveiros2025/grantfounders
- **Production:** https://www.grantfounders.com
- **API:** https://www.grantfounders.com/api
- **Health Check:** https://www.grantfounders.com/api/health

---

## 🎓 Learning Path

**For New Users:**
1. Read this Quick Reference
2. Try the demo at `/dashboard`
3. Review `AGENTS_OVERVIEW.md` for details
4. Test API with `/api/health`
5. Evaluate a sample project

**For Developers:**
1. Clone repository
2. Read `DEPLOYMENT_RUNBOOK.md`
3. Set up local environment
4. Review `web/API_REFERENCE.md`
5. Build integration

**For Administrators:**
1. Review `IMPLEMENTATION_SUMMARY.md`
2. Understand multi-tenant architecture
3. Configure RLS policies
4. Set up monitoring
5. Review audit logs

---

**Version:** 1.0.0  
**Kernel:** GF-777ACE-Quantum-v3.0  
**Last Updated:** December 31, 2025

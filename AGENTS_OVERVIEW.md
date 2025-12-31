# GrantFounders™ Agents Overview
## Comprehensive Guide to All Implemented Features and Intelligent Agents

**Repository:** https://github.com/pedroviveiros2025/grantfounders  
**Platform:** GrantFounders™ Federal Funding Intelligence  
**Version:** GF-777ACE-Quantum-v3.0  
**Last Updated:** December 31, 2025

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Core Database Schema with Multi-Tenant Isolation](#1-core-database-schema-with-multi-tenant-isolation)
3. [Serverless API Layer](#2-serverless-api-layer-over-supabase)
4. [Demo Chatbot Interface](#3-demo-chatbot-interface-for-decision-engine-api)
5. [Federal Grant Readiness Decision Terminal](#4-federal-grant-readiness-decision-terminal)
6. [GrantFounders OS™ Multi-Agent System](#5-grantfounders-os-multi-agent-cognitive-system)
7. [Federal FOA Harvester Agent](#6-federal-foa-harvester-agent)
8. [Match & Forecast Engine](#7-match--forecast-engine)
9. [Agency DNA Builder](#8-agency-dna-builder)
10. [System Architecture](#system-architecture)
11. [Integration & Usage](#integration--usage)

---

## Introduction

GrantFounders™ is an advanced **Federal Funding Intelligence Platform** that uses artificial intelligence and behavioral analysis to predict funding outcomes, match projects with opportunities, and automate grant application processes. The platform consists of multiple specialized agents and systems that work together to provide comprehensive funding intelligence.

This document explains each component implemented in the platform, based on the completed pull requests and issues.

---

## 1. Core Database Schema with Multi-Tenant Isolation

**PR #1** | **Status:** ✅ Completed | **Lines Changed:** +4,214 -3

### What It Does

The foundation of the entire GrantFounders platform. This implements a sophisticated PostgreSQL database schema with **81 tables** designed for:

- **Multi-tenant architecture** with Row-Level Security (RLS)
- **Decision traceability** - every action is logged and auditable
- **Compliance tracking** - ensures all operations meet federal standards
- **Data sovereignty** - each organization's data is completely isolated

### Key Components

#### Organizations & Multi-Tenancy
- `organizations` - Core tenant entities
- `org_users` - User memberships with role-based access
- `org_subscriptions` - Subscription and billing management
- `api_keys` - Secure API key generation and validation

#### Decision Intelligence Tables
- `gf_assessment_inputs` - Raw project data for evaluation
- `gf_decisions` - Final scoring and approval decisions
- `audit_logs` - Complete audit trail of all operations
- `usage_events` - API usage tracking per organization

#### Compliance & Security
- `compliance_firewall_rules` - Automated compliance checking
- `compliance_items` - Specific compliance requirements
- `federal_hidden_taxonomy` - Federal contracting knowledge base

### Security Features

1. **Row-Level Security (RLS)** - Automatic data isolation per tenant
2. **Audit Logging** - Every database change is tracked
3. **API Key Authentication** - Secure token-based access
4. **Role-Based Permissions** - Owner, admin, member, and viewer roles

### Database Functions

- `verify_api_key(key)` - Validates API keys and returns organization context
- `create_api_key(org_id, name)` - Generates secure API keys
- `current_org_id()` - Returns the current user's organization
- `can_run_autopilot(org_id)` - Checks subscription limits

---

## 2. Serverless API Layer Over Supabase

**PR #2** | **Status:** ✅ Completed | **Lines Changed:** +778 -3

### What It Does

A thin, **production-grade API layer** built on Next.js API routes that sits between client applications and the Supabase backend. This layer provides:

- **Authentication & Authorization** - Validates API keys and enforces access control
- **Request Validation** - Uses Zod schemas to ensure data integrity
- **Rate Limiting** - Protects against abuse (120 req/min per key)
- **CORS Support** - Enables cross-origin requests from web applications
- **Standardized Responses** - Consistent error handling and response format

### API Endpoints

#### `/api/health` - Health Check
Returns system status and version information.

```json
{
  "ok": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "kernel": "GF-777ACE-Quantum-v3.0",
    "environment": "production"
  }
}
```

#### `/api/ace/score` - ACE Scoring Engine
Evaluates projects using the GF-777ACE algorithm.

**Input:** Project parameters (budget, sector, ESG scores, etc.)  
**Output:** ACE score (0-100), tier (AAA/A/B/C), and decision (AUTO_APPROVED/REVIEW_REQUIRED/etc.)

#### `/api/auth` - User Authentication
Handles user signup and signin using Supabase Auth.

#### `/api/stripe/checkout` - Payment Processing
Creates Stripe checkout sessions for subscriptions.

#### `/api/stripe/webhook` - Stripe Events
Receives webhook events from Stripe and creates API keys for new customers.

### Key Features

- **Dual Authentication:** Supports both API keys (for clients) and owner secrets (for admin)
- **Zod Validation:** Type-safe request validation with detailed error messages
- **Error Standardization:** All errors follow `{ ok: false, error: { code, message } }` format
- **CORS Headers:** All routes support preflight OPTIONS requests

---

## 3. Demo Chatbot Interface for Decision Engine API

**PR #3** | **Status:** ✅ Completed | **Lines Changed:** +759 -3

### What It Does

An **interactive demo interface** that showcases the Decision Engine's capabilities through a conversational UI. This allows users to:

- Test the ACE scoring engine in real-time
- Understand how different project parameters affect scores
- Visualize decision logic and tier classifications
- Experience the API without writing code

### Features

- **Real-time Scoring** - Instant feedback as parameters change
- **Visual Decision Tree** - Shows how the score translates to approval decisions
- **Parameter Sliders** - Intuitive controls for all 13 input parameters
- **Score Breakdown** - Displays weighted contributions of each factor
- **Export Capability** - Can generate shareable reports

### Use Cases

1. **Sales Demos** - Show potential customers how the system works
2. **User Onboarding** - Help new users understand the scoring methodology
3. **API Testing** - Validate API functionality without Postman
4. **Educational Tool** - Teach teams about funding decision criteria

---

## 4. Federal Grant Readiness Decision Terminal

**PR #4** | **Status:** ✅ Completed | **Lines Changed:** +7,162

### What It Does

A **production-grade institutional decision terminal** that serves as the primary interface for evaluating federal grant readiness. This is the **core decision-making interface** of GrantFounders.

### Components

#### Project Evaluation Interface (`/projects/evaluate`)
- Comprehensive form for entering project details
- Real-time validation and guidance
- Instant ACE score calculation
- Decision recommendation with rationale

#### Dashboard (`/dashboard`)
- Organization overview and metrics
- Recent evaluations and history
- API usage statistics
- Subscription and billing status

#### Pricing Page (`/pricing`)
- Tiered subscription plans
- Feature comparison matrix
- Stripe integration for checkout

### The ACE Algorithm (GF-777ACE-Quantum-v3.0)

The **Alignment, Compliance, and Efficiency** scoring kernel that powers the decision engine:

#### Input Parameters (13 total):
1. `project_name` - Project identifier
2. `sector` - gov/health/bank/fund
3. `budget` - Total project budget (USD)
4. `duration_months` - Project timeline
5. `beneficiaries` - Number of people impacted
6. `esg_score` - Environmental, Social, Governance score (0-100)
7. `risk_index` - Risk assessment (0-100)
8. `execution_capacity` - Team's ability to deliver (0-100)
9. `scalability` - Growth potential (0-100)
10. `strategic_value` - Alignment with strategic goals (0-100)
11. `compliance_score` - Regulatory compliance (0-100)
12. `expected_roi` - Return on investment (%)

#### Feature Extraction:
The algorithm extracts 5 key features:
- **Efficiency** (25% weight) - Budget utilization, ROI, execution capacity
- **Governance** (25% weight) - Compliance score, risk index
- **Sustainability** (20% weight) - Project duration, scalability
- **Impact** (20% weight) - Beneficiaries, strategic value, ESG
- **Resilience** (10% weight) - Risk mitigation, execution capacity

#### Decision Tiers:
- **AAA** (85-100): AUTO_APPROVED - Highest confidence, immediate approval
- **A** (70-84): REVIEW_REQUIRED - Strong candidate, needs expert review
- **B** (55-69): CONDITIONAL_APPROVAL - Possible with modifications
- **C** (0-54): BLOCKED - Does not meet minimum criteria

---

## 5. GrantFounders OS™ Multi-Agent Cognitive System

**PR #5** | **Status:** ✅ Completed | **Lines Changed:** +6,567 -3

### What It Does

The **brain** of GrantFounders - a sophisticated multi-agent system that orchestrates multiple AI agents to provide comprehensive funding intelligence. Think of it as an "operating system" for federal funding decisions.

### Agent Architecture

#### 1. **Compliance Firewall Agent**
- **Function:** Validates proposals against federal regulations
- **Data Source:** `compliance_firewall_rules` table
- **Output:** Pass/fail with specific violation details

#### 2. **Language Optimization Agent**
- **Function:** Analyzes and optimizes proposal language
- **Data Source:** `dod_prompt_templates` table
- **Output:** Suggestions for agency-specific terminology

#### 3. **Budget Forecasting Agent**
- **Function:** Predicts likely funding amounts
- **Data Source:** Historical award data in `agency_award_events`
- **Output:** Funding range with confidence intervals

#### 4. **Risk Assessment Agent**
- **Function:** Identifies execution and compliance risks
- **Data Source:** Project parameters + historical patterns
- **Output:** Risk score with mitigation recommendations

#### 5. **Timeline Optimizer Agent**
- **Function:** Suggests optimal project durations
- **Data Source:** Agency preferences in `agency_market_dna`
- **Output:** Recommended timeline based on agency behavior

### Agent Orchestration

The system uses a **coordinator pattern** where:
1. Input is received from user or API
2. Coordinator dispatches tasks to relevant agents
3. Each agent performs specialized analysis
4. Results are aggregated and weighted
5. Final decision is rendered with full traceability

### AI Models & Routing

- `ai_models` table - Stores model configurations (GPT-4, Claude, etc.)
- `ai_routes` table - Defines which model handles which task
- `ai_usage_events` table - Tracks token usage and costs

### Benefits

- **Parallel Processing** - Multiple agents work simultaneously
- **Specialized Expertise** - Each agent is optimized for specific tasks
- **Transparent Decisions** - Full audit trail of agent reasoning
- **Continuous Learning** - Agents improve with each evaluation

---

## 6. Federal FOA Harvester Agent

**PR #6** | **Status:** ✅ Completed | **Lines Changed:** +3,806 -3

### What It Does

An **autonomous data ingestion pipeline** that continuously harvests Federal Funding Opportunities (FOAs) from multiple sources and processes them into searchable, structured data.

### Data Sources

1. **Grants.gov API** - Primary source for federal grant opportunities
2. **SAM.gov** - Federal contracting opportunities
3. **SBIR.gov** - Small Business Innovation Research programs
4. **Agency-specific portals** - Direct feeds from federal agencies

### Harvesting Process

#### 1. **Discovery Phase**
- Scans sources every 6 hours
- Identifies new or updated FOAs
- Checks for deadline changes

#### 2. **Extraction Phase**
- Downloads full opportunity announcements
- Extracts metadata:
  - Opportunity ID
  - Title and description
  - Agency and program
  - Award amounts (min/max)
  - Deadline dates
  - Eligibility criteria
  - Required documentation

#### 3. **Processing Phase**
- **Text Chunking:** Breaks long documents into digestible segments
- **Embedding Generation:** Creates vector embeddings for semantic search
- **Taxonomy Mapping:** Links to federal program taxonomy
- **Quality Validation:** Ensures data completeness and accuracy

#### 4. **Storage Phase**
- `foas` table - Core opportunity data
- `funding_opportunities` table - Extended metadata
- `grant_chunks` table - Text segments with embeddings
- `funding_signals` table - Extracted signals (keywords, requirements)

### Database Tables

- **`foas`** - Main opportunity records
  - `opportunity_id` - Unique identifier (e.g., "HHS-2025-ACF-123")
  - `title` - Opportunity title
  - `description` - Full text description
  - `agency_code` - Federal agency (DOD, HHS, NSF, etc.)
  - `posted_date` - When it was published
  - `close_date` - Application deadline
  - `award_floor` / `award_ceiling` - Funding range
  - `summary_embedding` - Vector for semantic search

- **`grant_chunks`** - Text segments for RAG (Retrieval-Augmented Generation)
  - Links opportunity text to vector embeddings
  - Enables semantic search across entire corpus

### Semantic Search Capabilities

The harvester enables **intelligent matching** through:

```sql
-- Find opportunities similar to a project description
SELECT * FROM match_opportunities(
  query_embedding := project_description_vector,
  match_count := 20
);
```

### Automation Features

- **Scheduled Harvests** - Runs automatically every 6 hours
- **Change Detection** - Only processes new/updated opportunities
- **Error Recovery** - Retries failed harvests with exponential backoff
- **Notification System** - Alerts on new high-value opportunities

---

## 7. Match & Forecast Engine

**PR #8** | **Status:** ✅ Completed | **Lines Changed:** +5,712 -3

### What It Does

The **predictive intelligence core** that matches projects with opportunities and forecasts funding outcomes using machine learning and behavioral analysis.

### Matching Algorithm

#### 1. **Semantic Matching** (40% weight)
Uses vector embeddings to find opportunities semantically similar to the project:
- Project description → embedding vector
- Compare against all FOA embeddings using cosine similarity
- Returns top N matches with similarity scores

#### 2. **Agency DNA Matching** (30% weight)
Compares project characteristics against agency behavioral patterns:
- Analyzes past funding decisions from agency
- Matches project attributes to agency preferences
- Adjusts for agency-specific biases

#### 3. **Compliance Matching** (20% weight)
Ensures project meets opportunity requirements:
- Checks eligibility criteria
- Validates required capabilities
- Identifies missing documentation

#### 4. **Budget Alignment** (10% weight)
Ensures budget fits agency expectations:
- Compares to typical award sizes
- Adjusts for agency budget tolerance
- Flags over/under-budget risks

### Match Scoring

Each match receives:
- **GF Rank** (0-100) - Overall match quality
- **Approval Score** (0-100) - Predicted approval probability
- **Funding Forecast** ($) - Estimated award amount

Stored in `project_grant_matches` table.

### Forecasting Models

#### Historical Award Analysis
- Analyzes 100,000+ past awards from `agency_award_events`
- Identifies patterns in:
  - Award amounts by agency and program
  - Success rates by project type
  - Timeline from application to decision
  - Common rejection reasons

#### Predictive Models
- `funding_prediction_models` table stores ML model artifacts
- Models trained on:
  - Project characteristics
  - Agency behavior patterns
  - Seasonal funding trends
  - Political/economic factors

#### Forecast Components
- **Base Forecast** - Most likely award amount
- **Range** - Min and max expected amounts
- **Confidence** - Statistical confidence in prediction
- **Timing** - Expected decision and disbursement dates

Stored in `funding_forecasts` table.

### Database Tables

- **`project_grant_matches`** - Match results
  - `project_id` - The project being matched
  - `opportunity_id` - The matched FOA
  - `gf_rank` - Overall match score
  - `approval_score` - Predicted approval probability
  - `funding_forecast` - Estimated award amount
  - `match_metadata` - Detailed scoring breakdown

- **`funding_forecasts`** - Predictive analytics
  - Financial projections
  - Timeline estimates
  - Risk assessments

- **`funding_signals`** - Behavioral indicators
  - Keywords that indicate fit
  - Requirements that must be met
  - Red flags to avoid

### Usage Example

```typescript
// Match a project against all opportunities
const matches = await matchProjectToOpportunities(projectId);

// Returns array of matches sorted by GF rank:
[
  {
    opportunity_id: "DOD-2025-SBIR-456",
    gf_rank: 94.2,
    approval_score: 87.3,
    funding_forecast: 1250000,
    deadline: "2025-09-15",
    match_rationale: "Strong alignment with AI/ML focus..."
  },
  // ... more matches
]
```

---

## 8. Agency DNA Builder

**PR #7** | **Status:** 🔴 Cancelled | **Lines Changed:** +3,593 -3

### What It Does (Intended Functionality)

The **Agency DNA Builder** was designed to create **behavioral profiles** of federal agencies by analyzing their historical funding patterns, decision-making behaviors, and institutional preferences. While this PR was cancelled, similar functionality exists in the completed system.

### Implemented DNA Features (in completed PRs)

Even though PR #7 was cancelled, agency DNA capabilities were integrated into other components:

#### Agency Behavioral Profiles (`agency_market_dna` table)

Each federal agency has a comprehensive behavioral profile with:

**Funding Behavior Metrics:**
- `total_funding_usd` - Total annual funding capacity
- `avg_award_size` - Typical award amounts
- `award_velocity` - Speed of funding decisions
- `fiscal_allocation_pattern` - When they deploy capital

**Innovation & Risk Metrics:**
- `innovation_appetite_index` (0-100) - Willingness to fund novel approaches
- `risk_tolerance` (0-100) - Comfort with uncertain outcomes
- `disruption_tolerance` (0-100) - Openness to disruptive technologies

**Institutional Preferences:**
- `small_business_bias_index` (0-100) - Preference for small businesses
- `sbir_sttr_affinity` (0-100) - SBIR/STTR program engagement
- `acquisition_readiness` (0-100) - Likelihood to acquire vs. grant
- `autonomy_acceptance` (0-100) - Comfort with autonomous systems
- `digitalization_level` (0-100) - Digital transformation maturity

**Market Intelligence:**
- `hot_verticals` (JSONB array) - Currently prioritized sectors
- `underserved_domains` (JSONB array) - Areas seeking solutions
- `incumbent_vendors` (JSONB array) - Existing major contractors
- `contracting_vehicles` (JSONB array) - Preferred contract mechanisms

**Language & Communication:**
- `funding_language_profile` (TEXT) - Preferred terminology and phrasing
- `decision_making_language` (TEXT) - How they frame decisions
- `application_keywords` (JSONB array) - Keywords that signal alignment

### DNA-Driven Features

#### 1. **Language Optimization**
Uses agency DNA to suggest optimal proposal language:
```sql
SELECT funding_language_profile 
FROM agency_market_dna 
WHERE agency_code = 'DOD';
-- Returns: "mission-critical, dual-use, TRL 6+, transition-ready"
```

#### 2. **Budget Recommendations**
Suggests ideal budget based on agency patterns:
```sql
SELECT avg_award_size, award_ceiling, award_floor
FROM agency_market_dna
WHERE agency_code = 'NIH';
```

#### 3. **Timeline Optimization**
Recommends project duration based on agency preferences:
```sql
SELECT fiscal_allocation_pattern
FROM agency_market_dna
WHERE agency_code = 'NSF';
-- Returns when agency typically makes awards
```

#### 4. **Vertical Matching**
Identifies if project aligns with agency priorities:
```sql
SELECT hot_verticals, underserved_domains
FROM agency_market_dna
WHERE agency_code = 'DOE';
-- Returns: ["renewable energy", "grid modernization", "carbon capture"]
```

### DNA Snapshot System

- **`agency_dna_snapshots`** - Historical DNA records
  - Captures agency behavior over time
  - Enables trend analysis
  - Tracks shifts in priorities

- **`agency_dna_latest`** - View of current DNA
  - Always returns most recent snapshot
  - Used for real-time matching decisions

### DNA Builder Functions

Even though PR #7 was cancelled, these functions exist:

```sql
-- Get all hot verticals across agencies
SELECT * FROM all_underserved_domains();

-- Search for agencies by vertical
SELECT * FROM search_verticals('artificial intelligence');

-- Audit DNA changes
-- Automatically logged via audit_agency_market_dna() trigger
```

### Why It Matters

Agency DNA is the **secret sauce** that makes GrantFounders predictions accurate. Instead of generic matching, the system:

1. **Understands agency psychology** - What motivates their decisions
2. **Speaks their language** - Uses terminology they prefer
3. **Predicts behavior** - Knows when and how they fund
4. **Identifies opportunities** - Spots underserved areas
5. **Optimizes positioning** - Positions projects for maximum appeal

### Example: DOD vs. NIH DNA Comparison

**Department of Defense (DOD):**
```json
{
  "innovation_appetite_index": 92,
  "risk_tolerance": 85,
  "hot_verticals": ["AI/ML", "autonomous systems", "cybersecurity"],
  "funding_language_profile": "dual-use, mission-critical, TRL 6+",
  "avg_award_size": 1500000,
  "sbir_sttr_affinity": 95
}
```

**National Institutes of Health (NIH):**
```json
{
  "innovation_appetite_index": 78,
  "risk_tolerance": 65,
  "hot_verticals": ["precision medicine", "rare diseases", "clinical trials"],
  "funding_language_profile": "evidence-based, patient outcomes, clinical validation",
  "avg_award_size": 750000,
  "sbir_sttr_affinity": 72
}
```

The DNA Builder would automatically tailor proposals differently for each agency, even for similar projects.

---

## System Architecture

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Server Components

**Backend:**
- Supabase (PostgreSQL + Auth + Storage)
- Next.js API Routes (Serverless)
- Edge Functions for real-time processing

**AI/ML:**
- OpenAI GPT-4 (text analysis)
- pgvector (semantic search)
- Custom ML models (forecasting)

**Integrations:**
- Stripe (payments)
- Grants.gov API
- SAM.gov API
- SBIR.gov

### Data Flow

```
User Input → API Layer → Authentication → Validation → Decision Engine
                ↓                                           ↓
         Rate Limiting                            Multi-Agent System
                ↓                                           ↓
         Usage Tracking                         Supabase Database
                                                            ↓
                                                    Response + Audit
```

### Security Architecture

1. **API Authentication** - Bearer tokens + owner secrets
2. **Row-Level Security** - PostgreSQL RLS policies
3. **Audit Logging** - Complete traceability
4. **Encryption** - TLS in transit, encryption at rest
5. **Rate Limiting** - 120 req/min per organization
6. **Input Validation** - Zod schemas on all inputs

---

## Integration & Usage

### For Developers

**1. Get API Key:**
```bash
# Purchase subscription at https://www.grantfounders.com/pricing
# API key delivered via email after checkout
```

**2. Evaluate a Project:**
```typescript
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
    beneficiaries: 50000,
    esg_score: 85,
    risk_index: 25,
    execution_capacity: 90,
    scalability: 75,
    strategic_value: 88,
    compliance_score: 92,
    expected_roi: 18
  })
});

const result = await response.json();
console.log(result.ace_score);  // 87
console.log(result.tier);       // "AAA"
console.log(result.decision);   // "AUTO_APPROVED"
```

**3. Match Against Opportunities:**
```sql
-- Direct SQL query (for advanced users with database access)
SELECT * FROM match_opportunities(
  query_embedding := project_embedding,
  match_count := 20
);
```

### For Organizations

**Dashboard Access:**
1. Visit https://www.grantfounders.com
2. Sign up or log in
3. Navigate to /projects/evaluate
4. Enter project details
5. Receive instant ACE score and recommendations

**Subscription Tiers:**
- **Free Trial** - 10 evaluations
- **Pro** - $99/month - 100 evaluations, basic matching
- **Enterprise** - Custom - Unlimited evaluations, full autopilot

---

## Conclusion

GrantFounders™ represents a **paradigm shift** in federal funding intelligence. By combining:

- **Multi-agent AI** for comprehensive analysis
- **Behavioral DNA** for agency-specific insights
- **Predictive forecasting** for outcome probability
- **Autonomous harvesting** for opportunity discovery
- **Semantic matching** for intelligent pairing

...the platform transforms federal funding from a **black box** into a **predictable, optimizable process**.

Each agent and component works together to provide institutional-grade decision intelligence that was previously impossible to achieve.

---

**Support:** support@grantfounders.com  
**Documentation:** https://docs.grantfounders.com  
**API Status:** https://www.grantfounders.com/api/health

**Last Updated:** December 31, 2025  
**Version:** 1.0.0  
**Kernel:** GF-777ACE-Quantum-v3.0

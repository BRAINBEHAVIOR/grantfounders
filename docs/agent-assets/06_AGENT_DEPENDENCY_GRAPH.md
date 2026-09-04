# Agent and System Dependency Graph

This graph records static source relationships. An arrow does **not** prove deployed reachability.

## Canonical source graph — `BRAINBEHAVIOR/grantfounders @ 9074648...`

```mermaid
flowchart LR
  ACE_ROUTE["web/app/api/ace/score/route.ts"] --> AUTH["api-key-guard.verifyAuth"]
  ACE_ROUTE --> METER["metering.logUsage"]
  ACE_ROUTE --> SCORE["ace-kernel.scoreACE"]
  SCORE --> KERNEL["gf777ace_kernel.runGF777AceKernel"]
  KERNEL --> FEATURES["feature_extractor.extractFeatures"]
  KERNEL --> CORE["abasensor_core.computeAceScore"]
  KERNEL --> FIXED_DNA["agency_dna.DEFAULT_AGENCY_CONTEXT"]
  CORE --> AUTO["deriveDecision: AUTO_APPROVED / REVIEW_REQUIRED / CONDITIONAL_APPROVAL / BLOCKED"]

  AUTH_ROUTE["web/app/api/auth/route.ts"] --> AUTH_SERVICE["auth.service"]
  CHECKOUT["stripe/checkout/route.ts"] --> STRIPE_SERVICE["stripe.service"]
  WEBHOOK["stripe/webhook/route.ts"] --> STRIPE_SERVICE
  WEBHOOK --> SUPABASE_SERVICE["supabase.service: user/org/membership/API key"]
```

### Canonical trust observations

- Existing auth, organization, metering, Supabase, Stripe, dashboard, and report concerns form the target boundary.
- A historical package may not create a parallel version without an approved architectural decision record.
- `AUTO_APPROVED` and fixed Agency DNA are red trust nodes and must not be exported as government facts.

## Historical seven-agent graph — FRB PR #5

```mermaid
flowchart TD
  SOURCES["Claimed external sources"] -. unverified/simulated .-> SENTINEL
  SENTINEL --> SIGNALS["funding_signals"]
  SIGNALS --> DECODER
  DECODER --> OPPS["funding_opportunities"]
  DECODER --> REQS["opportunity_requirements"]
  OPPS --> PROFILER
  PROFILER --> PROFILES["agency profiles / behavior"]
  PROFILES --> ORACLE
  ORACLE --> PRED["predictions / forecasts"]
  OPPS --> RANKER
  REQS --> RANKER
  PROFILES --> RANKER
  RANKER --> SCORES["scores + unsupported approval_probability"]
  SCORES --> STRATEGIST
  PRED --> STRATEGIST
  STRATEGIST --> STRATEGIES["strategies / plans"]
  OUTCOMES["award outcomes"] --> LEARNER
  PRED --> LEARNER
  LEARNER --> MODEL["model/performance updates"]

  SHARED["shared utils: service-role Supabase + weak bearer check"] --> SENTINEL
  SHARED --> DECODER
  SHARED --> PROFILER
  SHARED --> ORACLE
  SHARED --> RANKER
  SHARED --> STRATEGIST
  SHARED --> LEARNER
```

### Broken trust propagation

1. SENTINEL can create a success state without source evidence.
2. DECODER can create specific opportunity facts from unknown/default inputs.
3. PROFILER can relabel opportunity data and simulate source analysis.
4. ORACLE emits uncalibrated forecasts.
5. RANKER converts heuristic score to apparent approval probability.
6. STRATEGIST multiplies and operationalizes unsupported outputs.
7. LEARNER can validate circularly/constantly, making false confidence self-reinforcing.

Because downstream stages depend on upstream claims, selective reuse must begin with source/provenance plumbing, not forecasting or strategy.

## FOA Harvester graph — FRB PR #6

```mermaid
flowchart LR
  CLI["src/main.py"] --> PIPE["HarvesterPipeline"]
  SCHED["scheduler.py"] --> PIPE
  PIPE --> GRANTS["GrantsGovScraper"]
  PIPE --> SAM["SAMGovScraper"]
  PIPE --> SBIR["SBIRScraper"]
  PIPE --> STATES["StateProcurementScraper placeholders"]
  GRANTS --> NORM["TextNormalizer"]
  SAM --> NORM
  SBIR --> NORM
  STATES --> NORM
  NORM --> DOC["DocumentProcessor / OCR"]
  DOC --> EMB["EmbeddingGenerator"]
  EMB --> CLASS["OpportunityClassifier"]
  CLASS --> SQLA["SQLAlchemy Opportunity model"]
  SQLA --> PG["PostgreSQL"]
```

Direct incompatibilities with the canonical target include Python execution, SQLAlchemy models, PostgreSQL ARRAY, `create_all`, and a separate opportunities schema. Concepts may be reimplemented only after target-contract verification.

## Agency DNA graph — FRB PR #7

```mermaid
flowchart LR
  BUILDER["AgencyDNABuilder"] --> USA["USAspending connector"]
  BUILDER --> TREAS["Treasury connector"]
  BUILDER --> GAO["GAO connector"]
  BUILDER --> CPARS["CPARS mock generator"]
  BUILDER --> CONG["Congressional/J-Book mock fallback"]
  USA --> ANALYZERS["8 analyzers"]
  TREAS --> ANALYZERS
  GAO --> ANALYZERS
  CPARS --> ANALYZERS
  CONG --> ANALYZERS
  ANALYZERS --> PROFILE["agency_dna_profiles"]
```

Observed and generated records are not sufficiently separated. Output trust is therefore broken even where one connector performs a real request.

## Match & Forecast graph — FRB PR #8

```mermaid
flowchart LR
  PROJECT["project scores or defaults"] --> MATCH["MatchForecastEngine"]
  OPP["opportunity or defaults"] --> MATCH
  DNA["agency DNA or defaults"] --> MATCH
  INC["incumbent or no-incumbent=0.8"] --> MATCH
  MATCH --> WIN["win probability"]
  WIN --> EV["expected value"]
  MATCH --> DELAY["delay probability"]
  MATCH --> ROI["ROI"]
  MATCH --> REC["pursue / monitor / pass"]
```

Every derived financial/recommendation output is blocked because its upstream probability and defaults are unvalidated.

## Separate repositories

```mermaid
flowchart TD
  CANON["grantfounders / web — canonical source"] 
  FRONT["grantfounders-frontend — older Next 14/React 18 app"]
  ORCH["gf-777ace-orchestrator PR #1 — contracts/plans"]
  BACK["grantfounders-backend — no substantive source"]

  FRONT -. report adapter candidate .-> CANON
  ORCH -. schema/order candidate .-> CANON
  BACK -. no asset .-> CANON
```

No dotted edge is an approved integration.

## Integration boundary

A package can cross into the canonical repository only when `07_MANUS_INTEGRATION_MANIFEST.json` has `integrationGate.status == "APPROVED"` and the package appears in `integrationOrder`. Candidate order alone grants no authority.

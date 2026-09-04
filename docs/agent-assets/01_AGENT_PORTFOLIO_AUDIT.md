# Source-Level Agent Portfolio Audit

## Audit method

This is a static inspection of GitHub trees, blobs, pull-request metadata, and selected source files at immutable commit SHAs. No source was executed. No test suite, scheduler, scraper, Edge Function, database migration, deployment, or external business API was run. Environment-variable names may be recorded; values were not retrieved.

Implementation vocabulary:

`MERGED_REACHABLE_VERIFIED`, `MERGED_SOURCE_PRESENT_NOT_RUNTIME_VERIFIED`, `UNMERGED_ENTRYPOINT_PRESENT`, `PARTIAL_EXECUTABLE`, `EXECUTABLE_PLACEHOLDER`, `EXECUTABLE_UNSAFE_PROTOTYPE`, `METADATA_ONLY`, `DOCUMENTATION_ONLY`, `ACCESSIBLE_NO_SUBSTANTIVE_IMPLEMENTATION`, `NOT_FOUND`, `INACCESSIBLE_NOT_VERIFIED`.

Reuse vocabulary:

`PORT_AS_IS`, `PORT_WITH_ADAPTATION`, `REIMPLEMENT_CONCEPT_ONLY`, `ARCHIVE_REFERENCE`, `REJECT_LOGIC`, `NO_ASSET`, `NEEDS_MANUAL_DECISION`.

---

## A. Seven-agent system — `federal-readiness-bot` PR #5

**Repository:** `BRAINBEHAVIOR/federal-readiness-bot`  
**PR:** `#5`  
**Source branch:** `copilot/implement-grantfounders-os`  
**Immutable source SHA:** `a028fa64a6b1ecaf2096f1c2c8e6abc30d612381`  
**Language/runtime:** TypeScript, Deno-style Supabase Edge Functions  
**Merged:** NO  
**Tests run in this audit:** NO  
**Overall classification:** `EXECUTABLE_UNSAFE_PROTOTYPE`

### Shared registry and security boundary

- Registry: `agents/registry.ts`.
- Shared utilities: `supabase/functions/_shared/utils.ts`.
- The registry declares frequency/trigger metadata; static metadata is not scheduler or webhook wiring.
- `getSupabaseClient` uses the service-role credential.
- `validateRequest` checks only that an authorization header begins with `Bearer `; token validity and tenant identity are not established there.
- Agent handlers therefore combine high-privilege database access with no source-proven tenant boundary.
- Shared tables observed include `agent_executions` and `audit_log`; individual agents reference additional domain tables.
- **Reuse:** utility ideas only; direct authentication/database port is `REJECT_LOGIC`.

### SENTINEL

| Field | Finding |
|---|---|
| Source path | `supabase/functions/sentinel/index.ts` |
| Entry symbols | `monitorGrantsGov`, `monitorSAMGov`, `monitorUSASpending`, `serve` |
| Claimed trigger | Hourly / source monitoring in registry metadata |
| Trigger wiring | NOT FOUND in inspected source |
| Claimed network sources | Grants.gov, SAM.gov, USAspending |
| Actual source behavior | Monitor functions return empty arrays; comments identify unimplemented/simulated API integration |
| Writes | Execution/audit records, source-check metadata, funding-signal path when signals exist |
| False-success behavior | Can update `last_successful_check` and finish successfully despite no confirmed retrieval |
| Provenance | No raw response, request cursor, checksum, source version, or durable source-health proof |
| Tests | No agent-specific deterministic source-contract test verified |
| Classification | `EXECUTABLE_PLACEHOLDER` |
| Reuse | `REIMPLEMENT_CONCEPT_ONLY`; false-success logic `REJECT_LOGIC` |

**Production blockers:** real source clients, bounded pagination/retry, API terms/rate limits, raw-source preservation, run/source health, failure semantics, idempotency, amendment lineage, tenant boundary, scheduler wiring, and contract tests.

### DECODER

| Field | Finding |
|---|---|
| Source path | `supabase/functions/decoder/index.ts` |
| Entry symbols | `parseOpportunityFromSignal`, `parseOpportunityFromDocument`, `serve` |
| Inputs | `funding_signals`; direct document action |
| Writes | `funding_opportunities`, `opportunity_requirements`; processed status on signal |
| Actual parsing | Heuristic extraction from signal payload |
| Generated context | `GEN-${Date.now()}` identifier and defaults such as `UNKNOWN`, `Unknown Agency`, `grant`, and `open` |
| Document path | Explicitly throws `Document parsing not yet implemented` |
| Ordering risk | Signal can be marked processed before all downstream persistence is proven complete |
| Classification | `EXECUTABLE_PLACEHOLDER` |
| Reuse | Schema/taxonomy concepts only; generated/default business facts `REJECT_LOGIC` |

**Production blockers:** deterministic parser contracts, attachment acquisition/OCR, source citations per extracted claim, amendment/version identity, transactional persistence, unknown/null semantics, validation against source record, and tests.

### PROFILER

| Field | Finding |
|---|---|
| Source path | `supabase/functions/profiler/index.ts` |
| Entry symbols | `analyzeAgencyFromUSASpending`, `analyzeAgencyFromOpportunities`, `extractBehaviorTraits`, `identifyPreferences` |
| Claimed source | USAspending plus opportunity/outcome data |
| Actual source behavior | USAspending analysis path is simulated/zero-valued; no verified live retrieval |
| Semantic defect | Opportunity values/counts may be labeled as awards or obligations |
| Scope defect | Preference/outcome analysis is not reliably constrained to the target agency |
| Confidence | Values are heuristic/unsupported rather than outcome-calibrated |
| Classification | `EXECUTABLE_UNSAFE_PROTOTYPE` |
| Reuse | Agency-profile field taxonomy only; metrics and confidence `REJECT_LOGIC` |

### ORACLE

| Field | Finding |
|---|---|
| Source path | `supabase/functions/oracle/index.ts` |
| Entry symbols | `generateAgencyPredictions`, `generateFundingForecasts`, `generateTimingPredictions` |
| Inputs | Agency profiles and historical opportunity/funding records |
| Outputs | Prediction/forecast records |
| Unsafe assumptions | Default growth around 2%, arbitrary confidence calculations, hardcoded confidence values, and fixed ±15% intervals |
| Calibration | No held-out outcomes, model version, calibration curve, error distribution, or backtest evidence |
| Classification | `EXECUTABLE_UNSAFE_PROTOTYPE` |
| Reuse | Forecast interface vocabulary only; numeric logic `REJECT_LOGIC` |

### RANKER

| Field | Finding |
|---|---|
| Source path | `supabase/functions/ranker/index.ts` |
| Entry symbols | `calculateEligibilityScore`, `calculateCapabilityScore`, `calculatePastPerformanceScore`, `calculateAgencyAlignmentScore`, `calculateFinancialCapacityScore`, `calculateTimingScore`, `scoreOpportunity` |
| Positive unknown defaults | Eligibility missing: positive points/eligible; requirements missing: positive points; no past performance, agency profile, or financial data: positive points |
| Probability defect | `approvalProbability = clamp(overallScore / 100, 0.05, 0.95)` |
| Fabricated context | `rank_among_pool: 1`, `estimated_pool_size: 50` |
| Decision risk | Score can be transformed into apparent approval probability without outcome data or calibration |
| Classification | `EXECUTABLE_UNSAFE_PROTOTYPE` |
| Reuse | `REJECT_LOGIC`; retain only neutral input/output naming as `ARCHIVE_REFERENCE` |

### STRATEGIST

| Field | Finding |
|---|---|
| Source path | `supabase/functions/strategist/index.ts` |
| Entry symbols | `determineStrategyType`, `generateObjectives`, `selectTargetOpportunities`, `estimateResourceRequirements`, `identifyRisks`, `generateActionPlan` |
| Dependency defect | Consumes unsupported `approval_probability` from RANKER |
| Hardcoded economics | 3-year history, 25%/40% win rates, 5% growth, $85k salary, $15k proposal cost, $5k technology cost, risk probabilities around 0.3–0.6 |
| Estimated funding | Derives funding from award range multiplied by unsupported approval probability |
| Classification | `EXECUTABLE_UNSAFE_PROTOTYPE` |
| Reuse | `REJECT_LOGIC`; action-plan formatting only may be `ARCHIVE_REFERENCE` |

### LEARNER

| Field | Finding |
|---|---|
| Source path | `supabase/functions/learner/index.ts` |
| Entry symbols | `processAwardOutcome`, `evaluatePredictionAccuracy`, `extractLessons`, `validatePendingPredictions`, `calculateModelPerformance` |
| Validation defect | Timing prediction validation returns a constant true |
| Circularity | Funding validation may use the prediction's own confidence |
| Learning defect | `performance_before` can equal `performance_after`; confidence updates are arbitrary (for example +0.05 / 0.5 initial) |
| Calibration | No proper outcome labels, data split, drift monitoring, confidence calibration, or reproducible evaluation |
| Classification | `EXECUTABLE_UNSAFE_PROTOTYPE` |
| Reuse | `REJECT_LOGIC` |

### Seven-agent conclusion

The seven named agents are **not metadata-only** because source entrypoints exist. They are also **not runtime-reachable or production-ready** because deployment, trigger wiring, secure tenant execution, live source behavior, database compatibility, and tests were not demonstrated. No agent is approved for direct port.

---

## B. Federal FOA Harvester — PR #6

**SHA:** `d54febe516a392f5e5c5773303f0f36452374b8b`  
**Primary entrypoints:** `src/main.py`, `src/foa_harvester/pipeline.py`, `src/foa_harvester/scheduler.py`  
**Runtime:** Python + SQLAlchemy + PostgreSQL-specific types  
**Classification:** `PARTIAL_EXECUTABLE`  
**Reuse:** `REIMPLEMENT_CONCEPT_ONLY`

### Source-level findings

- `HarvesterPipeline.run_full_harvest(days_back=7)` accepts a time window but invokes `scraper.scrape()` without propagating `days_back`.
- Grants.gov and SBIR paths perform a single request in inspected code; pagination is not established.
- SAM.gov has pagination logic, but retry behavior is not bounded clearly and API-key/query handling requires correction.
- State procurement implementations for CA/TX/NY/FL are homepage placeholders returning no opportunities.
- Most source errors return empty/partial arrays, permitting a run to appear successful without source completeness.
- Hash identity combines title, description, and source ID; it is not a source-qualified canonical key and does not create amendment/version lineage.
- `raw_metadata` does not establish full immutable raw-response preservation.
- SQLAlchemy model uses PostgreSQL `ARRAY`; the database connection includes a local credential-shaped fallback and `create_all`.
- No tenant, ingestion-run, source-health, request/cursor, amendment lineage, or durable provenance model was verified.
- Tests cover basic helper behavior, not real source contracts, pagination, retries, rate limits, database transactions, OCR, pipeline failure semantics, source health, or provenance. Tests were not run here.

### Approved concept candidates

- source adapter interface;
- staged normalization/classification pipeline;
- content hashing as one deduplication signal;
- document processor and text-normalizer separation;
- source-specific rate-limit awareness.

### Prohibited direct-port behavior

- empty fallback treated as success;
- source homepage placeholders;
- current dedup/version identity;
- local database credential fallback;
- Python/SQLAlchemy schema copied into the canonical app without target-contract review;
- source outputs without immutable provenance and health status.

---

## C. Agency DNA Builder — PR #7

**SHA:** `6b4ed598c17b8d62afcbcaac54cc0a42ed18c66c`  
**Entrypoint:** `src/agency_dna_builder/builder.py::AgencyDNABuilder`  
**Classification:** `EXECUTABLE_UNSAFE_PROTOTYPE`  
**Reuse:** `REIMPLEMENT_CONCEPT_ONLY`

Findings:

- `FPDSConnector.fetch_data` performs a USAspending request but has no verified pagination and converts failures/status errors to empty lists.
- `AgencyDNABuilder._collect_data` uses `return_exceptions=True` and converts source exceptions to empty arrays.
- `_calculate_data_quality` still assigns positive scores when appropriations, protests, or CPARS data are absent.
- `CPARSConnector.fetch_data` always returns generated mock assessments with hardcoded ratings and generated DUNS-like identifiers.
- `CongressionalConnector` falls back to generated appropriations; `fetch_jbooks` returns hardcoded $50B/$30B/$15B/$5B values and labels source `mock_jbook`.
- `_store_profile` leaves behavior-pattern and budget-cycle persistence as a future implementation comment.
- Mock/derived records are not cleanly isolated from observed records at the output contract.

**Conclusion:** useful connector/analyzer decomposition, but no output may be marketed or surfaced as factual Agency DNA until provenance classes, missing-data semantics, source permissions, calibration, and tests are rebuilt.

---

## D. Match & Forecast Engine — PR #8

**SHA:** `f647783c8279367b171649854a9df4c50e2c1846`  
**Entrypoint:** `src/agents/match-forecast-engine.js::MatchForecastEngine`  
**Classification:** `EXECUTABLE_UNSAFE_PROTOTYPE`  
**Reuse:** `REJECT_LOGIC`

Confirmed unsafe defaults include:

- prior success rate `0.15`;
- missing readiness/capacity/compliance/past performance `0.5`;
- no incumbent interpreted as `0.8` opportunity;
- probability clamped to 5%–95%;
- missing award amount defaults to `$100,000`;
- delay rate defaults to `0.30`, delay days to `45`, cycle multipliers to `1.2`/`1.4`;
- proposal effort tiers and `$100/hour` cost;
- automatic `pursue`, `monitor`, or `pass` recommendations.

The formula is not a validated Bayesian model merely because it uses a posterior-shaped expression. No empirically estimated likelihoods, representative priors, labeled outcomes, calibration, uncertainty analysis, or backtesting were verified.

---

## E. Historical readiness assets — PRs #1–#4

| PR | SHA | Source finding | Classification | Reuse |
|---|---|---|---|---|
| #1 schema | `f762c3c...` | Substantive PostgreSQL schema, constraints, audit tables, and psql migration wrapper; no executable RLS policy found in inspected core schema | `UNMERGED_ENTRYPOINT_PRESENT` | `PORT_WITH_ADAPTATION` after schema diff |
| #2 thin API | `4cd1e4e...` | Vercel handlers use anonymous Supabase client, wildcard CORS, client-supplied organization ID, and no handler authentication; isolation depends on unproven RLS | `EXECUTABLE_UNSAFE_PROTOTYPE` | `REJECT_LOGIC` for auth; endpoint taxonomy `ARCHIVE_REFERENCE` |
| #3 demo chatbot | `d4d633e...` | Static UI; invalid numeric input defaults to zero; API failure switches to demo result | `EXECUTABLE_PLACEHOLDER` | `ARCHIVE_REFERENCE` |
| #4 institutional terminal | `5fccab4...` | Demo UI and in-memory/presentation behavior, not demonstrated production engine | `EXECUTABLE_PLACEHOLDER` | `ARCHIVE_REFERENCE` |

All four remain open/draft/unmerged in `federal-readiness-bot`.

---

## F. Canonical `BRAINBEHAVIOR/grantfounders`

### Baseline source contract

**Audit baseline:** `main @ 9074648033bdd5bc24f6721ee295818ba7b9acb4`  
**Current main after governance PR #6:** `f167e7b446bdde626b28f7f1dc9acdddfb643ed1`  
**Observed app root:** `web/`  
**Observed stack:** Next.js 16.1.1, React 19.2.3, TypeScript 5, Supabase JS, Stripe, Zod  
**Target classification:** `SOURCE_VERIFIED_TARGET_CONTRACT`  
**Manus/deployed runtime classification:** `NOT_VERIFIED_IN_CURRENT_TASK`

Selected reachable-looking source paths, without runtime proof:

- `web/app/api/ace/score/route.ts`
- `web/src/lib/ace-kernel.ts`
- `web/src/ai_engine/gf777ace_kernel.ts`
- `web/src/ai_engine/feature_extractor.ts`
- `web/src/ai_engine/abasensor_core.ts`
- `web/src/ai_engine/agency_dna.ts`
- `web/src/services/api-key-guard.ts`
- `web/app/api/auth/route.ts`
- `web/app/api/stripe/checkout/route.ts`
- `web/app/api/stripe/webhook/route.ts`
- Supabase schema/migration assets visible in the repository tree.

Positive findings:

- Zod validation on selected routes.
- API-key/owner-secret guard exists for ACE.
- Metering is called from ACE.
- Stripe webhook verifies signature before provisioning.
- Auth, org, billing, database, API, dashboard, and report concerns already exist; parallel replacements are prohibited by default.

Critical findings:

- `deriveDecision` maps score ≥85 to `AUTO_APPROVED`.
- `DEFAULT_AGENCY_CONTEXT` is a fixed internal object, not observed agency evidence.
- ACE feature/weight formulas are deterministic heuristics; calibration and external validity were not established.
- Wildcard CORS is present on selected routes.
- Runtime deployment, environment configuration, RLS, live database schema, Stripe idempotency behavior, and production observability were not tested in this audit.

### Historical PRs in canonical repository

| PR | State | Head SHA | Finding |
|---|---|---|---|
| #1 | closed, unmerged | `280fb5a...` | Deployment verification/docs only; historical reference |
| #2 | open draft, unmerged | `e860ae5...` | Agent documentation that can overstate historical implementation |
| #3 | open draft, unmerged | `f598d8a...` | OAuth callback/login/client changes; must be compared with current auth |
| #4 | open, unmerged | `b40972e...` | Large alternate product/UI root with hardcoded metrics, testimonials, scores, “analysis,” rankings, and actions |
| #5 | open draft | reporting branch | This documentation-only forensic package |

PR #4 specifically hardcodes `$47M+ Funding Secured`, `89% Prediction Accuracy`, `500+ Startups`, named testimonials and awards, ACE score 77, “Top 23%,” potential score 92, categories, risks, impact points, and timed simulated analysis. These are not verified business facts.

---

## G. Other repositories

### `BRAINBEHAVIOR/gf-777ace-orchestrator`

- Main: `ca15fe13e03f198a7c8e955e707828f093b71f0c`.
- PR #1 head: `16835762044fcf3c6cbc3127fb1cc913b60e919b`.
- Source includes `src/agents/registry.ts`, `src/orchestrator/plan.ts`, `src/orchestrator/fallback.ts`, type/schema contracts, prompt files, and structural tests.
- It builds deterministic step metadata and fallback envelopes; no model/agent execution, persistence, auth, tenant boundary, external API, or canonical-app wiring was verified.
- **Classification:** `UNMERGED_ENTRYPOINT_PRESENT`.
- **Reuse:** `PORT_WITH_ADAPTATION` for contracts/order only.

### `BRAINBEHAVIOR/grantfounders-frontend`

- Main: `fe1f229f347daa20d9bd70858d6af43fb75eca1f`.
- Next.js 14/React 18 separate app.
- Useful source: `app/api/analysis/decision-report/route.ts` fails closed when `NEXT_ENGINE_URL` is absent and proxies with `ENGINE_SECRET`; `lib/analysis-report.js` validates a structured report.
- Unsafe legacy source: `app/api/run/route.ts` contains a mock NIH kernel/weights/status thresholds; `app/api/scan/route.ts` has weaker environment/error handling.
- **Classification:** `MERGED_SOURCE_PRESENT_NOT_RUNTIME_VERIFIED`.
- **Reuse:** selected report contract/adapter `PORT_WITH_ADAPTATION`; legacy mock logic `REJECT_LOGIC`.

### `BRAINBEHAVIOR/grantfounders-backend`

- Main: `9bef1e57234dd402c8263e08d6b111f734671b18`.
- Only `.gitignore` and a minimal README were found.
- **Classification:** `ACCESSIBLE_NO_SUBSTANTIVE_IMPLEMENTATION`.
- **Reuse:** `NO_ASSET`.

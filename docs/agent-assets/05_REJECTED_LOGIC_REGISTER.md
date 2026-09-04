# Rejected Logic Register

Anything listed here is prohibited from direct port, production use, marketing evidence, customer-facing output, eligibility determination, scoring authority, or automated recommendation. Removal from this register requires a new evidence package, validated replacement design, tests, and explicit owner approval.

| ID | Repository / PR / SHA | Exact path | Exact symbol or area | Confirmed issue | Disposition |
|---|---|---|---|---|---|
| RL-001 | `grantfounders` main `9074648...` | `web/src/ai_engine/abasensor_core.ts` | `deriveDecision` | Maps score ≥85 to `AUTO_APPROVED`; a private heuristic cannot confer government approval | `REJECT_LOGIC` |
| RL-002 | `grantfounders` main `9074648...` | `web/src/ai_engine/agency_dna.ts` | `DEFAULT_AGENCY_CONTEXT` | Fixed risk/innovation/compliance biases represented as agency context without observed source provenance | `REJECT_LOGIC` |
| RL-003 | `grantfounders` main `9074648...` | `web/src/ai_engine/feature_extractor.ts`, `abasensor_core.ts` | `extractFeatures`, `computeAceScore` | Heuristic weights/transforms lack verified calibration or external validity | `NEEDS_MANUAL_DECISION`; never label probability/approval |
| RL-004 | FRB PR #5 `a028fa6...` | `supabase/functions/_shared/utils.ts` | `getSupabaseClient`, `validateRequest` | Service-role access plus prefix-only Bearer check; token/tenant validity not established | `REJECT_LOGIC` |
| RL-005 | FRB PR #5 `a028fa6...` | `supabase/functions/sentinel/index.ts` | `monitorGrantsGov`, `monitorSAMGov`, `monitorUSASpending` | Empty/simulated retrieval paths | `REJECT_LOGIC` |
| RL-006 | FRB PR #5 `a028fa6...` | `supabase/functions/sentinel/index.ts` | execution/source update flow | Can report success/update `last_successful_check` without confirmed source retrieval | `REJECT_LOGIC` |
| RL-007 | FRB PR #5 `a028fa6...` | `supabase/functions/decoder/index.ts` | `parseOpportunityFromSignal` | Generates `GEN-*` IDs and defaults unknown agency/type/status into specific facts | `REJECT_LOGIC` |
| RL-008 | FRB PR #5 `a028fa6...` | `supabase/functions/decoder/index.ts` | `parseOpportunityFromDocument` | Explicitly unimplemented document parsing | `NO_ASSET` |
| RL-009 | FRB PR #5 `a028fa6...` | `supabase/functions/profiler/index.ts` | `analyzeAgencyFromUSASpending` | Simulated/zero-valued source analysis can be mistaken for live data | `REJECT_LOGIC` |
| RL-010 | FRB PR #5 `a028fa6...` | `supabase/functions/profiler/index.ts` | `analyzeAgencyFromOpportunities`, `identifyPreferences` | Opportunity amounts/counts may be mislabeled as awards/obligations; incomplete agency scoping | `REJECT_LOGIC` |
| RL-011 | FRB PR #5 `a028fa6...` | `supabase/functions/oracle/index.ts` | `generateAgencyPredictions` | Default growth assumptions and arbitrary confidence | `REJECT_LOGIC` |
| RL-012 | FRB PR #5 `a028fa6...` | `supabase/functions/oracle/index.ts` | `generateFundingForecasts`, `generateTimingPredictions` | Fixed confidence/interval behavior without calibration | `REJECT_LOGIC` |
| RL-013 | FRB PR #5 `a028fa6...` | `supabase/functions/ranker/index.ts` | `calculateEligibilityScore` | Positive score/eligible interpretation when eligibility data is missing | `REJECT_LOGIC` |
| RL-014 | FRB PR #5 `a028fa6...` | `supabase/functions/ranker/index.ts` | capability/past-performance/agency/financial functions | Positive defaults for missing requirements, history, agency profile, and financial evidence | `REJECT_LOGIC` |
| RL-015 | FRB PR #5 `a028fa6...` | `supabase/functions/ranker/index.ts` | `scoreOpportunity` | `approvalProbability = clamp(overallScore/100, 0.05, 0.95)` | `REJECT_LOGIC` |
| RL-016 | FRB PR #5 `a028fa6...` | `supabase/functions/ranker/index.ts` | result construction | Fabricated `rank_among_pool: 1` and `estimated_pool_size: 50` | `REJECT_LOGIC` |
| RL-017 | FRB PR #5 `a028fa6...` | `supabase/functions/strategist/index.ts` | `selectTargetOpportunities` | Consumes unsupported approval probability | `REJECT_LOGIC` |
| RL-018 | FRB PR #5 `a028fa6...` | `supabase/functions/strategist/index.ts` | `estimateResourceRequirements`, `identifyRisks`, objective/funding logic | Hardcoded salaries, costs, win rates, growth, risk probabilities, and estimated funding | `REJECT_LOGIC` |
| RL-019 | FRB PR #5 `a028fa6...` | `supabase/functions/learner/index.ts` | `validatePendingPredictions` | Timing validation constant true; funding validation circularly depends on prediction confidence | `REJECT_LOGIC` |
| RL-020 | FRB PR #5 `a028fa6...` | `supabase/functions/learner/index.ts` | `processAwardOutcome`, `calculateModelPerformance` | Arbitrary confidence increments and pseudo before/after performance | `REJECT_LOGIC` |
| RL-021 | FRB PR #6 `d54febe...` | `src/foa_harvester/pipeline.py` | `run_full_harvest` | `days_back` not propagated; empty/partial source results do not fail the run | `REJECT_LOGIC` |
| RL-022 | FRB PR #6 `d54febe...` | `src/foa_harvester/scrapers/grants_gov.py`, `sbir.py` | `scrape` | No proven pagination; exceptions collapse to empty arrays | `REJECT_LOGIC` |
| RL-023 | FRB PR #6 `d54febe...` | `src/foa_harvester/scrapers/state_procurement.py` | state scraper implementations | Homepage placeholders return no records while appearing configured | `NO_ASSET` |
| RL-024 | FRB PR #6 `d54febe...` | `src/foa_harvester/scrapers/base.py` | `generate_content_hash` | Identity is not sufficient for source-qualified amendment/version lineage | `REJECT_LOGIC` |
| RL-025 | FRB PR #6 `d54febe...` | `src/foa_harvester/database/connection.py` | default database URL / initialization | Credential-shaped local fallback and schema `create_all` conflict with controlled migrations | `REJECT_LOGIC` |
| RL-026 | FRB PR #7 `6b4ed59...` | `src/agency_dna_builder/connectors/cpars.py` | `fetch_data`, `_get_mock_cpars_data` | Generated ratings and DUNS-like IDs can contaminate agency intelligence | `REJECT_LOGIC` |
| RL-027 | FRB PR #7 `6b4ed59...` | `src/agency_dna_builder/connectors/congressional.py` | `fetch_data`, `fetch_jbooks`, `_get_mock_appropriations_data` | Generated appropriations/J-Book amounts returned on failure | `REJECT_LOGIC` |
| RL-028 | FRB PR #7 `6b4ed59...` | `src/agency_dna_builder/builder.py` | `_collect_data`, `_calculate_data_quality` | Source errors become empty arrays while missing sources retain positive quality points | `REJECT_LOGIC` |
| RL-029 | FRB PR #8 `f647783...` | `src/agents/match-forecast-engine.js` | `calculateWinProbability` | Defaults missing evidence to positive values and labels a heuristic posterior as win probability | `REJECT_LOGIC` |
| RL-030 | FRB PR #8 `f647783...` | same | `calculateExpectedValue` | Defaults missing award to `$100,000` then multiplies by uncalibrated probability | `REJECT_LOGIC` |
| RL-031 | FRB PR #8 `f647783...` | same | delay, ROI, vulnerability, recommendation functions | Arbitrary delay/cost/effort/incumbent defaults and automated `pursue/pass` | `REJECT_LOGIC` |
| RL-032 | FRB PR #2 `4cd1e4e...` | `api/_lib/supabase.js`, `api/decisions.js`, `api/decisions/list.js` | API handlers | Anonymous client, wildcard CORS, client-selected org, and no caller authentication; RLS not proven | `REJECT_LOGIC` |
| RL-033 | FRB PR #3 `d4d633e...` | `chatbot.js` | `handleSend`, `submitToAPI`, `showDemoResult` | Invalid numeric input becomes zero; API failures fall back to demo output | `REJECT_LOGIC` for decisions; UI only `ARCHIVE_REFERENCE` |
| RL-034 | `grantfounders` PR #4 `b40972e...` | `components/landing/stats.tsx` | `Stats` | Hardcoded `$47M+`, `89%`, `500+`, and analysis-time claims | `REJECT_LOGIC` / remove claims |
| RL-035 | `grantfounders` PR #4 `b40972e...` | `components/landing/testimonials.tsx` | `Testimonials` | Named success stories and award amounts have no verified evidence | `REJECT_LOGIC` / remove claims |
| RL-036 | `grantfounders` PR #4 `b40972e...` | `app/dashboard/page.tsx` | `DashboardPage` | Timed simulated analysis, static score 77, percentile, potential 92, category scores, risk/actions | `REJECT_LOGIC` |
| RL-037 | `grantfounders-frontend` main `fe1f229...` | `app/api/run/route.ts` | mock kernel/decision path | Hardcoded NIH program, weights, thresholds, and status results | `REJECT_LOGIC` |

## Global prohibitions

The following labels may not be generated from uncalibrated heuristics or missing evidence:

- approval probability;
- win probability;
- expected value;
- predicted funding;
- prediction accuracy;
- confidence level;
- agency preference or behavior;
- government approval;
- `AUTO_APPROVED`;
- `pursue`, `pass`, or equivalent autonomous decision;
- customer, award, funding-secured, or performance claims without an evidence record.

Unknown critical facts must remain unknown and must fail closed.

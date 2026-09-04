# Agent-Assets Forensic Package — Executive Truth

## Controlling status

**INTEGRATION GATE: `BLOCKED_PENDING_SOURCE_AND_TARGET_VERIFICATION`**

No historical agent, harvester, schema, scoring model, forecast, UI, API, migration, or orchestration package is approved for implementation or porting by this pull request. `integrationOrder` is intentionally empty. The first candidate is only a candidate, not an authorization.

## Provenance

| Field | Value |
|---|---|
| reportingRepository | `BRAINBEHAVIOR/grantfounders` |
| reportingPullRequest | `#5` |
| reportingBranch | `copilot/copilotagent-asset-forensics-manus-pack` |
| reportingHeadShaAtInspectionStart | `aa4b06b08e2788685a9b572eb689ce5c96bb865c` |
| baseBranch | `main` |
| baseSha | `9074648033bdd5bc24f6721ee295818ba7b9acb4` |
| currentMainShaAfterGovernance | `f167e7b446bdde626b28f7f1dc9acdddfb643ed1` |
| evidenceTimestamp | `2026-09-04T06:22:34Z` |
| inspectionLevel | `STATIC_SOURCE_AT_IMMUTABLE_SHAS` |
| testsRunInThisTask | `NO` |
| externalBusinessAPIsCalled | `NO` |
| deploymentsPerformed | `NO` |
| secretValuesRetrieved | `NO` |

`reportingHeadShaAtInspectionStart` is the immutable PR head inspected before this corrective documentation commit. The branch advances when this package is committed; the authoritative post-commit head is GitHub's PR ref. Embedding a commit's own SHA inside that same commit would be recursively impossible.

## Executive determinations

1. **Canonical GitHub source.** `BRAINBEHAVIOR/grantfounders` is the canonical application repository for this audit. At the immutable baseline `9074648...`, the substantive application lives under `web/` and includes Next.js routes, Supabase services/schema assets, Stripe routes, authentication, metering, dashboard/report flows, and an ACE kernel. This is a `SOURCE_VERIFIED_TARGET_CONTRACT`, not proof that a Manus or deployed runtime is identical.

2. **The seven historical agents are source-present, unmerged, and not production-ready.** SENTINEL, DECODER, PROFILER, ORACLE, RANKER, STRATEGIST, and LEARNER have TypeScript/Supabase Edge Function entrypoints in `federal-readiness-bot` PR #5 at `a028fa6...`. Source presence does not establish runtime reachability. Static review found placeholders, simulated data paths, unsupported defaults, fabricated identifiers, uncalibrated probability/confidence logic, and weak authentication/tenant boundaries.

3. **The FOA Harvester is a partial executable prototype, not a drop-in subsystem.** PR #6 at `d54febe...` contains a Python/SQLAlchemy pipeline and some real HTTP code, but also empty fallbacks, placeholder state portals, incomplete pagination, no amendment lineage, weak source-health semantics, and stack/database coupling that conflicts with the canonical Next.js/Supabase application.

4. **Agency DNA is contaminated by mock data.** PR #7 at `6b4ed59...` has real connector code for some public sources, but failures are converted to empty arrays while CPARS, congressional appropriations, and J-Books may be replaced with generated mock values. Those outputs cannot be represented as observed government intelligence.

5. **Match & Forecast is not calibrated evidence.** PR #8 at `f647783...` supplies positive defaults for missing evidence, assumes award amounts/costs/delays, calls a weighted heuristic “Bayesian,” and emits `pursue`/`pass`, win probability, expected value, ROI, confidence, and incumbent vulnerability without a validated model or outcome calibration. Its decision logic is rejected.

6. **The current canonical baseline also contains unsafe decision wording.** `web/src/ai_engine/abasensor_core.ts` maps a score of 85+ to `AUTO_APPROVED`, while `web/src/ai_engine/agency_dna.ts` supplies a fixed `DEFAULT_AGENCY_CONTEXT`. This is not government approval and is a P0 correction requirement before the ACE output can be relied upon externally.

7. **`gf-777ace-orchestrator` is accessible but skeletal.** PR #1 at `1683576...` contains type contracts, a registry, deterministic step planning, fallback envelopes, prompts, and structural tests. It does not execute models or agents, persist state, authenticate tenants, or prove integration with the canonical app.

8. **`grantfounders-frontend` is accessible and substantive, but separate and older.** Main at `fe1f229...` is a Next.js 14/React 18 application with a useful decision-report adapter and engine proxy, plus legacy mock routes. It is a reference/port-with-adaptation candidate, not a second canonical application.

9. **`grantfounders-backend` is accessible but empty of substantive implementation.** Main at `9bef1e5...` contains only `.gitignore` and a minimal README.

10. **Historical GrantFounders PRs are not production state.** In `BRAINBEHAVIOR/grantfounders`, PRs #2, #3, and #4 remain unmerged. PR #4 includes hardcoded funding claims, testimonials, analysis scores, rankings, impact points, and simulated progress. Those claims are rejected as production evidence.

## Implementation-status truth table

| Asset | Static source | Static entrypoint | Runtime reachable | Production ready | Classification | Reuse |
|---|---:|---:|---:|---:|---|---|
| Canonical `grantfounders` baseline | YES | YES | NOT VERIFIED | NO | `MERGED_SOURCE_PRESENT_NOT_RUNTIME_VERIFIED` | `NEEDS_MANUAL_DECISION` |
| FRB PR #5 seven agents | YES | YES | NOT VERIFIED | NO | `EXECUTABLE_UNSAFE_PROTOTYPE` | `REIMPLEMENT_CONCEPT_ONLY` / `REJECT_LOGIC` |
| FRB PR #6 FOA Harvester | YES | YES | NOT VERIFIED | NO | `PARTIAL_EXECUTABLE` | `REIMPLEMENT_CONCEPT_ONLY` |
| FRB PR #7 Agency DNA | YES | YES | NOT VERIFIED | NO | `EXECUTABLE_UNSAFE_PROTOTYPE` | `REIMPLEMENT_CONCEPT_ONLY` |
| FRB PR #8 Match & Forecast | YES | YES | NOT VERIFIED | NO | `EXECUTABLE_UNSAFE_PROTOTYPE` | `REJECT_LOGIC` |
| `gf-777ace-orchestrator` PR #1 | YES | YES | NOT VERIFIED | NO | `UNMERGED_ENTRYPOINT_PRESENT` | `PORT_WITH_ADAPTATION` |
| `grantfounders-frontend` main | YES | YES | NOT VERIFIED | NO | `MERGED_SOURCE_PRESENT_NOT_RUNTIME_VERIFIED` | `PORT_WITH_ADAPTATION` |
| `grantfounders-backend` main | NO substantive source | NO | NO | NO | `ACCESSIBLE_NO_SUBSTANTIVE_IMPLEMENTATION` | `NO_ASSET` |

## Four facts that must never be conflated

- `SOURCE_PRESENT`: a file exists at an immutable Git SHA.
- `STATIC_ENTRYPOINT_PRESENT`: a class/function/route can be identified statically.
- `RUNTIME_REACHABLE`: deployed wiring, configuration, authentication, data, and triggers have been demonstrated.
- `PRODUCTION_READY`: security, provenance, correctness, tests, observability, rollback, and policy requirements have been satisfied.

This audit proves selected instances of the first two facts only. It does not prove the last two.

## Blocking conditions

The gate remains blocked until all of the following are recorded for a specific package:

- exact source paths, symbols, and immutable SHAs;
- approved fragments separated from rejected fragments;
- target-runtime gap verified against the actual Manus/deployed runtime;
- target tables, authentication, tenant model, API contracts, and report contracts verified;
- no duplicate auth/org/database/report/billing subsystem;
- source provenance, version/amendment lineage, and source-health contracts;
- deterministic unit, contract, integration, security, and failure-path tests;
- rollback boundary and migration reversibility;
- prohibited logic enumerated and mechanically excluded;
- explicit owner approval for that exact package and scope.

See `07_MANUS_INTEGRATION_MANIFEST.json` for the machine-enforced gate and `08_MANUS_SELECTIVE_PORT_PROMPT.md` for the fail-closed execution instruction.

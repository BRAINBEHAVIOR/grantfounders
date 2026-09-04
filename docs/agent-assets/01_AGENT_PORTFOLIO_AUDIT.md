# Agent Portfolio Audit (Initial Evidence-Backed Snapshot)

> Evidence level in this initial pack: **GitHub repository metadata + PR metadata + commit SHAs**.
> Code-level behavior, runtime wiring, and tests are marked **NOT VERIFIED** unless direct source paths/SHAs are already confirmed.

## A. Verified repository and branch evidence

### A1) BRAINBEHAVIOR/grantfounders
- Repository id: `1125606999`
- Default branch: `main`
- Verified evidence commit: `9074648033bdd5bc24f6721ee295818ba7b9acb4`
- Branch reference: `refs/heads/copilot/agent-asset-forensics-manus-pack` -> `9074648033bdd5bc24f6721ee295818ba7b9acb4`
- Verified file SHAs:
  - `README.md` `335e14da45a0f56b8c3c4eab7c36c59ecc41f1a6`
  - `IMPLEMENTATION_SUMMARY.md` `c035541a8b173d9a2757e96c87a315fe1b15957c`
  - `DEPLOYMENT_RUNBOOK.md` `d619cd1d62d70030a00a74e9b27762e84f944a65`
  - `supabase_schema.sql` `76476776abc695c652c7c9e9f7ef741fc9630711`

### A2) BRAINBEHAVIOR/federal-readiness-bot PR ledger (all open draft)
| PR | Title | Draft | State | Head SHA | URL |
|---|---|---|---|---|---|
| 1 | Implement core database schema with multi-tenant isolation and decision traceability | true | open | `f762c3c25111022752c60c12d1f3315694e88177` | https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/1 |
| 2 | Add thin serverless API layer over Supabase Decision Engine | true | open | `4cd1e4ed73d35b82f854ad082ffc835659ea3714` | https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/2 |
| 3 | Add demo chatbot interface for Decision Engine API | true | open | `d4d633e9d869d9ddc532760dd32e27bd9b8d0931` | https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/3 |
| 4 | Implement production-grade Federal Grant Readiness institutional decision terminal | true | open | `5fccab4fc1f50e06da739273881daedbb5350f04` | https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/4 |
| 5 | Implement GrantFounders OS™ multi-agent cognitive system | true | open | `a028fa64a6b1ecaf2096f1c2c8e6abc30d612381` | https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/5 |
| 6 | Implement Federal FOA Harvester Agent with autonomous multi-source ingestion pipeline | true | open | `d54febe516a392f5e5c5773303f0f36452374b8b` | https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/6 |
| 7 | Implement Agency DNA Builder for federal contracting behavioral intelligence | true | open | `6b4ed598c17b8d62afcbcaac54cc0a42ed18c66c` | https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/7 |
| 8 | Implement Match & Forecast Engine for federal grant predictive intelligence | true | open | `f647783c8279367b171649854a9df4c50e2c1846` | https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/8 |

## B. Agent cards (initial metadata-state cards)

### SENTINEL
- Claimed purpose: source monitoring / ingestion vigilance
- Actual implemented purpose: **NOT VERIFIED** (code not inspected in this initial pass)
- Evidence source: PR #6 title + head SHA `d54febe516a392f5e5c5773303f0f36452374b8b`
- Status: `INACCESSIBLE_NOT_VERIFIED` (implementation detail not yet proven)
- Reuse decision: `REIMPLEMENT_CONCEPT_ONLY`

### DECODER
- Claimed purpose: opportunity document extraction/decoding
- Actual implemented purpose: **NOT VERIFIED**
- Evidence source: PR #6 FOA pipeline claim + PR #4 decision terminal claim
- Status: `INACCESSIBLE_NOT_VERIFIED`
- Reuse decision: `REIMPLEMENT_CONCEPT_ONLY`

### PROFILER
- Claimed purpose: Agency DNA / profile synthesis
- Actual implemented purpose: **NOT VERIFIED**
- Evidence source: PR #7 + grantfounders PR #2 documentation lineage
- Status: `INACCESSIBLE_NOT_VERIFIED`
- Reuse decision: `REIMPLEMENT_CONCEPT_ONLY`

### ORACLE
- Claimed purpose: predictive reasoning
- Actual implemented purpose: **NOT VERIFIED**
- Evidence source: PR #8 "Match & Forecast"
- Status: `INACCESSIBLE_NOT_VERIFIED`
- Reuse decision: `REJECT_LOGIC` pending code proof due policy against unsupported probabilities

### RANKER
- Claimed purpose: scoring/ranking
- Actual implemented purpose: **NOT VERIFIED**
- Evidence source: PR #5 multi-agent claim
- Status: `INACCESSIBLE_NOT_VERIFIED`
- Reuse decision: `NEEDS_MANUAL_DECISION`

### STRATEGIST
- Claimed purpose: strategic plan generation
- Actual implemented purpose: **NOT VERIFIED**
- Evidence source: PR #5 multi-agent claim
- Status: `INACCESSIBLE_NOT_VERIFIED`
- Reuse decision: `NEEDS_MANUAL_DECISION`

### LEARNER
- Claimed purpose: outcome learning / adaptation
- Actual implemented purpose: **NOT VERIFIED**
- Evidence source: PR #5/8 claims
- Status: `INACCESSIBLE_NOT_VERIFIED`
- Reuse decision: `REIMPLEMENT_CONCEPT_ONLY`

## C. Related subsystem cards (initial)
- FOA HARVESTER — PR #6 (`d54febe...`) — status `CODE_PRESENT_UNMERGED` at PR metadata level, code-level function `NOT VERIFIED`.
- MATCH & FORECAST ENGINE — PR #8 (`f647783...`) — status `CODE_PRESENT_UNMERGED`; predictive claims require strict rejection gate until proven calibrated.
- COMPLIANCE VALIDATOR — `NOT_FOUND` in collected metadata.
- GRANT INTELLIGENCE AGENT — `NOT_FOUND` in collected metadata.
- AGENCY DNA BUILDER — PR #7 (`6b4ed59...`) — status `CODE_PRESENT_UNMERGED` at PR metadata level.
- ACE / GF-777ACE KERNEL — referenced in grantfounders docs, code-level kernel implementation `NOT VERIFIED` in this initial pass.
- DECISION ENGINE API — implied by PR #2/#3 titles, executable routing `NOT VERIFIED`.
- INSTITUTIONAL DECISION TERMINAL — PR #4 claim, implementation details `NOT VERIFIED`.
- DEMO CHATBOT — PR #3 claim, implementation details `NOT VERIFIED`.
- FRONTEND OPERATIONAL WORKFLOW — inaccessible repository request (`grantfounders-frontend` 404).
- UNIFIED DECISION REPORT WORKFLOW — inaccessible repository request (`grantfounders-frontend` 404).

## D. Claims-versus-code verification status
- Completed in this initial pack: **claims-versus-metadata** verification only.
- Deferred for subsequent forensic pass: executable code inspection, call graph, tests, DB I/O traceability.

## E. Required executive answers (initial-state answers)
1. Actual executable agents in code: **0 verified**.
2. Agents only in registry/config/title evidence: **all named agents in this initial pass**.
3. Agents with independent executable entrypoints: **none verified**.
4. Agents mounted/scheduled: **none verified**.
5. Agents merged into default branch: **none verified from collected metadata**.
6. Agents only in open/draft PRs: PR-linked systems #1-#8 in `federal-readiness-bot`.
7. Agents with meaningful tests: **none verified**.
8. Agents writing to declared tables: **none verified**.
9. Declared tables existing only in migrations: **not yet verified**.
10. Systems containing placeholders: **not yet verified**.
11. Systems using unsafe/unsupported scoring assumptions: **PR #8 claim area flagged; code proof pending**.
12. Compatible parts with Manus runtime: schema/traceability + ingestion concepts (adaptation required).
13. Parts requiring adaptation: all candidate reusable assets.
14. Parts to reject: unsupported probability/optimistic-default logic categories.
15. First integration package: FOA monitoring/ingestion freshness package.
16. Source files/SHAs for first package: PR #6 head SHA `d54febe516a392f5e5c5773303f0f36452374b8b` (path-level extraction pending code pull).
17. Acceptance tests: manifest-defined contract tests and deterministic hard-gate tests in current runtime.

# GrantFounders Agent-Assets Forensics — Executive Truth (Initial Evidence Pack)

## Scope
- Reporting repository: `BRAINBEHAVIOR/grantfounders`
- Audit branch (required): `copilot/agent-asset-forensics-manus-pack`
- Evidence mode: metadata/PR/SHA evidence only (GitHub API + local read-only repository metadata)
- Historical source porting: **not executed** in this initial pack

## Verified Counts (initial)
- Repositories inspected (accessible): **2**
  - `BRAINBEHAVIOR/grantfounders`
  - `BRAINBEHAVIOR/federal-readiness-bot`
- Repositories requested but inaccessible/not found by API: **2**
  - `BRAINBEHAVIOR/gf-777ace-orchestrator` (404)
  - `BRAINBEHAVIOR/grantfounders-frontend` (404)
- Refs inspected: **11**
  - `grantfounders`: `main` + `copilot/agent-asset-forensics-manus-pack` @ `9074648033bdd5bc24f6721ee295818ba7b9acb4`
  - `federal-readiness-bot`: PR heads #1-#8
- Actual executable agents found from code inspection: **0 (NOT VERIFIED in this initial metadata-only pass)**
- Merged agents: **0 (NOT VERIFIED)**
- Unmerged/open-draft agent implementations: **8 PR-linked candidate systems in federal-readiness-bot (#1-#8 are open draft)**
- Functional agents: **0 (NOT VERIFIED)**
- Partial/placeholder systems: **NOT VERIFIED (code-level inspection pending)**
- Inaccessible assets: **2 repositories**

## Confirmed repository evidence
- `BRAINBEHAVIOR/grantfounders`
  - Repository id: `1125606999`
  - Default branch: `main`
  - Notable files and SHA:
    - `README.md` — `335e14da45a0f56b8c3c4eab7c36c59ecc41f1a6`
    - `IMPLEMENTATION_SUMMARY.md` — `c035541a8b173d9a2757e96c87a315fe1b15957c`
    - `DEPLOYMENT_RUNBOOK.md` — `d619cd1d62d70030a00a74e9b27762e84f944a65`
    - `supabase_schema.sql` — `76476776abc695c652c7c9e9f7ef741fc9630711`
    - `web/` directory present
  - Evidence reference branch: `refs/heads/copilot/agent-asset-forensics-manus-pack` -> `9074648033bdd5bc24f6721ee295818ba7b9acb4`

- `BRAINBEHAVIOR/federal-readiness-bot`
  - Default branch: `main`
  - PR #1-#8 all currently `open` and `draft=true` by API
  - Head SHAs recorded in manifest and source index

## Top reusable assets (initial recommendation)
1. `federal-readiness-bot` PR #6 FOA Harvester concept (`d54febe516a392f5e5c5773303f0f36452374b8b`) — **REIMPLEMENT_CONCEPT_ONLY**
2. `federal-readiness-bot` PR #7 Agency DNA Builder concept (`6b4ed598c17b8d62afcbcaac54cc0a42ed18c66c`) — **REIMPLEMENT_CONCEPT_ONLY**
3. `federal-readiness-bot` PR #1 decision-traceability schema concept (`f762c3c25111022752c60c12d1f3315694e88177`) — **PORT_WITH_ADAPTATION**

## Top rejected logic (policy gate)
- Any approval/win probability output
- `AUTO_APPROVED` or optimistic state transitions
- Positive default scoring for unknown data
- Fabricated/hardcoded award or agency context treated as factual evidence

## Recommended integration order (initial)
1. FOA monitoring + ingestion freshness package (Sentinel/Harvester concept only)
2. Opportunity document decoding package (Decoder concept only)
3. Agency profile evidence package (Profiler concept only)

## Public PR references (federal-readiness-bot)
- #1 https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/1
- #2 https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/2
- #3 https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/3
- #4 https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/4
- #5 https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/5
- #6 https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/6
- #7 https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/7
- #8 https://github.com/BRAINBEHAVIOR/federal-readiness-bot/pull/8

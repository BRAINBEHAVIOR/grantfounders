# Rejected Logic Register (Initial Evidence Pack)

This register documents logic categories that **must not** be imported into the Manus runtime.
Current entries are evidence-backed from accessible metadata and policy constraints; source-file level extraction is pending follow-up forensic pull.

## R-001 — Predictive approval/win probability outputs
- Rejection category: `approval_probability`, `win_probability`, uncalibrated predictive confidence
- Source ref: `BRAINBEHAVIOR/federal-readiness-bot` PR #8
- Commit SHA: `f647783c8279367b171649854a9df4c50e2c1846`
- Path: `(path-not-yet-indexed from PR head)`
- Evidence class: PR metadata/title + policy gate
- Why rejected: Current Premium Decision OS policy forbids approval/win probability output and false precision.

## R-002 — AUTO_APPROVED and optimistic terminal states
- Rejection category: `AUTO_APPROVED`, `CONDITIONAL_APPROVAL`-style optimistic automation
- Source ref: cross-repo risk gate for all historical imports
- Commit SHA: `N/A (policy-level rejection pending code occurrence extraction)`
- Path: `(not yet located in accessible indexed paths)`
- Evidence class: integration policy gate
- Why rejected: final customer delivery requires human authorization; deterministic hard-gates cannot be bypassed.

## R-003 — Positive defaults for unknown/missing facts
- Rejection category: default/neutral/base positive scores without evidence
- Source ref: all candidate historical scoring imports, especially predictive/ranking subsystems
- Commit SHA: `f647783c8279367b171649854a9df4c50e2c1846` (risk area), `a028fa64a6b1ecaf2096f1c2c8e6abc30d612381` (risk area)
- Path: `(path-not-yet-indexed from PR heads)`
- Evidence class: PR metadata + policy gate
- Why rejected: unknown data must not contribute positive score in GF-777ACE 3.1.0 policy.

## R-004 — Hardcoded Agency DNA treated as official truth
- Rejection category: hardcoded agency context/defaults as factual evidence
- Source ref: `BRAINBEHAVIOR/federal-readiness-bot` PR #7
- Commit SHA: `6b4ed598c17b8d62afcbcaac54cc0a42ed18c66c`
- Path: `(path-not-yet-indexed from PR head)`
- Evidence class: PR metadata risk classification
- Why rejected: every material claim requires persisted provenance to official evidence.

## R-005 — Placeholder connectors/scrapers presented as active ingestion
- Rejection category: placeholder parser/scraper logic, empty collection returns, demo ingestion
- Source ref: `BRAINBEHAVIOR/federal-readiness-bot` PR #6 risk area
- Commit SHA: `d54febe516a392f5e5c5773303f0f36452374b8b`
- Path: `(path-not-yet-indexed from PR head)`
- Evidence class: unverified implementation risk
- Why rejected: parser completeness and connector health must be proven before import.

## R-006 — Parallel auth/database/report/run models
- Rejection category: importing duplicate auth, org, decision run, report, or database stacks
- Source ref: historical repository-to-Manus integration boundary
- Commit SHA: `N/A (architectural prohibition)`
- Path: `(integration policy boundary)`
- Evidence class: target runtime contract
- Why rejected: Manus runtime is canonical; only capability-level selective ports are allowed.

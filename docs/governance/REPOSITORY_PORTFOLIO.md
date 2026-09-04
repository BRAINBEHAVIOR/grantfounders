# GrantFounders Repository Portfolio

Status: governance baseline; implementation classifications remain provisional until source-level verification is complete.

## Canonical repository

`BRAINBEHAVIOR/grantfounders` is the canonical application repository for GrantFounders product development, integration decisions, production-bound changes, and release evidence unless the owner explicitly records a different decision.

No other repository may be treated as production authority merely because it contains a similarly named application, engine, frontend, backend, agent, schema, or orchestration layer.

## Governed repository set

| Repository | Governance role | Current handling |
|---|---|---|
| `BRAINBEHAVIOR/grantfounders` | Canonical application and integration authority | Preserve current architecture; use branches and pull requests; require evidence before merge |
| `BRAINBEHAVIOR/federal-readiness-bot` | Historical R&D and candidate source assets | Static source review only until a selective reuse decision is approved |
| `BRAINBEHAVIOR/gf-777ace-orchestrator` | Candidate orchestration asset | Verify source, contracts, dependencies, tests, provenance, and duplication before reuse |
| `BRAINBEHAVIOR/grantfounders-frontend` | Candidate frontend or legacy satellite | Verify whether it contains unique production-relevant assets before any consolidation |
| `BRAINBEHAVIOR/grantfounders-backend` | Candidate backend or placeholder satellite | Verify substantive implementation before assigning an architectural role |
| `BRAINBEHAVIOR/grantfounders-platform` | Candidate platform or legacy satellite | Verify source and overlap before preservation, migration, or archival decisions |

Repositories outside this table are out of scope for GrantFounders consolidation unless the owner explicitly adds them.

## Authority rules

1. `main` in the canonical repository is not modified directly for planned work.
2. Every production-bound change is made on a dedicated branch and reviewed through a pull request.
3. Historical code, PR descriptions, demos, generated documentation, screenshots, and claimed test results are evidence inputs, not proof of production readiness.
4. Reuse requires exact source paths and symbols, immutable commit provenance, dependency review, security review, target-runtime compatibility, deterministic acceptance tests, and rollback boundaries.
5. Critical eligibility, funding, scoring, probability, confidence, compliance, payment, authentication, authorization, tenant-isolation, or report-generation logic must fail closed when decisive evidence is absent.
6. No parallel authentication, organization, database, billing, reporting, or opportunity-ingestion subsystem may be introduced without an explicit architecture decision.
7. Secrets are never copied into issues, pull requests, documentation, logs, fixtures, or source code.
8. A repository is not archived, deleted, transferred, made public/private, or renamed until unique assets and external dependencies are verified.

## Active governance work

- PR #5 is the evidence-only Agent-Assets forensic audit. Its integration gate remains authoritative for candidate historical agent reuse.
- PR #6 establishes repository-level Copilot and pull-request governance. It does not approve any runtime implementation or historical port.

## Consolidation decision sequence

1. Establish immutable source inventory.
2. Identify unique and duplicated assets.
3. Classify implementation status and reuse disposition.
4. Verify target-runtime gaps in the canonical repository.
5. Approve only narrowly scoped integration packages.
6. Implement each approved package in an isolated branch.
7. Run and record deterministic validation.
8. Review security, data provenance, tenant isolation, and rollback.
9. Merge only after owner approval and satisfied gates.
10. Archive or retain satellites only after the canonical implementation is verified.

## Prohibited shortcuts

- Wholesale copying of a historical repository or PR.
- Treating generated probability or confidence values as validated evidence.
- Marking tests, CI, integrations, deployments, or data sources as operational without direct execution evidence.
- Using mock, fallback, placeholder, or fabricated data as production evidence.
- Merging documentation that silently authorizes implementation while its integration gate is blocked.

This document defines governance boundaries. It does not itself classify any candidate asset as production ready or authorize a port, migration, deployment, or merge.

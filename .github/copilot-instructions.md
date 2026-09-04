# GrantFounders Copilot Instructions

## Canonical repository
- Treat `BRAINBEHAVIOR/grantfounders` as the canonical application repository unless a task explicitly states otherwise.
- Treat historical or adjacent repositories as evidence/reference sources, not automatic port targets.

## Safety and evidence discipline
- Do not invent facts, metrics, testimonials, probabilities, award likelihoods, readiness determinations, agency behavior, funding amounts, or external-source results.
- Distinguish clearly among source present, statically reachable, runtime reachable, and production ready.
- Prefer fail-closed behavior when required evidence is missing.
- Never use positive defaults to compensate for unknown eligibility, requirements, past performance, financial capacity, agency profile, provenance, or source health.
- Do not derive `approval_probability`, `win_probability`, confidence, or forecast claims from an uncalibrated weighted score and present them as factual probabilities.

## Architecture
- Preserve existing authentication, organization/tenant, database, reporting, and billing models unless a task explicitly authorizes an architectural change.
- Do not create parallel auth, organization, database, scoring, report, or billing subsystems when an existing implementation can be extended.
- Current web application root is `web/` unless repository evidence for the target task proves otherwise.
- Supabase, Stripe, and external government-data integrations must be evidence-backed and must not silently fall back to fabricated success states.

## Historical agent assets
- `BRAINBEHAVIOR/federal-readiness-bot` contains historical R&D and agent prototypes. Reuse requires source-level inspection.
- Historical agent concepts may include SENTINEL, DECODER, PROFILER, ORACLE, RANKER, STRATEGIST, LEARNER, FOA Harvester, Agency DNA, and Match/Forecast assets.
- Never port historical logic wholesale merely because a PR description says it is production grade.
- Reject or redesign unsupported optimistic defaults, fabricated identifiers/context, pseudo-calibration, circular validation, fixed confidence assumptions, and unsupported autonomous recommendations.

## Forensic package gate
- The documentation package under `docs/agent-assets/` is a control surface for selective reuse.
- If `07_MANUS_INTEGRATION_MANIFEST.json` indicates a blocked gate, do not implement a candidate package based solely on `candidateIntegrationOrder`.
- Respect the scope of PR #5 and any owner instructions in that PR. Do not merge or convert forensic documentation work into implementation without explicit approval.

## Code quality
- Keep changes minimal, explicit, and testable.
- Reuse existing types, services, routes, helpers, and schemas before introducing abstractions.
- Validate external inputs and surface unknown/error states explicitly.
- Preserve provenance for external data: source, retrieval time, identifiers, freshness, and failure state when applicable.
- Add or update deterministic tests for business-critical changes. Do not claim tests passed unless they were actually executed in the current task/CI evidence.

## Pull requests
Every substantive PR should state:
1. problem and intended behavior;
2. exact scope/files changed;
3. source/evidence used for nontrivial business rules;
4. tests actually run and results;
5. migrations/config/env-name changes;
6. security/privacy implications;
7. known limitations/unknowns;
8. rollback path.

## Secrets
- Never commit secret values, tokens, private keys, credentials, or production PII.
- Environment variable names may be documented; values must remain outside the repository.

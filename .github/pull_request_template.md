# Pull Request

## Problem / intended behavior
Describe the problem being solved and the exact intended behavior.

## Scope
List the files/subsystems changed and explicitly state what is out of scope.

## Evidence / source of truth
For nontrivial eligibility, scoring, funding, agency, compliance, pricing, forecast, or external-data logic, cite the authoritative source or repository evidence used. Do not treat PR descriptions, mock data, or historical prototypes as production evidence.

## Tests actually run
- [ ] TypeScript/build checks
- [ ] Lint
- [ ] Unit/integration tests
- [ ] Relevant smoke test

List exact commands and results. If a test was not run, say `NOT RUN` and explain why.

## Data / schema / configuration
- Migrations:
- Environment variable names added/changed:
- External integrations affected:
- Backfill or compatibility impact:

## Security / privacy
Describe authentication, authorization, tenant isolation, secret-handling, PII, provenance, or external-call implications.

## Unknowns / limitations
List unresolved assumptions, missing evidence, unsupported runtime claims, or follow-up work.

## Rollback
Describe the concrete rollback boundary and how to restore the previous behavior safely.

## Production-readiness gate
- [ ] No fabricated identifiers, testimonials, metrics, probabilities, confidence, source results, or optimistic defaults
- [ ] Unknown critical facts fail closed or are surfaced explicitly
- [ ] Existing auth/org/database/report/billing architecture was reused unless explicitly authorized otherwise
- [ ] External data includes provenance/freshness/failure semantics where applicable
- [ ] Historical agent logic was source-reviewed before reuse
- [ ] CI/test claims are backed by current evidence

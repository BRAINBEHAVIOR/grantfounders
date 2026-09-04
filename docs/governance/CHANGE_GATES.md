# GrantFounders Change Gates

These gates apply to production-bound work in `BRAINBEHAVIOR/grantfounders`.

## Gate 0 — Scope and provenance

A pull request must identify:

- the business objective;
- exact files and systems in scope;
- source repository, branch or PR, and immutable commit SHA for reused material;
- explicit out-of-scope items;
- whether the change touches authentication, authorization, tenant isolation, database schema, billing, external APIs, scoring, reports, background jobs, or deployment configuration.

A change with unclear provenance or scope remains blocked.

## Gate 1 — Architecture compatibility

The author must show that the change:

- extends the canonical architecture rather than creating a duplicate subsystem;
- preserves the existing auth, organization, database, billing, report, and opportunity contracts unless an approved architecture decision changes them;
- identifies runtime, framework, language, package, storage, and environment-variable dependencies;
- separates historical concepts from source fragments actually approved for reuse.

Unverified compatibility blocks implementation approval.

## Gate 2 — Evidence and decision safety

For eligibility, readiness, match, ranking, forecast, probability, confidence, compliance, award, funding, or recommendation logic:

- inputs must be attributable to a named source;
- unknown decisive facts must remain unknown or block the decision;
- assumptions must be explicit and non-authoritative;
- deterministic rules must be versioned;
- generated values must not be presented as measured or calibrated unless calibration evidence exists;
- mock, fallback, placeholder, or synthetic data must be visibly separated from production outputs.

Positive defaults for missing critical evidence are prohibited.

## Gate 3 — Security and data boundaries

The pull request must document:

- authentication and authorization effects;
- tenant-isolation behavior;
- PII or sensitive-data handling;
- secret names required, without secret values;
- network destinations and external providers;
- rate limits, retries, timeouts, error behavior, and false-success risks;
- least-privilege assumptions;
- audit and provenance records written by the change.

Any unresolved high-severity security or cross-tenant risk blocks merge.

## Gate 4 — Database and migration safety

A schema or persistence change requires:

- forward migration;
- rollback or compensating procedure;
- compatibility assessment for existing records and callers;
- constraints and indexes justified by access patterns;
- tenant and audit fields reviewed;
- migration tested against a non-production environment;
- no destructive operation without explicit owner approval and backup/restore evidence.

Documentation-only claims are not migration evidence.

## Gate 5 — Deterministic validation

The pull request must list the exact commands actually executed and their results. Depending on scope, validation can include:

- formatting and linting;
- type checking;
- unit tests;
- integration tests;
- migration validation;
- build verification;
- API contract tests;
- authorization and tenant-isolation tests;
- failure-path and rollback tests;
- evidence fixtures with known expected outcomes.

“Should pass,” “appears valid,” or historical test claims are not successful test results.

## Gate 6 — Operational readiness

Production-bound changes require:

- deployment boundary and affected environment;
- required configuration names;
- observability and actionable error signals;
- source-health or job-health behavior where applicable;
- idempotency and retry behavior for state-changing operations;
- rollback trigger and owner;
- no unreviewed external call, scheduler, webhook, or background execution path.

A successful build alone does not establish operational readiness.

## Gate 7 — Review and merge

Before merge:

- all required evidence is present in the pull request;
- unresolved blockers are explicitly listed;
- review comments are resolved or consciously accepted;
- CI status corresponds to the current head SHA;
- the head SHA has not changed after final approval without renewed validation;
- the owner approves the release decision;
- merge strategy is selected intentionally.

Auto-merge remains disabled unless explicitly authorized for a narrowly defined class of low-risk changes.

## Risk tiers

### Tier 1 — Documentation and non-runtime governance

Examples: instructions, templates, evidence inventories, architecture records. Must not silently authorize runtime implementation.

### Tier 2 — Isolated non-critical runtime change

Examples: presentation-only UI or internal developer tooling without sensitive data or decision logic. Requires build and relevant tests.

### Tier 3 — Business-critical integration

Examples: opportunity ingestion, reporting, payments, external APIs, jobs, or persistent workflows. Requires integration, failure-path, provenance, and rollback evidence.

### Tier 4 — Decision, security, or data-critical change

Examples: eligibility, ranking, confidence/probability, auth, authorization, tenant isolation, schema, billing, or regulated/sensitive data. All gates apply; unknown critical facts fail closed.

## Exception process

An exception must be explicit in the pull request, identify the skipped gate, explain the reason, state the risk accepted, name the approving owner, and define an expiration or remediation issue. Silence is not an exception.

# Contributing to GrantFounders

`BRAINBEHAVIOR/grantfounders` is the canonical application repository. Changes must be evidence-backed, reviewable, and reversible.

## Workflow

1. Start from the current `main` branch.
2. Create a narrowly named branch, such as `feat/...`, `fix/...`, `chore/...`, `docs/...`, or `audit/...`.
3. Keep each branch focused on one reviewable outcome.
4. Open a draft pull request early for material changes.
5. Complete the pull-request template with evidence, validation, risk, unknowns, and rollback information.
6. Do not merge until the current head SHA has passed the required gates and received owner approval.

Do not push planned feature work directly to `main`.

## Canonical architecture

Before adding a subsystem, inspect the current repository and confirm that an equivalent contract or implementation does not already exist. Preserve existing authentication, organization, tenant, database, billing, reporting, and deployment boundaries unless an approved architecture decision explicitly changes them.

Historical repositories and pull requests are candidate evidence sources, not production authority. Reuse must be selective and traceable to exact paths, symbols, and immutable commits.

## Branch and commit conventions

Recommended branch forms:

- `feat/<scope>-<outcome>`
- `fix/<scope>-<defect>`
- `chore/<scope>-<maintenance>`
- `docs/<scope>-<document>`
- `audit/<scope>-<evidence>`

Recommended commit prefixes:

- `feat:` new product behavior
- `fix:` defect correction
- `refactor:` behavior-preserving restructuring
- `test:` validation only
- `docs:` documentation only
- `chore:` tooling or governance
- `security:` security correction

Commit messages should describe what changed, not merely the tool that generated it.

## Evidence requirements

Every material pull request should identify:

- exact requirement or issue addressed;
- source paths and symbols changed;
- external source or historical commit provenance when reused;
- assumptions and unresolved unknowns;
- commands actually run and their results;
- screenshots or fixtures only when they prove a stated behavior;
- security, data, migration, operational, and rollback implications.

Never claim that CI, tests, a deployment, an API, a source feed, or a model is working without direct evidence tied to the current head SHA.

## Decision and funding integrity

The following require heightened review:

- eligibility and readiness determinations;
- opportunity ranking or matching;
- probability, confidence, expected value, forecasting, or recommendations;
- compliance conclusions;
- funding, award, agency, applicant, or source claims;
- automated strategy generation.

Critical missing evidence must not receive a positive default. Simulated, mock, synthetic, fallback, and placeholder data must be clearly labeled and kept out of authoritative production outputs.

## Security

- Never commit secrets, credentials, API keys, private tokens, production exports, or sensitive personal data.
- Document environment-variable names only.
- Preserve tenant isolation and least privilege.
- Review authentication, authorization, webhook, scheduler, database, storage, and external-network changes explicitly.
- Report a suspected secret exposure privately and rotate the affected credential; do not reproduce it in an issue or pull request.

## Database changes

Schema changes require a reviewed migration, compatibility analysis, tenant and audit review, non-production validation, and a rollback or compensating procedure. Destructive changes require explicit owner approval and recovery evidence.

## Generated code and AI agents

Copilot, Manus, Codex, or another agent may assist, but the pull request remains accountable to repository evidence. Agents must follow `.github/copilot-instructions.md`, the pull-request template, `docs/governance/REPOSITORY_PORTFOLIO.md`, and `docs/governance/CHANGE_GATES.md`.

Do not allow an agent to:

- port an entire historical subsystem without approval;
- invent evidence, metrics, users, testimonials, awards, sources, or production status;
- bypass a blocked integration gate;
- modify unrelated files to make tests pass;
- expose or retrieve secret values;
- deploy or merge unless explicitly authorized.

## Pull-request size

Prefer the smallest complete change that can be independently reviewed, tested, rolled back, and understood. Split discovery, documentation, implementation, migration, and deployment into separate stages when they carry different risks.

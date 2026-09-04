# Fail-Closed Manus Selective-Port Instruction

Read `docs/agent-assets/07_MANUS_INTEGRATION_MANIFEST.json` before doing anything else.

## Mandatory stop condition

If `integrationGate.status` is **not exactly** `APPROVED`:

1. make no runtime source changes;
2. create or modify no migration, schema, dependency, workflow, configuration, auth, organization, billing, report, or deployment artifact;
3. execute no external API, scraper, scheduler, agent, database job, or historical CLI;
4. retrieve or expose no secret value;
5. deploy nothing;
6. merge nothing;
7. do not implement a package merely because it appears in `candidateIntegrationOrder`;
8. return a structured list of unresolved blockers and the evidence required to resolve each one;
9. **STOP.**

The current manifest status is `BLOCKED_PENDING_SOURCE_AND_TARGET_VERIFICATION`. Therefore, the only valid result from this prompt in the current state is a blocker report. No code implementation is authorized.

## Required blocker-report format

Return:

```json
{
  "status": "BLOCKED",
  "observedGateStatus": "<exact manifest value>",
  "sourceChangesMade": false,
  "migrationsCreatedOrRun": false,
  "externalApisCalled": false,
  "deploymentsPerformed": false,
  "secretsRetrieved": false,
  "unresolvedBlockers": [
    {
      "code": "<reason code>",
      "whyItBlocks": "<specific reason>",
      "requiredEvidence": ["<specific artifact or verification>"],
      "ownerDecisionRequired": true
    }
  ]
}
```

Do not substitute assumptions for missing evidence. Do not report success when a source returns no records or when a runtime cannot be inspected.

---

## Instructions that activate only after a future explicit approval

The remainder of this document is dormant unless all of these are true:

- `integrationGate.status == "APPROVED"`;
- the package ID is present in `integrationOrder`;
- owner approval identifies that exact package and approved scope;
- every approval condition is documented;
- the current target ref and rollback point are recorded.

Only then:

1. Read `00_EXECUTIVE_TRUTH.md`, `01_AGENT_PORTFOLIO_AUDIT.md`, `04_SELECTIVE_PORT_MATRIX.csv`, `05_REJECTED_LOGIC_REGISTER.md`, and `06_AGENT_DEPENDENCY_GRAPH.md`.
2. Work from a new branch based on the recorded target ref. Never commit directly to `main`.
3. Implement only the approved fragments. Reimplement concepts when the matrix says `REIMPLEMENT_CONCEPT_ONLY`; do not copy source wholesale.
4. Mechanically exclude every item listed under `prohibitedSourceLogic` and every matching global prohibition.
5. Preserve the existing canonical auth, organization, Supabase/database, report, billing, metering, and error-envelope contracts unless the approval explicitly authorizes a migration.
6. Critical unknowns must remain unknown and fail closed. Never create positive eligibility, confidence, probability, rank, funding, or recommendation from absent evidence.
7. Every external record must carry source, canonical source ID, retrieved timestamp, source-updated timestamp, raw checksum, parser version, request/run ID, source-health state, and amendment/version lineage.
8. Separate observed, derived, estimated, simulated, and unknown values in the schema and API.
9. Add deterministic fixtures and tests before enabling any scheduled or external execution.
10. Record exactly which tests were run. Never claim CI, source health, deployment, or production readiness without evidence.
11. Provide a rollback plan that restores source, schema, configuration, and scheduled execution.
12. Open a draft PR. Do not merge automatically.

## Non-negotiable rejected logic

Never port or recreate:

- score-derived approval/win probability;
- `AUTO_APPROVED` as a government or funder decision;
- automatic `pursue`/`pass` based on uncalibrated heuristics;
- positive defaults for missing eligibility, capability, financial, agency, or past-performance facts;
- fabricated rank, pool size, customer, award, funding-secured, or accuracy claims;
- mock CPARS, appropriations, J-Book, agency, or opportunity data presented as observed;
- empty/failed source runs represented as successful;
- arbitrary confidence, growth, delay, win-rate, salary, proposal-cost, technology-cost, ROI, or expected-value assumptions;
- prefix-only Bearer validation with service-role database access;
- a parallel auth/org/database/report/billing architecture.

`candidateIntegrationOrder` is advisory only. It is never an execution queue.

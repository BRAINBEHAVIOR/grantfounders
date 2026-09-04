# Manus Selective Port Prompt (Execute One Package Only)

Use the current **GrantFounders Premium Decision OS V1.1** runtime as the only source of truth.

1. Read `/docs/agent-assets/07_MANUS_INTEGRATION_MANIFEST.json`.
2. Select and implement **only the first package in `integrationOrder`**.
3. Port only assets whose `reuseDecision` is `PORT_AS_IS`, `PORT_WITH_ADAPTATION`, or `REIMPLEMENT_CONCEPT_ONLY`.
4. Do **not** merge historical repositories or branches wholesale.
5. Do **not** replace GF-777ACE 3.1.0 logic.
6. Do **not** import or emit `approval_probability`, `win_probability`, `AUTO_APPROVED`, or optimistic defaults for unknown data.
7. Do **not** create parallel auth, organization, decision-run, report, or database models.
8. Implement capability-level modules only, with deterministic hard-gates and evidence provenance.
9. Produce incremental diffs, checkpoints, and tests; do not deploy.
10. Stop after completing the first approved package and return:
   - changed files,
   - contract/test evidence,
   - rejected logic confirmations,
   - rollback boundary validation.

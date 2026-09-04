# Repository Access and Verification Ledger

## Correction of the preliminary package

The preliminary package classified `BRAINBEHAVIOR/gf-777ace-orchestrator` and `BRAINBEHAVIOR/grantfounders-frontend` as inaccessible based on earlier lookup failures. That classification is corrected. Both repositories are now accessible through the authorized GitHub connection and were inspected at immutable refs.

A 404 or unresolved lookup is not evidence that a repository is private, deleted, renamed, or nonexistent. This ledger distinguishes access from implementation content.

## Target repositories

| Repository | Access result | Immutable ref inspected | Inspection result | Classification |
|---|---|---|---|---|
| `BRAINBEHAVIOR/grantfounders` | ACCESSIBLE, admin-capable connection | audit base `9074648033bdd5bc24f6721ee295818ba7b9acb4`; PR #5 start `aa4b06b08e2788685a9b572eb689ce5c96bb865c`; current main `f167e7b446bdde626b28f7f1dc9acdddfb643ed1` | Canonical `web/` application plus historical PRs; selected source inspected | `MERGED_SOURCE_PRESENT_NOT_RUNTIME_VERIFIED` |
| `BRAINBEHAVIOR/federal-readiness-bot` | ACCESSIBLE, admin-capable connection | main `1f14bae19c71b4b642311b52cdc37262965e9ab5`; PRs #1–#8 at ledger SHAs | Eight PR branches are open/draft/unmerged; source inspected at selected mandatory paths | mixed unsafe/unmerged classifications |
| `BRAINBEHAVIOR/grantfounders-backend` | ACCESSIBLE | main `9bef1e57234dd402c8263e08d6b111f734671b18` | Tree contains `.gitignore` and minimal README only | `ACCESSIBLE_NO_SUBSTANTIVE_IMPLEMENTATION` |
| `BRAINBEHAVIOR/gf-777ace-orchestrator` | ACCESSIBLE | main `ca15fe13e03f198a7c8e955e707828f093b71f0c`; PR #1 `16835762044fcf3c6cbc3127fb1cc913b60e919b` | Contracts/registry/plan/fallback/tests exist; no functional agent executor or integration proof | `UNMERGED_ENTRYPOINT_PRESENT` |
| `BRAINBEHAVIOR/grantfounders-frontend` | ACCESSIBLE | main `fe1f229f347daa20d9bd70858d6af43fb75eca1f` | Separate Next.js 14/React 18 app; selected report adapter and mock legacy routes inspected | `MERGED_SOURCE_PRESENT_NOT_RUNTIME_VERIFIED` |

## No unresolved repository-access blocker in the defined scope

Within the Phase 2 repository scope, there are currently **no repositories classified `INACCESSIBLE_NOT_VERIFIED`**.

This does not mean every branch, deployment, service, or secret is verified. It means only that the named GitHub repositories and refs required for this static audit were accessible.

## External/runtime facts not verified

The following remain `NOT_VERIFIED_IN_CURRENT_TASK`:

- the actual Manus source tree/runtime and whether it matches GitHub `main`;
- Vercel project configuration, current production deployment, domains, build output, and environment values;
- live Supabase project schema, migrations applied, RLS policies, data, Edge Functions, cron jobs, and auth settings;
- live Stripe products, prices, webhook endpoint configuration, event replay/idempotency, and customer state;
- external API credentials, quotas, terms, response shapes, health, and historical completeness;
- runtime reachability of any historical agent, scraper, API, scheduler, or orchestrator;
- production logs, alerts, backups, disaster recovery, and incident procedures.

## Secret-handling record

- Environment-variable **names** were observed in source where necessary.
- Secret values were not requested, retrieved, printed, or committed.
- No external service was invoked.
- No deployment was performed.
- No historical test or job was run.

## Account/governance observation

The owner login `BRAINBEHAVIOR` is a GitHub **User** account in the observed API metadata, not a GitHub Organization. Repository access was nevertheless administrative for the named repositories. Organization/team governance is therefore outside the evidence proven by this package.

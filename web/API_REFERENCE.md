# GF-777ACE Internal Readiness Screening API

**Source contract:** `2.0`  
**Endpoint:** `POST /api/ace/score`  
**Runtime/deployment identity:** not established by this source document.

> **Critical limitation:** GF-777ACE is an owner-defined internal heuristic screening tool. It does not determine government or funder eligibility, approval, award, win probability, expected value, or likelihood of funding. Every result requires qualified human review.

## Authentication

The current endpoint accepts either:

- `Authorization: Bearer <api-key>`
- `x-gf-secret: <owner-secret>` for server-to-server owner operations

Never place `x-gf-secret` in browser code or a public environment variable.

## Request

```json
{
  "project_name": "Rural Water Access Initiative",
  "sector": "gov",
  "budget": 5000000,
  "duration_months": 36,
  "beneficiaries": 50000,
  "esg_score": 85,
  "risk_index": 25,
  "execution_capacity": 90,
  "scalability": 75,
  "strategic_value": 88,
  "compliance_score": 92,
  "expected_roi": 18
}
```

All fields must be supplied by the caller. The application must not invent missing values.

### Field constraints

| Field | Constraint |
|---|---|
| `project_name` | string |
| `sector` | `gov`, `health`, `bank`, or `fund` |
| `budget` | finite number |
| `duration_months` | finite number |
| `beneficiaries` | finite number |
| `esg_score` | finite number supplied by caller |
| `risk_index` | finite number supplied by caller |
| `execution_capacity` | finite number supplied by caller |
| `scalability` | finite number supplied by caller |
| `strategic_value` | finite number supplied by caller |
| `compliance_score` | finite number supplied by caller |
| `expected_roi` | finite number supplied by caller |

The API route validates types with Zod. Callers should apply stricter business-range validation before submission.

## Success response

```json
{
  "ok": true,
  "data": {
    "contract_version": "2.0",
    "ace_score": 87,
    "tier": "AAA",
    "readiness_band": "HIGH_ALIGNMENT",
    "decision": "REVIEW_REQUIRED",
    "human_review_required": true,
    "assessment_basis": "INTERNAL_HEURISTIC",
    "context_provenance": "INTERNAL_HEURISTIC",
    "kernel": "GF-777ACE-Quantum-v3.0",
    "rationale": "Internal readiness-alignment screening computed from owner-defined heuristic inputs and weights. Qualified human review is always required.",
    "limitations": [
      "Not a government or funder eligibility, approval, award, win-probability, or funding decision.",
      "The score is not outcome-calibrated and must not be interpreted as a probability.",
      "This context is not an observed profile of any government agency or funder.",
      "The values have not been outcome-calibrated or externally validated."
    ]
  }
}
```

## Internal score bands

| Internal tier | Score range | Readiness band | Workflow decision |
|---|---:|---|---|
| `AAA` | 85–100 | `HIGH_ALIGNMENT` | `REVIEW_REQUIRED` |
| `A` | 70–84 | `MODERATE_ALIGNMENT` | `REVIEW_REQUIRED` |
| `B` | 55–69 | `DEVELOPING_ALIGNMENT` | `REVIEW_REQUIRED` |
| `C` | 0–54 | `LOW_ALIGNMENT` | `REVIEW_REQUIRED` |

The tier is an internal band only. It is not a bond rating, government status, eligibility decision, approval, or award recommendation.

## Error envelope

Validation, authentication, and internal failures use:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid payload"
  }
}
```

Known codes in the current route include:

- `UNAUTHORIZED`
- `VALIDATION_ERROR`
- `INTERNAL_ERROR`

## CORS

The current source allows all origins for this route. Production origin restrictions remain a deployment/security task and must be verified separately.

## Other current endpoints

### `POST /api/auth`

Email/password sign-in or sign-up via the current authentication service. Authentication and tenant-isolation behavior must be verified against the deployed Supabase project and its RLS policies.

### `POST /api/stripe/checkout`

Creates a Stripe Checkout session using the configured server-side Stripe service.

### `POST /api/stripe/webhook`

Verifies the Stripe signature and processes supported checkout events. Live webhook configuration, replay/idempotency behavior, and provisioning recovery must be verified in the deployed environment.

## Usage example

```bash
curl -X POST "$BASE_URL/api/ace/score" \
  -H "Authorization: Bearer $GF_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Rural Water Access Initiative",
    "sector": "gov",
    "budget": 5000000,
    "duration_months": 36,
    "beneficiaries": 50000,
    "esg_score": 85,
    "risk_index": 25,
    "execution_capacity": 90,
    "scalability": 75,
    "strategic_value": 88,
    "compliance_score": 92,
    "expected_roi": 18
  }'
```

Do not expose API keys in committed source, screenshots, logs, or client-side public environment variables.

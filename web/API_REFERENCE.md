# GF-777ACE API Reference
**Production URL:** `https://www.grantfounders.com/api`  
**Kernel Version:** GF-777ACE-Quantum-v3.0  
**Authentication:** Bearer token (API Key)

---

## 📡 /api/ace/score

Evaluate project alignment with GrantFounders criteria using the GF-777ACE scoring kernel.

### Request

**Method:** `POST`  
**Content-Type:** `application/json`  
**Authentication:** Required (Bearer token)

#### Headers
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

#### Body Schema
```json
{
  "project_name": "string (required)",
  "sector": "gov|health|bank|fund (required)",
  "budget": "number (required, USD)",
  "duration_months": "number (required)",
  "beneficiaries": "number (required)",
  "esg_score": "number (0-100, required)",
  "risk_index": "number (0-100, required)",
  "execution_capacity": "number (0-100, required)",
  "scalability": "number (0-100, required)",
  "strategic_value": "number (0-100, required)",
  "compliance_score": "number (0-100, required)",
  "expected_roi": "number (%, required)"
}
```

#### Example Request
```bash
curl -X POST https://www.grantfounders.com/api/ace/score \
  -H "Authorization: Bearer gf_key_abc123xyz" \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Rural Water Access Initiative",
    "sector": "health",
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

### Response

#### Success (200 OK)
```json
{
  "ace_score": 87,
  "tier": "AAA",
  "decision": "AUTO_APPROVED",
  "kernel": "GF-777ACE-Quantum-v3.0",
  "rationale": "Computed via GF-777ACE weighting across efficiency, governance, sustainability, impact, and resilience."
}
```

#### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `ace_score` | number (0-100) | Final ACE score from kernel computation |
| `tier` | string | Rating tier: AAA, A, B, or C |
| `decision` | string | Approval decision (see below) |
| `kernel` | string | Kernel version used for computation |
| `rationale` | string | Explanation of scoring methodology |

#### Decision Logic
| Tier | Score Range | Decision |
|------|-------------|----------|
| **AAA** | ≥ 85 | AUTO_APPROVED (Highest confidence) |
| **A** | 70-84 | REVIEW_REQUIRED (Expert review needed) |
| **B** | 55-69 | CONDITIONAL_APPROVAL (Subject to conditions) |
| **C** | < 55 | BLOCKED (Does not meet criteria) |

#### Error Responses

**401 Unauthorized** - Missing API Key
```json
{
  "error": "API key required"
}
```

**403 Forbidden** - Invalid API Key
```json
{
  "error": "Invalid API key"
}
```

**400 Bad Request** - Invalid Payload
```json
{
  "error": "Invalid payload",
  "issues": [
    {
      "code": "invalid_type",
      "expected": "number",
      "received": "string",
      "path": ["budget"],
      "message": "Expected number, received string"
    }
  ]
}
```

**500 Internal Server Error**
```json
{
  "error": "Unexpected error",
  "detail": "Error message details"
}
```

### CORS

**Allowed Origins:** All (*)  
**Allowed Methods:** POST, OPTIONS  
**Allowed Headers:** Content-Type, Authorization

---

## 🔐 /api/auth

User authentication via email and password.

### Request

**Method:** `POST`  
**Content-Type:** `application/json`

#### Body Schema
```json
{
  "email": "string (valid email, required)",
  "password": "string (min 6 chars, required)",
  "action": "signin|signup (optional, defaults to 'signin')"
}
```

#### Example: Signup
```bash
curl -X POST https://www.grantfounders.com/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "action": "signup"
  }'
```

#### Example: Signin
```bash
curl -X POST https://www.grantfounders.com/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "action": "signin"
  }'
```

### Response

#### Success (200 OK)
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "email_confirmed_at": "2025-12-31T00:00:00Z",
    "created_at": "2025-12-31T00:00:00Z"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "refresh_token": "..."
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid Payload
```json
{
  "error": "Invalid payload",
  "issues": [
    {
      "code": "invalid_email",
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```

**401 Unauthorized** - Auth Failed
```json
{
  "error": "Invalid login credentials"
}
```

---

## 💳 /api/stripe/checkout

Create a checkout session for subscription to GF Pro.

### Request

**Method:** `POST`  
**Content-Type:** `application/json`

#### Body Schema
```json
{
  "email": "string (optional, customer email)"
}
```

#### Example
```bash
curl -X POST https://www.grantfounders.com/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com"
  }'
```

### Response

#### Success (200 OK)
```json
{
  "url": "https://checkout.stripe.com/pay/cs_..."
}
```

**Next Step:** Redirect user to the `url` returned.

#### Error Responses

**400 Bad Request** - Stripe Error
```json
{
  "error": "Invalid stripe price"
}
```

**500 Internal Server Error**
```json
{
  "error": "Unexpected error"
}
```

---

## 🪝 /api/stripe/webhook

Receive and process Stripe webhook events (checkout completion).

**Note:** This endpoint is called by Stripe servers, not by client applications.

### Request

**Method:** `POST`  
**Content-Type:** `application/json`  
**Header:** `stripe-signature` (required)

Stripe sends webhook events to this endpoint when:
- Checkout session is completed
- Subscription is created
- Payment is received

### Response

#### Success (200 OK) - Event Processed
```json
{
  "api_key": "gf_key_...",
  "received": true
}
```

On `checkout.session.completed`:
1. User created in Supabase Auth
2. Organization created
3. User added as owner
4. API key generated for org

#### Error Responses

**400 Bad Request** - Missing Signature
```json
{
  "error": "Missing Stripe signature"
}
```

**400 Bad Request** - Signature Verification Failed
```json
{
  "error": "Signature verification failed"
}
```

**400 Bad Request** - Missing Customer Email
```json
{
  "error": "Missing customer email"
}
```

**500 Internal Server Error**
```json
{
  "error": "Webhook handling failed",
  "detail": "Error details"
}
```

---

## 🔑 API Key Management

### Getting an API Key

1. **Purchase GF Pro** via `/api/stripe/checkout`
2. **Stripe webhook** (`/api/stripe/webhook`) triggers:
   - User & org creation
   - API key generation
3. **API key returned** in webhook response
4. **Use key** in Authorization header: `Bearer gf_key_...`

### API Key Format
- Prefix: `gf_key_`
- Generated by Supabase RPC: `create_api_key(org_id, name)`
- Stored in `api_keys` table
- Verified via Supabase RPC: `verify_api_key(key)`

### Rate Limiting

**Standard Limits:**
- 120 requests per minute per API key
- Window: 60 seconds
- Rate limit headers returned with each response

---

## 📊 Usage Tracking

Every successful API request logs:
```
{
  "org_id": "uuid",
  "api_key_id": "uuid",
  "endpoint": "ace/score|auth|stripe/checkout|stripe/webhook",
  "timestamp": "ISO 8601"
}
```

Stored in `usage_events` table in Supabase.

---

## 🔄 ACE Kernel Algorithm

The GF-777ACE kernel computes scores based on:

### Input Features Extraction
From 13 input parameters, extracts 5 key features:
- **Efficiency** - Budget utilization, ROI, execution capacity
- **Governance** - Compliance score, risk index
- **Sustainability** - Project duration, scalability
- **Impact** - Beneficiaries, strategic value, ESG score
- **Resilience** - Risk mitigation, execution capacity

### Weighting
```
Base weights:
- Efficiency: 25%
- Governance: 25%
- Sustainability: 20%
- Impact: 20%
- Resilience: 10%
```

**Agency context adjustments:**
- Innovation bias: ±5% on impact weighting
- Compliance bias: ±5% on governance weighting

### Normalization
- Scores clamped to 0-100 range
- Applied across all feature calculations
- Prevents outliers from skewing results

### Final Decision
Tier assigned based on normalized score:
- **AAA** (≥85): Auto-approved
- **A** (70-84): Requires expert review
- **B** (55-69): Conditional approval possible
- **C** (<55): Blocked

---

## 🛠️ Integration Examples

### Python
```python
import requests

API_KEY = "gf_key_your_api_key"
BASE_URL = "https://www.grantfounders.com/api"

# Score a project
response = requests.post(
    f"{BASE_URL}/ace/score",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "project_name": "Water Initiative",
        "sector": "health",
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
)

result = response.json()
print(f"Score: {result['ace_score']}")
print(f"Tier: {result['tier']}")
print(f"Decision: {result['decision']}")
```

### Node.js
```javascript
const API_KEY = "gf_key_your_api_key";
const BASE_URL = "https://www.grantfounders.com/api";

async function scoreProject(projectData) {
  const response = await fetch(`${BASE_URL}/ace/score`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(projectData)
  });

  return response.json();
}

const result = await scoreProject({
  project_name: "Water Initiative",
  sector: "health",
  budget: 5000000,
  duration_months: 36,
  beneficiaries: 50000,
  esg_score: 85,
  risk_index: 25,
  execution_capacity: 90,
  scalability: 75,
  strategic_value: 88,
  compliance_score: 92,
  expected_roi: 18
});

console.log(`Score: ${result.ace_score}`);
console.log(`Decision: ${result.decision}`);
```

### cURL
```bash
curl -X POST https://www.grantfounders.com/api/ace/score \
  -H "Authorization: Bearer gf_key_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Water Initiative",
    "sector": "health",
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
  }' | jq
```

---

## 📞 Support & Status

- **API Status:** https://www.grantfounders.com/status
- **Documentation:** https://docs.grantfounders.com
- **Support Email:** support@grantfounders.com
- **Issues:** Report via GitHub issues in `pedroviveiros2025/grantfounders`

---

**Last Updated:** December 31, 2025  
**Version:** 1.0.0

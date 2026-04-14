# Payments & Subscriptions — Frontend Integration Guide

> For the Next.js frontend engineer.
> Covers two things: (1) the full backend API as it exists today, structured as
> user stories from pricing page to cancellation; and (2) a gap analysis of
> PR #3101 against that backend, with a recommended order of attack.

---

## Conventions (applies to every endpoint)

- Base URL: `{{baseUrl}}/api/v2/users`
- Every authenticated request needs `Authorization: JWT <jwt_token>`
- Add `?tenant=airqo` to any request (optional — defaults to `airqo`)
- Every response follows the shape `{ success, message, data, status }`
- Pagination: pass `?page=1&limit=20` on list endpoints

---

# Part 1 — Backend API: User Stories

---

## Story 1 — User lands on the Pricing page

There are three tiers. These are static — no endpoint needed to fetch them.

| Tier | Hourly limit | Daily limit | Monthly limit | Included scopes |
|---|---|---|---|---|
| **Free** *(default for all users)* | 100 req/hr | 1,000/day | 10,000/mo | Recent measurements, devices, sites, cohorts, grids |
| **Standard** | 500 req/hr | 5,000/day | 50,000/mo | Free + historical measurements |
| **Premium** | 2,000 req/hr | 20,000/day | 200,000/mo | Standard + forecasts + insights |

Every new user starts on **Free**. Their current tier is on the user object
(`subscriptionTier`), already returned by the existing profile endpoint.

---

## Story 2 — User checks their current subscription state

All subscription fields live on the existing user object — no extra call needed.

```
GET /users/me
```

Relevant fields:

```json
{
  "subscriptionTier": "Free",
  "subscriptionStatus": "inactive",
  "nextBillingDate": null,
  "lastRenewalDate": null,
  "automaticRenewal": false,
  "currentSubscriptionId": null,
  "currentPlanDetails": {
    "priceId": null,
    "currency": null,
    "billingCycle": null
  },
  "apiRateLimits": {
    "hourlyLimit": 100,
    "dailyLimit": 1000,
    "monthlyLimit": 10000
  }
}
```

`subscriptionStatus` values: `inactive` | `active` | `past_due` | `cancelled`

---

## Story 3 — User clicks "Upgrade to Standard/Premium"

### Step 1 — Start a checkout session

```
POST /transactions/checkout
```

```json
{
  "customerId": "ctm_abc123",
  "priceId": "pri_abc123",
  "tier": "Standard",
  "successUrl": "https://analytics.airqo.net/subscription/success",
  "cancelUrl": "https://analytics.airqo.net/subscription/cancel"
}
```

**Response:**

```json
{
  "success": true,
  "data": { "checkoutUrl": "https://checkout.paddle.com/..." }
}
```

```js
// Next.js
const { data } = await api.post('/transactions/checkout', payload);
router.push(data.checkoutUrl); // redirect user to the provider's hosted page
```

> ⚠️ This endpoint returns `503` while payment provider credentials are not yet
> live in production. Show a graceful "coming soon" state — not a generic error.

```json
{ "success": false, "message": "Payment service is not configured", "status": 503 }
```

---

### Step 2 — User completes payment on the provider's hosted page

The payment provider redirects back to your `successUrl`. The webhook has
already fired server-side and updated:

- `user.subscriptionTier` → e.g. `"Standard"`
- `user.subscriptionStatus` → `"active"`
- `user.nextBillingDate`
- The user's API token `scopes` and `tier` fields

### Step 3 — Refresh the user's subscription state

On the `successUrl` page, re-fetch the user profile (Story 2) to reflect the
new tier in your UI/store. You can also fetch the specific subscription record:

```
GET /transactions/:id/subscription-status
```

```json
{
  "success": true,
  "data": {
    "status": "active",
    "tier": "Standard",
    "nextBillingDate": "2026-05-05T23:59:59.999Z"
  }
}
```

---

## Story 4 — User wants to generate a dynamic price

If you need a custom/calculated price ID before opening checkout (e.g. volume-based):

```
POST /transactions/pricing/generate
```

Returns a price ID from the payment provider to pass to the checkout endpoint.

> Returns `503` when the payment provider is not configured.

---

## Story 5 — User views their transaction history

```
GET /transactions/transaction-history?start_date=2026-01-01&end_date=2026-04-06&status=completed&page=1&limit=20
```

All query params are optional. `end_date` is inclusive (covers the full day up
to 23:59:59). `status` values: `completed` | `pending` | `failed` | `refunded`

---

## Story 6 — User enables automatic renewal

```
POST /transactions/:id/enable-auto-renew
```

No body required. Sets `automaticRenewal: true` on the user. The background job
runs daily at 2 AM EAT and processes renewals automatically.

---

## Story 7 — User renews manually

```
POST /transactions/:id/renew-subscription
```

No body required. Uses the subscription ID stored on the user to fetch the
current billing period end date from the payment provider and records the renewal.

> Returns `503` when the payment provider is not configured.

---

## Story 8 — User cancels their subscription

```
POST /transactions/:id/cancel-subscription
```

No body required. Confirm with the user before calling. After cancellation:

- `subscriptionStatus` → `"cancelled"`
- `subscriptionCancelledAt` is set
- The tier remains until the end of the billing period (background job runs
  daily at 1 AM EAT to sync status)

> Returns `503` when the payment provider is not configured.

---

## Story 9 — Webhook (server-to-server — no frontend involvement)

```
POST /transactions/webhook
```

Called by the payment provider automatically after any payment event. **Do not
call or proxy this from the frontend.** It handles tier upgrades, renewals, and
cancellations automatically.

---

## Story 10 — Admin creates a fundraising Campaign

Campaigns are independent of the payment provider and work fully today.

```
POST /campaigns/create
```

```json
{
  "title": "Clean Air Fund Q2",
  "description": "Raise funds for sensor deployment in Kampala",
  "goal_amount": 5000,
  "category": "environment",
  "start_date": "2026-04-10",
  "end_date": "2026-06-30"
}
```

> `category` and `goal_amount` are required. Common mistake: using `amount` or
> `target` instead of `goal_amount`.

---

## Story 11 — Users browse and interact with Campaigns

```
GET  /campaigns/list?page=1&limit=20
GET  /campaigns/:id
GET  /campaigns/:id/updates       — progress updates (paginated)
GET  /campaigns/:id/donations     — donations list (paginated)
```

---

## Story 12 — Admin manages a Campaign

```
PATCH  /campaigns/:id/update          — send only changed fields
PATCH  /campaigns/:id/toggle-status   — activate or pause
POST   /campaigns/:id/updates         — post a progress update
DELETE /campaigns/:id/delete
GET    /campaigns/stats
GET    /campaigns/reports/campaign-report
```

---

## Story 13 — Super-admin manages Scope Rules *(admin panel only)*

Scope rules map URL patterns to the subscription scope required to access them.
Admins can update enforcement without a code deploy.

```
POST   /scope-rules/seed-defaults     — one-time setup, safe to re-run
GET    /scope-rules
POST   /scope-rules
PUT    /scope-rules/:rule_id
DELETE /scope-rules/:rule_id
```

**Create / update body:**

```json
{
  "pattern": "/devices/forecasts",
  "scope": "read:forecasts",
  "priority": 10,
  "description": "Forecasts require Premium tier",
  "active": true
}
```

Rules are evaluated in ascending `priority` order — lower number wins.

---

## Currently off — what to expect when turned on

Two backend flags are `false` everywhere right now. Existing tokens are
completely unaffected. When turned on per-environment:

| Flag | What changes for users |
|---|---|
| `ENABLE_TOKEN_RATE_LIMITING` | API calls beyond the hourly tier limit return `429 Too Many Requests` |
| `ENABLE_SCOPE_ENFORCEMENT` | Requests to gated paths return `403 Forbidden` if the token's scope doesn't cover them |

Only **new tokens** with explicit scopes set are subject to scope enforcement.
All existing legacy tokens are permanently exempt.

---

# Part 2 — Gap Analysis: PR #3101 vs the Backend

> PR: [feat(billing): Integrate secure payment methods with Google reCAPTCHA](https://github.com/airqo-platform/AirQo-frontend/pull/3101)

All Next.js BFF routes exist and the React UI is wired to them, but **no route
currently makes a real outbound call to the auth-service** — all return
hardcoded mock data. The findings below are what needs resolving before wiring
up real calls.

---

## Gap 1 — Critical: Checkout flow mismatch

**What the frontend does today:** `CheckoutDialog` collects raw card details
(number, CVV, expiry, billing address) and POSTs them, expecting
`{ success, message }` back.

**What the backend does:** Returns `{ data: { checkoutUrl } }` — a URL on the
payment provider's hosted page. The user must be redirected there; the backend
never touches card details directly.

**Action needed:** Agree on the UX pattern before anything else. The backend
today only supports the redirect flow.

---

## Gap 2 — Field name mismatches

| Frontend sends | Backend expects | Fix |
|---|---|---|
| `planId` | `priceId` | Rename in checkout body |
| `autoRenewal` | `automaticRenewal` | Rename in user type + subscription response |
| `startDate` | Does not exist — use `lastRenewalDate` | Update `UserSubscription` type |
| `response.transactions` | `response.data` | Array is under `data`, not `transactions` |

---

## Gap 3 — Wrong HTTP methods and missing path parameters

Every subscription mutation endpoint requires the subscription record `_id` as a
path parameter (`:id`). Source this from `user.currentSubscriptionId`.

| Frontend route | Backend endpoint | Issues |
|---|---|---|
| `PUT /api/subscription/auto-renewal` | `POST /transactions/:id/enable-auto-renew` | Wrong verb; missing `:id`; backend takes no body |
| `POST /api/subscription/cancel` | `POST /transactions/:id/cancel-subscription` | Missing `:id` |
| `POST /api/subscription/reactivate` | `POST /transactions/:id/renew-subscription` | Missing `:id` |
| `GET /api/subscription` | `GET /transactions/:id/subscription-status` | Missing `:id`; response shape mismatch |

---

## Gap 4 — Rate limits are off by 10x

The mock data in `subscription/usage/route.ts` and `subscription/plans/route.ts`
uses wrong values.

| Tier | Frontend mock (wrong) | Backend (correct) |
|---|---|---|
| Free | 10 / 100 / 1,000 | **100 / 1,000 / 10,000** |
| Standard | 100 / 1,000 / 10,000 | **500 / 5,000 / 50,000** |
| Premium | 1,000 / 10,000 / 100,000 | **2,000 / 20,000 / 200,000** |

---

## Gap 5 — Response shape mismatches

| Frontend expects | Backend actually returns | Fix |
|---|---|---|
| `{ subscription: UserSubscription, usage: ApiUsage }` | `{ data: { status, tier, nextBillingDate } }` | Map `data` fields; get `usage` from `user.apiRateLimits` |
| `{ transactions: Transaction[] }` | `{ data: [...] }` | Read `response.data` |
| `{ plans: SubscriptionPlan[] }` | No plans endpoint exists | Hardcode from the static tier table in Part 1 |
| `Transaction.reference` | Not returned by backend | Remove or make optional |

---

## Gap 6 — UI features with no backend endpoint yet

These need new backend work — cannot be wired up as-is.

| UI feature | What's missing |
|---|---|
| Subscription plans listing | No plans endpoint — hardcode from the static tier table |
| API usage stats display | No usage endpoint — use `user.apiRateLimits` from profile instead |
| Billing info view / edit | No billing info CRUD endpoint |
| Payment method update | No card update endpoint |
| **Disable** auto-renew | Backend only has `enable-auto-renew`; no disable/toggle yet |
| Receipt / invoice download | No download endpoint |

---

## Gap 7 — JWT not forwarded through the BFF layer

None of the proxy routes currently forward the user's auth token to the backend.
Every auth-service endpoint requires `Authorization: JWT <token>`. Wire this
through NextAuth session → BFF proxy → backend on every route.

---

## Gap 8 — Backend namespaces with no frontend coverage yet

The following are ready and waiting when needed:

- **Campaigns** — all 10 endpoints (create, list, view, update, toggle, updates, donations, stats, report, delete)
- **Scope Rules** — all 5 admin endpoints
- **Admin transaction endpoints** — list, stats, financial report, update, delete

---

## Recommended order of attack

1. **Agree on checkout UX** — redirect flow vs in-page card form (§ Gap 1)
2. **Fix field names** — `planId`, `autoRenewal`, `startDate`, `response.data` (§ Gap 2)
3. **Add `:id` to all mutation routes** — from `user.currentSubscriptionId` (§ Gap 3)
4. **Correct rate limit constants** — all 10x off (§ Gap 4)
5. **Wire JWT** through the BFF layer on every proxy route (§ Gap 7)
6. **Align response shapes** for subscription status and transaction history (§ Gap 5)
7. **Swap mock usage/plans data** for real profile fields and static tier table (§ Gap 6)
8. **Handle 503 gracefully** — all checkout/cancel/renew endpoints return `503` until payment provider credentials are live

---

## Next.js integration checklist

- [ ] Read `subscriptionTier`, `subscriptionStatus`, `nextBillingDate`, `apiRateLimits` from the existing user profile — no extra endpoint needed
- [ ] On `successUrl` page: re-fetch user profile to update tier in state/store
- [ ] Handle `503` from all payment endpoints gracefully — show "coming soon" state
- [ ] Gate "Upgrade" button on `subscriptionStatus !== 'active'`
- [ ] Gate "Cancel" button on `subscriptionStatus === 'active'`
- [ ] Confirm with the user before calling cancel — it is immediate server-side
- [ ] Design for `403` on data endpoints even though scope enforcement is off now — it will turn on

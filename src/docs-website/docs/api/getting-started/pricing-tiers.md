---
sidebar_position: 2
sidebar_label: Pricing & Tiers
---

# Pricing & Access Tiers

The AirQo API is available on three tiers. Start for free and upgrade as your needs grow.

---

## Tier comparison

| Feature | Free | Standard | Premium |
|---------|------|----------|---------|
| Recent hourly measurements (last 7 days) | ✅ | ✅ | ✅ |
| Spatial heatmaps | ✅ | ✅ | ✅ |
| Historical data (up to 1 year) | ❌ | ✅ | ✅ |
| Raw sensor data | ❌ | ✅ | ✅ |
| Daily aggregations | ❌ | ✅ | ✅ |
| Bulk data exports | ❌ | ✅ | ✅ |
| Hourly forecasts (7-day) | ❌ | ❌ | ✅ |
| Daily forecasts (7-day) | ❌ | ❌ | ✅ |
| Health tips with forecasts | ❌ | ❌ | ✅ |
| **Price** | **$0/month** | **$50/month** | **$150/month** |
| Support | Community | Email | Priority |

---

## Free Tier — $0/month

Best for individual developers, students, and small proof-of-concept projects.

**What you get:**
- Recent hourly calibrated measurements (last 7 days)
- Access via Site ID, Device ID, Cohort ID, and Grid ID
- Spatial heatmap visualisations

**Limitations:**
- No access to data older than 7 days
- No raw sensor readings
- No forecast data
- Standard rate limits apply

---

## Standard Tier — $50/month

Best for research projects, NGOs, small businesses, and applications that need historical context.

**What you get:**
- Everything in the Free Tier
- Full historical data access (up to 1 year)
- Raw sensor readings via the Analytics API
- Daily and weekly aggregated data
- Bulk data export functionality
- Pagination support for large queries

---

## Premium Tier — $150/month

Best for commercial applications, government agencies, and any use case requiring predictive capability.

**What you get:**
- Everything in the Standard Tier
- 7-day hourly air quality forecasts
- 7-day daily air quality forecasts
- Health recommendations based on predicted pollution levels
- Priority API access and higher rate limits
- Dedicated technical support

---

## How to upgrade

1. Log in at [analytics.airqo.net](https://analytics.airqo.net).
2. Go to **Account Settings → Subscription**.
3. Select your desired tier and complete payment.
4. Your access is upgraded immediately.

---

## Special pricing

- **Academic institutions and non-profits:** Discounts available. Email [support@airqo.net](mailto:support@airqo.net) with proof of status.
- **Annual subscriptions:** 20% discount applied automatically.
- **Enterprise:** Custom plans for organisations requiring dedicated infrastructure, white-label options, SLA guarantees, or on-premises deployment. Contact [support@airqo.net](mailto:support@airqo.net).

---

## Rate limits

If you exceed your tier's rate limit, you will receive an `HTTP 429 Too Many Requests` response. Implement exponential backoff and retry logic in your application, or upgrade to a higher tier for increased limits.

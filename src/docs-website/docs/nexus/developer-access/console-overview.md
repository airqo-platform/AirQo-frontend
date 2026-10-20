---
sidebar_position: 1
sidebar_label: Console Overview
---

# Nexus Console

The Nexus Console is the account area for API access and subscription operations. Use it when you are moving from interactive exploration to a script, application, or recurring data workflow.

## Open the Console

1. Sign in to [AirQo Nexus](https://nexus.airqo.net/).
2. Open the workspace sidebar.
3. Select **Console**.

Direct URL: `https://nexus.airqo.net/console`

The Console is linked to your AirQo account. API clients, usage, and subscription details are not the same as an organization workspace's monitoring permissions.

## Console sections

| Section | What it shows |
| --- | --- |
| **Overview** | Requests used this month, API client count, current plan, daily request volume, and recent clients. |
| **API Clients** | Create clients, generate or regenerate tokens, edit client names, and manage token security. |
| **Subscriptions** | Compare available tiers, review usage limits, manage renewal, and view transactions. |
| **Profile** | Return to your account settings. |

Request volume is shown by day for the current month in UTC. The overview also includes quick links to create a client, compare plans, and open the full [AirQo API documentation](https://platform.airqo.net/docs/api/intro/).

## Choose the right access method

- Use [Nexus Data Export](../exporting-data/data-export.md) for a one-off file prepared through the interface.
- Use the [Dataset Visualizer](../visualizing-data/dataset-visualizer.md) for your own CSV or XLSX files.
- Use an [API client](./api-clients.md) for a repeatable integration.
- Use the [raw-data endpoint](../../api/analytics-api/raw-data.md) when you need raw, minute-level readings or finer-than-hourly resolution.

## Security basics

Treat API tokens as secrets. Do not commit them to source control, expose them in client-side code, or share them in tickets or chat. Restrict a token to the grids, cohorts, origins, days, and UTC hours it actually needs.

## Related guides

- [API Clients](./api-clients.md)
- [Subscriptions and Usage](./subscriptions-and-usage.md)
- [Raw Sensor Data API](../../api/analytics-api/raw-data.md)

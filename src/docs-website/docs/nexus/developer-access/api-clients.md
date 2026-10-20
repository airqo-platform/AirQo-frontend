---
sidebar_position: 2
sidebar_label: API Clients
---

# API Clients

An API client is a named account entry used to generate an AirQo API access token. Create separate clients for separate applications or environments so that access can be reviewed and restricted independently.

## Create a client

1. Open **Console > API Clients**.
2. Select **Create Client**.
3. Enter a descriptive name, such as `research-dashboard` or `production-pipeline`.
4. Save the client.
5. Select **Generate Token** and copy the token into your secure secret store.

The token is used to authenticate requests described in the [AirQo API documentation](https://platform.airqo.net/docs/api/intro/).

## Manage a client

The API Clients table can show the client name, status, creation date, IP information, and token status. Available actions include:

- **Edit:** Update the client details.
- **Generate Token:** Create a token for an active client that does not have one.
- **Regenerate Token:** Replace an expired or suspended token. Update your application with the new value.
- **Manage Security:** Restrict where and when the token can be used.

An inactive client cannot generate a token until it is reinstated through the workflow shown in Nexus.

## Restrict token access

Open **Manage Security** for a client token. You can configure:

- **Grids:** IDs of grids the token may access.
- **Cohorts:** Cohort IDs the token may access.
- **Allowed origins:** Full `http` or `https` origins for browser-based integrations.
- **Access schedule:** Allowed days and a start/end window in UTC.

An empty list leaves that dimension unrestricted. The schedule is enforced only when enabled. Do not add a broad origin or scope when a narrower value will work.

## Suspicious activity

Nexus can automatically suspend a token when suspicious activity is detected. The Manage Security dialog shows the reason and time when available and provides **Reinstate token** when reinstatement is allowed. If you cannot confirm that the token is safe, regenerate it instead and investigate the old credential.

## Token handling checklist

- Store the token in a server-side secret manager or environment variable.
- Never put a secret token in a public browser bundle or public repository.
- Use separate clients for development, staging, and production.
- Rotate a token after exposure or when a team member or integration no longer needs access.
- Set origin and schedule restrictions for browser or scheduled workloads.

## Related guides

- [Console Overview](./console-overview.md)
- [Subscriptions and Usage](./subscriptions-and-usage.md)
- [AirQo API documentation](https://platform.airqo.net/docs/api/intro/)
- [Raw Sensor Data API](../../api/analytics-api/raw-data.md)

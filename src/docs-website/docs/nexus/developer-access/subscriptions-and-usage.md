---
sidebar_position: 3
sidebar_label: Subscriptions and Usage
---

# Subscriptions and Usage

Use **Console > Subscriptions** to review the account's API plan, usage, limits, and billing history.

## Sections

The page has three sections:

- **Subscription & Tiers:** Review the current tier and compare the tiers currently offered to your account. Nexus can start a checkout, upgrade, downgrade, resume or turn off automatic renewal, and cancel a paid subscription when those actions are available.
- **Usage & Limits:** Review the requests and limits associated with your account.
- **Transactions:** Review billing transactions and receipts available to the account.

The available tiers, prices, limits, and actions are loaded from the billing service and can change. Use the values displayed in Nexus as the current source of truth.

## Change a plan

1. Open **Console > Subscriptions**.
2. Review the available plan cards and the current plan status.
3. Select the action for the tier you want.
4. Complete checkout when prompted, or confirm the requested change.
5. Return to the page to confirm that the subscription status and access date have refreshed.

Downgrades may take effect at the next billing period while the current tier remains available. Read the confirmation message before approving a change.

## Renewal and cancellation

- Turning off automatic renewal keeps access through the displayed access date but stops the next renewal.
- Resuming renewal turns scheduled billing back on.
- Cancelling a subscription ends the subscription record; it is different from only turning off the next renewal.
- A past-due or paused status can affect API access. Follow the action shown in Nexus to update billing or resume access.

## Usage guidance

Monitor the Console overview and Usage & Limits section before increasing request volume. If an application needs more access, review the available tier or reduce unnecessary requests with caching, batching, and an appropriate polling interval.

## Related guides

- [Console Overview](./console-overview.md)
- [API Clients](./api-clients.md)
- [AirQo API documentation](https://platform.airqo.net/docs/api/intro/)

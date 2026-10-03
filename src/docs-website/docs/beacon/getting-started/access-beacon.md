---
sidebar_position: 1
---

# Access Beacon

Beacon uses the same AirQo account and the same workspaces as [Vertex](/vertex/intro). If you can sign in to Vertex, you can sign in to Beacon — there's no second registration and no separate device list to build.

## Prerequisites

* An AirQo account. If you don't have one, create it at [analytics.airqo.net](https://analytics.airqo.net/user/creation/individual/register).
* At least one monitor registered in Vertex. See [The Beneficiary Journey](../beneficiary-journey.md) if you haven't done this yet.

## Steps to Sign In

1. Go to [beacon.airqo.net](https://beacon.airqo.net).
2. Enter the email address on your AirQo account, then your password. You can also use the social sign-in options if you registered that way.
3. Beacon opens on the fleet dashboard.

:::note
Beacon has no sign-up page. Opening `/register` redirects you to sign-in, because account creation happens once on AirQo Analytics and is shared across all AirQo products.
:::

Forgotten your password? Reset it at [analytics.airqo.net/user/forgotPwd](https://analytics.airqo.net/user/forgotPwd). The change applies to Vertex and Beacon too.

## Choose Your Workspace

Beacon shows one workspace at a time, and your workspace decides which monitors and which tools you see. Use the workspace switcher in the top-right corner to change it.

Switch to the **same workspace your monitors were registered under in Vertex**. If your monitors live in an Organization Workspace and you're looking at your personal one, your fleet will appear to be missing.

## What You'll See

Your sidebar is built from your workspace and your role, so it won't look identical for everyone.

Members of a beneficiary organization normally see:

| Section | What it's for |
|---|---|
| **Devices** | Your organization's monitors, searchable and filterable |
| **Performance Analysis** | Uptime and data quality across cohorts, grids, or individual devices |
| **Maintenance** | A map of your fleet for planning field visits |
| **Reports** | PDF device health reports |

Two things you may notice are absent, and both are expected:

* **My Devices** appears only in the AirQo personal context. In an organization workspace, monitors belong to the organization, so they're under **Devices** instead.
* The **Administrative Panel** — IoT Diagnostics, Collocation, Firmware Management, Device Categories, and Stock & Inventory — is an AirQo-internal toolset and isn't offered to beneficiary organizations.

## Troubleshooting

### My fleet is empty

**Problem**: You're signed in, but Beacon shows no devices.

**Solution**:
1. Check the workspace switcher. This is by far the most common cause.
2. Open Vertex and confirm the monitors are registered and assigned to a cohort.
3. Confirm the monitors have been deployed to a site. Undeployed monitors have no location and are easy to overlook.

### Maintenance, Reports, or Performance Analysis is missing

**Problem**: Sidebar sections you expected aren't there.

**Solution**: These require an active workspace and, depending on the section, specific permissions on your role. Select your organization's workspace first. If the sections are still hidden, ask your organization administrator to review your role — roles and permissions are managed on AirQo Nexus, not in Beacon.

### I can sign in to Vertex but not Beacon

**Problem**: The same credentials are rejected.

**Solution**: Check for a typo in the email address, then reset your password at [analytics.airqo.net/user/forgotPwd](https://analytics.airqo.net/user/forgotPwd). Because both products authenticate against the same account, a working Vertex sign-in and a failing Beacon sign-in nearly always means a mistyped credential rather than a missing account.

## What's Next

- [**Monitor Your Fleet**](./monitor-your-fleet.md) — Read the dashboard, inspect a monitor, plan maintenance, and export reports.
- [**The Beneficiary Journey**](../beneficiary-journey.md) — The full path from unboxing to monitoring.

---
sidebar_position: 10
---

# User Management

:::warning AirQo staff only
Requires the AirQo workspace and device-maintenance rights. See [Administrative Panel](./overview.md).
:::

**User Management** lists platform user accounts and allows new ones to be added.

## The User List

| Column | Notes |
|---|---|
| **First Name** | |
| **Last Name** | |
| **Email** | The address the user signs in with |
| **Phone Number** | |
| **Status** | Active, Inactive, or Pending |
| **Joined** | When the account was created |

A **Pending** status means the account exists but hasn't been completed by the user — usually an unaccepted invitation or unverified email. A run of pending accounts after an onboarding push normally means invitation emails aren't arriving rather than that people are ignoring them.

## Adding a User

**Add New User** takes first name, last name, email, phone number, and a password.

## Where Roles and Permissions Live

This page manages *accounts*. It is not where you decide what someone can do.

Roles, permissions, and organization membership are managed on **AirQo Nexus** — see the [Roles & Permissions guide](/nexus/organization-management/roles-and-permissions) and [Managing Members](/nexus/organization-management/managing-members). Because one AirQo account spans Beacon, [Vertex](/vertex/intro), and AirQo Analytics, what a user can reach in Beacon follows from their Nexus group membership and role, not from anything set here.

:::important
Creating an account here does not grant access to any organization's data. Until the user is a member of a group with appropriate permissions, they will sign in to a Beacon with nothing in it.
:::

## Troubleshooting

### A user can sign in but sees nothing

**Problem**: A new account reaches Beacon but has no devices or sections.

**Solution**: The account exists but has no group membership. Add them to the right organization in Nexus and assign a role — Beacon's navigation is built from active workspace plus permissions, so a user with no group sees almost nothing by design.

### A user's status stays Pending

**Problem**: An account never becomes Active.

**Solution**: The user hasn't completed setup. Confirm the email address is right and that invitation mail is reaching them — check a spam folder before recreating the account, since a duplicate account with a second address makes the problem harder to unpick.

### A user can't see the Administrative Panel

**Problem**: An AirQo staff member has no admin tools.

**Solution**: Both conditions must hold — their active workspace must be the **AirQo** group, and they need `DEVICE_MAINTAIN` or group administrator rights. Have them check the workspace switcher first; it's usually that rather than the permission.

## What's Next

- [**Administrative Panel**](./overview.md) — What the panel contains and who can open it.
- [**Access Beacon**](../getting-started/access-beacon.md) — Signing in and workspaces, from the user's side.

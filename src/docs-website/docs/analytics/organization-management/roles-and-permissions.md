---
sidebar_position: 3
sidebar_label: Roles & Permissions
---

# Organization Roles & Permissions

A guide to managing roles, permissions, and members within your organization on the AirQo Analytics platform.

---

## What Is an Organization?

An organization is a workspace on the AirQo Analytics platform where team members collaborate. Each organization has its own set of members, roles, permissions, and settings. You can belong to multiple organizations and switch between them from the header dropdown.

When you first join the AirQo Analytics platform, you are assigned to a default organization. Organization administrators can invite additional members, create custom roles, and configure settings.

---

## How Roles & Permissions Work

AirQo uses a **roles and permissions system** to control what each member can do:

```text
Organization
 └── Roles (e.g., CLEAN_AIR_NETWORK_ADMIN, DEFAULT_MEMBER)
      └── Permissions (e.g., MEMBER_INVITE, ROLE_EDIT)
           └── Members (assigned to roles)
```

- **Roles** are named collections of permissions. Each organization can define its own roles.
- **Permissions** are individual access rights (like `MEMBER_VIEW` or `DATA_EXPORT`) that determine what a user can see and do.
- **Members** are assigned one or more roles. The permissions from all assigned roles combine to determine what the member can access.

:::note
Access is determined by the *permissions* your roles grant, not by the role name itself. Two organizations may define roles with the same display name but different permissions.
:::

---

## How Roles Are Named

All organization-scoped roles are prefixed with the organization's **normalized title** (uppercased, with special characters stripped). For example, an organization called `"Clean Air Network"` uses the prefix `CLEAN_AIR_NETWORK`.

Role codes mirror role names (uppercased and underscored).

---

## Default Roles Created at Organization Creation

When an organization is created, the following roles are created automatically.

### 1. `ADMIN`

Created immediately when the organization is created and assigned to the user who created it.

| Permission | Description |
|------------|-------------|
| `MEMBER_VIEW` | View organization members |
| `MEMBER_INVITE` | Invite new members |
| `MEMBER_SEARCH` | Search members |
| `MEMBER_EXPORT` | Export member data |
| `MEMBER_REMOVE` | Remove members |

The `ADMIN` role also includes all default administrator permissions.

### 2. `{ORG_NAME}_SUPER_ADMIN`

Full organization-level access. This role receives **all system permissions except** the following system-only permissions:

`SYSTEM_ADMIN`, `SUPER_ADMIN`, `DATABASE_ADMIN`, `ADMIN_FULL_ACCESS`, `SYSTEM_CONFIGURE`, `SYSTEM_MONITOR`, `ACCESS_PLATFORM`.

In practice, this covers every organization, group, user, role, device, site, analytics, data, dashboard, and settings permission.

:::important
`{ORG_NAME}_SUPER_ADMIN` is **not** a platform super admin. It cannot access system or platform-level controls.
:::

### 3. `{ORG_NAME}_ADMIN`

Organization administrator. Cannot touch platform-level system controls.

| Category | Permissions |
|----------|-------------|
| **Organization management** | `ORG_CREATE`, `ORG_VIEW`, `ORG_UPDATE`, `ORG_DELETE`, `ORG_APPROVE`, `ORG_REJECT` |
| **Group management** | `GROUP_VIEW`, `GROUP_CREATE`, `GROUP_EDIT`, `GROUP_DELETE`, `GROUP_MANAGEMENT` |
| **User management** | `USER_MANAGEMENT`, `USER_INVITE`, `ORG_USER_ASSIGN` |
| **Role management** | `ROLE_VIEW`, `ROLE_CREATE`, `ROLE_EDIT`, `ROLE_DELETE`, `ROLE_ASSIGNMENT` |
| **Device** | `DEVICE_*` (all device permissions) |
| **Site** | `SITE_*` (all site permissions) |
| **Dashboard** | `DASHBOARD_*` |
| **Analytics** | `ANALYTICS_*` |
| **Data** | `DATA_*` |
| **Settings** | `SETTINGS_*` |

### 4. `{ORG_NAME}_DEFAULT_MEMBER`

Baseline role for regular organization members.

| Permission | Description |
|------------|-------------|
| `API_ACCESS` | Access the AirQo API |
| `TOKEN_GENERATE` | Generate access keys for the AirQo API |
| `ANALYTICS_VIEW` | View analytics |
| `GROUP_VIEW` | View group details |
| `MEMBER_VIEW` | View group members |
| `DASHBOARD_VIEW` | View dashboards |
| `DATA_VIEW` | View air quality data |
| `DATA_EXPORT` | Export data |
| `DEVICE_VIEW` | View devices |
| `DEVICE_CLAIM` | Claim a device |
| `DEVICE_DEPLOY` | Deploy a device |
| `SITE_VIEW` | View sites |

:::tip
When assigning a default role to a newly invited member, use `{ORG_NAME}_DEFAULT_MEMBER`.
:::

---

## Default Role Created On Demand

### `{ORG_NAME}_GROUP_MANAGER`

Created only when a group manager is explicitly assigned via the API (`assignGroupManager`).

| Permission | Description |
|------------|-------------|
| `GROUP_MANAGEMENT` | Manage group settings |
| `USER_MANAGEMENT` | Manage users |
| `ROLE_ASSIGNMENT` | Assign roles |
| `ORG_USER_ASSIGN` | Assign users to organization |
| `GROUP_SETTINGS` | Edit group settings |
| `ANALYTICS_VIEW` | View analytics |
| `MEMBER_INVITE` | Invite members |
| `CONTENT_MODERATION` | Moderate content |

---

## Custom Roles

In addition to the default roles, organization administrators can create custom roles with any combination of permissions.

### Creating a New Role

1. Navigate to **Roles & Permissions** in the sidebar.
2. Select **Create New Role**.
3. Enter a **Role Name** (for example, "Data Analyst" or "Field Technician").
4. Optionally add a **Description** explaining what the role is for.
5. Select **Create**.

:::note Requires ROLE_CREATE
This action requires the `ROLE_CREATE` permission.
:::

### Editing Role Permissions

1. Go to **Roles & Permissions** and select the role you want to edit.
2. You will see a checklist of all available permissions.
3. Check or uncheck permissions to add or remove them from the role.
4. Select **Save** to apply changes.

:::note Requires ROLE_EDIT
This action requires the `ROLE_EDIT` permission.
:::

### Activating or Deactivating a Role

1. Open the role detail page.
2. Use the **Status** dropdown to toggle between **ACTIVE** and **INACTIVE**.
3. An inactive role will not be available for assignment to members.

:::note Requires ROLE_EDIT
This action requires the `ROLE_EDIT` permission.
:::

---

## Assigning Roles to Members

### Single Assignment

1. Go to the **Members** page and select the member's name.
2. On the member detail page, find the **Roles** section.
3. Use the dropdown to select a role to assign.
4. Select **Assign**.

### Bulk Assignment

1. Go to the **Members** page.
2. Select multiple members using the checkboxes in the table.
3. Select the **Assign Role** button that appears.
4. Choose the role from the dropdown.
5. Confirm the assignment.

### Removing a Role

1. Open the member's detail page.
2. Find the role you want to remove.
3. Select the **Unassign** or remove button next to the role.
4. Confirm the action.

:::note
You can only assign roles that exist within the same organization.
:::

---

## Available Permissions

### Member Management

| Permission | Description |
|------------|-------------|
| `MEMBER_VIEW` | View the list of organization members and see individual member details. |
| `MEMBER_INVITE` | Send email invitations to new members and manage pending join requests. |
| `MEMBER_REMOVE` | Remove members from the organization. |

### Role Management

| Permission | Description |
|------------|-------------|
| `ROLE_VIEW` | View the list of roles and see role details. |
| `ROLE_CREATE` | Create new custom roles for the organization. |
| `ROLE_EDIT` | Edit existing roles, change their permissions, and toggle their status (active/inactive). |

### Organization Management

| Permission | Description |
|------------|-------------|
| `GROUP_MANAGEMENT` | Access organization settings, update organization details, change the Group Manager, and configure organization theme. |

### Data

| Permission | Description |
|------------|-------------|
| `DATA_EXPORT` | Export and download organization data from analytics and data visualizer pages. |

---

## Permission Reference

| Action | Required Permission |
|--------|-------------------|
| View members list | `MEMBER_VIEW` |
| View member details | `MEMBER_VIEW` |
| Send invitations | `MEMBER_INVITE` |
| Approve/reject join requests | `MEMBER_INVITE` |
| Remove a member | `MEMBER_REMOVE` |
| View roles list | `ROLE_VIEW` |
| View role details | `ROLE_VIEW` |
| Create a new role | `ROLE_CREATE` |
| Edit role permissions | `ROLE_EDIT` |
| Change role status | `ROLE_EDIT` |
| Access organization settings | `GROUP_MANAGEMENT` |
| Update organization details | `GROUP_MANAGEMENT` |
| Set Group Manager | `GROUP_MANAGEMENT` |
| Export data | `DATA_EXPORT` |

---

## Related Guides

- [Managing Members](./managing-members.md) — invite, assign roles, and remove members
- [Member Requests](./member-requests.md) — approve or reject join requests
- [Organization Settings](./organization-settings.md) — configure the organization workspace

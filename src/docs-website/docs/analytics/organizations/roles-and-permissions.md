---
sidebar_position: 1
sidebar_label: Roles & Permissions
---

# Organization Roles & Permissions Guide

A comprehensive guide to understanding how roles, permissions, and member management work in your AirQo organization.

---

## Table of Contents

1. [What Is an Organization?](#what-is-an-organization)
2. [How Roles & Permissions Work](#how-roles--permissions-work)
3. [Default Roles](#default-roles)
4. [Available Permissions](#available-permissions)
5. [Managing Organization Members](#managing-organization-members)
6. [Inviting New Members](#inviting-new-members)
7. [Handling Join Requests](#handling-join-requests)
8. [Creating & Managing Custom Roles](#creating--managing-custom-roles)
9. [Assigning Roles to Members](#assigning-roles-to-members)
10. [Setting a Group Manager](#setting-a-group-manager)
11. [Organization Settings](#organization-settings)
12. [Leaving an Organization](#leaving-an-organization)
13. [Common Workflows](#common-workflows)
14. [Frequently Asked Questions](#frequently-asked-questions)

---

## What Is an Organization?

An organization is a workspace on the AirQo platform where team members collaborate. Each organization has its own set of members, roles, permissions, and settings. You can belong to multiple organizations and switch between them from the header dropdown.

When you first join the platform, you are assigned to a default organization. Organization administrators can invite additional members, create custom roles, and configure settings.

---

## How Roles & Permissions Work

AirQo uses a **permission-based Role-Based Access Control (RBAC)** system. Here is how the pieces fit together:

```
Organization
 └── Roles (e.g., Manager, Member, Viewer)
      └── Permissions (e.g., MEMBER_INVITE, ROLE_EDIT)
           └── Members (assigned to roles)
```

- **Roles** are named collections of permissions. Each organization can define its own roles.
- **Permissions** are individual access rights (like `MEMBER_VIEW` or `DATA_EXPORT`) that determine what a user can see and do.
- **Members** are assigned one or more roles within an organization. The permissions from all assigned roles combine to determine what the member can access.

:::note
Access is determined by the *permissions* your roles grant, not by the role name itself. An organization's "Manager" role may have different permissions than another organization's "Manager" role.
:::

---

## Default Roles

Every organization comes with a set of default roles. The exact roles depend on your organization's configuration, but common defaults include:

| Role | Typical Description |
|------|-------------------|
| **Organization Owner** | Full access to all organization features, settings, and member management. Usually assigned to the person who created the organization. |
| **Manager** | Can manage members, roles, and most organization settings. Cannot delete the organization. |
| **Member** | Can access shared resources, view data, and perform day-to-day tasks. Cannot manage roles or invite new members unless explicitly granted. |
| **Viewer** | Read-only access to the organization's data and resources. Cannot make changes. |

:::note
Organization administrators can create additional custom roles with any combination of permissions.
:::

---

## Available Permissions

Permissions are the building blocks of access control. Below is a comprehensive list of permissions available in the platform:

### Member Management Permissions

| Permission | What It Grants |
|------------|---------------|
| `MEMBER_VIEW` | View the list of organization members and see individual member details. |
| `MEMBER_INVITE` | Send email invitations to new members and manage pending join requests. |
| `MEMBER_REMOVE` | Remove members from the organization. |

### Role Management Permissions

| Permission | What It Grants |
|------------|---------------|
| `ROLE_VIEW` | View the list of roles and see role details. |
| `ROLE_CREATE` | Create new custom roles for the organization. |
| `ROLE_EDIT` | Edit existing roles, change their permissions, and toggle their status (active/inactive). |

### Organization Management Permissions

| Permission | What It Grants |
|------------|---------------|
| `GROUP_MANAGEMENT` | Access organization settings, update organization details, change the Group Manager, and configure organization theme. |

### Data Permissions

| Permission | What It Grants |
|------------|---------------|
| `DATA_EXPORT` | Export and download organization data from analytics and data visualizer pages. |

---

## Managing Organization Members

### Viewing Members

1. Navigate to your organization using the header dropdown.
2. Click **Members** in the sidebar.
3. You will see a paginated list of all members with their names, emails, and assigned roles.

:::note Requires MEMBER_VIEW
This action requires the `MEMBER_VIEW` permission.
:::

### Viewing Member Details

1. Click on any member's name in the members list.
2. The detail page shows the member's profile information and all roles currently assigned to them within the organization.

:::note Requires MEMBER_VIEW
This action requires the `MEMBER_VIEW` permission.
:::

### Removing a Member

1. Navigate to the **Members** page.
2. Click the **Remove** button next to the member you want to remove.
3. Confirm the removal in the dialog that appears.

Alternatively, from the member detail page:

1. Click **Remove from Organization**.
2. Confirm the action.

:::caution
You cannot remove the organization's Group Manager. You must reassign the manager role first. This action requires the `MEMBER_REMOVE` permission.
:::

---

## Inviting New Members

There are two ways new members can join an organization:

### Method 1: Email Invitation (Admin-Initiated)

1. Navigate to the **Members** page.
2. Click the **Send Invites** button.
3. Enter the email addresses of the people you want to invite (one per line or comma-separated).
4. Click **Send**.

The invitees will receive an email with a link to join your organization. When they click the link:

- If they already have an AirQo account, they will be added to the organization after confirming.
- If they do not have an account, they will be prompted to create one first.

:::note Requires MEMBER_INVITE
This action requires the `MEMBER_INVITE` permission.
:::

### Method 2: Join Request (User-Initiated)

1. A user requests to join your organization (via the platform or a shared link).
2. The request appears in the **Member Requests** tab of your Members page.
3. You can **Approve** or **Reject** each request.

:::note Requires MEMBER_INVITE
This action requires the `MEMBER_INVITE` permission to view and manage join requests.
:::

### Viewing Pending Invitations

If you have pending invitations from other organizations:

- A notification banner will appear at the top of your dashboard showing the number of pending invitations.
- Click **View invitation(s)** to see all pending invites.
- From there, you can **Accept** or **Reject** each invitation.

---

## Handling Join Requests

When someone requests to join your organization:

1. Go to **Members > Member Requests** in the sidebar.
2. You will see a list of pending requests with the applicant's name, email, and request date.
3. Click **Approve** to add them to the organization, or **Reject** to decline.

:::note Requires MEMBER_INVITE
This action requires the `MEMBER_INVITE` permission.
:::

---

## Creating & Managing Custom Roles

### Creating a New Role

1. Navigate to **Roles & Permissions** in the sidebar.
2. Click **Create New Role**.
3. Enter a **Role Name** (e.g., "Data Analyst", "Field Technician").
4. Optionally add a **Description** explaining what the role is for.
5. Click **Create**.

:::note Requires ROLE_CREATE
This action requires the `ROLE_CREATE` permission.
:::

### Editing Role Permissions

1. Go to **Roles & Permissions** and click on the role you want to edit.
2. You will see a checklist of all available permissions.
3. Check or uncheck permissions to add or remove them from the role.
4. Click **Save** to apply changes.

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

### Assigning a Role to a Single Member

1. Go to the **Members** page and click on the member's name.
2. On the member detail page, find the **Roles** section.
3. Use the dropdown to select a role to assign.
4. Click **Assign**.

### Bulk Role Assignment

1. Go to the **Members** page.
2. Select multiple members using the checkboxes in the table.
3. Click the **Assign Role** button that appears.
4. Choose the role from the dropdown.
5. Confirm the assignment.

### Removing a Role from a Member

1. Open the member's detail page.
2. Find the role you want to remove.
3. Click the **Unassign** or remove button next to the role.
4. Confirm the action.

:::note
The ability to assign roles depends on the roles available in your organization. You can only assign roles that exist within the same organization.
:::

---

## Setting a Group Manager

The Group Manager is a special designation for the primary administrator of an organization. The manager has overall responsibility for the organization and appears with a **Manager** badge in the members list.

### How to Set a Group Manager

1. Go to **Organization Settings** in the sidebar.
2. Open the **Group Details** tab.
3. Use the **Group Manager** dropdown to select a member.
4. Save your changes.

:::note Requires GROUP_MANAGEMENT
This action requires the `GROUP_MANAGEMENT` permission.
:::

### Important Notes About the Group Manager

- There can only be **one** Group Manager per organization.
- The Group Manager **cannot be removed** from the organization. You must assign a new manager before removing the current one.
- The Group Manager badge is visible next to the manager's name in the members list.

---

## Organization Settings

Organization settings allow you to configure your workspace's appearance and basic information.

### Accessing Organization Settings

1. Click **Organization Settings** in the sidebar.
2. You will see two tabs: **Theme** and **Group Details**.

:::note Requires GROUP_MANAGEMENT
This action requires the `GROUP_MANAGEMENT` permission.
:::

### Theme Settings

Customize the look and feel of your organization's workspace:

- **Primary Color:** Choose from preset colors or enter a custom hex code.
- **Appearance:** Light, Dark, or Auto (follows system preference).
- **Interface Style:** Default or Bordered.
- **Content Layout:** Compact or Wide.

### Group Details

Manage your organization's information:

- **Group Title:** The display name of your organization.
- **Group Manager:** The primary administrator (see [Setting a Group Manager](#setting-a-group-manager)).
- **Logo:** Upload your organization's logo (displayed in the sidebar and header).
- **Status:** Active or Inactive.
- **Industry:** Your organization's industry category.
- **Country:** The country where your organization operates.
- **Timezone:** Your organization's timezone.
- **Website:** Your organization's website URL.
- **Description:** A brief description of your organization.

---

## Leaving an Organization

If you want to leave an organization you no longer need access to:

1. Click on your profile icon and go to **Profile**.
2. Navigate to the **Security** tab.
3. Scroll to the **Leave Organization** section at the bottom.
4. Click **Leave Organization**.
5. Confirm your decision in the dialog.

:::caution
Leaving an organization will revoke your access to all its resources, data, and collaboration features. This action can only be undone by being re-invited by an administrator.
:::

:::note
The Group Manager cannot leave the organization. You must transfer the manager role first.
:::

---

## Common Workflows

### Workflow 1: Setting Up a New Organization

1. **Request Organization:** If you need a new organization, go to **Request New Organization** from the organization selector dropdown. Fill in the required details and submit.
2. **Wait for Approval:** An AirQo administrator will review and approve your request.
3. **Configure Settings:** Once approved, go to Organization Settings to set up your theme, logo, and organization details.
4. **Invite Members:** Navigate to the Members page and send email invitations to your team.
5. **Create Roles:** Set up custom roles with the specific permissions your team members need.
6. **Assign Roles:** Assign the appropriate roles to each member.

### Workflow 2: Onboarding a New Team Member

1. **Send Invitation:** Go to Members > Send Invites and enter their email address.
2. **Member Accepts:** The new member receives an email and clicks the link to join.
3. **Assign Role:** Once they accept, go to their member detail page and assign the appropriate role.
4. **Verify Access:** Confirm the member can access the features they need.

### Workflow 3: Granting Additional Access

1. **Identify the Permission Needed:** Determine what the member needs to do (e.g., export data, manage roles).
2. **Check Existing Roles:** Go to Roles & Permissions to see if a role already has that permission.
3. **Option A - Use Existing Role:** If a suitable role exists, assign it to the member.
4. **Option B - Create New Role:** If no existing role fits, create a new role with the required permissions and assign it to the member.
5. **Option C - Edit Existing Role:** If you want multiple members to have the new permission, edit an existing role to include it.

### Workflow 4: Managing Role Changes

1. **Review Current Roles:** Go to Roles & Permissions to see all roles and their permissions.
2. **Edit the Role:** Click on the role and modify its permissions.
3. **Save Changes:** All members with that role will automatically gain or lose the affected permissions.
4. **Deactivate if Needed:** If a role is no longer needed, set its status to INACTIVE to prevent future assignments.

---

## Frequently Asked Questions

### Can I belong to multiple organizations?

Yes. You can be a member of multiple organizations simultaneously. Use the organization selector dropdown in the header to switch between them.

### What happens to my access if my role is changed?

Your access updates immediately. If permissions are removed from your role, you will lose access to the corresponding features. If permissions are added, you will gain access.

### Can I create a role with no permissions?

Yes, but it would not grant the member any access beyond the platform's base functionality. Roles are most useful when they contain specific permissions.

### What is the difference between the Group Manager and an Organization Owner role?

The Group Manager is a **designation** assigned to one specific member, visible with a badge. The Organization Owner is a **role** with a specific set of permissions. A member can hold both the Group Manager designation and the Organization Owner role simultaneously.

### How do I know what permissions I have?

Navigate to your profile page within the organization. Your assigned roles and their permissions will be displayed there.

### Can a member have multiple roles?

Yes. A member can be assigned multiple roles. Their effective permissions are the **union** of all permissions from all assigned roles.

### What if I need a permission that doesn't exist in any role?

Contact your organization's administrator. They can create a new role with the specific permission or add it to an existing role.

### Who can manage organization settings?

Only members with the `GROUP_MANAGEMENT` permission can access and modify organization settings.

### Can I undo removing a member?

No. Once a member is removed, they must be re-invited to rejoin the organization.

### What happens to data when a member is removed?

The member's contributions (data, configurations, etc.) remain in the organization. Only their access is revoked.

---

## Quick Reference: Permission Matrix

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

## Need Help?

If you have questions about roles and permissions that are not covered in this guide, contact your organization administrator or reach out to the AirQo support team.

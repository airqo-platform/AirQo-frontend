---
sidebar_position: 3
sidebar_label: Roles & Permissions
---

# Organization Roles & Permissions

Roles control what members can see and do in an organization workspace. A role
is a named set of permissions, and a member's access is determined by the
permissions assigned to that member—not by the role name alone.

## Before you begin

You must be in an organization workspace. The pages and actions available to
you depend on your current permissions:

| Task | Permission used by Nexus |
| --- | --- |
| View members, member details, and member requests | `MEMBER_VIEW` |
| Invite members | `MEMBER_INVITE` |
| Remove a member | `MEMBER_REMOVE` |
| View roles and permissions | `ROLE_VIEW` |
| Create a role | `ROLE_CREATE` |
| Edit role details or permissions | `ROLE_EDIT` |
| Assign or unassign roles | `ROLE_ASSIGNMENT` |
| Open organization settings | `GROUP_MANAGEMENT` |

If a page or control is not visible, ask an organization administrator to
review your role. Role names can differ between organizations.

## View roles

1. Switch to the organization workspace.
2. Select **Roles & Permissions** in the sidebar.
3. Search the roles table if needed.
4. Select **Manage** for a role to view its details and permissions.

The role detail page shows the role name, description, status, selected
permissions, and the complete permission list returned to your organization.

## Create a role

1. Open **Roles & Permissions**.
2. Select **Create New Role**.
3. Enter a role name. Nexus converts the name to uppercase and replaces spaces
   or unsupported characters with underscores.
4. Optionally add a description.
5. Select **Create Role**.

:::note Requires ROLE_CREATE
The **Create New Role** action requires `ROLE_CREATE`.
:::

Create roles around a clear responsibility, such as data analysis or field
operations. Give each role only the permissions required for that
responsibility.

## Edit a role

1. Open **Roles & Permissions** and select **Manage** for the role.
2. To change the role name or status, select the edit control in the role
   details and select **Save**.
3. To change permissions, select or clear the permission checkboxes.
4. Select **Save Changes**. Use **Discard Changes** if you want to restore the
   last saved permission set.

Roles can be **Active** or **Inactive**. Keep a role inactive when it should no
longer be available for normal use, and review existing assignments before
changing a role that many members depend on.

:::note Requires ROLE_EDIT
Editing role details, status, or permissions requires `ROLE_EDIT`.
:::

## Assign a role to one member

1. Open **Members** and select the member's name.
2. In **Group Roles**, select **Assign Role**.
3. Choose a role that is not already assigned to the member.
4. Select **Assign Role** and confirm that the new role appears in the member's
   details.

## Assign a role to several members

1. Open **Members**.
2. Select the members with the table checkboxes.
3. Select **Assign Role**.
4. Choose a role and select **Assign Role**.

:::note Requires ROLE_ASSIGNMENT
Assigning or unassigning roles requires `ROLE_ASSIGNMENT`.
:::

## Unassign a role

1. Open the member's details.
2. In **Group Roles**, select the remove control next to the role.
3. Confirm **Unassign Role**.

Unassigning a role can remove access to pages and actions immediately. Check
the remaining roles before removing the last role that provides a required
capability.

## Understand permission-based access

Nexus uses permissions to protect both pages and actions. For example:

- `MEMBER_VIEW` controls access to the members and member-requests pages and
  the member-details view.
- `MEMBER_INVITE` controls the **Send Invites** action.
- `MEMBER_REMOVE` controls **Remove from Group**; the organization manager
  cannot be removed until management is transferred.
- `ROLE_VIEW`, `ROLE_CREATE`, and `ROLE_EDIT` control the corresponding role
  workflows.
- `DATA_EXPORT` controls organization export actions. If it is missing, the
  **Review & Download** action may not appear on the export page.
- `GROUP_MANAGEMENT` controls organization settings and manager updates.

The permission list is loaded by Nexus and may change as the platform evolves.
Use the permission descriptions shown on the role detail page as the current
source of truth.

## Related guides

- [Managing Members](./managing-members.md) — invite, assign, and remove members
- [Member Requests](./member-requests.md) — review, approve, and reject join requests
- [Organization Settings](./organization-settings.md) — configure the workspace

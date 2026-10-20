---
sidebar_position: 1
sidebar_label: Managing Members
---

# Managing Members

Members with the required organization permissions can view, invite, assign
roles to, and remove members from the organization workspace. If a control is
missing, your role may not include the permission for that action.

---

## Viewing Members

1. Navigate to your organization using the header dropdown.
2. Select **Members** in the sidebar.
3. You will see a paginated list with each member's name, email address,
   status, last-login date, and country. Open a member's details to view their
   assigned roles.

:::note Requires MEMBER_VIEW
This action requires the `MEMBER_VIEW` permission.
:::

---

## Viewing Member Details

1. Select any member's name in the members list.
2. The detail page shows the member's profile information and all roles currently assigned to them.

:::note Requires MEMBER_VIEW
This action requires the `MEMBER_VIEW` permission.
:::

---

## Inviting New Members

### Email Invitation (Admin-Initiated)

1. Navigate to the **Members** page.
2. Select the **Send Invites** button.
3. Enter one or more email addresses. Use **+ Add Email Address** to add another
   field.
4. Select **Send Invites**.

The invitees will receive an email with a link to join your organization. When they select the link:

- If they already have an AirQo account, they will be added to the organization after confirming.
- If they do not have an account, they will be prompted to create one first.

:::note Requires MEMBER_INVITE
This action requires the `MEMBER_INVITE` permission.
:::

### Assign Roles After Joining

After the invitation is accepted, open the member's details to review or
assign roles. The roles available to you come from the current organization;
there is no universal role name that applies to every organization.

---

## Assigning Roles to Members

### Single Assignment

1. Go to the **Members** page and select the member's name.
2. On the member detail page, find the **Group Roles** section.
3. Select **Assign Role** and choose an available role.
4. Select **Assign Role**.

### Bulk Assignment

1. Go to the **Members** page.
2. Select multiple members using the checkboxes in the table.
3. Select **Assign Role**.
4. Choose the role from the dropdown.
5. Select **Assign Role** to confirm the assignment.

### Removing a Role

1. Open the member's detail page.
2. Find the role you want to remove.
3. Select the remove control next to the role and confirm **Unassign Role**.
4. Confirm the action.

:::note
You can only assign roles that exist within the same organization.
:::

---

## Removing a Member

1. Navigate to the **Members** page.
2. Open the member actions menu and select **Remove from Group**.
3. Confirm the removal in the dialog that appears.

Alternatively, from the member detail page:

1. Select **Remove from Group**.
2. Confirm the action.

:::caution
You cannot remove the organization's Group Manager. You must reassign the manager role first. This action requires the `MEMBER_REMOVE` permission.
:::

---

## Viewing Pending Invitations

If you have pending invitations from other organizations, Nexus may show a
notification banner with **View invitation(s)**. You can also open **Profile >
Team Invites** directly. Review each invitation and select **Accept** or
**Reject**.

---

## Common Workflows

### Onboarding a New Team Member

1. Go to **Members > Send Invites** and enter their email address.
2. The new member receives an email and selects the link to join.
3. Once they accept, go to their member detail page and assign the appropriate role.
4. Verify the member can access the features they need.

### Granting Additional Access

1. Determine what permission the member needs (for example, export data or manage roles).
2. Go to **Roles & Permissions** to see if a role already has that permission.
3. If a suitable role exists, assign it to the member.
4. If no existing role fits, create a new role with the required permissions and assign it.

---

## Related Guides

- [Member Requests](./member-requests.md) — approve or reject join requests
- [Roles & Permissions](./roles-and-permissions.md) — create and manage roles
- [Organization Settings](./organization-settings.md) — configure the organization workspace

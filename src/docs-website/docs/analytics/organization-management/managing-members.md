---
sidebar_position: 1
sidebar_label: Managing Members
---

# Managing Members

Organization administrators can view, invite, and remove members from the organization workspace.

---

## Viewing Members

1. Navigate to your organization using the header dropdown.
2. Select **Members** in the sidebar.
3. You will see a paginated list of all members with their names, emails, and assigned roles.

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
3. Enter the email addresses of the people you want to invite (one per line or comma-separated).
4. Select **Send**.

The invitees will receive an email with a link to join your organization. When they select the link:

- If they already have an AirQo account, they will be added to the organization after confirming.
- If they do not have an account, they will be prompted to create one first.

:::note Requires MEMBER_INVITE
This action requires the `MEMBER_INVITE` permission.
:::

### Default Role for New Members

When a newly invited member joins, they are typically assigned the organization's default member role (`{ORG_NAME}_DEFAULT_MEMBER`). Administrators can change this assignment after the member accepts the invitation.

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

## Removing a Member

1. Navigate to the **Members** page.
2. Select the **Remove** button next to the member you want to remove.
3. Confirm the removal in the dialog that appears.

Alternatively, from the member detail page:

1. Select **Remove from Organization**.
2. Confirm the action.

:::caution
You cannot remove the organization's Group Manager. You must reassign the manager role first. This action requires the `MEMBER_REMOVE` permission.
:::

---

## Viewing Pending Invitations

If you have pending invitations from other organizations:

- A notification banner will appear at the top of your dashboard showing the number of pending invitations.
- Select **View invitation(s)** to see all pending invites.
- From there, you can **Accept** or **Reject** each invitation.

---

## Common Workflows

### Onboarding a New Team Member

1. Go to **Members > Send Invites** and enter their email address.
2. The new member receives an email and clicks the link to join.
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

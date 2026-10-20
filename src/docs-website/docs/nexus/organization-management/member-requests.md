---
sidebar_position: 2
sidebar_label: Member Requests
---

# Member Requests

Users can request to join an organization through the AirQo Nexus platform.
Members with `MEMBER_VIEW` access can review the requests currently returned
for the organization and approve or reject pending requests.

---

## Viewing Join Requests

1. Switch to your organization workspace using the header dropdown.
2. Select **Member Requests** in the sidebar.
3. You will see a list of requests with the applicant, email address, status,
   request date, and last-login date.

:::note Requires MEMBER_VIEW
The Member Requests page currently requires the `MEMBER_VIEW` permission.
:::

---

## Approving a Request

1. Find the request you want to approve.
2. Select **Approve**.
3. The request status changes to **Approved**, and the user is added to the organization.
4. Open **Members** to review the new member and assign a role if needed.

---

## Rejecting a Request

1. Find the request you want to decline.
2. Select **Reject**.
3. The request is removed from the list and the user is not added to the organization.

:::caution
Rejected requests cannot be undone. The user must submit a new request if they want to join later.
:::

---

## What the table shows

The table includes the applicant, email address, status, request date, last
login, and available actions. Use the search field to filter by name, email, or
status. Requested roles are not shown in the current request table; review the
member's roles after approval.

---

## Related Guides

- [Managing Members](./managing-members.md) — invite, assign roles, and remove members
- [Roles & Permissions](./roles-and-permissions.md) — understand available roles and permissions

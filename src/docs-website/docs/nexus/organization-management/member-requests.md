---
sidebar_position: 2
sidebar_label: Member Requests
---

# Member Requests

Users can request to join your organization through the AirQo Nexus platform or a shared link. Administrators with the appropriate permissions can review, approve, or reject these requests.

---

## Viewing Join Requests

1. Switch to your organization workspace using the header dropdown.
2. Select **Members** in the sidebar.
3. Open the **Member Requests** tab.
4. You will see a list of pending requests with the applicant's name, email, and request date.

:::note Requires MEMBER_INVITE
Viewing and managing join requests requires the `MEMBER_INVITE` permission.
:::

---

## Approving a Request

1. Find the request you want to approve.
2. Select **Approve**.
3. The user is added to the organization, usually with the default member role.
4. Optionally, go to the **Members** page and assign additional roles to the new member.

---

## Rejecting a Request

1. Find the request you want to decline.
2. Select **Reject**.
3. The request is removed from the list and the user is not added to the organization.

:::caution
Rejected requests cannot be undone. The user must submit a new request if they want to join later.
:::

---

## Requested Roles

Each join request may include a requested role. Review the role carefully before approving:

- If the requested role is appropriate, approve the request and verify the role is assigned correctly.
- If the requested role grants more access than needed, approve the request and assign a more restrictive role afterward.
- You can also reject the request and ask the user to request a different role.

---

## Notifications

Administrators with the `MEMBER_INVITE` permission may receive notifications when a new join request is submitted. Pending requests also appear as a badge or banner in the organization workspace so they are not missed.

---

## Related Guides

- [Managing Members](./managing-members.md) — invite, assign roles, and remove members
- [Roles & Permissions](./roles-and-permissions.md) — understand available roles and permissions

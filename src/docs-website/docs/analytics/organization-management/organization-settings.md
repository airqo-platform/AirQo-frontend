---
sidebar_position: 4
sidebar_label: Organisation Settings
---

# Organisation Settings

Organization settings allow administrators to configure the workspace appearance, basic information, and primary manager.

---

## Accessing Organization Settings

1. Switch to your organization workspace using the header dropdown.
2. Click **Organization Settings** in the sidebar.
3. You will see two tabs: **Theme** and **Group Details**.

:::note Requires GROUP_MANAGEMENT
Accessing and changing organization settings requires the `GROUP_MANAGEMENT` permission.
:::

---

## Theme Settings

Customize the look and feel of your organization's workspace:

- **Primary Color:** Choose from preset colors or enter a custom hex code.
- **Appearance:** Light, Dark, or Auto (follows system preference).
- **Interface Style:** Default or Bordered.
- **Content Layout:** Compact or Wide.

Changes apply immediately to the organization workspace for all members.

---

## Group Details

Manage your organization's information:

| Field | Description |
|-------|-------------|
| **Group Title** | The display name of your organization |
| **Group Manager** | The primary administrator (see [Setting a Group Manager](#setting-a-group-manager)) |
| **Logo** | Upload your organization's logo (displayed in the sidebar and header) |
| **Status** | Active or Inactive |
| **Industry** | Your organization's industry category |
| **Country** | The country where your organization operates |
| **Timezone** | Your organization's timezone |
| **Website** | Your organization's website URL |
| **Description** | A brief description of your organization |

---

## Setting a Group Manager

The Group Manager is the primary administrator of the organization. The manager appears with a **Manager** badge in the members list and has overall responsibility for the workspace.

1. Go to **Organization Settings** in the sidebar.
2. Open the **Group Details** tab.
3. Use the **Group Manager** dropdown to select a member.
4. Save your changes.

:::note Requires GROUP_MANAGEMENT
This action requires the `GROUP_MANAGEMENT` permission.
:::

:::important
- There can only be **one** Group Manager per organization.
- The Group Manager **cannot be removed** from the organization. You must assign a new manager before removing the current one.
- The Group Manager **cannot leave** the organization. Transfer the manager role first.
:::

---

## Requesting a New Organization

If your team does not yet have an organization workspace:

1. Open the organization selector in the header.
2. Select **Request New Organization**.
3. Fill in the required details and submit.
4. Wait for an AirQo administrator to review and approve your request.
5. Once approved, go to **Organization Settings** to configure your theme, logo, and details.
6. Navigate to **Members** and send email invitations to your team.

---

## Leaving an Organization

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

## Related Guides

- [Managing Members](./managing-members.md) — invite and manage team members
- [Roles & Permissions](./roles-and-permissions.md) — control what members can do

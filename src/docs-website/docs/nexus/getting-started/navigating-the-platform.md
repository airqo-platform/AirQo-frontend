---
sidebar_position: 4
sidebar_label: Navigating the Platform
---

# Navigating the Platform

Learn how the AirQo Nexus interface is organized, how the Individual and Organization workflows differ, and how to move between them.

---

## Understanding the Two Workflows

### Individual Workflow

The Individual workflow is your personal workspace. Use it to explore air quality data, analyze trends and comparisons, export datasets, and visualize your own data files.

**Navigation sidebar:**

| Group       | Page                        | Description                                                 |
| ----------- | --------------------------- | ----------------------------------------------------------- |
| **Main**    | Home                        | Welcome page with quick actions and an onboarding checklist |
|             | Visualization & Data Export | Download air quality datasets with flexible configuration   |
|             | Air Quality Map             | Full-screen interactive map with air quality data layers    |
|             | Air Quality Analysis        | Analyze trends and forecasts, and compare locations         |
| **Account** | Profile                     | Edit your name, profile picture, and account settings       |

:::note Where is Dataset Visualizer?
**Dataset Visualizer** is not part of the workflow sidebar. Open it from the **global sidebar**: select the menu button at the top-left of the header, then choose **Dataset Visualizer**. See [Global Sidebar (Menu)](#global-sidebar-menu) below.
:::

### Organization Workflow

The Organization workflow is a shared workspace for teams. It includes the same data exploration features as the Individual workflow, plus management tools for administrators.

**Navigation sidebar:**

| Group          | Page                        | Description                                                       |
| -------------- | --------------------------- | ----------------------------------------------------------------- |
| **Main**       | Dashboard                   | Organization-level Nexus dashboard with selected sites and charts |
|                | Visualization & Data Export | Download datasets for your organization's locations               |
|                | Air Quality Map             | Interactive map for your organization's monitoring sites          |
| **Management** | Members                     | View and manage team members (requires permission)                |
|                | Member Requests             | Review join requests from new members (requires permission)       |
|                | Roles & Permissions         | Configure roles and assign permissions (requires permission)      |
|                | Organization Settings       | Manage your organization's configuration (requires permission)    |
| **Account**    | Profile                     | Edit your personal profile                                        |

:::note
The Management section is only visible to users with the appropriate permissions. If you do not see these items, contact your organization administrator.
:::

---

## Platform Layout

### Header

The header appears at the top of every page and contains:

| Element                   | Description                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------- |
| **Menu**                  | Opens the global sidebar for cross-workflow navigation (top-left of the header)       |
| **Logo**                  | AirQo or organization logo — select it to return to your home page                    |
| **Page title**            | Shows the name of the current page                                                    |
| **Organization Selector** | Switch between your personal and organization workspaces                              |
| **App Menu**              | Links to other AirQo products such as Calibrate, Vertex, API Docs, and the Mobile App |
| **Profile Menu**          | Access your profile, settings, and sign-out option                                    |

### Sidebar (Desktop)

The left sidebar shows navigation for your current workflow. It updates automatically when you switch between Individual and Organization workflows. On desktop, it is always visible and can be collapsed to save space.

### Bottom Navigation (Mobile)

On mobile devices, the workflow sidebar is replaced by a bottom navigation bar with three shortcuts:

| Workflow         | Items                              |
| ---------------- | ---------------------------------- |
| **Individual**   | Home, Air Quality Map, Export      |
| **Organization** | Dashboard, Air Quality Map, Export |

The bottom bar is intentionally limited. To reach the other pages on mobile:

- Select the **Toggle sidebar** button in the mobile navigation strip to open your workflow navigation (Individual: Visualization & Data Export, Air Quality Map, Air Quality Analysis, Profile; Organization: Dashboard, Visualization & Data Export, Air Quality Map, Members, Member Requests, Roles & Permissions, Organization Settings, Profile).
- Select the menu button at the top-left of the header to open the **global sidebar** for **Dataset Visualizer** and **Air Quality Rankings**.

### Global Sidebar (Menu) {#global-sidebar-menu}

Select the menu button at the top-left of the header to open the global sidebar. It works on both desktop and mobile and provides cross-workflow navigation:

- **Home** — takes you to the appropriate home page for your current workflow
- **Dataset Visualizer** — upload your own CSV or Excel files and build custom charts
- **Air Quality Rankings** — compare monitoring locations by air quality
- **System Management** — visible only to platform administrators

The links adapt to your current workflow, so an organization user opens the organization versions of these pages.

---

## Switching Between Workflows

Use the **Organization Selector** in the header to switch workspaces:

1. Select the organization dropdown in the header.
2. Choose your organization name to enter the Organization workflow.
3. Choose **AirQo** (or your personal account) to return to the Individual workflow.

---

## Quick Actions

| Action              | Shortcut                           |
| ------------------- | ---------------------------------- |
| Open global sidebar | Select the menu icon in the header |
| Search              | Use the search bar in the header   |
| Close dialogs       | Press **Escape**                   |

---

## Related Guides

- [Creating an Account](./creating-an-account.md)
- [Logging In](./logging-in.md)
- [Nexus Dashboard](../monitoring-air-quality/nexus-dashboard.md)
- [Interactive Map](../monitoring-air-quality/interactive-map.md)
- [Organization Management](../organization-management/managing-members.md)

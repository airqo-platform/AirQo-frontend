---
sidebar_position: 4
---

# Platform User Guide

This guide walks you through navigating and using the AirQo Analytics platform. Whether you are an individual researcher exploring air quality data or an organization administrator managing a sensor network, this page covers everything you need to get started.

---

## What Is AirQo Analytics?

AirQo Analytics is a web platform for monitoring, analyzing, and exporting air quality data across Africa. It provides interactive maps, trend charts, data export tools, and dataset visualization — all accessible through a browser at [analytics.airqo.net](https://analytics.airqo.net).

The platform supports two distinct workflows:

| Flow | Who It's For | URL Pattern |
|------|-------------|-------------|
| **Individual** | Researchers, analysts, and individual users | `analytics.airqo.net/user/*` |
| **Organization** | Teams, government agencies, and NGOs managing sensor networks | `analytics.airqo.net/org/<your-org>/*` |

Your account starts in the **Individual** flow. If you belong to an organization, you can switch to it from the header.

---

## Getting Started

### Creating an Account

1. Go to [analytics.airqo.net](https://analytics.airqo.net).
2. Click **Sign Up** on the login page.
3. Fill in your details and submit the registration form.
4. Check your email for a verification link and confirm your account.
5. You are redirected to the Home page.

### Logging In

1. Go to [analytics.airqo.net](https://analytics.airqo.net).
2. Enter your email and password.
3. Click **Login**.

You can also log in with Google, GitHub, or other supported OAuth providers if they are enabled for your account.

### Forgot Password

1. On the login page, click **Forgot Password**.
2. Enter your email address.
3. Check your inbox for a reset link.
4. Click the link and set a new password.

---

## Understanding the Two Flows

### Individual Flow

The Individual flow is your personal workspace. It is designed for exploring air quality data, saving favorite locations, exporting datasets, and visualizing your own data files.

**Navigation sidebar:**

| Group | Page | Description |
|-------|------|-------------|
| **Explore** | Home | Dashboard with favorite locations, recent trends, and quick actions |
| | Map | Full-screen interactive map with air quality data layers |
| | My Favorites | Manage your saved monitoring locations |
| **Data & Analysis** | Visualization & Data Export | Download air quality datasets with flexible configuration |
| | Dataset Visualizer | Upload CSV/Excel files and build custom charts |
| **Account** | Profile | Edit your name, profile picture, and account settings |

### Organization Flow

The Organization flow is a shared workspace for teams. It includes all the data exploration features of the Individual flow, plus management tools for administrators.

**Navigation sidebar:**

| Group | Page | Description |
|-------|------|-------------|
| **Main** | Dashboard | Organization-level overview of air quality data |
| | Visualization & Data Export | Download datasets for your organization's locations |
| | Dataset Visualizer | Upload and visualize data files |
| | Map | Interactive map for your organization's monitoring sites |
| **Management** | Members | View and manage team members (requires permission) |
| | Member Requests | Review join requests from new members (requires permission) |
| | Roles & Permissions | Configure roles and assign permissions (requires permission) |
| | Organization Settings | Manage your organization's configuration (requires permission) |
| **Account** | Profile | Edit your personal profile |

:::note
The Management section is only visible to users with the appropriate permissions. If you don't see these items, contact your organization administrator.
:::

### Switching Between Flows

Use the **Organization Selector** in the header (top-right area) to switch between your personal workspace and your organization workspace:

1. Click the organization dropdown in the header.
2. Select your organization name to switch to the Organization flow.
3. Select **AirQo** (or your personal account) to return to the Individual flow.

---

## Platform Layout

### Header

The header appears at the top of every page and contains:

| Element | Description |
|---------|-------------|
| **Hamburger menu** | Opens the global sidebar for cross-flow navigation |
| **Logo** | AirQo or organization logo — click to go to your home page |
| **Page title** | Shows the name of the current page |
| **Organization Selector** | Switch between personal and organization workspaces (authenticated users only) |
| **App Dropdown** | Links to other AirQo products: Calibrate, Website, Vertex, API Docs, Mobile App, AI Platform |
| **Profile Dropdown** | Access your profile, settings, and logout |

### Sidebar (Desktop)

The left sidebar provides navigation within your current flow. It automatically adjusts based on whether you are in the Individual or Organization flow. On desktop, it is always visible and can be collapsed to save space.

### Bottom Navigation (Mobile)

On mobile devices, the sidebar is replaced by a bottom navigation bar with quick access to the most important pages.

### Global Sidebar (Hamburger Menu)

Click the hamburger icon in the header to open the global sidebar. This slide-out panel provides cross-flow navigation:

- **Home** — takes you to the appropriate home page for your current flow
- **Data Access** — takes you to Favorites (Individual) or Data Export (Organization)
- **System Management** — visible only to platform administrators

---

## Individual Flow Features

### Home Dashboard

Your Home page provides an at-a-glance view of air quality data:

- **Favorite locations** — quick-access cards for your saved monitoring sites showing real-time PM₂.₅ levels
- **Trend charts** — visual comparisons across your favorite locations
- **Quick actions** — shortcuts to explore the map, export data, or add new favorites

To add a favorite location, click the **Add Location** button and search for a monitoring site.

### Map View

The Map page displays air quality monitoring sites on an interactive map:

- **Site markers** — color-coded by air quality level (green = good, red = unhealthy)
- **Heatmap layer** — toggle to see pollution density across regions
- **Click a site** — opens a popup with real-time readings and historical trends
- **Filter by pollutant** — switch between PM₂.₅ and PM₁₀ views
- **Full-screen mode** — the map takes the full viewport with a collapsed sidebar

### My Favorites

Manage your saved monitoring locations:

- Save up to **four** favorite locations for quick access
- Each favorite shows real-time air quality trends on the Home page
- Add or remove favorites from the Map view or the Favorites page

### Visualization & Data Export

Download air quality datasets for offline analysis. See the full guide in [Exporting Air Quality Data](./data-export.md).

Key capabilities:
- Select individual sites, devices, countries, or cities
- Configure date ranges, pollutants (PM₂.₅ and PM₁₀), and data frequency
- Export as CSV, Excel, or PDF
- Preview and customize which columns to include

### Dataset Visualizer

Upload your own air quality data files and build interactive charts. See the full guide in [Using the Dataset Visualizer](./dataset-visualizer.md).

Key capabilities:
- Upload CSV and Excel files (up to 100 MB)
- Automatic column detection (time, numeric, dimension, coordinates)
- 9 chart types: line, area, bar, composed, scatter, histogram, pie, radar, map
- Multi-dataset comparison
- Export charts as PNG or PDF

### Profile

Manage your personal account settings:
- Update your name and profile picture
- View your authentication methods (password, Google, GitHub, etc.)
- Manage account preferences

---

## Organization Flow Features

### Dashboard

The Organization Dashboard provides an overview of your team's air quality monitoring:

- Summary of monitoring sites and devices
- Recent data activity
- Quick access to export and visualization tools

### Data Export & Dataset Visualizer

These work the same as in the Individual flow, but scoped to your organization's locations and data.

:::tip
In the Organization flow, the Countries and Cities tabs are not available on the Data Export page. Use the Sites or Devices tab to select your organization's monitoring locations.
:::

### Members

View and manage your organization's team members:

- See a list of all members with their roles and status
- Invite new members by email
- Remove members from the organization
- View individual member details

### Member Requests

Review join requests from users who want to join your organization:

- Approve or reject pending requests
- View the requested role for each applicant

### Roles & Permissions

Configure roles and permissions for your organization:

- **View existing roles** — see which roles are available and what permissions they include
- **Create custom roles** — define new roles with specific permission sets
- **Assign roles** — grant roles to members to control their access level

Common roles include:
- **Organization Admin** — full access to all settings and management features
- **Member** — basic access to data and visualization tools
- **Viewer** — read-only access to dashboards and data

### Organization Settings

Configure your organization's workspace:

- Update organization name and details
- Manage data privacy settings
- Configure organization-level preferences

---

## Common Tasks

### Saving a Favorite Location

1. Navigate to the **Map** page.
2. Find a monitoring site by searching or browsing the map.
3. Click the site marker to open its popup.
4. Click the **star icon** or **Add to Favorites** button.
5. The site appears on your Home page and in My Favorites.

### Exporting Air Quality Data

1. Navigate to **Visualization & Data Export** from the sidebar.
2. Set a **date range** in the sidebar.
3. Select one or more **sites** or **devices** from the table.
4. Choose your **pollutants** (PM₂.₅ and/or PM₁₀).
5. Click **Review & Download** in the header.
6. Select which columns to include and click **Confirm Download**.
7. Choose your save format (CSV, Excel, or PDF).

### Uploading Data to the Dataset Visualizer

1. Navigate to **Dataset Visualizer** from the sidebar.
2. Click **Choose files** or drag and drop a CSV/Excel file.
3. The visualizer auto-detects columns and creates initial charts.
4. Use **Add chart** to create additional visualizations.
5. Export individual charts as PNG or PDF.

### Switching to Your Organization

1. Click the **Organization Selector** dropdown in the header.
2. Select your organization name.
3. You are taken to your organization's Dashboard.

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open global sidebar | Click the hamburger icon in the header |
| Search | Use the search bar in the header |
| Close dialogs | Press **Escape** |

---

## Limitations

| Feature | Limitation |
|---------|------------|
| Favorite locations | Maximum 4 per user |
| Data export date range | Maximum 90 days per request |
| Dataset Visualizer file size | 100 MB per file |
| Dataset Visualizer rows | 50,000 rows per dataset |
| Organization management | Requires appropriate RBAC permissions |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't see Management pages | You need MEMBER_VIEW or GROUP_MANAGEMENT permission — contact your org admin |
| Countries/Cities tabs missing on Data Export | These tabs are only available in the Individual flow |
| Map not loading | Check that you have an internet connection and that Mapbox is accessible |
| Data Export shows "No Data Available" | Your organization may not have any deployed devices yet — visit Vertex to set up monitoring |
| Can't switch organizations | Ensure you've been invited and accepted the invitation for that organization |

---

## Further Reading

- [About AirQo Analytics](../intro.md) — platform overview and capabilities
- [Exporting Air Quality Data](./data-export.md) — detailed data export guide
- [Using the Dataset Visualizer](./dataset-visualizer.md) — upload and visualize your own data
- [Managing Favorite Locations](./manage-favorites.md) — save and organize monitoring sites

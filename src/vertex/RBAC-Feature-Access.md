# AirQo RBAC Feature Access – Living Document

---

## RBAC Principles

- **Transparency:** Prefer disabling over hiding, unless security or irrelevance dictates otherwise.
- **Security:** Hide destructive or sensitive actions from all but the highest-level admins.
- **Motivation:** Disabled features should explain what's required to enable them.
- **Clarity:** Users should never wonder if something is missing due to a bug.

---

## Feature Access Matrix

| **Feature/Action**         | **Super Admin** | **Org Admin** | **Technician** | **Analyst** | **Developer** | **Viewer** | **Guest/No Org** | **Disable for**                | **Hide for**                        |
|----------------------------|:--------------:|:-------------:|:--------------:|:-----------:|:-------------:|:----------:|:----------------:|:-------------------------------|:------------------------------------|
| Device Claim               |      ✔️        |      ✔️       |      ✔️        |     ❌      |      ❌       |     ❌     |        ❌        | All except Super/Org Admin/Tech | Guest/No Org                        |
| Device Deploy              |      ✔️        |      ✔️       |      ✔️        |     ❌      |      ❌       |     ❌     |        ❌        | All except Super/Org Admin/Tech | Guest/No Org                        |
| Device Update              |      ✔️        |      ✔️       |      ✔️        |     ❌      |      ❌       |     ❌     |        ❌        | All except Super/Org Admin/Tech | Guest/No Org                        |
| Device Delete              |      ✔️        |      ✔️       |      ❌        |     ❌      |      ❌       |     ❌     |        ❌        | All except Super/Org Admin      | Guest/No Org, Technician, Analyst   |
| Device View                |      ✔️        |      ✔️       |      ✔️        |     ✔️      |      ✔️       |     ✔️     |        ❌        | Guest/No Org                    | Guest/No Org                        |
| Device Assignment/Share    |      ✔️        |      ✔️       |      ❌        |     ❌      |      ❌       |     ❌     |        ❌        | All except Super/Org Admin      | Guest/No Org, Technician, Analyst   |
| Site Create/Update         |      ✔️        |      ✔️       |      ✔️        |     ❌      |      ❌       |     ❌     |        ❌        | All except Super/Org Admin/Tech | Guest/No Org                        |
| Site Delete                |      ✔️        |      ✔️       |      ❌        |     ❌      |      ❌       |     ❌     |        ❌        | All except Super/Org Admin      | Guest/No Org, Technician, Analyst   |
| Site View                  |      ✔️        |      ✔️       |      ✔️        |     ✔️      |      ✔️       |     ✔️     |        ❌        | Guest/No Org                    | Guest/No Org                        |
| Analytics Dashboard        |      ✔️        |      ✔️       |      ✔️        |     ✔️      |      ✔️       |     ✔️     |        ❌        | Guest/No Org                    | Guest/No Org                        |
| Data Export                |      ✔️        |      ✔️       |      ❌        |     ✔️      |      ✔️       |     ❌     |        ❌        | All except Super/Org Admin/Analyst/Dev | Guest/No Org, Technician, Viewer    |
| User Management            |      ✔️        |      ✔️       |      ❌        |     ❌      |      ❌       |     ❌     |        ❌        | All except Super/Org Admin      | Guest/No Org, Technician, Analyst   |
| Role Management            |      ✔️        |      ✔️       |      ❌        |     ❌      |      ❌       |     ❌     |        ❌        | All except Super/Org Admin      | Guest/No Org, Technician, Analyst   |
| Organization Management    |      ✔️        |      ❌       |      ❌        |     ❌      |      ❌       |     ❌     |        ❌        | All except Super Admin          | All except Super Admin              |
| Settings Edit              |      ✔️        |      ✔️       |      ❌        |     ❌      |      ❌       |     ❌     |        ❌        | All except Super/Org Admin      | Guest/No Org, Technician, Analyst   |
| Settings View              |      ✔️        |      ✔️       |      ✔️        |     ✔️      |      ✔️       |     ✔️     |        ❌        | Guest/No Org                    | Guest/No Org                        |
| Premium/Upgrade            |      ✔️        |      ✔️       |      ✔️        |     ✔️      |      ✔️       |     ✔️     |        ❌        | All except premium orgs/users   | Guest/No Org, non-premium orgs      |
| Destructive Actions        |      ✔️        |      ❌       |      ❌        |     ❌      |      ❌       |     ❌     |        ❌        | All except Super Admin          | All except Super Admin              |

**Legend:**
- ✔️ = Has access (feature enabled)
- ❌ = No access (feature disabled or hidden)
- **Disable for** = Show feature, but disabled, for these roles
- **Hide for** = Don't show feature at all for these roles

---

## Sidebar & Application Feature Mapping

### Sidebar Structure (Example)

| **Sidebar Item**         | **Sub-Items**                | **Permission**                | **Disable for**                | **Hide for**                        |
|-------------------------|------------------------------|-------------------------------|--------------------------------|--------------------------------------|
| Dashboard               | —                            | DEVICE.VIEW                   | —                              | Guest/No Org                        |
| Network Map             | —                            | SITE.VIEW                     | —                              | Guest/No Org                        |
| Devices                 | Overview, My Devices         | DEVICE.VIEW                   | All except permitted roles     | Guest/No Org                        |
|                         | Deploy, Claim, Share         | DEVICE.DEPLOY/UPDATE/ASSIGN   | All except permitted roles     | Guest/No Org, Viewer                |
| Sites                   | Overview, Create, Grids      | SITE.VIEW, SITE.CREATE        | All except permitted roles     | Guest/No Org                        |
| Cohorts                 | Overview, Create             | DEVICE.VIEW, DEVICE.UPDATE    | All except permitted roles     | Guest/No Org                        |
| User Management         | —                            | USER.VIEW, USER.MANAGEMENT    | All except Super/Org Admin     | Guest/No Org, Technician, Analyst    |
| Access Control          | Roles, Permissions           | ROLE.VIEW, ROLE.MANAGEMENT    | All except Super/Org Admin     | Guest/No Org, Technician, Analyst    |
| Organizations           | —                            | ORGANIZATION.VIEW             | All except Super Admin         | All except Super Admin               |
| Team                    | Overview, Invite, Roles      | USER.VIEW, USER.CREATE, ROLE.VIEW | All except permitted roles | Guest/No Org, Technician, Analyst    |
| Profile Settings        | —                            | —                             | —                              | —                                    |

**Notes:**
- For each sidebar item, use your `PermissionGuard` or `usePermission` to determine if it should be enabled or disabled.
- If a user is in the "Hide for" group, do not render the sidebar item at all.
- If a user is in the "Disable for" group, render the item but make it non-clickable and show a tooltip explaining why.

---

### Application Features (Major Screens/Actions)

| **Feature/Screen**         | **Permission**                | **Disable for**                | **Hide for**                        |
|----------------------------|-------------------------------|--------------------------------|--------------------------------------|
| Claim Device               | DEVICE.UPDATE                 | All except permitted roles     | Guest/No Org                        |
| Deploy Device              | DEVICE.DEPLOY                 | All except permitted roles     | Guest/No Org                        |
| Device Assignment/Share    | DEVICE.ASSIGN                 | All except permitted roles     | Guest/No Org, Viewer                |
| Delete Device              | DEVICE.DELETE                 | All except Super/Org Admin     | Guest/No Org, Technician, Analyst    |
| Create Site                | SITE.CREATE                   | All except permitted roles     | Guest/No Org                        |
| Delete Site                | SITE.DELETE                   | All except Super/Org Admin     | Guest/No Org, Technician, Analyst    |
| Export Data                | ANALYTICS.DATA_EXPORT         | All except Analyst/Dev/Admin   | Guest/No Org, Technician, Viewer     |
| Invite User                | USER.INVITE                   | All except Super/Org Admin     | Guest/No Org, Technician, Analyst    |
| Edit Roles                 | ROLE.EDIT                     | All except Super/Org Admin     | Guest/No Org, Technician, Analyst    |
| Organization Management    | ORGANIZATION.UPDATE           | All except Super Admin         | All except Super Admin               |
| Edit Settings              | SETTINGS.EDIT                 | All except Super/Org Admin     | Guest/No Org, Technician, Analyst    |
| View Settings              | SETTINGS.VIEW                 | All except permitted roles     | Guest/No Org                        |
| Destructive Actions        | SYSTEM.SUPER_ADMIN            | All except Super Admin         | All except Super Admin               |

---

## How to Maintain This Document

- **Update** whenever new features or roles are added.
- **Review** with product/design quarterly or after major releases.
- **Link** to this doc from engineering and product wikis.
- **Add** a "Request Access" or "Upgrade" workflow for disabled features as needed.

---

## Future Updates / Open Questions

- [ ] Are there new roles or custom roles to consider?
- [ ] Should some features be "requestable" (user can click to request access)?
- [ ] Are there features that should be hidden for compliance/security reasons?
- [ ] Should we add analytics to track how often users see disabled features? 
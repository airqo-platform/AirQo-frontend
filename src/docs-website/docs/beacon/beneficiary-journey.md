---
sidebar_position: 2
---

# The Beneficiary Journey

This guide is the end-to-end path for **beneficiaries** — organizations and individuals who have received or purchased air quality monitors and want to manage them on AirQo's platforms. It takes you from an unopened box to a live fleet you can monitor, maintain, and report on.

Your monitors do **not** have to be AirQo hardware. Vertex represents every hardware vendor as a **Sensor Manufacturer**, so monitors from AirGradient, Clarity, QuantAQ, IQAir, and others are registered, deployed, grouped, and monitored exactly like AirQo devices — and if your vendor isn't onboarded yet, you can request it. See [Supported Manufacturers](/vertex/third-party-sensors/supported-manufacturers) for the current list; the dropdown inside Vertex is always the definitive source. Where the AirQo and third-party paths differ, this guide says so.

## The Journey at a Glance

| Stage | Where | What you do |
|---|---|---|
| 1 | AirQo Nexus | Create your AirQo account |
| 2 | Vertex | Open the workspace your monitors will belong to |
| 3 | Vertex | Add your monitors — claim AirQo devices, or register monitors from any manufacturer |
| 4 | Vertex | Group your monitors into cohorts |
| 5 | Vertex | Deploy each monitor to a physical site |
| 6 | Vertex | Decide who can see your data |
| 7 | Beacon | Sign in and confirm your fleet is reporting |
| 8 | Beacon | Monitor health, maintain, and report |

Stage 1 happens on [AirQo Nexus](https://nexus.airqo.net). Stages 2–6 happen in [Vertex](https://vertex.airqo.net), and stages 7–8 in [Beacon](https://beacon.airqo.net). One account covers all three.

---

## Before You Start

Gather these before you begin — what you need depends on who made your monitors.

**For AirQo monitors**, you need either:

* The **Device Name** (for example `airqo_g5241`) and **Claim Token** (for example `A1B2C3D4`) for each monitor. These ship with the device, usually on a QR code sticker on the unit or its packaging.
* Or the **Cohort ID** your AirQo network support contact gives you when devices are transferred to you in bulk. If you don't have one, email [integrations@airqo.net](mailto:integrations@airqo.net).

**For monitors from any other manufacturer**, you need, per monitor:

* The **Serial Number**, from the manufacturer.
* The **Device Connection URL** — the API endpoint the monitor reports its data to.
* The **Read Key**, if that endpoint requires authentication.

You'll also need to know the **installation location** of each monitor (a site name or its latitude and longitude) before you can deploy it.

---

## Stage 1: Create Your AirQo Account

One AirQo account works across Vertex, Beacon, and AirQo Nexus. You only create it once.

1. Go to [nexus.airqo.net/user/creation/individual/register](https://nexus.airqo.net/user/creation/individual/register) and register.
2. Verify your email address.
3. Sign in to [vertex.airqo.net](https://vertex.airqo.net) with those credentials.

:::note
Beacon has no separate sign-up. If you try to register on Beacon, it sends you to the sign-in page — because your AirQo account already grants access.
:::

## Stage 2: Open Your Workspace

Every monitor belongs to a workspace, and the workspace you're in when you add a monitor determines who else can manage it.

* A **Personal Workspace** suits an individual running one or two monitors. Devices belong to your account.
* An **Organization Workspace** suits a team. Devices belong to the organization rather than to whoever added them, so access survives staff changes, and colleagues can be invited with different roles.

Switch workspaces from the dropdown in the top-right corner of Vertex.

:::important
Most beneficiaries want an Organization Workspace. If yours doesn't exist yet, it has to be initialized on the AirQo Nexus platform first — Vertex can't create it for you. Team members and their roles are also managed in Nexus, under **Management → Members** and **Roles & Permissions**.
:::

See [For Organizations](/vertex/getting-started/for-organizations) or [For Individuals](/vertex/getting-started/for-individuals) for the full setup.

## Stage 3: Add Your Monitors

On the Vertex **Home** dashboard, a setup checklist walks you through this. Click **Add a device** and pick the path that matches your hardware.

### Path A — AirQo Monitors

Choose **Claim AirQo Device**. You're then offered three ways to claim:

| Option | Use it when |
|---|---|
| **Claim Single Device** | You have one device. Scan its QR code, or enter its name and claim token by hand |
| **Claim Multiple Devices** | You have several. Type them in as rows, or upload a CSV or Excel file |
| **Import from Cohort** | AirQo transferred a batch to you and gave you a Cohort ID |

**Claim Single Device** opens the QR scanner first. If the camera can't read the sticker — or you'd rather type — switch to manual entry and supply the **Device Name** and **Claim Token**. Either way, you confirm the device on a review screen before the claim completes.

Full detail: [Add an AirQo Device](/vertex/device-deployment/add-airqo-device).

### Path B — Monitors From Any Other Manufacturer

Choose **Register Non-AirQo Device**, then pick **Import Single Device** or **Import Multiple Devices**.

**For a single monitor**, fill in:

* **Device Name**
* **Sensor Manufacturer** — pick your vendor from the dropdown
* **Category** — Low Cost, Reference Monitor, or Gas
* **Authentication Required** — True if the Device Connection URL needs credentials to read from
* **Serial Number**
* **Device Connection URL**

Optionally add **Tags** and a **Description**, and open **Show More Options** for the **Device Number**, **Write Key**, and **Read Key**.

**For several monitors**, upload a **CSV or JSON** file. Click **Download CSV template** to get a file with the right headers already in place: Device Name, Serial Number, Authentication Required, Latitude, Longitude, Device Connection URL, Description, and Device Number. You then set the **Sensor Manufacturer** and **Category** once for the whole file, confirm the column mapping on the **Map Fields** step (Vertex auto-matches most columns), and review the preview before importing.

:::tip
In the Authentication Required column, Vertex accepts `yes`, `no`, `true`, `false`, `1`, `0`, `y`, or `n`. Anything else is rejected and the row is named in the error.
:::

**If your manufacturer isn't in the dropdown**, click **Can't find your Sensor Manufacturer?** and submit a request with the manufacturer's name and official email. AirQo reviews each request, so the manufacturer won't appear immediately — but once onboarded, it's available to everyone.

Full detail: [Import Devices](/vertex/third-party-sensors/import-devices) and [Supported Manufacturers](/vertex/third-party-sensors/supported-manufacturers).

## Stage 4: Group Your Monitors Into Cohorts

A **cohort** is a named group of monitors you manage together — by project, by city, by funder, by manufacturer, whatever suits you. Cohorts are the unit Beacon filters and reports on, so this step pays off later.

If you registered non-AirQo monitors, you already did this: the import flow requires a cohort before it will finish, and lets you create one on the spot. Otherwise, use **Group devices** on the Home checklist.

Full detail: [Device Cohorts](/vertex/device-deployment/device-cohorts).

## Stage 5: Deploy Each Monitor to a Site

Registering a monitor records that you own it. **Deploying** it records where it is — and until you deploy it, its readings have no location attached.

For each monitor, supply:

* The **deployment date**, **height**, **mount type** (faceboard, pole, rooftop, suspended, or wall), and **power type** (solar or mains).
* A **static** location — a new or previously used site, entered by site name or by latitude and longitude — or, for a monitor that moves, a **mobile** deployment against a grid.

Full detail: [Deploy a Device to a Site](/vertex/device-deployment/deploy-to-site).

## Stage 6: Decide Who Can See Your Data

Visibility is set **per cohort**, not per device or per account.

* **Private** — readings stay inside your workspace.
* **Public** — readings and locations become accessible through the AirQo platform and its data access channels, including the public AirQo Air Quality Map.

Set it from the **Device Visibility** section of the Home dashboard, or from a cohort's details page. You can change it at any time.

Full detail: [Public Visibility](/vertex/data-visibility/public-visibility).

## Stage 7: Sign In to Beacon

Your monitors are now registered, grouped, and deployed. Beacon picks them up from there.

1. Go to [beacon.airqo.net](https://beacon.airqo.net).
2. Sign in with the same AirQo account you used for Vertex.
3. Switch to the same workspace your monitors belong to.

That's the whole setup. There's no second registration, no device re-entry, and no separate Beacon permissions to request.

Full detail: [Access Beacon](./getting-started/access-beacon.md).

## Stage 8: Monitor, Maintain, and Report

With your fleet visible in Beacon you can:

* **Watch fleet health** on the dashboard — online rate, uptime trend, incidents, and which monitors need attention. Use the **Fleet Filter** to narrow to one manufacturer or one cohort.
* **Inspect a single monitor** — performance history, configuration, metadata, and files.
* **Analyse performance** across cohorts, grids, or individual devices over a date range.
* **Plan field visits** on the maintenance map, filtered by uptime band, sensor error margin, and days offline.
* **Export a PDF report** with the sections you choose.

Full detail: [Monitor Your Fleet](./getting-started/monitor-your-fleet.md).

---

## Troubleshooting

### My monitor doesn't appear in Beacon

**Problem**: A monitor you registered in Vertex isn't in Beacon's device list.

**Solution**:
1. Check you're in the same workspace in both apps. The workspace switcher is in the top-right corner of each.
2. Confirm the monitor is assigned to a cohort in Vertex — ungrouped devices are easy to miss in filtered views.
3. Confirm it's been deployed. A registered-but-undeployed monitor has no site and shows as not deployed.

### My monitor appears but shows as offline

**Problem**: The monitor is listed, but its status is offline or its uptime is zero.

**Solution**: This is a data-flow problem, not a registration problem. For a third-party monitor, the usual cause is the **Device Connection URL** or the **Read Key**. Open the device in Vertex and confirm both, along with whether **Authentication Required** matches what the manufacturer's API actually expects. For an AirQo monitor, check power and network coverage at the site.

### I can't open Maintenance or Reports in Beacon

**Problem**: Those items aren't in your Beacon sidebar.

**Solution**: Beacon's menu follows your workspace and role. If you're signed in with no workspace selected, or your role lacks the relevant permissions, those sections are hidden. Switch to your organization's workspace; if they're still missing, ask your organization administrator to review your role in AirQo Nexus.

### My manufacturer isn't in the Sensor Manufacturer list

**Problem**: You can't select your vendor when registering a monitor.

**Solution**: Click **Can't find your Sensor Manufacturer?** on the Sensor Manufacturer field and submit a request. AirQo reviews it before the manufacturer becomes selectable, so plan for a short wait. See [Supported Manufacturers](/vertex/third-party-sensors/supported-manufacturers).

---

## Frequently Asked Questions

**Q: Do I need a separate account for Beacon?**

A: No. One AirQo account covers Vertex, Beacon, and AirQo Nexus. Beacon has no sign-up page of its own.

**Q: Can I monitor non-AirQo hardware in Beacon?**

A: Yes. Once a monitor is registered in Vertex under its Sensor Manufacturer, Beacon treats it like any other device. The dashboard can even compare fleets by manufacturer side by side.

**Q: Do I have to make my data public?**

A: No. Visibility is private by default and set per cohort. You can keep everything inside your workspace, publish selectively, or change your mind later.

**Q: What's the difference between a cohort and a site?**

A: A **site** is a physical location where one monitor is installed. A **cohort** is a logical group of monitors you manage and report on together. One cohort typically spans many sites.

**Q: Can I move monitors between workspaces later?**

A: Not from the Vertex interface today. Register monitors in the workspace that should own them long-term — for a team, that's the Organization Workspace, not an individual's Personal Workspace.

---

## What's Next

- [**Access Beacon**](./getting-started/access-beacon.md) — Sign in and find your fleet.
- [**Monitor Your Fleet**](./getting-started/monitor-your-fleet.md) — Use the dashboard, analytics, maintenance map, and reports.
- [**Vertex Quickstart**](/vertex/quickstart) — Including the Vertex Desktop app for field work.

## Need Help?

Email [integrations@airqo.net](mailto:integrations@airqo.net) for device transfers, cohort IDs, and onboarding questions.

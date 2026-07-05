# Deploy a Device to a Site

Deploying links a device to a physical Site and changes its deployment status to **Deployed**, so it starts transmitting data to the AirQo platform. From there, its readings become available on the [AirQo Air Quality Map](https://ai.airqo.net/map) and other data access channels.

## Prerequisites

* A device that has already been added or imported into your workspace and isn't currently assigned to a Site — either a new device that has never been deployed, or one that was previously deployed and later [recalled](./recall-device.md).

## Steps to Deploy

1. In the left sidebar, click **My Devices** (Personal Workspace) or **Devices** under Organization Assets (Organization Workspace).
2. Select the device you want to deploy from the list.
3. On the Device Details page, click **Deploy Device**.
4. **Enter the device details:**
   * **Deployment Date** — the date the device is being installed.
   * **Height (meters)** — how high above ground the device is mounted.
   * **Mount Type** — Faceboard, Pole, Rooftop, Suspended, or Wall.
   * **Power Type** — Solar, Mains, or Alternator.
   * **Primary Site** — check this if this is the device's main deployment location.
5. **Choose a deployment type:**
   * **New site** — deploy to a location the device hasn't used before.
   * **Previous site** — redeploy to a site this device was deployed to earlier. Only available if the device has deployment history.
6. If you chose **New site**, set the location:
   * **Site Name** — search for a location by name; Vertex fills in the coordinates automatically when you pick a result.
   * **Coordinates** — switch to this mode to enter latitude and longitude directly, along with a custom site name to fall back on if the map can't determine one automatically.
   * Use the interactive map to fine-tune the exact position by clicking or dragging the marker.
7. Click **Deploy**.

Once deployed, the device's deployment status changes to **Deployed**, and it starts transmitting data to the AirQo platform, making its readings available on the [AirQo Air Quality Map](https://ai.airqo.net/map) and other data access channels.

## What's Next

- [**Recall a Device**](./recall-device.md) — Un-assign a device from its Site if you need to move or remove it.


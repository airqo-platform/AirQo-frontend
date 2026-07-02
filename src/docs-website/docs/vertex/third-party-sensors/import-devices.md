# Import Devices

Vertex lets you bring devices from other sensor manufacturers (such as AirGradient) into your workspace, so you can manage and deploy them alongside your AirQo fleet.

## Prerequisites

* The device's **Serial Number**, from the manufacturer.
* The **Device Connection URL** — the API endpoint the device reports its data to.
* If the connection requires authentication, the **Read Key** for it (see Advanced Options below).

## Steps to Import

1. Go to the **Home** dashboard, **My Devices** (Personal Workspace), or **Devices** (Organization Workspace), then click **Import External Device**.
2. Choose an import method: **Import Single Device** or **Import Multiple Devices**.

### Import a Single Device

3. Enter the device's details:
   * **Device Name**
   * **Sensor Manufacturer** — select from the list, or use **Can't find your Sensor Manufacturer?** to request one.
   * **Category** — Low Cost, Reference Monitor, or Gas.
   * **Authentication Required** — True or False, depending on whether the Device Connection URL needs authentication to read from.
   * **Tags** (Optional)
   * **Serial Number**
   * **Device Connection URL**
   * **Description** (Optional)
4. (Optional) Click **Show More Options** for advanced fields:
   * **Device Number** — an additional identifier for the device from the manufacturer's own system, separate from its Serial Number.
   * **Write Key** — the manufacturer's API key used to push data into the device's connection, if their platform uses one.
   * **Read Key** — the manufacturer's API key used to read data from the Device Connection URL, if Authentication Required is set to True.
5. Click **Next**.

### Import Multiple Devices

3. Upload a **CSV** or **JSON** file containing your devices.
4. Select the **Sensor Manufacturer**, **Category**, and any **Tags** to apply to every device in the file.
5. Click **Next**. On the **Map Fields** step, match each column in your file to the expected fields (Device Name, Serial Number, Authentication Required, Latitude, Longitude, Device Connection URL, Description, Device Number) — Vertex tries to auto-match your columns first.
6. Review the preview of the transformed data, then click **Next**.

## Assign to a Cohort

Whether you imported one device or many, you'll be asked to assign them to a **Cohort** before you can finish. This is required, and you can create a new cohort on the spot if you don't already have one.

## Confirm and Complete

Review the summary — the number of devices and the cohort they'll be assigned to — then click **Complete**.

## What's Next

- [**Supported Manufacturers**](./supported-manufacturers.md) — See what importing third-party sensors into Vertex gives you.
- [**Device Cohorts**](../device-deployment/device-cohorts.md) — Learn how cohorts group your devices.

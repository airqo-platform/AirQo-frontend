---
sidebar_position: 2
---

# Device Configuration & Network Onboarding in Vertex

The purpose of this guide is to provide instructions for using the Vertex web application to manage the deployment, metadata, and high-level operational status of your devices. This ensures a streamlined onboarding process and accurate data flow to the AirQo Analytics platform and API by facilitating the configuration of devices in an organization workspace.

## Overview
As the primary configuration interface, Vertex is used to set up your device network and organization workspace, ensuring your sensors are correctly mapped to display air quality data on the Analytics dashboard and API. Functionalities of the Vertex application include:

* Monitor device online status in real time.
* Manage device metadata (e.g., editing device name, etc.).
* Manage deployment details (site location, installation date).
* Troubleshoot maintenance issues.
* Control data visibility (Public by default).

## Prerequisites
Before proceeding, ensure you have the following:

* **A Vertex Account:** Use your AirQo Analytics login details to log in at [vertex.airqo.net](https://vertex.airqo.net).
* **Your Cohort ID:** This unique ID, provided by an AirQo administrator, groups all your specific devices together for bulk management.


### Step 1: Create Your Organization Workspace

To manage devices as a team rather than as individuals, you must create an organization workspace.

1. **Log in** to the Analytics web application.
2. **Open the Organization Button:** Click the button in the top right corner of the dashboard.
3. **Fill in Organization Details:** Provide the name and relevant metadata for your group.
4. **Submit:** Once created, you can invite team members to join the workspace.



### Step 2: Onboard Your Devices (Using Cohort ID)

Once your workspace is ready, you need to link your physical sensors to the platform.

1. Navigate to the **Assets** or **Devices** section in Vertex.
2. Select **Add/Import Devices**.
3. Enter your **Cohort ID** provided by the AirQo admin. This will automatically pull the list of devices assigned to your network into your workspace.



### Step 3: Monitor Device Status

Vertex provides a real-time health check for your network. Use the following color-coded guide to understand your device status:

| Status Icon | Meaning | Action Required |
| --- | --- | --- |
| 🟢 **Green** | **Active** | No action needed. The device is transmitting data normally. |
| 🔴 **Red** | **Offline** | Check the physical device. It has not sent data in over 24 hours. |
| ⚪ **Gray** | **Not Transmitting** | Check Device. The device is likely offline or has no power. |
| 🟣 **Purple** | **Invalid Date** | Contact Support. The device clock is incorrect (reporting future dates). |



### Step 4: Data Privacy & Public Visibility

By default, AirQo is an open data platform, meaning all device data is publicly available to all. However, Vertex allows you to control whether your network's data is visible to the public or restricted to your organization.

#### Managing Your Network Visibility

You can manage this setting directly from the **Overview** page of the Vertex application under the **Device Visibility** section:

* **Public (Default):** Your sensors are visible to anyone on the AirQo Map, and your data is exportable by the public. This contributes to the open data ecosystem.
* **Private:** Your sensors and data are hidden from the public map and are only accessible to members of your organization's workspace.

#### How to Toggle Visibility

1. **Navigate to Home:** Click on the **Overview** tab in the left sidebar menu.
2. **Locate Device Visibility:** Scroll down to the **Device Visibility** card at the bottom of the dashboard.
3. **Adjust the Toggle:** Use the slider to switch between **Private** and **Public**.
* **Green Toggle (Right):** Indicates the network is currently **Public**.
* **Gray Toggle (Left):** Indicates the network is currently **Private**.




### Support

If you encounter issues with Claim Tokens or Organization approval, please contact:

* **Joel Ssematimba** (Hardware Engineering Lead)
* **Email:** joel@airqo.net and support@airqo.net
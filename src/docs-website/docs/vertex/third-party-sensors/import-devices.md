# Import Devices

Vertex acts as an open data sharing platform, allowing you to integrate third-party sensors (such as AirGradient) to manage them alongside your fleet.

There is no dedicated "add page" for external devices; instead, you import them directly into your workspace via a quick modal.

## Import a Single Device

You must obtain the following information from your sensor manufacturer:
* The device's **Serial Number**.
* The **Device Connection URL** (the API endpoint where the device sends its data).

**Steps:**
1. Navigate to the **Home** dashboard, or to your **Devices** list (labeled **My Devices** if you are in a Personal Workspace).
2. Click the **Import External Device** button located in the top right area of the screen.
3. In the modal that appears, enter a descriptive **Device Name**.
4. Click the **Sensor Manufacturer** dropdown and select the manufacturer (e.g., `airgradient`).
5. Select the appropriate hardware **Category** (e.g., `Low Cost`).
6. Enter the **Serial Number** exactly as provided by the manufacturer.
7. Paste the **Device Connection URL** into the designated field.
8. Click the blue **Import External Device** button to complete the process.

## Bulk Import Devices

If you are migrating a large fleet of external sensors to the Vertex platform, you can upload a CSV file to import them all at once.

> [!NOTE]
> Currently, the bulk CSV import functionality is only supported for third-party sensors from external manufacturers.

**Steps:**
1. In the left sidebar, navigate to the **Add Device** section.
2. Locate the **Bulk Import** card and click **Import Batch →**.
3. Upload your properly formatted CSV file containing the third-party sensor details.
4. Review the summary of the devices to be imported. If there are any formatting errors, correct your CSV file and upload it again.
5. Click **Confirm Import** to add the entire batch to your workspace.

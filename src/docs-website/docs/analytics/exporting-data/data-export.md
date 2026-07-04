---
sidebar_position: 1
sidebar_label: Exporting Data
---

# Exporting Air Quality Data

The Data Export page lets you download air quality datasets from the AirQo Analytics platform. Select locations across Africa, configure date ranges and pollutants, and export in multiple formats for offline analysis.

---

## Accessing the Export Page

1. Log in to the AirQo Analytics platform at [analytics.airqo.net](https://analytics.airqo.net).
2. Open the sidebar and click **Data Export** under the Data & Analysis section.
3. Direct URLs:
   - **Personal workspace:** `analytics.airqo.net/user/data-export`
   - **Organization workspace:** `analytics.airqo.net/org/<your-org>/data-export`

---

## Export Configuration (Sidebar)

The left sidebar contains all export settings. On smaller screens, tap the menu icon to open it.

### File Title

Enter a custom name for your download. This becomes the filename (e.g., `kampala-pm25-analysis`). If left blank, a default name is generated from the date range.

### Date Range (Required)

Select a start and end date for your data export. The date range is required before you can download.

:::caution Large Date Ranges
Date ranges exceeding **90 days** must be split into smaller batches to avoid backend timeouts. The platform will warn you if your selection is too large.
:::

### Device Category

Only applies when the **Devices** tab is active:

| Category | Description |
|----------|-------------|
| **Low Cost Sensor** | AirQo-manufactured air quality sensors (default) |
| **Reference Monitor** | High-precision BAM (Beta Attenuation Monitor) instruments |
| **Mobile** | Mobile monitoring units |
| **Gas** | Gas-specific monitoring devices |

### Data Type

| Option | Description |
|--------|-------------|
| **Raw** | Unprocessed sensor readings directly from the device |
| **Calibrated** | AirQo-calibrated values with quality adjustments applied |

:::note
Reference Monitor (BAM) devices always export as **Raw** data since they are already high-quality reference instruments. The Data Type selector is hidden when BAM is selected.
:::

### Pollutants

Select one or more air quality parameters to include in your export:

| Pollutant | Description |
|-----------|-------------|
| **PM₂.₅** | Fine particulate matter (≤2.5 micrometers) — selected by default |
| **PM₁₀** | Coarse particulate matter (≤10 micrometers) |

At least one pollutant must be selected. Uncheck the default PM₂.₅ and check PM₁₀ if you only need coarse particulate data.

### File Type

This controls the format returned by the API:

| Option | Description |
|--------|-------------|
| **CSV** | Comma-separated values (default) |
| **JSON** | Structured JSON response |

:::tip
The file type here is the API response format. After the data is fetched, you can additionally save as **CSV**, **Excel (XLSX)**, or **PDF** through the save format dialog.
:::

### Frequency

The available frequencies depend on the selected device category:

**For Low Cost Sensor, Reference Monitor, and Gas devices:**

| Option | Description |
|--------|-------------|
| **Hourly** | Averaged values per hour |
| **Daily** | Averaged values per day |
| **Weekly** | Averaged values per week |
| **Monthly** | Averaged values per month |

**For Mobile devices:**

| Option | Description |
|--------|-------------|
| **Raw** | Individual readings at native device intervals |

Mobile devices only support **Raw** frequency because they collect data at irregular intervals during transit.

---

## Selecting Locations

The main content area shows a paginated table of available locations. The table changes based on the active tab.

### Available Tabs

| Tab | Description | Available In |
|-----|-------------|--------------|
| **Sites** | Individual monitoring sites with location details | Personal & Organization |
| **Devices** | Physical monitoring devices | Personal & Organization |
| **Countries** | Country-level grids containing all sites within a country | Personal only |
| **Cities** | City-level grids containing all sites within a city | Personal only |

### How to Select

1. Use the **checkboxes** in the left column to select individual rows.
2. Use the **Select All** checkbox in the table header to select all rows on the current page.
3. Use the **search bar** to filter locations by name.
4. Use **pagination** to browse through pages of results.
5. Click **Clear All** in the header to deselect everything.

:::tip
Selections persist across page changes. You can select items from page 1, navigate to page 2, select more, and all selections are preserved.
:::

### Countries & Cities (Grid Selection)

When you select a country or city:

1. All monitoring sites within that grid are included by default.
2. A **Selected Grids Summary** card appears showing the site count per grid.
3. Click **Customize Sites** to open the Site Selection dialog where you can:
   - Deselect individual sites within the grid
   - Choose only specific sites to include in the export

---

## Downloading Data

### Step 1: Configure Export Settings

Set your desired date range, data type, frequency, pollutants, and file type in the sidebar.

### Step 2: Select Locations

Choose one or more sites, devices, countries, or cities from the table.

### Step 3: Review & Download

1. Click **Review & Download** in the header.
2. The **Download Preview** dialog opens with a summary of your export and **column selection** options:
   - **Location columns** — site/device name, ID, coordinates
   - **Core data columns** — datetime, measurement values
   - **Metadata columns** — city, country, region, data provider
   - **Pollutant columns** — PM₂.₅ and/or PM₁₀ measurement values
3. Toggle columns on or off depending on what you need.
4. Click **Confirm Download** to proceed.

### Step 4: Choose Save Format

After the API returns your data, the **Save Format** dialog appears:

| Format | Description | Badge |
|--------|-------------|-------|
| **CSV** | Single spreadsheet file with all rows combined. Best for analysis and importing into other tools. | Single file |
| **Excel (XLSX)** | Workbook with each selected location on a separate sheet. Requires 2+ locations. | Separate sheets |
| **PDF** | Formatted report with a summary, data table, and page numbers. | Report |

:::note
If you selected **JSON** as the API file type, the data is downloaded directly without the format dialog.
:::

### Metadata Fallback

If the API returns no measurement data for your selection (e.g., no readings in the date range), the export automatically falls back to a **metadata-only** file containing site/device information. This ensures you always get a useful export.

---

## Visualize Data

Click **Visualize Data** in the header to open the selected locations in the **More Insights** dialog. This lets you quickly explore trends and charts for your selected sites without leaving the export page.

---

## Contextual Notifications

The platform shows dynamic banners based on your current export state:

| Banner | Meaning |
|--------|---------|
| **Date Range Required** | You haven't selected a date range yet |
| **Location Selection Required** | No sites, devices, or grids are selected |
| **Pollutant Selection Required** | No pollutants are checked |
| **Large Date Range Detected** | Your range exceeds 90 days — split into batches |
| **Reference Monitor data is available** | BAM devices provide high-quality reference data |
| **Ready to Export** | All requirements are met — you can download |
| **No Data Available** | (Organization flow) No devices or sites have been deployed yet |

---

## Video Tutorial

Click **Watch Tutorial** in the help banner at the top of the page to open a walkthrough video demonstrating the full export workflow.

---

## Limitations

| Limit | Value | Reason |
|-------|-------|--------|
| Max date range per export | 90 days | Backend timeout prevention |
| Supported pollutants | PM₂.₅, PM₁₀ | Currently available parameters |
| Countries/Cities tabs | Personal workspace only | Organization flow restricted to sites/devices |
| BAM device data type | Raw only | Reference monitors provide calibrated data natively |
| Mobile device frequency | Raw only | Mobile devices collect data at irregular intervals |
| Excel format | Requires 2+ locations | One sheet per location |

---

## Troubleshooting

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| **Review & Download** is disabled | Missing date range, selection, or pollutant | Complete all required fields in the sidebar |
| Download fails with timeout | Date range too large | Split into batches of 90 days or fewer |
| No measurement data in export | No readings in selected date range | Try a different date range or check device status |
| Countries/Cities tab not visible | Organization workspace | These tabs are only available in personal workspace |
| BAM data shows only raw data | Reference monitors use raw data type | This is expected — BAM data is already high-quality |
| Mobile devices only show Raw frequency | Mobile devices don't support aggregation | Use Raw frequency for mobile device exports |
| Excel option unavailable | Only one location selected | Select 2+ locations to enable Excel export |

---

## Related Guides

- [Using the Dataset Visualizer](../visualizing-data/dataset-visualizer.md) — upload and visualize your own data files
- [Managing Favorite Locations](../managing-locations/favorite-locations.md) — save monitoring sites for quick access

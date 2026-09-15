---
sidebar_position: 1
sidebar_label: Export Air Quality Data
---

# Export Air Quality Data

The Data Export page lets you build and download a custom air quality dataset from any number of AirQo monitoring locations across Africa. Pick sites, devices, whole cities, or whole countries; choose a date range, pollutants, data type, and frequency; select exactly which columns you want; and save the result as CSV, Excel, PDF, or JSON. Whether you need a single week for one site or a multi-country annual pull split into batches, this page is where you build it.

This guide walks you through every control on the page, explains how to drill into a country or city to include only the sites you want, and covers the review, column-selection, and format steps that come before the file lands on your machine.

---

## Before You Begin

**Permissions.** You must be signed in and your role must have the **Data Export** permission. If you do not have it, the **Review & Download** button is hidden entirely — you will not see an error, the button just is not there. If you expect the button and do not see it, ask an organization admin to grant you the Data Export permission or check your role settings.

**Data availability.** If no measurement readings exist for the chosen locations, date range, and pollutants, the export still returns a file — but it contains only metadata (location names, coordinates, device info), and the file name gets a `-metadata` suffix so you can tell it apart. Network or backend failures are different: they show a **Download Failed** message and no file is saved.

**90-day batch limit.** Each export can cover at most **90 days**. Date ranges longer than that show a warning in the sidebar and are blocked at download time. To export a full year, make **five** 90-day (or smaller) exports and stitch them together afterward.

**Supported formats.** The final download can be **CSV** (one spreadsheet, all rows), **Excel** (one sheet per location, requires 2+ locations), **PDF** (a formatted summary), or **JSON** (a structured response that downloads directly, without the format picker).

---

## Access the Data Export Page

1. Log in to [AirQo Nexus](https://nexus.airqo.net/).
2. Open the sidebar and select **Visualization & Data Export**.
3. Or go straight to the page:

| Workflow         | URL                                                  |
| ---------------- | ---------------------------------------------------- |
| **Individual**   | `https://nexus.airqo.net/user/data-export`           |
| **Organization** | `https://nexus.airqo.net/org/<your-org>/data-export` |

Both routes open the same page. The only difference is that the **organization** workflow hides the **Countries** and **Cities** tabs — organization users see only **Sites** and **Devices**.

---

## The Export Page at a Glance

![Data Export page with the Sites tab active, the search bar, paginated table, Export Configuration sidebar, and the header with Visualize Data and Review & Download buttons](/img/nexus/data-export-overview.png)

1. **Help banner** — dismissible info bar with a **Watch Tutorial** button.
2. **Dynamic banners** — tell you what is missing (date range, location, pollutant) or confirm you are ready.
3. **Header** — the four tabs, **Visualize Data**, **Clear All**, and **Review & Download (N)** buttons.
4. **Table** — paginated list of sites, devices, countries, or cities with checkboxes.
5. **Export Configuration sidebar** — every setting that shapes your download.
6. **Review & Download** — the button that opens the review/preview step; shows how many items you have selected.

---

## Step 1: Choose What to Export

Pick a tab, search, and select the rows you want. Every selected row feeds into the final download.

### The Four Tabs

| Tab           | Columns                                    | Available in              |
| ------------- | ------------------------------------------ | ------------------------- |
| **Sites**     | Location, City, Country, Owner             | Individual & organization |
| **Devices**   | Device name, Sensor Manufacturer, Category | Individual & organization |
| **Countries** | Country, Sensor Manufacturer, Sites Count  | Individual only           |
| **Cities**    | City, Sensor Manufacturer, Sites Count     | Individual only           |

- **Search** filters the current tab by name.
- **Pagination** shows 10 rows per page by default. Navigate with the page controls at the bottom of the table.
- The **header checkbox** selects every row on the **current page only** — not every matching row across all pages.
- Selections **persist** across pages and across tabs. Select a few sites, switch to Devices, select a few more, and both sets are still selected when you switch back. The **Review & Download (N)** button shows the count for the **active tab**.
- Select **Clear All** in the header to wipe every selection across all tabs.

---

### Select Specific Sites in a City or Country

Countries and Cities are "grids" — each row stands for a group of monitoring sites. When you check a country or city, **every monitoring site in that grid is included by default**. A summary card then appears below the banners so you can drill in.

![Selected Grids Summary card for Zambia showing "13 of 13 sites selected" and a "Customize Sites" button](/img/nexus/data-export-countries-selected-annotated.png)

1. **Summary card.** For each selected grid it shows the grid name and **"N of M sites selected"** plus a button.
2. **Button label.** Reads **"Customize Sites"** the first time, and **"Modify Sites"** once you have already customized that grid.

Click the button to open the **Select Sites in &lt;name&gt;** dialog:

![Select Sites in Zambia dialog with search, Select All / Deselect All, per-site checkboxes, View more links, and a "Download (N selected)" footer button](/img/nexus/data-export-customize-sites-annotated.png)

1. **Title** — "Select Sites in \<name>".
2. **Subtitle** — "Choose which sites under this \<city/country> to include in your data download."
3. **Search** — "Search sites by name, city, or country..." filters the list.
4. **Select All** — check every site in the dialog.
5. **Deselect All** — uncheck every site in the dialog.
6. **Checkboxes** — one per site, showing the site name and "City, Country". The **View more** link beside a site opens that monitoring site's details page.
7. **Footer button** — "Download (\<N> selected)" confirms your site-level choices.

This is the way to include **only some** of a city or country's sites: uncheck the ones you do not want, leave the rest checked, and confirm. The grid's "N of M sites selected" updates to reflect your choice.

---

## Step 2: Configure the Export

The **Export Configuration** sidebar (heading "Export Configuration") shapes what ends up inside your file. Set these **before** you click Review & Download — though you can also change them afterward and re-review.

![Export Configuration sidebar on the Devices tab showing the Device Category selector](/img/nexus/data-export-devices-annotated.png)

1. **Device Category** — enabled only on the Devices tab.
2. **Devices tab** — switches the table to devices.
3. **Row checkboxes** — the device selection handled the same way as sites.

### File Title

Optional. Placeholder is **"Enter file title (optional)"**. Whatever you type replaces the default `air-quality-data-...` base name in the downloaded file name. Leave blank to use the default.

### Device Category

**Only enabled on the Devices tab** (and only relevant there). Options:

| Label                 | Value     | Effect                                                                                                                                                        |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Low Cost Sensor**   | `lowcost` | Default. No forced overrides.                                                                                                                                 |
| **Reference Monitor** | `bam`     | Forces Data Type to **Raw** (the Data Type selector is hidden). A toast tells you: "Reference monitors only provide raw data. Data type has been set to Raw." |
| **Mobile**            | `mobile`  | Forces Frequency to **Raw Data** only.                                                                                                                        |
| **Gas**               | `gas`     | No forced overrides.                                                                                                                                          |

:::note
Device Category has no effect unless the Devices tab is active. On Sites, Countries, and Cities tabs the control is disabled.
:::

### Data Type

**Calibrated** vs **Raw**. The sidebar tooltip reads: "Calibrated data is quality-assured and adjusted for sensor drift. Raw data is unprocessed sensor output." Default is **Raw**. This selector is **hidden** when Device Category is set to **Reference Monitor** (BAM always exports Raw).

### Pollutants

Checkboxes for **PM₂.₅** (default-selected) and **PM₁₀**. **At least one is required** — if you try to uncheck the last one you get "Please select at least one pollutant." The pollutant you pick also changes the column names you can choose later: Raw exports use "PM₂.₅" / "PM₁₀"; calibrated exports use "PM₂.₅ calibrated" / "PM₁₀ calibrated".

### Frequency

How the readings are aggregated over time.

- **Mobile** device category: **Raw Data** only (forced).
- **All other** categories: choose **Hourly**, **Daily**, **Weekly**, or **Monthly**.

Default is **Daily**.

The sidebar tooltip reads: "How the data is aggregated over time. Hourly gives per-hour readings, Daily averages once per day, Monthly averages once per month."

### File Type

**CSV** (default) or **JSON**. This is the single most important format decision because of what happens next:

- **CSV** — continue through the Review step and the Format dialog to pick CSV / Excel / PDF.
- **JSON** — **downloads directly**, skipping the format dialog entirely. Picking JSON is the fast path if you want a machine-readable response.

### Date Range

**Required.** Defaults to the last 7 days. An empty date range shows the error "Date range is required for data export" and the dynamic banner shows **Date Range Required**.

:::caution Download Limit Notice
Date ranges over **90 days** show a **Download Limit Notice** warning in the sidebar: "Annual data downloads must be done in batches. Please select shorter date ranges for optimal performance." At download time, ranges over 90 days are **blocked** with the toast "Date Range Too Large" / "Please split this export into batches of 90 days or fewer to avoid backend timeouts."
:::

---

## Step 3: Review and Choose Columns

Click **Review & Download (N)** in the header to open the **Export Preview** dialog. This is where you sanity-check your selection and trim the file down to only the columns you actually need.

![Export Preview dialog with the Data Preview table, Configure columns button, Export Configuration Summary, and Confirm & Download button](/img/nexus/data-export-review.png)

1. **Title & subtitle** — "Export Preview" / "Review the N selected &lt;type&gt; below. Choose the columns you want to keep before downloading."
2. **Data Preview table** — shows metadata for your selected locations.
3. **Below the table** — "Showing metadata for all N selected &lt;type&gt;. The actual download will include measurement data for these locations based on your export configuration."
4. **Configure columns** — the button that opens the column picker.
5. **Export Configuration Summary** — Data Type, Frequency, Response Format, Location count, Date Range, Estimated Days, and Selected Columns count.
6. **Buttons** — **Cancel** and **Confirm & Download**.

### Warning: Data May Be Incomplete

This warning is **always shown**, regardless of whether your selection has data:

> **Data May Be Incomplete** — "The data you download may contain missing values or no data at all. If no data is available for your selected filters, you will download the metadata for the selected locations only."

It is informational, not an error. See the Troubleshooting section for what to do if your file comes back metadata-only.

---

### Choose Which Columns to Download

Click **Configure columns** to open the dropdown:

![Configure columns dropdown showing "N of M selected" counter and the four column groups: Location, Core Data, Metadata, Pollutants](/img/nexus/data-export-configure-columns-annotated.png)

1. **Counter** — header reads "Configure columns" with "&lt;N&gt; of &lt;M&gt; selected" showing how many columns are checked.
2. **Toggle any checkbox** — all columns are checked by default. Uncheck to drop a column; check to add it back.

| Group          | Columns                                                                        |
| -------------- | ------------------------------------------------------------------------------ |
| **Location**   | Site name (Sites/Countries/Cities) **or** Device name (Devices)                |
| **Core Data**  | Date and time, Frequency, Sensor Manufacturer                                  |
| **Metadata**   | Latitude, Longitude, Temperature, Humidity                                     |
| **Pollutants** | PM₂.₅ and/or PM₁₀ (Raw) **or** PM₂.₅ calibrated / PM₁₀ calibrated (Calibrated) |

3. **Effect on preview and file.** The column choice changes **both** the Data Preview table inside the dialog **and** the columns written to the downloaded file.
4. **Minimum one column.** If you uncheck everything, the dropdown shows the red message **"Select at least one column to enable download."** and the Confirm button is disabled. Check at least one column to proceed.
5. **No required columns.** You can keep as few or as many as you want — drop everything except the pollutant column to get a tiny file, or keep everything for the full dataset.

---

## Step 4: Choose a Download Format

After you click **Confirm & Download** (and assuming File Type is CSV), the **Select Download Format** dialog opens:

![Select Download Format dialog with CSV spreadsheet, Excel workbook, and PDF summary cards](/img/nexus/data-export-format.png)

1. **Title & subtitle** — "Select Download Format" / "Choose the file type that works best for this export."
2. **CSV spreadsheet** — badge "Single file". "Download one spreadsheet file with all rows together. Best for analysis, sharing, and importing into other tools." Always available. Button: **Download CSV**.
3. **Excel workbook** — badge "Separate sheets". "Download an Excel file where each selected location has its own sheet." **Requires 2+ locations.** With only one location it is grayed out and shows "Available when two or more locations are selected." Button: **Download Excel workbook**.
4. **PDF summary** — badge "Summary". "Download a formatted summary with an overview, data table, and page numbers." Always available, but large exports are rejected with "Export too large for PDF; please reduce rows/columns or use CSV." Button: **Download PDF**.

### JSON skips this dialog

If you set File Type to **JSON** in the sidebar, Confirm & Download triggers a direct download and this dialog never appears.

### File naming

- Default: `air-quality-data-<start>-to-<end>.<ext>`
- With a File Title: the title replaces the `air-quality-data-...` base name.
- Metadata-only fallback: a `-metadata` suffix is appended, e.g. `air-quality-data-...-metadata.csv`.

### After the download

A banner confirms success:

| Format | Banner title      | Banner message                                                    |
| ------ | ----------------- | ----------------------------------------------------------------- |
| CSV    | **Saved as CSV**  | "Your CSV file has been saved."                                   |
| Excel  | **Saved as XLSX** | "Your Excel workbook has been saved with one sheet per location." |
| PDF    | **Saved as PDF**  | "Your professional PDF summary has been saved."                   |

There is also a toast: **"Download ready"** / "Your export for N location(s) is ready."

---

## Visualize Your Data

The header **Visualize Data** button (enabled when rows in the active tab are selected) opens the **Air Quality Insights** dialog. It contains a **Select Locations** panel (search, **Add All** / **Hide All**, checkable location cards, **+ Add Location**), chart controls (**Daily** frequency dropdown, date-range picker, pollutant dropdown such as PM₂.₅, and a chart-type dropdown with **Line Chart**), the chart itself with a WHO guideline line at 15 µg/m³ (PM₂.₅), and the dialog's own **Download Data** button.

![Air Quality Insights dialog showing location selection, chart controls, and a PM₂.₅ trend chart](/img/nexus/data-export-visualize.png)

Clicking any table row opens that monitoring site's **details page** (`/data-export/sites/[siteSlug]`), which shows the current reading, a trend chart (7D / 30D / 90D), a forecast, and health recommendations. Use this to inspect a single site before deciding whether to include it in your export.

### Opening your download

- **CSV** — opens in Excel, Google Sheets, or any spreadsheet tool. Each row is one reading; columns are the ones you picked.
- **Excel** — one worksheet per location, named after the site/device (sanitized to ≤ 31 chars).
- **PDF** — a paginated report with a summary header and a data table.

**Charting a CSV after download (quick start):**

1. Open the CSV in Excel or Google Sheets.
2. Select the **Date and time** column and the pollutant column (e.g. PM₂.₅).
3. Insert a **line chart** (Insert → Chart → Line).
4. Set the date column as the X-axis so the trend reads left-to-right over time.
5. Filter or pivot by **Site name** if you exported multiple locations.

---

## Troubleshooting

| Symptom                                                                               | Exact message                                                                                                                                                                     | What to do                                                                                                                                                                    |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Review & Download** is disabled                                                     | Tooltip: "Select a date range, location, and pollutant to enable download"                                                                                                        | Set a date range, check at least one row in the active tab, and make sure at least one pollutant is checked. Review the dynamic banner — it tells you which one is missing.   |
| The button is not there at all                                                        | (no error — button is hidden)                                                                                                                                                     | Your role lacks the **Data Export** permission. Ask an org admin to grant it.                                                                                                 |
| Date range missing                                                                    | Sidebar error: "Date range is required for data export" / banner **Date Range Required**                                                                                          | Pick a start and end date in the sidebar.                                                                                                                                     |
| No location selected                                                                  | Banner **Location Selection Required** — "Select at least one site/device/country/city using the row checkbox..."                                                                 | Check at least one row. Remember the header checkbox selects the current page only — page through and select more as needed.                                                  |
| No pollutant selected                                                                 | Banner **Pollutant Selection Required** — "Choose at least one air quality parameter..." / "Please select at least one pollutant."                                                | Check PM₂.₅ and/or PM₁₀ in the sidebar. You must keep at least one checked.                                                                                                   |
| Country/city selected but it has no sites                                             | Banner **Monitoring Site Selection Required** — "Choose at least one monitoring site in Customize Sites..."                                                                       | Open **Customize Sites** in the summary card and check at least one site, or deselect the empty grid.                                                                         |
| Date range too large                                                                  | Sidebar warning **Download Limit Notice**; at download: toast **"Date Range Too Large"** / "Please split this export into batches of 90 days or fewer to avoid backend timeouts." | Use 90 days or fewer. For annual data, make five separate exports and combine them afterward.                                                                                 |
| No measurement data for the selection                                                 | Preview warning **"No Measurement Data Found"**; toast **"No measurement data found"**; Confirm button changes to **"Download Metadata Only"**                                    | The download still succeeds, but contains only location metadata. Narrow the date range, pick different locations, or check that the devices were actually reporting.         |
| Export contains only metadata                                                         | File name has a `-metadata` suffix                                                                                                                                                | Same as above — there were no readings for your filters. The metadata file confirms the locations exist; adjust date range or locations to get measurement data.              |
| Download is large and you want a smaller file                                         | —                                                                                                                                                                                 | Deselect unused columns in **Configure columns**; reduce the date range; split by location.                                                                                   |
| PDF download rejected                                                                 | Toast **"PDF Too Large"** / "Export too large for PDF; please reduce rows/columns or use CSV." (limit: 5 000 rows or 50 000 cells)                                                | Reduce columns, reduce the date range, or download as CSV instead.                                                                                                            |
| Download failed                                                                       | Toast **"Download Failed"** + a friendly error message                                                                                                                            | Retry once. If it persists, reduce the date range (large exports can time out) or check your network.                                                                         |
| You clicked **Refresh** and the table did not update                                  | Toast **"Refresh failed"** / "We could not refresh the data."                                                                                                                     | Refresh the page and retry.                                                                                                                                                   |
| You are sure you selected locations but the count is wrong                            | —                                                                                                                                                                                 | The **Review & Download (N)** count reflects only the **active tab**. Selections on other tabs still exist — switch tabs to verify. **Clear All** wipes every tab at once.    |
| Preview always shows the **Data May Be Incomplete** warning even though you have data | Warning title **"Data May Be Incomplete"**                                                                                                                                        | This warning is **always shown** and is informational. It is not an error — see the Troubleshooting row above only if your downloaded file actually contains no measurements. |

---

## Tips and Best Practices

- **Name your files.** Put a short, descriptive **File Title** in the sidebar (e.g. `kampala-pm25-dry-season`) so you can tell exports apart without opening them.
- **Batch annual data.** A full year needs **five** 90-day exports (four would cover only 360 days). Batches are faster and more reliable than one giant pull — stitch them together in a spreadsheet afterward.
- **Deselect unused columns.** Every extra column makes the file bigger and slower to open. If you only need PM₂.₅ and a timestamp, keep just Date and time + PM₂.₅ and drop the rest.
- **Use Excel for per-site sheets.** If you are comparing several locations side by side, Excel (XLSX) gives each location its own sheet — one click instead of filtering a giant CSV.
- **Use JSON for pipelines.** Pick JSON in the sidebar when a script or tool is consuming the export. It downloads directly and skips the format dialog.
- **Check the preview first.** The **Export Preview** is free and instant. If the location count, date range, or columns look wrong, fix them here before you commit to the download.
- **Visualize before you export.** Click **Visualize Data** to chart the selected locations and confirm they are reporting before you build a file you might throw away.
- **Drill into grids.** Selecting a country or city is fast, but it grabs **all** its sites. Open **Customize Sites** to drop the ones you do not need — smaller export, faster download.

---

## Related Guides

- [Interactive Map](../monitoring-air-quality/interactive-map.md) — explore and inspect monitoring sites on a map
- [Air Quality Analysis](../monitoring-air-quality/air-quality-analysis.md) — chart and compare locations without downloading
- [Dataset Visualizer](../visualizing-data/dataset-visualizer.md) — upload and visualize your own data files

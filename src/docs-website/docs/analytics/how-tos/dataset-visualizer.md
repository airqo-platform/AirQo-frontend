---
sidebar_position: 2
---

# Using the Dataset Visualizer

The Dataset Visualizer lets you upload air quality data files (CSV or Excel), automatically profile the columns, and build export-ready charts — all client-side in your browser. No data leaves your device until you choose to share it.

---

## Accessing the Visualizer

1. Log in to the AirQo Analytics platform at [analytics.airqo.net](https://analytics.airqo.net).
2. Open the sidebar and click **Dataset Visualizer** under the Analytics section.
3. You can also access it directly at:
   - **Personal workspace:** `analytics.airqo.net/user/data-visualizer`
   - **Organization workspace:** `analytics.airqo.net/org/<your-org>/data-visualizer`

---

## Uploading Data

### Supported Formats

| Format | Extension | Max Size |
|--------|-----------|----------|
| CSV (Comma-Separated Values) | `.csv` | 100 MB |
| Excel Workbook | `.xlsx` | 100 MB |

:::tip
For large CSV files, the parser streams rows progressively. You'll see friendly status messages while the file is being read. You can cancel at any time.
:::

### How to Upload

1. Click **Choose files** or drag and drop files onto the upload area.
2. You can upload **multiple files at once** for side-by-side comparison.
3. For Excel workbooks with multiple sheets, you'll be prompted to select which sheet to use after upload.

### What Happens After Upload

The visualizer automatically:

- **Detects column types** — time fields, numeric measurements, dimension/category fields, and coordinate columns
- **Identifies pollutant names** — PM2.5, PM10, O₃, NO₂, CO, etc. from column headers
- **Detects latitude/longitude** — if your data contains coordinate columns, the Map chart type becomes available
- **Creates initial charts** — a line or bar chart (and a map if coordinates are found) is generated automatically
- **Assigns default fields** — the best metric, time, and comparison columns are pre-selected

---

## Understanding Column Detection

The visualizer classifies every column into one of these kinds:

| Kind | Color | What It Means |
|------|-------|---------------|
| **time** | Blue | Date or datetime values — used as the X-axis for trend charts |
| **numeric** | Green | Measurement values (PM2.5, temperature, AQI, etc.) — used as metrics |
| **dimension** | Purple | Categorical values (site name, device ID, city) — used for grouping and comparison |
| **mixed** | Gray | Contains both text and numbers — usable but may need review |
| **empty** | Gray | No usable data — skipped in charts |

You can view detected fields by clicking **Review data** → **Show fields** in the toolbar.

---

## Creating and Configuring Charts

### Adding a Chart

1. Click **Add chart** in the toolbar.
2. Select a chart type from the dropdown.
3. The new chart appears in the chart grid and becomes the active view.

### Chart Types

| Type | Best For | Requires |
|------|----------|----------|
| **Line** | Time trends, site/device comparisons over time | Time column |
| **Area** | Pollution load visualization over time | Time column |
| **Bar** | Averages across sites, devices, cities, or other groups | — |
| **Composed** | Comparing two measures on one time axis | Time column, two numeric columns |
| **Scatter** | Correlation between two numeric fields | Two numeric columns |
| **Histogram** | Distribution of concentration values | One numeric column |
| **Pie** | Share by air quality band or selected group | — |
| **Radar** | Profile top groups across one or two measures | — |
| **Map** | Spatial distribution from latitude and longitude fields | Latitude and longitude columns |

### Chart Configuration Panel

Click the settings icon on any chart card to expand the configuration panel. From there you can:

- **Change chart type** — switch between line, bar, area, etc.
- **Select metric column** — choose which numeric field to visualize (e.g., PM2.5, PM10)
- **Set X-axis / comparison column** — for trend charts this is the time field; for bar/pie/radar charts this is the grouping dimension
- **Choose aggregation method** — Average, Sum, Minimum, Maximum, or Count
- **Set maximum groups** — limit how many categories are shown (default: 8)
- **Toggle grid, legend, and axis labels**
- **Add reference lines** — overlay WHO or NEMA air quality standards as horizontal lines
- **Customize colors** — pick colors for each data series
- **Resize chart height** — drag to adjust the chart height

### Reference Lines (Standards)

You can overlay air quality guideline values on your charts:

| Standard | Description |
|----------|-------------|
| **WHO** | World Health Organization air quality guidelines |
| **NEMA Uganda** | Uganda National Environment Management Authority standards |
| **NEMA Kenya** | Kenya National Environment Management Authority standards |

Reference lines are automatically enabled when the metric column contains PM-related measurements.

---

## Map Visualization

When your data contains latitude and longitude columns, the **Map** chart type becomes available.

### Map Layers

| Layer | Description |
|-------|-------------|
| **Points** | Individual data points plotted as circles, colored by air quality level |
| **Heatmap** | Density-based visualization showing concentration clusters |
| **Grid choropleth** | Grid-based aggregation showing average values per cell |

### AQI Coloring

The map automatically detects PM2.5 or PM10 columns and applies AQI (Air Quality Index) color coding:

| AQI Level | Color | Range |
|-----------|-------|-------|
| Good | Green | 0–12 µg/m³ |
| Moderate | Yellow | 12.1–35.4 µg/m³ |
| Unhealthy for Sensitive Groups | Orange | 35.5–55.4 µg/m³ |
| Unhealthy | Red | 55.5–150.4 µg/m³ |
| Very Unhealthy | Purple | 150.5–250.4 µg/m³ |
| Hazardous | Dark Red | 250.5+ µg/m³ |

Click any point on the map to see a popup with the measurement value and AQI classification.

:::note
The Map chart requires a valid Mapbox access token (`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`) configured in the environment.
:::

---

## Filtering by Date Range

If your data contains a time column, the **Filter by date** picker appears in the toolbar.

1. Use the date range picker to set a start and end date.
2. All charts update in real time to show only data within the selected range.
3. Click **Reset range** to return to the full dataset period.

---

## Multi-Dataset Comparison

You can upload multiple files and compare them side by side.

### How It Works

1. Upload two or more CSV/XLSX files.
2. The visualizer merges matching columns across files and adds internal source columns (`__source_dataset`, `__source_file`) to distinguish rows.
3. When multiple datasets are loaded, charts automatically include a **Dataset** comparison field.
4. Each chart's **Sources** checkboxes let you toggle which datasets are included.

### Managing Datasets

- **Rename** — click the label field in the Data Inspector to give each dataset a friendly name.
- **Switch sheets** — for Excel files, use the Sheet dropdown to switch between workbook sheets.
- **Add sheet as dataset** — click **Add sheet** to import another sheet from the same workbook as a separate dataset.
- **Remove** — click the trash icon to remove a dataset (charts update automatically).

---

## Display Modes

Use the **View layout** buttons in the toolbar to control how charts are displayed:

| Mode | Description |
|------|-------------|
| **Selected view** | Shows only the active chart (focused mode) |
| **Charts only** | Shows all non-map charts in a grid |
| **Maps only** | Shows only map charts |
| **Compare all** | Shows all charts side by side in a 2-column grid |

Click any chart tab in the toolbar to switch the active chart in focused mode.

---

## Data Inspector

Click **Review data** in the toolbar to open the Data Inspector panel.

The inspector shows:

- **Dataset readiness** — Ready for charts, Partial data, or Limited data
- **Import notes** — warnings about missing columns, sparse data, or empty rows
- **Detected fields** — all columns with their kind (time, numeric, dimension), value count, and sample values

This helps you understand what the visualizer detected and whether any data quality issues need attention.

---

## Exporting Charts

Each chart card has an export menu with two options:

| Export | Format | How It Works |
|--------|--------|--------------|
| **Export as PNG** | `.png` | Renders the chart at 2x resolution for sharp images |
| **Export as PDF** | `.pdf` | Creates a single-page PDF with the chart centered |

Exported files are named automatically based on the chart title (e.g., `pm2-5-trend.png`).

---

## Workspace Drafts

Your work is **auto-saved** to the browser's IndexedDB storage. This means:

- If you close the tab and return later, your datasets, charts, and configuration are restored.
- You can also click **Save draft** to save manually at any time.
- Click **Clear** to reset the entire workspace and delete the saved draft.

:::caution
Drafts are stored locally in your browser. They are **not** synced across devices or browsers. Clearing browser data will remove saved drafts.
:::

---

## Tutorial Video

Click **Watch tutorial** at the top of the visualizer page to open a walkthrough video that demonstrates the full workflow from upload to chart export.

---

## Limitations

| Limit | Value | Reason |
|-------|-------|--------|
| Max file size | 100 MB per file | Browser memory constraints |
| Max rows per dataset | 50,000 | Performance optimization |
| Max rows rendered per chart | 5,000 | Chart rendering performance |
| Supported formats | `.csv`, `.xlsx` | PapaParse + read-excel-file |
| Map requires | Mapbox token + lat/lng columns | Mapbox GL rendering |

---

## Troubleshooting

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| No numeric columns detected | File has no measurement data | Ensure at least one column contains numeric values |
| Map not available | No latitude/longitude columns found | Verify your data has columns named `latitude`, `lat`, `longitude`, `lng`, or similar |
| Charts appear empty | Date range filter excludes all data | Click **Reset range** in the toolbar |
| Large file takes long to parse | File exceeds 50,000 rows | Wait for parsing to complete, or split into smaller files |
| Draft not restored | Browser storage was cleared | Re-upload your files |
| Sheet switch fails | Source file reference lost | Re-upload the file and select the desired sheet |

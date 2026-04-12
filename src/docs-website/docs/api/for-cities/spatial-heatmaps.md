---
sidebar_position: 4
sidebar_label: Spatial Heatmaps
---

# Spatial Heatmaps — Grid ID

Generate visual air quality heatmaps for your city. Heatmaps are returned as **Base64-encoded PNG images** with the geographic bounding box included, making them easy to overlay on maps.

:::info Tier requirement
Available on all tiers including Free.
:::

---

## What is a heatmap?

A spatial heatmap is a colour-coded image showing air quality levels across a city or region. Higher pollution levels appear in warmer colours; cleaner air appears in cooler colours. The `bounds` field gives you the southwest and northeast corners so you can position the image precisely on a map.

---

## Endpoints

### Get heatmap for a specific city Grid

```
GET https://api.airqo.net/api/v2/spatial/heatmaps/{GRID_ID}?token={SECRET_TOKEN}
```

### Get all available heatmaps

```
GET https://api.airqo.net/api/v2/spatial/heatmaps?token={SECRET_TOKEN}
```

---

## Example requests

```bash
# Single city heatmap
curl -X GET \
  "https://api.airqo.net/api/v2/spatial/heatmaps/64b7ac8fd7249f0029feca80?token=YOUR_SECRET_TOKEN"

# All available city heatmaps
curl -X GET \
  "https://api.airqo.net/api/v2/spatial/heatmaps?token=YOUR_SECRET_TOKEN"
```

---

## Example response

```json
[
  {
    "bounds": [
      [-1.444, 36.650],
      [-1.163, 37.102]
    ],
    "city": "nairobi_city",
    "id": "64b7ac8fd7249f0029feca80",
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...",
    "message": "✅ AQI image generated for nairobi_city"
  }
]
```

---

## Response fields

| Field | Type | Description |
|-------|------|-------------|
| `bounds` | array | `[[sw_lat, sw_lng], [ne_lat, ne_lng]]` — bounding box corners |
| `city` | string | City slug identifier |
| `id` | string | The Grid ID used in the request |
| `image` | string | Base64-encoded PNG heatmap (`data:image/png;base64,...`) |
| `message` | string | Generation status message |

---

## Displaying the heatmap in a web page

### Plain HTML

```html
<img
  id="airquality-heatmap"
  src=""
  alt="Nairobi air quality heatmap"
  style="width: 100%; border-radius: 8px;"
/>

<script>
  async function loadHeatmap(gridId, token) {
    const response = await fetch(
      `https://api.airqo.net/api/v2/spatial/heatmaps/${gridId}?token=${token}`
    );
    const [heatmap] = await response.json();
    document.getElementById('airquality-heatmap').src = heatmap.image;
  }

  loadHeatmap('64b7ac8fd7249f0029feca80', 'YOUR_SECRET_TOKEN');
</script>
```

### Leaflet map overlay (JavaScript)

```js
import L from 'leaflet';

async function addHeatmapOverlay(map, gridId, token) {
  const response = await fetch(
    `https://api.airqo.net/api/v2/spatial/heatmaps/${gridId}?token=${token}`
  );
  const [heatmap] = await response.json();

  const [[swLat, swLng], [neLat, neLng]] = heatmap.bounds;

  L.imageOverlay(
    heatmap.image,
    [[swLat, swLng], [neLat, neLng]],
    { opacity: 0.7 }
  ).addTo(map);
}
```

### Python

```python
import requests
import base64

def save_heatmap(grid_id, token, output_path='heatmap.png'):
    response = requests.get(
        f'https://api.airqo.net/api/v2/spatial/heatmaps/{grid_id}',
        params={'token': token}
    )
    heatmaps = response.json()

    if not heatmaps:
        print("No heatmap available for this Grid ID.")
        return

    heatmap = heatmaps[0]
    # Strip the data URL prefix
    image_data = heatmap['image'].split(',', 1)[1]
    with open(output_path, 'wb') as f:
        f.write(base64.b64decode(image_data))

    print(f"Heatmap saved to {output_path}")
    print(f"Bounds: SW {heatmap['bounds'][0]}, NE {heatmap['bounds'][1]}")

save_heatmap('64b7ac8fd7249f0029feca80', 'YOUR_SECRET_TOKEN')
```

---

## Update frequency

Heatmaps are regenerated periodically as new sensor data arrives. For the freshest image, check the `message` field — a `✅` prefix confirms a successfully generated image.

---

## Tips

- **Cache heatmap images** on your end (e.g. every 30–60 minutes) to reduce API calls.
- The `bounds` array uses `[latitude, longitude]` order — check your mapping library's expected order before positioning the overlay.
- For all-city dashboards, use the `/heatmaps` endpoint (without a Grid ID) to retrieve every available city heatmap in a single call.

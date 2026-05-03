# Inlab Collocation API Reference

All endpoints require the `Authorization` header: `JWT <token>`

Base path: `/api/v1/collocation`

---

## GET `/inlab`

List all inlab devices (lowcost devices from cohorts tagged `inlab`) with performance data.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | int | `0` | Pagination offset |
| `limit` | int | `100` | Page size |
| `startDateTime` | string | 7 days ago | ISO 8601 start date |
| `endDateTime` | string | now | ISO 8601 end date |
| `frequency` | string | `daily` | Data granularity: `raw`, `hourly`, `daily` |

### Response

```json
{
  "success": true,
  "message": "Inlab devices fetched successfully",
  "meta": {
    "total": 12,
    "totalResults": 12,
    "skip": 0,
    "limit": 100,
    "page": 1,
    "totalPages": 1
  },
  "devices": [
    {
      "device_id": "5f2036bc70223655545a8b4a",
      "name": "aq_18",
      "device_name": "aq_18",
      "is_active": true,
      "category": "lowcost",
      "network_id": "64b5db1d0e0b2a001e5d4e6f",
      "firmware": "3.2.1",
      "uptime": 28.96,
      "data_completeness": 28.96,
      "error_margin": 1.7433,
      "correlation": null,
      "averages": {
        "pm2.5 sensor1": 29.6997,
        "pm2.5 sensor2": 27.9564,
        "battery": 3.7264,
        "pm2.5": 28.828
      },
      "data": [
        {
          "channel_id": "689530",
          "device_id": "5f2036bc70223655545a8b4a",
          "datetime": "2026-04-17T10:00:00+03:00",
          "frequency": "hourly",
          "pm2.5 sensor1": 84.25,
          "pm2.5 sensor2": 75.195,
          "battery": 3.085,
          "record_count": 2,
          "complete": true,
          "device_name": "aq_18"
        }
      ],
      "daily": [
        {
          "date": "2026-04-17",
          "uptime": 45.83,
          "error_margin": 1.7433,
          "correlation": null
        }
      ]
    }
  ]
}
```

---

## POST `/inlab/batch`

Create a new collocation batch, optionally adding devices.

### Request Body

```json
{
  "name": "Batch April 2026",
  "start_date": "2026-04-01T00:00:00Z",
  "end_date": "2026-04-30T23:59:59Z",
  "device_ids": [
    "5f2036bc70223655545a8b4a",
    "5f2036bc70223655545a8b4b"
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **yes** | Unique batch name |
| `start_date` | string | no | ISO 8601 batch start date |
| `end_date` | string | no | ISO 8601 batch end date |
| `device_ids` | string[] | no | Devices to add on creation |

### Response `200`

```json
{
  "success": true,
  "message": "Batch 'Batch April 2026' created with 2 device(s)",
  "batch": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Batch April 2026",
    "start_date": "2026-04-01T00:00:00+00:00",
    "end_date": "2026-04-30T23:59:59+00:00",
    "device_count": 2,
    "devices": [
      {
        "device_id": "5f2036bc70223655545a8b4a",
        "device_name": "aq_18",
        "firmware_version": "3.2.1",
        "category": "lowcost",
        "network_id": "64b5db1d0e0b2a001e5d4e6f",
        "start_date": null,
        "end_date": null
      }
    ],
    "created_at": "2026-05-01T14:00:00+00:00"
  }
}
```

### Error `400`

Returned when the batch name already exists or all devices were skipped.

```json
{
  "detail": "A batch named 'Batch April 2026' already exists"
}
```

> **Note**: Devices already in another active batch are skipped (not an error). The message indicates how many were skipped.

---

## GET `/inlab/batch`

List all batches (paginated, soft-deleted excluded).

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | int | `0` | Pagination offset |
| `limit` | int | `100` | Page size |

### Response

```json
{
  "success": true,
  "message": "Batches fetched successfully",
  "meta": {
    "total": 3,
    "totalResults": 3,
    "skip": 0,
    "limit": 100,
    "page": 1,
    "totalPages": 1
  },
  "batches": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Batch April 2026",
      "start_date": "2026-04-01T00:00:00+00:00",
      "end_date": "2026-04-30T23:59:59+00:00",
      "device_count": 5,
      "devices": [
        {
          "device_id": "5f2036bc70223655545a8b4a",
          "device_name": "aq_18",
          "firmware_version": "3.2.1",
          "category": "lowcost",
          "network_id": "64b5db1d0e0b2a001e5d4e6f",
          "start_date": null,
          "end_date": null
        }
      ],
      "created_at": "2026-05-01T14:00:00+00:00"
    }
  ]
}
```

---

## GET `/inlab/batch/{batch_id}`

Get batch details with **per-device performance data** within the batch's date window.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `batch_id` | UUID | The batch ID |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `startDateTime` | string | batch start / 7d ago | ISO 8601 start. Overridden by batch/device dates. |
| `endDateTime` | string | batch end / now | ISO 8601 end. Overridden by batch/device dates. |
| `frequency` | string | `daily` | Data granularity: `raw`, `hourly`, `daily` |

### Date Resolution Order

For each device, the effective date range is resolved as:

1. **Per-device override** (`sync_inlab_batch_device.start_date/end_date`) — highest priority
2. **Batch-level dates** (`sync_inlab_batch.start_date/end_date`)
3. **Query parameters** (`startDateTime/endDateTime`)
4. **Default** — last 7 days

### Response

```json
{
  "success": true,
  "message": "Batch fetched successfully",
  "batch": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Batch April 2026",
    "start_date": "2026-04-01T00:00:00+00:00",
    "end_date": "2026-04-30T23:59:59+00:00",
    "device_count": 2,
    "devices": [
      {
        "device_id": "5f2036bc70223655545a8b4a",
        "device_name": "aq_18",
        "firmware_version": "3.2.1",
        "category": "lowcost",
        "network_id": "64b5db1d0e0b2a001e5d4e6f",
        "start_date": null,
        "end_date": null,
        "uptime": 28.96,
        "error_margin": 1.7433,
        "data": [
          {
            "channel_id": "689530",
            "device_id": "5f2036bc70223655545a8b4a",
            "datetime": "2026-04-17T10:00:00+03:00",
            "frequency": "hourly",
            "pm2.5 sensor1": 84.25,
            "pm2.5 sensor2": 75.195,
            "battery": 3.085,
            "record_count": 2,
            "complete": true,
            "device_name": "aq_18"
          }
        ]
      }
    ],
    "created_at": "2026-05-01T14:00:00+00:00"
  }
}
```

---

## PATCH `/inlab/batch/{batch_id}`

Update batch name and/or dates.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `batch_id` | UUID | The batch ID |

### Request Body

All fields optional. Only provided fields are updated.

```json
{
  "name": "Batch April 2026 - Revised",
  "start_date": "2026-04-05T00:00:00Z",
  "end_date": "2026-04-25T23:59:59Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | New name (must remain unique) |
| `start_date` | string | New start date (ISO 8601) |
| `end_date` | string | New end date (ISO 8601) |

### Response `200`

Same shape as POST response — returns the updated batch.

---

## DELETE `/inlab/batch/{batch_id}`

Soft-delete a batch. The batch and its device associations remain in the database but are excluded from all queries.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `batch_id` | UUID | The batch ID |

### Response `200`

```json
{
  "success": true,
  "message": "Batch 'Batch April 2026' deleted"
}
```

---

## POST `/inlab/batch/{batch_id}/devices`

Add devices to an existing batch. Each device's current firmware version is snapshot at the time of addition.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `batch_id` | UUID | The batch ID |

### Request Body

```json
{
  "device_ids": [
    "5f2036bc70223655545a8b4c",
    "5f2036bc70223655545a8b4d"
  ]
}
```

### Business Rules

- A device **cannot** belong to multiple active batches simultaneously — conflicting devices are skipped
- A previously soft-removed device is re-activated with a fresh firmware snapshot
- Devices already active in this batch are reported but not duplicated

### Response `200`

```json
{
  "success": true,
  "message": "Added 2 device(s), 1 skipped (in another batch), 1 already in this batch",
  "batch": { "..." }
}
```

---

## DELETE `/inlab/batch/{batch_id}/devices/{device_id}`

Soft-remove a device from a batch. The device becomes eligible for other batches.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `batch_id` | UUID | The batch ID |
| `device_id` | string | The device ID to remove |

### Response `200`

```json
{
  "success": true,
  "message": "Device 5f2036bc70223655545a8b4a removed from batch"
}
```

---

## PATCH `/inlab/batch/{batch_id}/devices/{device_id}`

Update per-device date overrides. When set, these dates take priority over the batch-level dates when fetching performance data.

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `batch_id` | UUID | The batch ID |
| `device_id` | string | The device ID |

### Request Body

```json
{
  "start_date": "2026-04-10T00:00:00Z",
  "end_date": "2026-04-20T23:59:59Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `start_date` | string | Per-device start date override (ISO 8601). Pass `""` to clear. |
| `end_date` | string | Per-device end date override (ISO 8601). Pass `""` to clear. |

### Response `200`

```json
{
  "success": true,
  "message": "Device date overrides updated",
  "device": {
    "device_id": "5f2036bc70223655545a8b4a",
    "start_date": "2026-04-10T00:00:00+00:00",
    "end_date": "2026-04-20T23:59:59+00:00"
  }
}
```

---

## Database Schema

```
sync_inlab_batch
├── id              UUID (PK)
├── name            VARCHAR(255) UNIQUE NOT NULL
├── start_date      TIMESTAMPTZ
├── end_date        TIMESTAMPTZ
├── is_deleted      BOOLEAN (soft delete)
├── created_at      TIMESTAMPTZ
└── updated_at      TIMESTAMPTZ

sync_inlab_batch_device
├── id                UUID (PK)
├── batch_id          UUID → sync_inlab_batch.id (CASCADE)
├── device_id         VARCHAR(100) → sync_device.device_id (CASCADE)
├── firmware_version  VARCHAR(100) — snapshot at addition time
├── start_date        TIMESTAMPTZ — per-device override
├── end_date          TIMESTAMPTZ — per-device override
├── is_removed        BOOLEAN (soft delete)
└── created_at        TIMESTAMPTZ
```

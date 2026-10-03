---
sidebar_position: 9
---

# Stock & Inventory

:::warning AirQo staff only
Requires the AirQo workspace and device-maintenance rights. See [Administrative Panel](./overview.md).
:::

**Stock Management** tracks hardware parts and inventory levels — the physical side of keeping a sensor network running.

## What's Tracked

The stock list shows each item with:

| Column | Notes |
|---|---|
| **Item Name** | |
| **Current Stock** | Quantity on hand |
| **Last Stock In** | When stock was last added |
| **Last Stock-In Addition Details** | What that last addition was |
| **Actions** | Stock operations |

Summary figures cover **Total Items** and the current page.

## Stock Operations

**Add New Stock Item** creates an item. For an existing one, a **Stock Operation** offers three operation types:

| Operation | Use when |
|---|---|
| **Add to Stock** | Parts arrive |
| **Remove from Stock** | Parts are consumed or issued |
| **Set Current Stock** | Correcting the record to match a physical count |

:::important
**Set Current Stock** overwrites the quantity rather than adjusting it. Use it for stocktakes, where the counted figure is authoritative. For everyday movements use Add or Remove, so the history reflects what actually happened rather than a series of corrections.
:::

## Stock and Field Maintenance

Inventory connects directly to repair planning. A [maintenance route](../analysis/maintenance.md) built from [fleet diagnostics](./fleet-triage.md) is only useful if the parts those repairs need are on hand — checking stock against the diagnosed faults before a trip is the difference between fixing monitors and visiting them.

## Troubleshooting

### Stock levels don't match a physical count

**Problem**: The recorded quantity disagrees with the shelf.

**Solution**: Use **Set Current Stock** to bring the record in line with the count. If the gap is large or recurring, the cause is usually parts being taken for field work without a corresponding **Remove from Stock**, which is a process fix rather than a data one.

### An item is missing from the list

**Problem**: You can't find an item you expect.

**Solution**: Check later pages before adding a duplicate — the summary figures and list are paginated. Create it with **Add New Stock Item** only once you've confirmed it isn't there.

## What's Next

- [**Maintenance**](../analysis/maintenance.md) — Plan the field visits these parts support.
- [**Fleet Diagnostics**](./fleet-triage.md) — What's likely to need parts.

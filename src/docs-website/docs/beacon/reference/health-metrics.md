---
sidebar_position: 2
---

# Health Metrics Explained

What Beacon's numbers actually measure, and how to read them without drawing the wrong conclusion.

## How Often the Numbers Update

Network status checks run **automatically every two hours**, at half past the hour, and a daily summary is published at **08:00 EAT**. Alert records are retained for **90 days**.

Two consequences worth knowing:

* A monitor that failed twenty minutes ago may not show as offline yet. The dashboard is near-real-time, not live.
* History older than 90 days isn't available in the alert record, so long-range reporting should be exported as you go rather than reconstructed later.

## Fleet Metrics

### Online Rate

The share of monitors transmitting, derived from the proportion **not** transmitting. Only the fully offline **Not transmitting** state counts against it — see [Device States](./device-states.md).

Online rate is a snapshot of how many monitors are transmitting, not a measure of how reliably each one reports. For reliability, look at uptime — and remember that an average uptime hides distribution. Ten monitors at 90%, and nine at 99% with one dead, both average about 90%. The **Uptime Range (Min–Max)** column on the dashboard is what separates them, and it's usually the more actionable number.

### Alert Levels

Fleet status is set by the percentage of monitors not transmitting:

| Status | Condition |
|---|---|
| **OK** | Under 35% not transmitting |
| **WARNING** | 35% to under 50% not transmitting |
| **CRITICAL** | 50% or more not transmitting |

Individual alerts carry a matching severity — **LOW**, **MEDIUM**, or **HIGH** — on the same thresholds.

:::important
These thresholds describe the **fleet**, not a single monitor. A fleet at OK can still contain completely dead monitors. Never read "OK" as "nothing needs attention" — it means the network as a whole is functioning, which is a much weaker claim.
:::

### Incidents

The count of warning and critical incidents raised in the last 14 days. Useful as a trend: a fleet with a good current online rate but a high incident count is unstable, flapping in and out of service, and that intermittency is often harder to diagnose than a clean failure.

## Per-Device Metrics

Available on a monitor's **Performance** tab.

### Daily Uptime

Reporting consistency day by day. Read the shape, not just the number: a steady 85% and an alternating pattern of 100% and 0% average the same and mean entirely different things.

### Data Frequency

How often readings arrive. Falling frequency with uptime otherwise intact usually points at connectivity rather than power or sensors.

### Sensor Health

Whether the sensor is reading sensibly, expressed through correlation and error margin.

* **Correlation** — how well the monitor tracks what it should. Co-located monitors should move together; when they stop agreeing, one is wrong.
* **Error margin** — the size of the discrepancy.

A monitor can score perfectly on uptime and badly here. It is online, reporting punctually, and producing numbers you shouldn't use.

### Battery Voltage

Power status, and the leading indicator for solar-powered units. Voltage sagging before uptime drops is the signature of a power budget problem — often a panel that has become shaded or dirty rather than a failing battery.

## Diagnosing by Combination

No single metric identifies a cause. The combination usually does:

| Pattern | Likely cause |
|---|---|
| Battery falls, then uptime falls | Power — panel, shading, or battery |
| Uptime steady, sensor health degrading | Sensor drift or failure |
| Data frequency falls, battery fine | Connectivity |
| Fails overnight, recovers by day | Solar power budget |
| Several monitors in one area fail together | Environmental or network, not hardware |
| Stale feed but still transmitting | Integration or timestamp, not the field |

:::tip
Use [Uptime Heatmaps](../monitoring/data-analysis.md#uptime-heatmaps) to spot time-of-day patterns. A failure that recurs at the same hour is nearly always power or scheduled network behaviour, and a heatmap makes that visible in a way a timeseries doesn't.
:::

## A Note on Comparing Monitors

Two cautions when ranking hardware:

* **Compare like with like.** Low-cost sensors and reference monitors have different expected error margins. Judging the former by the latter's standard makes healthy units look broken.
* **Account for deployment date.** Uptime spans the whole selected window, so a recently installed monitor is penalised for time before it existed on site. Narrow the range to since deployment.

## What's Next

- [**Device States**](./device-states.md) — What each status means.
- [**Device Data Analysis**](../monitoring/data-analysis.md) — Chart these metrics.
- [**The Fleet Dashboard**](../monitoring/fleet-dashboard.md) — Where the fleet figures appear.

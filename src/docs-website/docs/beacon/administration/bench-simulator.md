---
sidebar_position: 3
---

# Bench Simulator

:::warning AirQo staff only
Requires the AirQo workspace and device-maintenance rights. See [Administrative Panel](./overview.md).
:::

The **Diagnostic Simulator & Bench Tester** generates telemetry from a device profile's own metric limits, lets you inject a fault, and shows how the diagnostic engine interprets it.

:::note
Nothing the simulator does is saved. It writes no telemetry, creates no issues, and touches no real device — so it's safe to experiment with freely.
:::

## Why Use It

The diagnostic engine is a rules system, and rules have blind spots. The simulator closes the loop between writing a rule and finding out whether it works, without waiting for a real device to fail in the right way.

Reach for it when you're:

* Adding or changing a [diagnostic template](./diagnostic-templates.md) and need to know the rules fire as intended.
* Investigating why a known fault wasn't detected in [Fleet Diagnostics](./fleet-triage.md).
* Checking that a new [device profile](./device-profiles.md) produces sensible diagnoses.
* Learning how the engine reasons, without risk.

## How It Works

1. Choose a **device profile**. Its metric limits define what normal telemetry looks like, so generated data is realistic for that hardware rather than generic.
2. Generate telemetry from those limits.
3. **Inject a fault.**
4. Inspect the engine's diagnosis — what it concluded, and on what evidence.

## Reading the Result

The useful question isn't only whether the engine found the fault, but *how confidently and for what reason*. Three failure modes are worth watching for:

* **Missed** — no symptom rule matches. The template needs extending.
* **Detected, wrong cause** — symptoms match, but evidence weighting favours the wrong hypothesis. The weights need adjusting rather than new rules.
* **Detected, low confidence** — right answer, weak evidence. It will work on a clean bench signal and may not survive noisy field data.

The second is the most common and the easiest to miss, because a diagnosis appeared and it's tempting to stop reading there.

## Troubleshooting

### The engine doesn't detect an injected fault

**Problem**: You injected a fault and nothing was diagnosed.

**Solution**: Working as designed — this is the simulator telling you the rules have a gap. Check the [diagnostic template](./diagnostic-templates.md) for that hardware has a symptom covering the fault, and that the [device profile](./device-profiles.md) declares the subsystem involved.

### Generated telemetry looks unrealistic

**Problem**: The synthetic data doesn't resemble what real devices produce.

**Solution**: Telemetry is generated from the selected profile's own metric limits, so unrealistic output means the profile's limits are wrong. Fix the profile — that error is also affecting real diagnoses.

## What's Next

- [**Diagnostic Templates**](./diagnostic-templates.md) — Edit the rules you're testing.
- [**Device Profiles**](./device-profiles.md) — The hardware specs behind the telemetry.
- [**Fleet Diagnostics**](./fleet-triage.md) — The engine on real devices.

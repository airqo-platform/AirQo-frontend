---
sidebar_position: 5
---

# Diagnostic Templates

:::warning AirQo staff only
Requires the AirQo workspace and device-maintenance rights. See [Administrative Panel](./overview.md).
:::

The **Diagnostic Template & Rules Engine** holds reusable three-layer templates that define hardware symptoms, root cause hypotheses, and the evidential weighting rules that decide between them.

If [device profiles](./device-profiles.md) describe what hardware *is*, templates describe how to *reason* about it when something goes wrong.

## The Three Layers

| Layer | What it declares |
|---|---|
| **Symptoms** | Observable hardware conditions |
| **Root cause hypotheses** | Candidate explanations for those symptoms |
| **Evidential weighting** | Evidence for (+) or against (−) each hypothesis |

The weighting layer is what makes this more than a lookup table. Symptoms rarely map one-to-one onto causes — a voltage drop might be a failing battery, a shaded panel, or a wiring fault, and several symptoms together are what discriminate between them. Weighting lets one observation *support* one hypothesis while *arguing against* another.

## Why Templates Are Reusable

A template is written once and applied across the hardware it fits, rather than per device. That keeps diagnosis consistent across a fleet — but it also means an error propagates everywhere at once, which is why simulation before rollout matters.

## Changing a Template Safely

1. Make the change.
2. Open the [Bench Simulator](./bench-simulator.md) and pick a profile the template applies to.
3. Inject the fault the change is meant to catch. Confirm it's detected, with the right cause.
4. Inject a *different* fault that shares symptoms. Confirm the change didn't make the engine over-eager.
5. Watch [Fleet Diagnostics](./fleet-triage.md) for a day or two afterwards — a jump in **New Issues** right after a template change usually means the rules, not the fleet.

Step 4 is the one most often skipped. Adding evidence for a hypothesis without checking what it does to competing hypotheses is how a template starts diagnosing everything as the same fault.

## Troubleshooting

### A known fault isn't detected

**Problem**: A fault you can reproduce produces no diagnosis.

**Solution**: No symptom rule matches it. Add the symptom, link it to the right hypothesis, and verify in the simulator. Also confirm the device's [profile](./device-profiles.md) declares the subsystem involved — a symptom on an undeclared component can't fire.

### The engine keeps picking the wrong cause

**Problem**: Faults are detected but misattributed.

**Solution**: This is a weighting problem, not a missing-rule problem — adding more symptoms usually makes it worse. Review the evidential weights for the competing hypotheses and make sure evidence that argues *against* a cause is actually recorded as negative.

### New Issues spiked after a template change

**Problem**: Fleet Diagnostics shows a sudden jump.

**Solution**: Assume the template until proven otherwise, especially if the new issues cluster on one hypothesis. Reproduce in the simulator with a healthy-device signal — if a clean signal now produces a diagnosis, the rules are too eager.

## What's Next

- [**Bench Simulator**](./bench-simulator.md) — Test a rule change safely.
- [**Device Profiles**](./device-profiles.md) — The hardware layer beneath.
- [**Fleet Diagnostics**](./fleet-triage.md) — The rules running on real devices.

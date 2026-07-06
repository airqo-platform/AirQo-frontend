---
sidebar_position: 1
sidebar_label: Overview
---

# Air Quality Data Fair Usage Policy

Guidelines for Responsible and Equitable Access to Air Quality Data

:::info Document version
Version 1.0 — January 2026
:::

---

## 1. Why This Policy Exists

AirQo is a non-commercial air quality monitoring initiative operated by Makerere University, funded by research grants and development partners. All data is provided free of charge in line with our commitment to open access and advancing air quality science across Africa.

Our data infrastructure (servers, databases, compute nodes, and network bandwidth) is shared across all users simultaneously: researchers, students, government agencies, NGOs, partner organisations, and the general public. These resources are finite and not infinitely scalable.

When any single user or process requests very large volumes of data at once, it creates a disproportionate computational burden that can:

- Slow down or interrupt access for all other users on the platform
- Cause system instability or outright service downtime
- Degrade the performance of real-time data pipelines that inform public health decisions
- Exhaust database query capacity, causing timeouts for everyone

:::caution
This is not a technical limitation we intend to remove. Download batching is an intentional design decision to ensure fair, stable, and equitable access for all users of a shared, free resource.
:::

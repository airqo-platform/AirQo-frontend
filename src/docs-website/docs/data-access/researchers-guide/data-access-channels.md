---
sidebar_position: 8
sidebar_label: 7. Data Access Channels
---

# 7. Data Access Channels

### Overview of Access Methods

| Channel | Best For | Link |
|---------|----------|------|
| Mobile App (iOS/Android) | Field work, real-time monitoring | https://airqo.africa/products/mobile-app |
| Analytics Platform | Researchers, visualisation, historical analysis, CSV export | https://airqo.africa/products/analytics |
| API (RESTful) | Programmatic, large-scale, automated pipelines | https://airqo.africa/products/api |
| Network Coverage Explorer | Metadata on Africa's air quality monitoring landscape (stations, instrumentation, institutional ownership) | https://airqo.net/solutions/network-coverage |

### Network Coverage Metadata (Africa-wide)

Separate from AirQo's own sensor data, AirQo also publishes a continent-wide **Air Quality Monitoring Landscape in Africa** platform at [airqo.net/solutions/network-coverage](https://airqo.net/solutions/network-coverage). Rather than pollutant readings, it provides *metadata* describing the monitoring infrastructure itself:

> This platform provides a unified view of Africa's air quality monitoring landscape. It integrates metadata on monitoring initiatives across the continent, combining both low-cost sensors and high-precision reference monitors. Users can explore the geographic distribution of monitoring stations by country, identify active coverage, understand the types of instrumentation in use, and review institutional stewardship for each monitoring location.
>
> By offering a structured and comprehensive overview of Africa's air quality monitoring capacity, the platform seeks to incentivise collaboration towards scaling the development of open data infrastructure.

This is useful for researchers who need to understand *where* monitoring exists and *who* operates it — for example, when scoping a new study, checking for co-located reference-grade instruments to validate low-cost sensor data against, or identifying potential institutional partners in a given country. A downloadable report of this metadata is available directly from the site.

### Downloading Large Historical Datasets

:::warning Batch download limit
The Analytics Platform limits single exports to approximately three months of data. This is an intentional, permanent design decision to ensure equitable system performance for all users. For multi-year datasets, download data in quarterly batches and combine the files in your analysis software.
:::

For automated or large-scale data access, use the [AirQo API](../../api/intro.md) with appropriate rate-limiting in your scripts. Full guidance on batch workflows and API access is provided in the [companion fair usage document](../fair-usage-policy/index.md).

### API Pricing Tiers

| Tier | Cost | Suitable For |
|------|------|--------------|
| Free | $0/month | Small-scale academic research |
| Standard | $50/month | Larger research projects |
| Premium | $150/month | High-volume commercial or institutional use |

Academic researchers requiring higher API access than the free tier provides are encouraged to contact [support@airqo.net](mailto:support@airqo.net). We support academic research and can often accommodate reasonable requests.

### Data Access Costs

Data access is free of charge across the mobile app and Analytics Platform, consistent with our open-access philosophy. API subscription packages help subsidise computing infrastructure costs while maintaining free access for standard research use.

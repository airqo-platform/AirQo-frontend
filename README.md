# AirQo-frontend

[![codecov](https://codecov.io/gh/airqo-platform/AirQo-frontend/graph/badge.svg?token=LsBcFL42rz)](https://codecov.io/gh/airqo-platform/AirQo-frontend)

<a href="https://github.com/airqo-platform/AirQo-frontend/actions">
<img src="https://github.com/airqo-platform/AirQo-frontend/workflows/mobile-app-code-tests/badge.svg" alt="Build Status">
</a>

<a href="https://github.com/airqo-platform/AirQo-frontend/actions">
<img src="https://github.com/airqo-platform/AirQo-frontend/workflows/mobile-app-code-analysis/badge.svg" alt="Build Status">
</a>

This repo contains the frontend code for the AirQo platform. This includes the code for the Analytics platform, Calibrate App, Netmanager dashboard, AirQo website, mobile application and the documentation website.

## What is AirQo?

The AirQo project aims to measure and quantify the scale of air pollution throughout Africa through the design, development and deployment of a network of low-cost air quality sensing devices mounted on either static or mobile objects.

## Folder Organization.
This is a monorepo with all the frontend applications located under the src folder. Outside the src folder are infrastructure related files and other artifacts necessary for collaborative development and deployment.

```
.
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── k8s
│   ├── calibrate
│   ├── docs
│   ├── inventory
│   ├── netmanager
│   ├── platform
│   └── reports
└── src
    ├── Maintenance
    ├── calibrate
    ├── docs
    ├── inventory
    ├── mobile
    ├── mobile-v3
    ├── netmanager
    ├── netmanager-app
    ├── platform
    ├── reports
    ├── website
    └── website2
```

## Contributing

We invite you to help us build this platform. Please look at our [contributing guide](/CONTRIBUTING.md) for details.

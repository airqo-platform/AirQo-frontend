# AirQo-frontend

[![codecov](https://codecov.io/gh/airqo-platform/AirQo-frontend/graph/badge.svg?token=LsBcFL42rz)](https://codecov.io/gh/airqo-platform/AirQo-frontend)

<a href="https://github.com/airqo-platform/AirQo-frontend/actions">
<img src="https://github.com/airqo-platform/AirQo-frontend/workflows/mobile-app-code-tests/badge.svg" alt="Build Status">
</a>

<a href="https://github.com/airqo-platform/AirQo-frontend/actions">
<img src="https://github.com/airqo-platform/AirQo-frontend/workflows/mobile-app-code-analysis/badge.svg" alt="Build Status">
</a>

This repo contains the frontend code for the AirQo platform. It includes web, desktop, and mobile applications plus deployment and infrastructure configuration.

## What is AirQo?

The AirQo project aims to measure and quantify the scale of air pollution throughout Africa through the design, development and deployment of a network of low-cost air quality sensing devices mounted on either static or mobile objects.

## Folder Organization

This is a monorepo with all frontend applications under `src/`. Outside `src/` are infrastructure files and other artifacts needed for collaboration and deployment.

## Projects under `src/`

- `src/website`: AirQo public website
- `src/platform`: Analytics platform
- `src/vertex`: Vertex web application
- `src/vertex-desktop`: Vertex Electron desktop wrapper
- `src/beacon`: Beacon application
- `src/calibrate`: Calibrate application
- `src/mobile`: AirQo mobile app
- `src/docs-website`: Documentation website
- `src/netmanager`: Netmanager dashboard

```
.
|-- CONTRIBUTING.md
|-- LICENSE
|-- README.md
|-- docs
|-- k8s
|   |-- beacon
|   |-- calibrate
|   |-- docs-website
|   |-- platform
|   `-- vertex
`-- src
    |-- beacon
    |-- calibrate
    |-- docs-website
    |-- mobile
    |-- netmanager
    |-- platform
    |-- vertex
    |-- vertex-desktop
    `-- website
```

## Contributing

We invite you to help us build this platform. Please look at our [contributing guide](/CONTRIBUTING.md) for details.

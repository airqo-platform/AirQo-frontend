# Vertex Template Config Contract

## Purpose

`vertex.config.ts` is the single deployer-owned configuration file for a Vertex instance. The future `create-vertex-app` CLI should generate this file from wizard answers.

Shared validation, defaults, and TypeScript types live in `core/config/vertex-config.ts`.

## V1 Defaults

V1 supports only:

- `api.adapter: "mock"` for local evaluation without credentials.
- `api.adapter: "airqo"` for the current AirQo API-backed app.
- `auth.provider: "none"` for mock/local template evaluation.
- `auth.provider: "airqo"` for the existing AirQo auth/session flow.

Generic REST adapters, plugin systems, deploy wizards, and config admin screens are v2 work.

## Required Config Groups

- `org`: visible organization identity, logo, primary color, support email, website, and slug.
- `api`: adapter choice, AirQo API base URL when applicable, and public measurement URL base.
- `auth`: auth provider and system group slug used by AirQo-mode permission logic.
- `features`: v1 feature flags for maps, bulk deploy, sites, CSV export, readings, user management, app launcher, and network requests.
- `map`: default center, zoom, and tile provider.
- `links`: docs, privacy, cookie policy, and analytics URLs.

## Validation Rules

- Organization name, short name, slug, logo, primary color, and support email must be valid.
- `org.primaryColor` must be a hex color.
- `api.adapter` must be `mock` or `airqo`.
- `auth.provider` must be `none` or `airqo`.
- `api.baseUrl` is required when `api.adapter` is `airqo`.
- `auth.provider: "airqo"` requires `api.adapter: "airqo"`.
- Map latitude must be between -90 and 90.
- Map longitude must be between -180 and 180.
- Map zoom must be between 0 and 22.

## Contributor Guidance

- Do not add new top-level config groups without maintainer approval.
- Prefer adding feature-specific options under an existing group.
- Keep `vertex.config.example.ts` mock-first.
- Keep `vertex.config.ts` AirQo-compatible until template extraction is complete.
- Do not implement the generic REST adapter in v1.

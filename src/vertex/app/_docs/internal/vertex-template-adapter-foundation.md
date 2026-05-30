# Vertex Adapter Foundation

## Purpose

This document describes the adapter foundation for `create-vertex-app` v1. The foundation defines the interface that future app data flows should use and provides a mock adapter that can power local evaluation without API credentials.

## Files

- `core/adapters/types.ts`: v1 adapter contract.
- `core/adapters/index.ts`: adapter factory selected by `vertex.config.ts`.
- `core/adapters/mock.ts`: mock adapter implementation.
- `core/adapters/mock-fixtures.ts`: typed fixture data.
- `core/adapters/airqo.ts`: AirQo wrapper around the existing service layer.

## V1 Adapter Choices

- `mock`: implemented now and intended as the generated template default.
- `airqo`: wraps existing `core/apis/*` services without rewriting endpoint behavior.

Generic REST remains out of scope for v1.

## Integration Boundary

This foundation does not refactor existing React Query hooks yet. The next integration step should route `core/hooks/*` through the adapter while keeping hook return shapes stable for current components.

## Mock Adapter Coverage

The mock adapter includes:

- Seeded user, group, role, and network data.
- Four devices covering online, offline, private, deployed, and undeployed states.
- Three sites with coordinates and status variety.
- Two cohorts with device membership.
- Device and site activity events.
- Latest and historical reading data.
- Successful no-op mutations for claim, deploy, recall, create, update, maintenance, and group assignment flows.

## Contributor Guidance

- Keep fixture data realistic but small.
- Add adapter methods only when current v1 screens need them.
- Keep AirQo endpoint mapping out of `mock.ts`; `airqo.ts` owns live API service mapping.
- Do not add REST adapter behavior in v1.

# Vertex Adapter Foundation

## Purpose

Issue 3 introduces the adapter foundation for `create-vertex-app` v1. It defines the interface that future app data flows should use and provides a mock adapter that can power local evaluation without API credentials.

## Files

- `core/adapters/types.ts`: v1 adapter contract.
- `core/adapters/index.ts`: adapter factory selected by `vertex.config.ts`.
- `core/adapters/mock.ts`: mock adapter implementation.
- `core/adapters/mock-fixtures.ts`: typed fixture data.
- `core/adapters/airqo.ts`: Issue 4 placeholder for the AirQo wrapper.

## V1 Adapter Choices

- `mock`: implemented now and intended as the generated template default.
- `airqo`: factory-supported, but methods intentionally throw until Issue 4 maps existing `core/apis/*` services into the contract.

Generic REST remains out of scope for v1.

## Integration Boundary

This foundation does not refactor existing React Query hooks yet. Issue 5 should route `core/hooks/*` through the adapter while keeping hook return shapes stable for current components.

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
- Keep AirQo endpoint mapping out of `mock.ts`; Issue 4 owns `airqo.ts`.
- Do not add REST adapter behavior in v1.

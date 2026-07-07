# CLAUDE.md - AirQo Frontend Monorepo

This is a monorepo containing multiple AirQo frontend applications.

## Repository Structure

```
src/
├── website/           # Next.js 14 website (airqo.net) - PRIMARY APP
├── platform/          # Analytics platform
├── mobile/            # Flutter mobile app
├── mobile-dashboard/  # Mobile dashboard
├── beacon/            # Beacon device UI
├── calibrate/         # Calibration tool
├── vertex/            # Vertex device UI
├── vertex-template/   # Vertex template
├── vertex-desktop/    # Vertex desktop app
├── docs-website/      # Documentation site
└── .github/           # GitHub Actions workflows
```

## Primary App: Website (`src/website/`)

The website is the main customer-facing application at airqo.net. For detailed guidance, see `src/website/AGENTS.md`.

### Quick Reference

**Tech Stack**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui, Redux Toolkit, Tanstack React Query

**Key Commands** (run from `src/website/`):
```bash
npm run dev           # Dev server (localhost:3000)
npm run build         # Production build
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run format        # Prettier format
npm run test          # Jest unit tests
```

**Validation** (always run after changes):
```bash
npm run lint && npm run format && npm run build
```

### Project Structure

- `src/app/` - Next.js App Router routes (route groups: (site), (products), (solutions), (programs), (content), (developers), (legal), (utility))
- `src/features/` - Feature modules (page-level UI logic, 19 feature folders)
- `src/components/` - Reusable UI components (ui/, layout/, providers/, sections/, feedback/, dialogs/)
- `src/services/` - API client and service layer (api/, external/, website/)
- `src/config/` - Static configuration data
- `src/lib/` - Utilities and helpers
- `src/hooks/` - Custom React hooks
- `src/store/` - Redux Toolkit slices
- `src/queries/` - Tanstack React Query definitions
- `src/types/` - TypeScript type definitions

### Key Conventions

- Pages use the **features pattern**: `app/[route]/page.tsx` delegates to `features/[route]/[Name]Page.tsx`
- API client handles server/client dual routing automatically
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- Always use `API_ROUTES` constants, never hard-code backend URLs
- FloatingMiniBillboard is suppressed on `/packages`, `/solutions/network-coverage`, and `/faces-of-clean-air`

### Environment Variables

Copy `.env.sample` to `.env`. Never commit `.env`.

- Server-side: `API_URL`, `API_TOKEN`, `OPENCAGE_API_KEY`, `SLACK_WEBHOOK_URL`, `SLACK_CHANNEL`, `GOOGLE_SITE_VERIFICATION`
- Client-side: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`, `NEXT_PUBLIC_CLEAN_AIR_FORUM_EVENT_ID`

## Other Apps

Each app in `src/` is independent with its own dependencies and build system. Check each app's README or package.json for specific instructions.

## CI/CD

GitHub Actions workflows are in `.github/workflows/`. Key workflows:
- `website-ci.yml` - Website lint, type check, tests, coverage
- `deploy-frontends-to-staging.yml` - Staging deployment
- `deploy-frontends-to-production.yml` - Production deployment

## Contributing

See `CONTRIBUTING.md` for contribution guidelines.

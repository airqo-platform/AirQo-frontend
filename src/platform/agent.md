# AirQo Frontend Agent Notes

## Stack

- Next.js 14 App Router
- React 18 + TypeScript
- Tailwind CSS

## Commands

- yarn dev
- yarn lint
- yarn build
- yarn format

## Environment

- Copy .env.example to .env.local and fill required keys.
- API config uses API_BASE_URL or NEXT_PUBLIC_API_BASE_URL.
- Auth requires NEXTAUTH_SECRET and NEXTAUTH_URL.

## Conventions

- Use @/ alias for src imports.
- Prefer existing shared components under src/shared.
- Keep hook order stable; gate behavior with enabled flags instead of early returns.

## Error Handling

- App router boundaries live in src/app/error.tsx and src/app/global-error.tsx.

# Claude Notes for AirQo Frontend

See AGENTS.md for full conventions, best practices, and reliability guidelines.

## Project Basics

- Next.js 14 App Router, React 18, TypeScript.
- Use yarn for scripts and dependency management.

## Environment Rules

- Do not add new env vars without updating .env.example.
- Prefer NEXT*PUBLIC* vars only when values must be exposed to the client.

## Codebase Conventions

- Use @/ alias for src imports.
- Reuse shared UI components and hooks where possible.
- Avoid breaking hook order; use enabled flags and conditional keys.

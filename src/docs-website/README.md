# AirQo Digital Products Documentation

This repository hosts the centralized documentation hub for all AirQo digital products, including Analytics, Vertex, Beacon, AI Platform, and the API. It is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

## Project Structure

The documentation is organized by product. Each product should follow this structure:

### Analytics (`/docs/analytics/`)
- `intro.md`
- `/user-guides/`
- `/technical/`
- `/resources/`
  - `release-notes.md`
  - `deprecations.md`
  - `known-issues.md`
- `faq.md`

### Vertex (`/docs/vertex/`)
- `intro.md`
- `/user-guides/`
- `/technical/`
- `/resources/`
  - `release-notes.md`
  - `deprecations.md`
  - `migrations.md`
- `faq.md`

### Beacon (`/docs/beacon/`)
- `intro.md`
- `/user-guides/`
- `/technical/`
- `/resources/`
  - `release-notes.md`
  - `incidents.md`
- `faq.md`

### AI Platform (`/docs/ai-platform/`)
- `intro.md`
- `/user-guides/`
- `/technical/`
- `/resources/`
  - `release-notes.md`
  - `model-updates.md`
  - `deprecations.md`
- `faq.md`

### API (`/docs/api/`)
- `intro.md`
- `/guides/`
- `/reference/`
- `/technical/`
- `/resources/`
  - `release-notes.md`
  - `deprecations.md`
  - `versioning-policy.md`
- `faq.md`

